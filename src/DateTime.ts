import {
  getFirstDayOfWeek,
  getFormatter,
  getMeridiem,
  getMonthName,
  getWeekdayName,
  getWeekdays,
  resolveIntlOptions,
} from './intl';

import {
  DATETIME_LONG,
  DATETIME_MEDIUM,
  DATETIME_SHORT,
  DATE_LONG,
  DATE_MEDIUM,
  DATE_SHORT,
  MONTH_DAY,
  MONTH_YEAR,
  TIME_LONG,
  TIME_MEDIUM,
  TIME_SHORT,
  formatWithLocale,
} from './locale';

import { parseDate, parseTime } from './parse';
import { DATETIME_SYMBOL } from './symbols';
import { getTimezoneOffset, setPseudoTimezone } from './timezone';
import { formatWithTokens } from './tokens';

import {
  AdvanceBy,
  DateLike,
  DateParams,
  DateResolvable,
  DateTimeOptions,
  FormatOptions,
  GlobalDateTimeOptions,
  MeridiemOptions,
  MonthName,
  MonthOptions,
  RelativeOptions,
  SingularUnit,
  TimePrecision,
  TimeZoneName,
  Unit,
  WeekdayName,
  WeekdayOptions,
} from './types';

import { getUnitIndex, normalizeUnit } from './units';
import { daysInMonth, isInvalidDate } from './utils';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_WEEK = 7 * ONE_DAY;

/**
 * A timezone and locale aware date and time.
 *
 * `DateTime` wraps a native `Date` and provides immutable, fluent
 * methods for parsing, formatting, comparison, and arithmetic. Every
 * method that appears to mutate actually returns a new instance —
 * the original is never modified.
 *
 * Locale and timezone may be provided per instance, or set globally
 * via {@link DateTime.setLocale} and {@link DateTime.setTimeZone}.
 *
 * @example
 *
 * import { DateTime } from '@bedrockio/chrono';
 *
 * const dt = new DateTime('2026-04-07T09:30:00Z', {
 *   timeZone: 'America/New_York',
 * });
 *
 * dt.toLong();                             // April 7, 2026 at 5:30am
 * dt.advance(1, 'day').format('M/d/yyyy'); // 4/8/2026
 */
export default class DateTime {
  static options: DateTimeOptions = {};

  // Static configuration

  /**
   * Returns the global timezone, or `undefined` if none is set.
   */
  static getTimeZone() {
    return this.options.timeZone;
  }

  /**
   * Sets the global timezone, used as the default for all `DateTime`
   * instances that don't specify their own. Pass `null` to clear.
   *
   * @example
   *
   * DateTime.setTimeZone('America/New_York');
   * DateTime.setTimeZone(null); // Clear
   */
  static setTimeZone(timeZone: string | null) {
    this.setOptions({
      timeZone,
    });
  }

  /**
   * Returns the global locale, or `undefined` if none is set.
   */
  static getLocale() {
    return this.options.locale;
  }

  /**
   * Sets the global locale, used as the default for all `DateTime`
   * instances that don't specify their own. Pass `null` to clear.
   *
   * @example
   *
   * DateTime.setLocale('en-US');
   * DateTime.setLocale(null); // Clear
   */
  static setLocale(locale: string | null) {
    this.setOptions({
      locale,
    });
  }

  /**
   * Returns the currently set global options.
   */
  static getOptions() {
    return this.options;
  }

  /**
   * Merges the given options into the global options used as defaults
   * for all `DateTime` instances. Existing fields are preserved unless
   * explicitly overwritten. Pass `null` for any field to clear it. See
   * {@link GlobalDateTimeOptions} for the full list of fields.
   *
   * @example
   *
   * DateTime.setOptions({
   *   locale: 'en-US',
   *   timeZone: 'America/New_York',
   * });
   */
  static setOptions(options: GlobalDateTimeOptions) {
    for (let [k, value] of Object.entries(options)) {
      const key = k as keyof DateTimeOptions;
      if (value === null) {
        delete this.options[key];
      } else if (value !== undefined) {
        this.options[key] = value;
      }
    }
  }

  // Static factories

  /**
   * Returns the minimum value passed in as a DateTime.
   */
  static min(...args: DateResolvable[]) {
    if (!args.length) {
      return null;
    }
    return args
      .map((arg) => {
        return new DateTime(arg);
      })
      .reduce((dt1, dt2) => {
        return dt1 < dt2 ? dt1 : dt2;
      });
  }

  /**
   * Returns the maximum value passed in as a DateTime.
   */
  static max(...args: DateResolvable[]) {
    if (!args.length) {
      return null;
    }
    return args
      .map((arg) => {
        return new DateTime(arg);
      })
      .reduce((dt1, dt2) => {
        return dt1 > dt2 ? dt1 : dt2;
      });
  }

  /**
   * Clamps the value passed to the minimum and maximum.
   */
  static clamp(
    arg?: DateResolvable,
    min?: DateResolvable,
    max?: DateResolvable,
  ) {
    if (!arg) {
      return null;
    }
    return this.min(this.max(arg, min) as DateResolvable, max);
  }

  static getMonths(options: MonthOptions = {}) {
    let { locale, style = 'long' } = options;

    locale ||= DateTime.options.locale;

    const formatter = getFormatter(locale, {
      month: style,
    });

    return Array.from(new Array(12), (_, i) => {
      return formatter.format(new Date(2020, i));
    });
  }

  static getWeekdays(options: WeekdayOptions = {}) {
    return getWeekdays({
      ...this.options,
      ...options,
    });
  }

  static getMeridiem(options: MeridiemOptions = {}) {
    return Array.from(new Array(2), (_, i) => {
      const date = new Date(Date.UTC(2020, 0, 1, i * 12));
      return getMeridiem(date, {
        ...this.options,
        ...options,
        timeZone: 'UTC',
      });
    });
  }

  utc: Date | null;
  date: Date;
  offset: number;
  options: DateTimeOptions;

  // Constructor

  /**
   * Creates a DateTime representing the current moment.
   *
   * Other constructor forms accept a parseable value, individual date
   * components, or an options object — see the additional overloads.
   *
   * @example
   *
   * new DateTime();
   */
  constructor();

  /**
   * Creates a DateTime representing the current moment with the given
   * locale and timezone options. See {@link DateTimeOptions} for the
   * full list of fields.
   *
   * @example
   *
   * new DateTime({
   *   locale: 'en-US',
   *   timeZone: 'America/New_York',
   * });
   */
  constructor(options: DateTimeOptions);

  /**
   * Creates a DateTime from an existing value, which may be a parseable
   * string, a millisecond timestamp, a `Date`, or another `DateTime`.
   *
   * If the input is a string that specifies a timezone or offset it is
   * used as-is. Otherwise the `timeZone` option (or the global timezone)
   * is applied. If neither is set, the system offset is used as a final
   * fallback.
   *
   * Note that ISO-8601 strings without a time component are parsed
   * consistently with the rules above — **inconsistent** with the native
   * `Date` constructor, which interprets them as UTC for historical
   * reasons.
   *
   * @example
   *
   * new DateTime('2025-01-01');
   * new DateTime(1735689600000);
   * new DateTime(existingDate);
   */
  constructor(input: DateResolvable);

  /**
   * Creates a DateTime from an existing value with locale and timezone
   * options. See the single-argument overload for parsing rules and
   * {@link DateTimeOptions} for the full list of option fields.
   *
   * @example
   *
   * new DateTime('Jan 1 2025', {
   *   locale: 'en-US',
   *   timeZone: 'America/New_York',
   * });
   */
  constructor(input: DateResolvable, options: DateTimeOptions);

  /**
   * Creates a DateTime from individual date components. As with the
   * native `Date` constructor, months are **0-indexed** — January is `0`,
   * December is `11`.
   *
   * @example
   *
   * new DateTime(2026, 1, 1, 12, 30);
   */
  constructor(
    fullYear: number,
    month: number,
    day?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    milliseconds?: number,
  );

  constructor(...args: any) {
    let date;
    let input;
    let options;

    if (isEnumeratedArgs(args)) {
      input = args;
    } else if (args.length === 1 && isOptionsObject(args[0])) {
      options = args[0];
    } else if (args.length === 1 && args[0] instanceof DateTime) {
      input = args[0];
      options = args[0].options;
    } else if (args.length > 0) {
      input = args[0];
      options = args[1];
    }

    options = resolveIntlOptions({
      ...DateTime.options,
      ...options,
    });

    if (isEnumeratedArgs(input)) {
      date = new Date(...input);
      setPseudoTimezone(date, options);
    } else if (typeof input === 'string') {
      date = parseDate(input, options);
    } else if (input !== undefined) {
      date = new Date(input);
    } else {
      date = new Date();
    }

    this.utc = null;
    this.date = date;
    this.options = options;
    this.offset = getTimezoneOffset(date, options);
  }

  // JS Date compatibility

  /**
   * Returns a number representing the timestamp of the DateTime in milliseconds.
   */
  getTime() {
    return this.date.getTime();
  }

  /**
   * Returns a new DateTime at the given UTC millisecond timestamp.
   * Differs from {@link DateTime.setTime} in that the supplied
   * timestamp is interpreted as UTC and the result is then re-offset
   * into the DateTime's local timezone.
   *
   * @example
   *
   * dt.setUTCTime(Date.UTC(2026, 0, 1));
   */
  setUTCTime(time: number) {
    // Note the target time may have a different offset
    // so do an initial set before adding the offset.
    const dt = this.setTime(time);
    const offset = dt.getTimezoneOffset();
    return dt.setTime(time + offset * ONE_MINUTE);
  }

  /**
   * Returns the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601)
   * representation of the DateTime in UTC.
   */
  toISOString() {
    if (this.isInvalid()) {
      return 'Invalid DateTime';
    }
    return this.date.toISOString();
  }

  /**
   * Returns the DateTime as a human-readable string. Defaults to the
   * long locale format (e.g. "January 1, 2020 at 9:00am").
   *
   * Note: this deliberately diverges from native `Date.prototype.toString()`,
   * which returns a verbose system-locale string like
   * `"Wed Jan 01 2020 09:00:00 GMT-0500 (Eastern Standard Time)"`. The
   * native form is rarely useful as a default; chrono optimizes for
   * implicit stringification (template literals, logs, errors). Use
   * `dt.date.toString()` if you need the literal native format.
   */
  toString() {
    return this.format();
  }

  /**
   * Equivalent to `toISOString()`. Used by `JSON.stringify()`.
   */
  toJSON() {
    return this.toISOString();
  }

  /**
   * Returns the numeric value of the DateTime instance (milliseconds
   * since the Unix epoch).
   */
  valueOf() {
    return this.getTime();
  }

  // Native Date passthroughs
  //
  // These exist for parity with `Date` so that a DateTime can stand
  // in for a Date in code that calls these methods. Each delegates
  // directly to the underlying native `Date` instance and produces
  // exactly what the spec defines (including any implementation-defined
  // portions). For chrono-flavored output, prefer `format()`,
  // `toLong()`, `toMedium()`, etc.

  /**
   * Returns a string in RFC 7231 format. Passthrough to native
   * `Date.toUTCString()`.
   */
  toUTCString() {
    return this.date.toUTCString();
  }

  /**
   * Returns the date portion as a string. Passthrough to native
   * `Date.toDateString()`.
   */
  toDateString() {
    return this.date.toDateString();
  }

  /**
   * Returns the time portion as a string. Passthrough to native
   * `Date.toTimeString()`.
   */
  toTimeString() {
    return this.date.toTimeString();
  }

  /**
   * Returns a locale-sensitive string. Passthrough to native
   * `Date.toLocaleString()`.
   */
  toLocaleString(
    locales?: Intl.LocalesArgument,
    options?: Intl.DateTimeFormatOptions,
  ) {
    return this.date.toLocaleString(locales, options);
  }

  /**
   * Returns a locale-sensitive date string. Passthrough to native
   * `Date.toLocaleDateString()`.
   */
  toLocaleDateString(
    locales?: Intl.LocalesArgument,
    options?: Intl.DateTimeFormatOptions,
  ) {
    return this.date.toLocaleDateString(locales, options);
  }

  /**
   * Returns a locale-sensitive time string. Passthrough to native
   * `Date.toLocaleTimeString()`.
   */
  toLocaleTimeString(
    locales?: Intl.LocalesArgument,
    options?: Intl.DateTimeFormatOptions,
  ) {
    return this.date.toLocaleTimeString(locales, options);
  }

  // BSON serialization

  /**
   * Returns a native Date for BSON serialization.
   * @see https://github.com/mongodb/js-bson
   */
  toBSON() {
    return this.date;
  }

  // Formatting

  /**
   * Returns the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601)
   * representation of the date component of the DateTime in UTC.
   *
   * @example
   *
   * dt.toISODate(); // "2025-01-01"
   */
  toISODate() {
    const str = this.toISOString();
    return str.split('T')[0];
  }

  /**
   * Returns the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601)
   * representation of the time component of the DateTime in UTC.
   *
   * @example
   *
   * dt.toISOTime(); // "12:30:00.000"
   */
  toISOTime() {
    const str = this.toISOString();
    return str.split('T')[1].slice(0, -1);
  }

  /**
   * Formats the DateTime in [ISO format](https://en.wikipedia.org/wiki/ISO_8601)
   * but using the local timezone instead of UTC.
   *
   * @example
   *
   * dt.toLocalString();             // "2026-01-01T09:00:00.000"
   * dt.toLocalString('seconds');    // "2026-01-01T09:00:00"
   * dt.toLocalString('minutes');    // "2026-01-01T09:00"
   */
  toLocalString(precision?: TimePrecision) {
    const local = toUTC(this).toISOString().slice(0, -1);
    return toPrecision(local, precision);
  }

  /**
   * Formats the date component in ISO format using the local timezone.
   *
   * @example
   *
   * dt.toLocalDate(); // "2025-01-01"
   */
  toLocalDate() {
    return toUTC(this).toISOString().split('T')[0];
  }

  /**
   * Formats the time component in ISO format using the local timezone.
   *
   * @example
   *
   * dt.toLocalTime(); // "12:30:00.000"
   */
  toLocalTime(precision?: TimePrecision) {
    const local = this.toLocalString().split('T')[1];
    return toPrecision(local, precision);
  }

  /**
   * @alias {@link toLocalDate}
   */
  toDate() {
    return this.toLocalDate();
  }

  /**
   * Formats the date component in long style.
   *
   * @example
   *
   * dt.toDateLong(); // "January 1, 2020"
   */
  toDateLong(extra?: FormatOptions) {
    return this.format({
      ...DATE_LONG,
      ...extra,
    });
  }

  /**
   * Formats the date component in medium style.
   *
   * @example
   *
   * dt.toDateMedium(); // "Jan 1, 2020"
   */
  toDateMedium(extra?: FormatOptions) {
    return this.format({
      ...DATE_MEDIUM,
      ...extra,
    });
  }

  /**
   * Formats the date component in short style.
   *
   * @example
   *
   * dt.toDateShort(); // "1/1/2020"
   */
  toDateShort(extra?: FormatOptions) {
    return this.format({
      ...DATE_SHORT,
      ...extra,
    });
  }

  /**
   * @alias {@link toLocalTime}
   */
  toTime() {
    return this.toLocalTime();
  }

  /**
   * Formats the time component in long style.
   *
   * @example
   *
   * dt.toTimeLong(); // "9:00:00am"
   */
  toTimeLong(extra?: FormatOptions) {
    return this.format({
      ...TIME_LONG,
      ...extra,
    });
  }

  /**
   * Formats the time component in medium style.
   *
   * @example
   *
   * dt.toTimeMedium(); // "9:00am"
   */
  toTimeMedium(extra?: FormatOptions) {
    return this.format({
      ...TIME_MEDIUM,
      ...extra,
    });
  }

  /**
   * Formats the time component in short style.
   *
   * @example
   *
   * dt.toTimeShort(); // "9am"
   */
  toTimeShort(extra?: FormatOptions) {
    return this.format({
      ...TIME_SHORT,
      ...extra,
    });
  }

  /**
   * Formats the time component with the time zone.
   *
   * @example
   *
   * dt.toTimeWithZone();               // "9:00am EST"
   * dt.toTimeWithZone('long');         // "9:00am Eastern Standard Time"
   * dt.toTimeWithZone('shortGeneric'); // "9:00am ET"
   * dt.toTimeWithZone('longGeneric');  // "9:00am Eastern Time"
   * dt.toTimeWithZone({ hour: '2-digit' }); // "09:00am EST"
   */
  toTimeWithZone(arg?: TimeZoneName | FormatOptions) {
    const extra = resolveTimeZoneParams(arg);
    return this.format({
      ...TIME_MEDIUM,
      ...extra,
    });
  }

  /**
   * Formats the month and year components of the DateTime by locale.
   *
   * @example
   *
   * dt.toMonthYear();          // "January 2025"
   * dt.toMonthYear('short');   // "Jan 2025"
   * dt.toMonthYear({ month: 'short', year: '2-digit' }); // "Jan 25"
   */
  toMonthYear(arg?: MonthName | FormatOptions) {
    const extra = resolveMonthParams(arg);
    return this.format({
      ...MONTH_YEAR,
      ...extra,
    });
  }

  /**
   * Formats the month and day components of the DateTime by locale.
   *
   * @example
   *
   * dt.toMonthDay();          // "January 15"
   * dt.toMonthDay('short');   // "Jan 15"
   * dt.toMonthDay({ hour: 'numeric' }); // "January 15 at 9am"
   */
  toMonthDay(arg?: MonthName | FormatOptions) {
    const extra = resolveMonthParams(arg);
    return this.format({
      ...MONTH_DAY,
      ...extra,
    });
  }

  /**
   * Formats the DateTime in long style.
   *
   * @example
   *
   * dt.toLong(); // "January 1, 2020 at 9:00am"
   */
  toLong(extra?: FormatOptions) {
    return this.format({
      ...DATETIME_LONG,
      ...extra,
    });
  }

  /**
   * Formats the DateTime in medium style.
   *
   * @example
   *
   * dt.toMedium(); // "Jan 1, 2020, 9:00am"
   */
  toMedium(extra?: FormatOptions) {
    return this.format({
      ...DATETIME_MEDIUM,
      ...extra,
    });
  }

  /**
   * Formats the DateTime in short style.
   *
   * @example
   *
   * dt.toShort(); // "1/1/2020, 9:00am"
   */
  toShort(extra?: FormatOptions) {
    return this.format({
      ...DATETIME_SHORT,
      ...extra,
    });
  }

  /**
   * Formats the DateTime with the time zone.
   *
   * @example
   *
   * dt.toLongWithZone();               // "January 1, 2020 at 9:00am EST"
   * dt.toLongWithZone('long');         // "January 1, 2020 at 9:00am Eastern Standard Time"
   * dt.toLongWithZone('shortGeneric'); // "January 1, 2020 at 9:00am ET"
   * dt.toLongWithZone('longGeneric');  // "January 1, 2020 at 9:00am Eastern Time"
   * dt.toLongWithZone({ month: 'short' }); // "Jan 1, 2020 at 9:00am Eastern Time"
   */
  toLongWithZone(arg?: TimeZoneName | FormatOptions) {
    const extra = resolveTimeZoneParams(arg);
    return this.format({
      ...DATETIME_LONG,
      ...extra,
    });
  }

  /**
   * Formats the DateTime using the standard locale-based format.
   *
   * @example
   *
   * dt.format(); // "January 1, 2020 at 9:00am"
   */
  format(): string;

  /**
   * Formats the DateTime using locale options, mirroring
   * [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options).
   *
   * @example
   *
   * dt.format({ year: 'numeric', month: '2-digit' }); // "01/2026"
   */
  format(format: FormatOptions, options?: DateTimeOptions): string;

  /**
   * Formats the DateTime using a token string. Tokens are substituted
   * with locale-aware date and time parts; any other characters are
   * passed through unchanged. Wrap a substring in single or double
   * quotes to escape it from token replacement.
   *
   * @example
   *
   *  dt.format('M/d/yyyy');     // 4/7/2026
   *  dt.format('hh:mm a');      // 09:30 am
   *  dt.format("yyyy 'at' H:mm"); // 2026 at 9:30
   *
   * ### Token reference
   *
   * | Token   | Example   | Description                                |
   * | ------- | --------- | ------------------------------------------ |
   * | `yyyy`  | `2026`    | 4-digit year                               |
   * | `yy`    | `26`      | 2-digit year                               |
   * | `M`     | `4`       | Month, no padding                          |
   * | `MM`    | `04`      | Month, zero-padded                         |
   * | `d`     | `7`       | Day of month, no padding                   |
   * | `dd`    | `07`      | Day of month, zero-padded                  |
   * | `h`     | `9`       | Hour (12-hour clock), no padding           |
   * | `hh`    | `09`      | Hour (12-hour clock), zero-padded          |
   * | `H`     | `9`       | Hour (24-hour clock), no padding           |
   * | `HH`    | `09`      | Hour (24-hour clock), zero-padded          |
   * | `m`     | `5`       | Minute, no padding                         |
   * | `mm`    | `05`      | Minute, zero-padded                        |
   * | `s`     | `8`       | Second, no padding                         |
   * | `ss`    | `08`      | Second, zero-padded                        |
   * | `a`     | `am`      | Meridiem, lower case                       |
   * | `A`     | `AM`      | Meridiem, upper case                       |
   * | `Z`     | `+5`      | Timezone offset, compact                   |
   * | `ZZ`    | `+0500`   | Timezone offset, no separator              |
   * | `ZZZ`   | `+05:00`  | Timezone offset, colon separator           |
   * | `ZZZZ`  | `EST`     | Timezone abbreviation, short               |
   * | `ZZZZZ` | `Eastern Standard Time` | Timezone name, long          |
   *
   * For finer-grained control over output (e.g. AM/PM rendering style),
   * see the {@link FormatOptions} overload.
   */
  format(format: string): string;

  format(format?: string | FormatOptions, options?: DateTimeOptions): string {
    if (this.isInvalid()) {
      return 'Invalid DateTime';
    }

    // Merge default options.
    options = {
      ...this.options,
      ...options,
    };

    if (typeof format === 'string') {
      return formatWithTokens(this, format, options);
    } else {
      format ||= DATETIME_LONG as FormatOptions;
      return formatWithLocale(this, {
        ...format,
        ...options,
      });
    }
  }

  // Relative formatting

  /**
   * Formats the DateTime relative to another point in time (defaults to
   * now), producing strings like `"5 minutes ago"` or `"in 3 days"`.
   *
   * When the DateTime falls outside the `min`/`max` bounds, the result
   * falls back to an absolute format: a time of day for same-day values,
   * a month-and-day for same-year values, or a full date otherwise.
   *
   * See {@link RelativeOptions} for available options.
   *
   * @example
   *
   * dt.relative();
   * // "5 minutes ago"
   *
   * // With a 6-hour window, values older than 6 hours fall back to absolute:
   * dt.relative({
   *   min: new DateTime().rewind(6, 'hours'),
   * });
   * // Progressively renders:
   * //   "1 minute ago"
   * //   "5 hours ago"
   * //   "11:00pm"
   * //   "March 15"
   * //   "June 15 2018"
   */
  relative(options?: RelativeOptions) {
    return formatRelative(this, {
      ...this.options,
      ...options,
    });
  }

  // Advancing

  /**
   * Advances the DateTime by a number of units.
   *
   * @example
   * new DateTime().advance(6, 'months')
   */
  advance(by: number, unit: Unit): DateTime;

  /**
   * Advances the DateTime by multiple units at once.
   *
   * @example
   * new DateTime().advance({
   *   months: 6,
   *   days: 15
   * })
   */
  advance(by: DateParams): DateTime;
  advance(by: AdvanceBy, unit?: Unit): DateTime {
    return advanceDate(this, 1, by, unit);
  }

  /**
   * Rewinds the DateTime by a number of units.
   *
   * @example
   * new DateTime().rewind(6, 'months')
   */
  rewind(by: number, unit: Unit): DateTime;
  /**
   * Rewinds the DateTime by multiple units at once.
   *
   * @example
   * new DateTime().rewind({
   *   months: 6,
   *   days: 15
   * })
   */
  rewind(by: DateParams): DateTime;
  rewind(by: AdvanceBy, unit?: Unit): DateTime {
    return advanceDate(this, -1, by, unit);
  }

  // Edges

  /**
   * Rewinds the DateTime to the start of the specified unit.
   *
   * @example
   *
   * dt.startOf('month'); // First millisecond of the current month
   */
  startOf(unit: Unit) {
    return startOf(this, unit);
  }

  /**
   * Advances the DateTime to the end of the specified unit.
   *
   * @example
   *
   * dt.endOf('day'); // Last millisecond of the current day
   */
  endOf(unit: Unit) {
    return endOf(this, unit);
  }

  // Calendar boundaries

  /**
   * Rewinds the DateTime to the start of the year.
   */
  startOfYear() {
    return startOf(this, 'year');
  }

  /**
   * Rewinds the DateTime to the start of the month.
   */
  startOfMonth() {
    return startOf(this, 'month');
  }

  /**
   * Rewinds the DateTime to the start of the calendar month.
   * This may push the date into the previous month.
   */
  startOfCalendarMonth() {
    return this.startOfMonth().startOfWeek();
  }

  /**
   * Rewinds the DateTime to the start of the week.
   */
  startOfWeek() {
    return startOf(this, 'week');
  }

  /**
   * Rewinds the DateTime to the start of the day.
   */
  startOfDay() {
    return startOf(this, 'day');
  }

  /**
   * Advances the DateTime to the end of the year.
   */
  endOfYear() {
    return endOf(this, 'year');
  }

  /**
   * Advances the DateTime to the end of the month.
   */
  endOfMonth() {
    return endOf(this, 'month');
  }

  /**
   * Advances the DateTime to the end of the calendar month.
   * This may push the date into the next month.
   */
  endOfCalendarMonth() {
    return this.endOfMonth().endOfWeek();
  }

  /**
   * Advances the DateTime to the end of the week.
   */
  endOfWeek() {
    return endOf(this, 'week');
  }

  /**
   * Advances the DateTime to the end of the day.
   */
  endOfDay() {
    return endOf(this, 'day');
  }

  // Validation & utilities

  /**
   * Returns the number of days in the month.
   */
  daysInMonth() {
    return daysInMonth(this);
  }

  /**
   * Resets the time to 00:00:00.000. Equivalent to {@link startOfDay}.
   */
  resetTime() {
    return this.setArgs(this.getFullYear(), this.getMonth(), this.getDate());
  }

  /**
   * Returns true if the DateTime is invalid.
   */
  isInvalid() {
    return isInvalidDate(this);
  }

  /**
   * Returns true if the DateTime is valid.
   */
  isValid() {
    return !this.isInvalid();
  }

  /**
   * Returns true if the DateTime is equivalent to the passed value.
   */
  isEqual(arg: DateResolvable) {
    return this.getTime() === new DateTime(arg).getTime();
  }

  /**
   * Returns a clone of the DateTime.
   */
  clone() {
    return new DateTime(this.date, this.options);
  }

  // JS Date getters

  /**
   * Gets the year of the DateTime.
   */
  getFullYear() {
    return toUTC(this).getUTCFullYear();
  }

  /**
   * @alias {@link getFullYear}
   */
  getYear() {
    return this.getFullYear();
  }

  /**
   * Gets the month of the DateTime. Note that months are zero based so
   * January is 0.
   */
  getMonth() {
    return toUTC(this).getUTCMonth();
  }

  /**
   * Gets the day of the month of the DateTime.
   */
  getDate() {
    return toUTC(this).getUTCDate();
  }

  /**
   * Gets the day of the week of the DateTime, where 0 is Sunday.
   */
  getDay() {
    return toUTC(this).getUTCDay();
  }

  /**
   * Gets the hours of the DateTime.
   */
  getHours() {
    return toUTC(this).getUTCHours();
  }

  /**
   * Gets the minutes of the DateTime.
   */
  getMinutes() {
    return toUTC(this).getUTCMinutes();
  }

  /**
   * Gets the seconds of the DateTime.
   */
  getSeconds() {
    return toUTC(this).getUTCSeconds();
  }

  /**
   * Gets the milliseconds of the DateTime.
   */
  getMilliseconds() {
    return toUTC(this).getUTCMilliseconds();
  }

  /**
   * Gets the year in UTC.
   */
  getUTCFullYear() {
    return this.date.getUTCFullYear();
  }

  /**
   * Gets the month in UTC.
   */
  getUTCMonth() {
    return this.date.getUTCMonth();
  }

  /**
   * Gets the day of the month in UTC.
   */
  getUTCDate() {
    return this.date.getUTCDate();
  }

  /**
   * Gets the day of the week in UTC, where 0 is Sunday.
   */
  getUTCDay() {
    return this.date.getUTCDay();
  }

  /**
   * Gets the hours in UTC.
   */
  getUTCHours() {
    return this.date.getUTCHours();
  }

  /**
   * Gets the minutes in UTC.
   */
  getUTCMinutes() {
    return this.date.getUTCMinutes();
  }

  /**
   * Gets the seconds in UTC.
   */
  getUTCSeconds() {
    return this.date.getUTCSeconds();
  }

  /**
   * Gets the milliseconds in UTC.
   */
  getUTCMilliseconds() {
    return this.date.getUTCMilliseconds();
  }

  // JS Date setters

  /**
   * Sets the year of the DateTime.
   */
  setFullYear(year: number) {
    const utc = toUTC(this);
    return this.setUTCTime(utc.setUTCFullYear(year));
  }

  /**
   * @alias {@link setFullYear}
   */
  setYear(year: number) {
    return this.setFullYear(year);
  }

  /**
   * Sets the month of the DateTime. Note that months are zero based so
   * January is 0.
   */
  setMonth(month: number) {
    const utc = toUTC(this);
    return this.setUTCTime(utc.setUTCMonth(month));
  }

  /**
   * Sets the day of the month of the DateTime.
   */
  setDate(date: number) {
    const utc = toUTC(this);
    return this.setUTCTime(utc.setUTCDate(date));
  }

  /**
   * Sets the hours of the DateTime.
   */
  setHours(hours: number) {
    const utc = toUTC(this);
    return this.setUTCTime(utc.setUTCHours(hours));
  }

  /**
   * Sets the minutes of the DateTime.
   */
  setMinutes(minutes: number) {
    const utc = toUTC(this);
    return this.setUTCTime(utc.setUTCMinutes(minutes));
  }

  /**
   * Sets the seconds of the DateTime.
   */
  setSeconds(seconds: number) {
    const utc = toUTC(this);
    return this.setUTCTime(utc.setUTCSeconds(seconds));
  }

  /**
   * Sets the milliseconds of the DateTime.
   */
  setMilliseconds(milliseconds: number) {
    const utc = toUTC(this);
    return this.setUTCTime(utc.setUTCMilliseconds(milliseconds));
  }

  // JS Date UTC setters

  /**
   * Sets full year of the DateTime in UTC.
   */
  setUTCFullYear(year: number) {
    const date = new Date(this.date);
    return this.setTime(date.setUTCFullYear(year));
  }

  /**
   * Sets month of the DateTime in UTC.
   */
  setUTCMonth(month: number) {
    const date = new Date(this.date);
    return this.setTime(date.setUTCMonth(month));
  }

  /**
   * Sets the day of the month in UTC.
   */
  setUTCDate(utcDate: number) {
    const date = new Date(this.date);
    return this.setTime(date.setUTCDate(utcDate));
  }

  /**
   * Sets hours of the DateTime in UTC.
   */
  setUTCHours(hours: number) {
    const date = new Date(this.date);
    return this.setTime(date.setUTCHours(hours));
  }

  /**
   * Sets minutes of the DateTime in UTC.
   */
  setUTCMinutes(minutes: number) {
    const date = new Date(this.date);
    return this.setTime(date.setUTCMinutes(minutes));
  }

  /**
   * Sets seconds of the DateTime in UTC.
   */
  setUTCSeconds(seconds: number) {
    const date = new Date(this.date);
    return this.setTime(date.setUTCSeconds(seconds));
  }

  /**
   * Sets milliseconds of the DateTime in UTC.
   */
  setUTCMilliseconds(milliseconds: number) {
    const date = new Date(this.date);
    return this.setTime(date.setUTCMilliseconds(milliseconds));
  }

  // Custom setters

  /**
   * Returns a new DateTime at the given timestamp. Accepts either a
   * millisecond number or a parseable time string. In the string form
   * the time-of-day components are applied to the existing date.
   *
   * @example
   *
   * dt.setTime(1735657200000); // Replace with millisecond timestamp
   * dt.setTime('14:30');       // Replace time of day, keep date
   */
  setTime(time: string | number) {
    if (typeof time === 'string') {
      const { params, utc } = parseTime(time);
      return setComponents(this, params, utc);
    } else {
      return new DateTime(time, this.options);
    }
  }

  /**
   * Returns a new DateTime with the given component fields applied.
   * Unspecified components are preserved from the original.
   *
   * @example
   *
   * dt.set({ year: 2026, month: 0 }); // Same dt with year/month replaced
   */
  set(components: DateParams) {
    return setComponents(this, components);
  }

  /**
   * Creates a new DateTime from numeric arguments. Identical to the
   * enumerated-argument constructor, except that the values are
   * interpreted in the DateTime's timezone (or the global timezone)
   * rather than the system timezone.
   *
   * This lets you construct a DateTime from numeric values without the
   * system clock leaking into the result. Internally the values are
   * applied in UTC and then offset by the resolved timezone.
   *
   * @example
   *
   * // System time is GMT-5, global timezone set to Asia/Tokyo (GMT+9):
   * new Date(2020, 0, 1);    // 2019-12-31T19:00:00Z (system-relative)
   * dt.setArgs(2020, 0, 1);  // 2020-01-01T09:00:00Z (Tokyo-relative)
   */
  setArgs(...args: number[]) {
    const enumerated = args as [number, ...number[]];
    return this.setUTCTime(Date.UTC(...enumerated));
  }

  // Timezone

  /**
   * Returns the IANA timezone.
   */
  getTimeZone() {
    return this.options.timeZone;
  }

  /**
   * @alias {@link getTimeZone}
   */
  getTimezone() {
    return this.getTimeZone();
  }

  /**
   * Gets the timezone offset of the DateTime in minutes. This may
   * be the offset of the local or global timezone if one is set,
   * otherwise will be the system offset.
   */
  getTimeZoneOffset() {
    return this.offset;
  }

  /**
   * @alias {@link getTimeZoneOffset}.
   */
  getTimezoneOffset() {
    return this.offset;
  }

  /**
   * Sets the internal timezone of the DateTime.
   */
  setTimeZone(timeZone: string) {
    return new DateTime(this.date, {
      ...this.options,
      timeZone,
    });
  }

  /**
   * @alias {@link setTimeZone}
   */
  setZone(timeZone: string) {
    return this.setTimeZone(timeZone);
  }

  // Names

  /**
   * Returns the English name of the month. `style` follows Intl format
   * with `compact` as a special 2 character form. Default is `long`.
   */
  getMonthName(style?: MonthName) {
    return getMonthName(this, style);
  }

  /**
   * Returns the English name of the weekday. `style` follows Intl format
   * with `compact` as a special 2 character form. Default is `long`.
   */
  getWeekdayName(style?: WeekdayName) {
    return getWeekdayName(this, style);
  }

  // Private

  [DATETIME_SYMBOL] = true;

  // Uses a global Symbol.for key so that instanceof works across
  // different installations or bundled copies of chrono — the usual
  // prototype-chain check fails in those cases.
  static [Symbol.hasInstance](obj: any) {
    return obj?.[DATETIME_SYMBOL];
  }

  [Symbol.toPrimitive](hint: 'number'): number;
  [Symbol.toPrimitive](hint: 'string' | 'default'): string;
  [Symbol.toPrimitive](hint: string): number | string {
    return hint === 'number' ? this.valueOf() : this.toISOString();
  }
}

function isOptionsObject(arg: unknown): arg is DateTimeOptions {
  return arg !== null && typeof arg === 'object' && !isDateLike(arg);
}

function isEnumeratedArgs(
  args: unknown,
): args is [number, number, ...number[]] {
  if (!Array.isArray(args) || args.length < 2) {
    return false;
  }
  return args.every((arg) => {
    return typeof arg === 'number';
  });
}

function isDateLike(arg: unknown): arg is DateLike {
  return arg instanceof Date || arg instanceof DateTime;
}

function advanceDate(dt: DateTime, dir: number, by: AdvanceBy, unit?: Unit) {
  if (typeof by === 'number' && typeof unit === 'string') {
    return advanceDate(dt, dir, {
      [unit]: by,
    } as AdvanceBy);
  }

  const entries = Object.entries(by) as [Unit, number][];

  for (let [name, value] of entries) {
    value *= dir;

    name = normalizeUnit(name);

    switch (name) {
      case 'year':
        dt = dt.setYear(dt.getYear() + value);
        break;
      case 'month':
        dt = advanceMonthSafe(dt, value);
        break;
      case 'week':
        dt = dt.setDate(dt.getDate() + value * 7);
        break;
      case 'day':
        dt = dt.setDate(dt.getDate() + value);
        break;
      case 'hour':
        dt = dt.setHours(dt.getHours() + value);
        break;
      case 'minute':
        dt = dt.setMinutes(dt.getMinutes() + value);
        break;
      case 'second':
        dt = dt.setSeconds(dt.getSeconds() + value);
        break;
      case 'millisecond':
        dt = dt.setMilliseconds(dt.getMilliseconds() + value);
        break;
    }
  }

  return dt;
}

function setComponents(dt: DateTime, components: DateParams, utc?: boolean) {
  const names = Object.keys(components) as Unit[];

  names.sort((a, b) => {
    return getUnitIndex(a) - getUnitIndex(b);
  });

  for (let name of names) {
    const value = components[name] as number;

    name = normalizeUnit(name);

    if (utc) {
      dt = setUTCComponent(dt, name, value) as DateTime;
    } else {
      dt = setComponent(dt, name, value) as DateTime;
    }
  }

  return dt;
}

function setComponent(dt: DateTime, name: SingularUnit, value: number) {
  switch (name) {
    case 'year':
      return dt.setFullYear(value);
    case 'month':
      return dt.setMonth(value - 1);
    case 'day':
      return dt.setDate(value);
    case 'hour':
      return dt.setHours(value);
    case 'minute':
      return dt.setMinutes(value);
    case 'second':
      return setSeconds(dt, value);
    case 'millisecond':
      return dt.setMilliseconds(value);
  }
}

function setUTCComponent(dt: DateTime, name: SingularUnit, value: number) {
  switch (name) {
    case 'year':
      return dt.setUTCFullYear(value);
    case 'month':
      return dt.setUTCMonth(value - 1);
    case 'day':
      return dt.setUTCDate(value);
    case 'hour':
      return dt.setUTCHours(value);
    case 'minute':
      return dt.setUTCMinutes(value);
    case 'second':
      return setUTCSeconds(dt, value);
    case 'millisecond':
      return dt.setUTCMilliseconds(value);
  }
}

function setSeconds(dt: DateTime, seconds: number) {
  const { integer, fraction } = splitSeconds(seconds);

  dt = dt.setSeconds(integer);

  if (fraction) {
    dt = dt.setMilliseconds(fraction);
  }

  return dt;
}

function setUTCSeconds(dt: DateTime, seconds: number) {
  const { integer, fraction } = splitSeconds(seconds);

  dt = dt.setUTCSeconds(integer);

  if (fraction) {
    dt = dt.setUTCMilliseconds(fraction);
  }

  return dt;
}

function splitSeconds(seconds: number) {
  const integer = Math.floor(seconds);
  const fraction = Math.round((seconds % 1) * 1000);
  return { integer, fraction };
}

function formatRelative(dt: DateTime, options: RelativeOptions = {}) {
  const { min, max, locale, numeric = 'auto' } = options;
  const now = new DateTime(options.now);

  const ms = dt.getTime() - now.getTime();
  const msAbs = Math.abs(ms);

  // Outside the min/max window we fall back to absolute formats:
  // a time of day for same-day values, a month-and-day for same-year
  // values, otherwise a full date. See `relative()` JSDoc for examples.
  if (dt < min!) {
    if (dt > now.startOfDay()) {
      return dt.toTimeMedium();
    } else if (dt > now.startOfYear()) {
      return dt.toMonthDay();
    } else {
      return dt.toDateLong();
    }
  } else if (dt > max!) {
    if (dt < now.endOfDay()) {
      return dt.toTimeMedium();
    } else if (dt < now.endOfYear()) {
      return dt.toMonthDay();
    } else {
      return dt.toDateLong();
    }
  }

  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric,
  });

  // For simple offsets we can return up front just by
  // converting units. Note that we are ignoring days
  // with more or less than 24 hours due to DST shifts
  // as this is acceptable for this case.
  if (msAbs < ONE_MINUTE) {
    return formatter.format(Math.round(ms / ONE_SECOND), 'seconds');
  } else if (msAbs < ONE_HOUR) {
    return formatter.format(Math.round(ms / ONE_MINUTE), 'minutes');
  } else if (msAbs < ONE_DAY) {
    return formatter.format(Math.round(ms / ONE_HOUR), 'hours');
  } else if (msAbs < ONE_WEEK) {
    return formatter.format(Math.round(ms / ONE_DAY), 'days');
  }

  // Months are trickier as they do not have an exact
  // number of days, so switch strategies here and use
  // the month offset with years (for example 24 for 2
  // years) as a pivot point to determine which unit
  // to render.
  const months = getMonthOffset(dt, now);
  const monthsAbs = Math.abs(months);

  let format;
  if (monthsAbs === 0) {
    format = 'weeks';
  } else if (monthsAbs === 1) {
    // If the absolute month offset is 1 then check
    // the days of the month against each other. For
    // example if the current date is 8/15 then only
    // format as months if the input date is 7/15 or
    // before, otherwise format as weeks.
    const day1 = dt.getDate();
    const day2 = now.getDate();
    if (months === 1) {
      format = day1 >= day2 ? 'months' : 'weeks';
    } else {
      format = day1 <= day2 ? 'months' : 'weeks';
    }
  } else if (monthsAbs >= 12) {
    format = 'years';
  } else {
    format = 'months';
  }

  if (format === 'weeks') {
    const weekOffset = Math.round(ms / ONE_WEEK);
    return formatter.format(weekOffset, 'weeks');
  } else if (format === 'months') {
    return formatter.format(months, 'months');
  } else if (format === 'years') {
    const yearOffset = Math.round(months / 12);
    return formatter.format(yearOffset, 'years');
  }
}

function getMonthOffset(d1: DateTime, d2: DateTime) {
  const yearOffset = d1.getFullYear() - d2.getFullYear();
  const monthOffset = d1.getMonth() - d2.getMonth();
  return yearOffset * 12 + monthOffset;
}

function toUTC(dt: DateTime) {
  const offset = dt.getTimezoneOffset();
  return new Date(dt.getTime() - offset * ONE_MINUTE);
}

// When rewinding dates we need to ensure that
// we "fall back" instead of falling forward. For
// example when rewinding one month from 12-31 we
// should land on 11-30, not 12-01.
function advanceMonthSafe(dt: DateTime, by: number) {
  const isRewind = by < 0;
  const targetDate = dt.getDate();

  dt = dt.setMonth(dt.getMonth() + by);

  // If the current date is the 1st and the target
  // was more than the maximum days in any month,
  // then we have fallen forward.
  if (isRewind && targetDate > 28) {
    // When rewinding the month on an edge day the date
    // may fall ahead into a new month. For example setting
    // the month to 1 on March 31 will result in February 31,
    // which effectively falls head to March 3rd.
    if (dt.getDate() < 4) {
      // Setting the date to 0 ensures that we will
      // land on the last date of the previous month.
      dt = dt.setDate(0);
    }
  }

  return dt;
}

function startOf(dt: DateTime, unit: Unit) {
  const index = getUnitIndex(unit);

  const year = dt.getFullYear();
  const month = index < 1 ? 0 : dt.getMonth();

  let day;
  if (unit === 'week') {
    const firstDay = getFirstDayOfWeek(dt.options);
    const startOffset = (dt.getDay() - firstDay + 7) % 7;
    day = dt.getDate() - startOffset;
  } else if (index < 3) {
    day = 1;
  } else {
    day = dt.getDate();
  }

  const hours = index < 4 ? 0 : dt.getHours();
  const minutes = index < 5 ? 0 : dt.getMinutes();
  const seconds = index < 6 ? 0 : dt.getSeconds();

  return dt.setArgs(year, month, day, hours, minutes, seconds);
}

function endOf(dt: DateTime, unit: Unit) {
  const index = getUnitIndex(unit);

  const year = dt.getFullYear();
  const month = index < 1 ? 11 : dt.getMonth();

  let day;
  if (unit === 'week') {
    const firstDay = getFirstDayOfWeek(dt.options);
    const endOffset = (firstDay + 6 - dt.getDay() + 7) % 7;
    day = dt.getDate() + endOffset;
  } else if (index < 3) {
    day = daysInMonth(dt.setMonth(month));
  } else {
    day = dt.getDate();
  }

  const hours = index < 4 ? 23 : dt.getHours();
  const minutes = index < 5 ? 59 : dt.getMinutes();
  const seconds = index < 6 ? 59 : dt.getSeconds();

  return dt.setArgs(year, month, day, hours, minutes, seconds, 999);
}

// Formatting Utils

function resolveTimeZoneParams(arg?: TimeZoneName | FormatOptions) {
  return resolveFormatParams(arg, 'timeZoneName', 'short');
}

function resolveMonthParams(arg?: MonthName | FormatOptions) {
  return resolveFormatParams(arg, 'month', 'long');
}

function resolveFormatParams(
  arg: string | FormatOptions | undefined,
  name: string,
  preset: string,
) {
  if (typeof arg === 'string') {
    return {
      [name]: arg,
    };
  } else {
    return {
      [name]: preset,
      ...arg,
    };
  }
}

function toPrecision(str: string, precision: TimePrecision = 'millisecond') {
  let offset;

  precision = precision.replace(/s$/, '') as TimePrecision;

  if (precision === 'millisecond') {
    return str;
  } else if (precision === 'second') {
    offset = -1;
  } else if (precision === 'minute') {
    offset = -2;
  } else {
    throw new Error(`Unknown precision "${precision}".`);
  }

  return str.split(/[:.]/).slice(-4, offset).join(':');
}
