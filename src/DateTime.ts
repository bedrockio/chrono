import {
  getFirstDayOfWeek,
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
import { getTimezoneOffset, setPseudoTimezone } from './timezone';
import { formatWithTokens } from './tokens';

import {
  AdvanceBy,
  DateFields,
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

const INSTANCE_KEY = Symbol.for('@bedrockio/chrono');

/**
 * A timezone and locale aware DateTime.
 * This class assumes support for:
 *
 * - `Intl.DateTimeFormat`
 * - `Intl.RelativeTimeFormat`
 *
 *  @class
 */
export default class DateTime {
  static options: DateTimeOptions = {};

  /**
   * Gets the global timezone.
   */
  static getTimeZone() {
    return this.options.timeZone;
  }

  /**
   * Sets the global timezone.
   */
  static setTimeZone(timeZone: string | null) {
    this.setOptions({
      timeZone,
    });
  }

  /**
   * Gets the global locale.
   */
  static getLocale() {
    return this.options.locale;
  }

  /**
   * Sets the global locale.
   */
  static setLocale(locale: string | null) {
    this.setOptions({
      locale,
    });
  }

  /**
   * Gets global options.
   */
  static getOptions() {
    return this.options;
  }

  /**
   * Sets global options.
   */
  static setOptions(options: GlobalDateTimeOptions) {
    for (let [k, value] of Object.entries(options)) {
      const key = k as keyof DateTimeOptions;
      if (value === null) {
        delete this.options[key];
      } else if (value) {
        this.options[key] = value;
      }
    }
  }

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

    const formatter = new Intl.DateTimeFormat(locale, {
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

  /**
   * Creates a DateTime from:
   *
   * - A parseable `string`.
   * - A timestamp as a `number`.
   * - A `Date` object.
   * - A `DateTime` object.
   * - Enumerated arguments.
   *
   * If the input is a string that specifies a timezone or offset it will be used
   * as is. Otherwise if the `timeZone` option is specified or a global timezone
   * is set it will be parsed in that timezone. If no timezone can be derived the
   * system offset will be used as a final fallback.
   *
   * Note also that ISO-8601 formats that do not include a time are also parsed in
   * a manner that is consistent with the above, however **inconsistent** with the
   * `Date` constructor which parses these as UTC for historical reasons.
   *
   * @example
   *
   * new DateTime(); // Current datetime
   * new DateTime('January 1, 2025');
   * new DateTime(1735657200000);
   * new DateTime(2025, 0, 1);
   *
   */
  constructor();

  /**
   * Creates a DateTime with local options.
   *
   * @example
   *
   * new DateTime({
   *   locale: 'en-US',
   *   timeZone: 'America/New_York'
   * });
   */
  constructor(options: DateTimeOptions);

  /**
   * Creates a DateTime from input which may be:
   *
   * - A parseable string.
   * - A timestamp as a number.
   * - A Date object.
   * - Another DateTime object.
   *
   * @example
   *
   * new DateTime(1735689600000);
   * new DateTime('2025-01-01');
   *
   */
  constructor(input: DateResolvable);

  /**
   * Creates a DateTime from input with local options.
   *
   * @example
   *
   * new DateTime('Jan 1 2025', {
   *   locale: 'en-US',
   *   timeZone: 'America/New_York'
   * });
   */
  constructor(input: DateResolvable, options: DateTimeOptions);

  /**
   * Creates a DateTime from enumerated arguments. Note that
   * as with the native date constructor months are 0 indexed.
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
      const enumerated = input as unknown as [number];
      date = new Date(...enumerated);
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

  // Compatibility

  /**
   * Returns a number representing the timestamp of the DateTime in milliseconds.
   */
  getTime() {
    return this.date.getTime();
  }

  /**
   * Sets the timestamp of the DateTime as a number in milliseconds.
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
   * Returns the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601)
   * representation of the DateTime in UTC.
   */
  toISOString() {
    return this.date.toISOString();
  }

  /**
   * Returns a default formatted string that represents the DateTime.
   */
  toString() {
    return this.format();
  }

  // TODO: ensure these fit into the system
  toDateString() {
    return this.toDateMedium();
  }

  toTimeString() {
    return this.toTimeMedium();
  }

  toLocaleDateString() {
    return this.date.toLocaleDateString();
  }

  toLocaleTimeString() {
    return this.date.toLocaleTimeString();
  }

  toUTCString() {
    return this.date.toUTCString();
  }

  /**
   * Equivalent to `toISOString`.
   */
  toJSON() {
    return this.date.toISOString();
  }

  /**
   * Returns a native Date for BSON serialization.
   * @see https://github.com/mongodb/js-bson
   */
  toBSON() {
    return this.date;
  }

  /**
   * Returns the numeric value of the DateTime instance.
   */
  valueOf() {
    return this.getTime();
  }

  // Formatting

  /**
   * Returns the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601)
   * representation of the date component of the DateTime in UTC.
   *
   * @example
   * 2025-01-01
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
   * 12:30:00.000
   */
  toISOTime() {
    const str = this.toISOString();
    return str.split('T')[1].slice(0, -1);
  }

  /**
   * Formats the DateTime in [ISO format](https://en.wikipedia.org/wiki/ISO_8601)
   * and the local timezone.
   *
   * @example
   * 2026-01-01T09:00:00.000
   *
   * @example
   * 2026-01-01T09:00:00
   *
   * @example
   * 2026-01-01T09:00
   */
  toLocalString(precision?: TimePrecision) {
    const local = toUTC(this).toISOString().slice(0, -1);
    return toPrecision(local, precision);
  }

  /**
   * Formats the date component in ISO format but in local timezone.
   *
   * @example
   * 2025-01-01
   *
   */
  toLocalDate() {
    return toUTC(this).toISOString().split('T')[0];
  }

  /**
   * Formats the time component in ISO format but in local timezone.
   *
   * @example
   * 12:30:00.000
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
   * January 1, 2020
   * dateTime.toDateLong();
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
   * Jan 1, 2020
   * dateTime.toDateMedium();
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
   * 1/1/2020
   * dateTime.toDateShort();
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
   * 9:00:00am
   * dateTime.toTimeLong();
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
   * 9:00am
   * dateTime.toTimeLong();
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
   * 9am
   * dateTime.toTimeShort();
   */
  toTimeShort(extra?: FormatOptions) {
    return this.format({
      ...TIME_SHORT,
      ...extra,
    });
  }

  /**
   * Formats the time component with the time zone.
   '
   * @example
   * 9:00am EST
   * dateTime.toTimeWithZone();
   *
   * @example
   * 9:00am Eastern Standard Time
   * dateTime.toTimeWithZone('long');
   *
   * @example
   * 9:00am ET
   * dateTime.toTimeWithZone('shortGeneric');
   *
   * @example
   * 9:00am Eastern Time
   * dateTime.toTimeWithZone('longGeneric');
   *
   * @example
   * 09:00am EST
   * dateTime.toTimeWithZone({ hour: '2-digit' });
   */
  toTimeWithZone(arg?: TimeZoneName | FormatOptions) {
    const extra = resolveTimeZoneParams(arg);
    return this.format({
      ...TIME_MEDIUM,
      ...extra,
    });
  }

  /**
   * Formats the month and year components of the DateTime by locales.
   *
   * @example
   * January 2025
   * dateTime.toMonthYear();
   *
   * @example
   * Jan 2025
   * dateTime.toMonthYear('short');
   *
   * @example
   * Jan 25
   * dateTime.toMonthYear({ month: 'short', year: '2-digit' });
   */
  toMonthYear(arg?: MonthName | FormatOptions) {
    const extra = resolveMonthParams(arg);
    return this.format({
      ...MONTH_YEAR,
      ...extra,
    });
  }

  /**
   * Formats the month and day components of the DateTime by locales.
   *
   * @example
   * January 15
   * dateTime.toMonthDay();
   *
   * @example
   * Jan 15
   * dateTime.toMonthDay('short');
   *
   * @example
   * January 15 at 9am
   * dateTime.toMonthDay({ hour: 'numeric' });
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
   * dateTime.formatLong();
   * January 1, 2020 at 9:00am
   */
  formatLong(extra?: FormatOptions) {
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
   * dateTime.formatMedium();
   * Jan 1, 2020, 9:00am
   */
  formatMedium(extra?: FormatOptions) {
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
   * dateTime.formatShort();
   * 1/1/2020, 9:00am
   */
  formatShort(extra?: FormatOptions) {
    return this.format({
      ...DATETIME_SHORT,
      ...extra,
    });
  }

  /**
   * Formats the DateTime with the time zone.
   '
   * @example
   * dateTime.formatWithZone();
   * January 1, 2020 at 9:00am EST
   *
   * @example
   * dateTime.formatWithZone('long');
   * January 1, 2020 at 9:00am Eastern Standard Time
   *
   * @example
   * dateTime.formatWithZone('shortGeneric');
   * January 1, 2020 at 9:00am ET
   *
   * @example
   * dateTime.formatWithZone('longGeneric');
   * January 1, 2020 at 9:00am Eastern Time
   *
   * @example
   * dateTime.formatTimeWithZone({ month: 'short' });
   * Jan 1, 2020 at 9:00am Eastern Time
   */
  formatWithZone(arg?: TimeZoneName | FormatOptions) {
    const extra = resolveTimeZoneParams(arg);
    return this.format({
      ...DATETIME_LONG,
      ...extra,
    });
  }

  /**
   * Formats the DateTime to standard locale-based format.
   */
  format(): string;

  /**
   * Format the DateTime by locale options similar to
   * [DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options).
   *
   * @example
   *
   *  dt.format({
   *    year: 'numeric',
   *    month: '2-digit',
   *  });
   */
  format(format: FormatOptions, options?: DateTimeOptions): string;

  /**
   * Format the DateTime with a token based format.
   *
   * @example
   *
   *  dt.format('M/d/yyyy');
   *  dt.format('hh:mm');
   */
  format(format: string): string;

  format(format?: string | FormatOptions, options?: DateTimeOptions): string {
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

  // Relative Formatting

  /**
   * Formats the DateTime in a relative format. Allowed options are:
   */
  relative(options?: RelativeOptions) {
    return formatRelative(this, {
      ...this.options,
      ...options,
    });
  }

  // Advancing

  /**
   * Advances the DateTime. When the first argument is a number it must
   * be followed by a unit advancing by that many units. If the first
   * argument is an object it will advance the date by multiple units.
   *
   * @example
   * new DateTime().advance(6, 'months')
   * new DateTime().advance({
   *   months: 6,
   *   days: 15
   * })
   */
  advance(by: AdvanceBy, unit?: Unit) {
    return advanceDate(this, 1, by, unit);
  }

  /**
   * Rewinds the DateTime. When the first argument is a number it must
   * be followed by a unit rewinding by that many units. If the first
   * argument is an object it will rewind the date by multiple units.
   *
   * @example
   * new DateTime().rewind(6, 'months')
   * new DateTime().rewind({
   *   months: 6,
   *   days: 15
   * })
   */
  rewind(by: AdvanceBy, unit?: Unit) {
    return advanceDate(this, -1, by, unit);
  }

  // Edges

  /**
   * Rewinds the DateTime to the start of the specified unit.
   */
  startOf(unit: Unit) {
    return startOf(this, unit);
  }

  /**
   * Advances the DateTime to the end of the specified unit.
   */
  endOf(unit: Unit) {
    return endOf(this, unit);
  }

  // Convenience methods

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

  // Other

  /**
   * Returns the number of days in the month.
   */
  daysInMonth() {
    return daysInMonth(this);
  }

  /**
   * Resets the time to 00:00:00.000. Equivalent to `startOfDay`.
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
   * Returns true if the DateTime is equivalent to the passed value..
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

  // Getters

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
   * Gets the date of the DateTime.
   */
  getDate() {
    return toUTC(this).getUTCDate();
  }

  /**
   * Gets the day of week of the DateTime from 0 to 6.
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
   * Gets the date in UTC.
   */
  getUTCDate() {
    return this.date.getUTCDate();
  }

  /**
   * Gets the day in UTC.
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
   * Sets the date of the DateTime.
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

  // UTC Setters

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
   * Sets date of the DateTime in UTC.
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

  /**
   * Sets components of the DateTime by name.
   */
  set(components: DateFields) {
    return setComponents(this, components);
  }

  /**
   * Create a new date from arguments. This is identical
   * to using the overloaded constructor, however where
   * numeric values there are relative to the system time,
   * the result here will be relative to the derived timezone.
   *
   * For example:
   *
   * - System time is GMT-5
   * - DateTime.setTimeZone('Asia/Tokyo') (GMT+9)
   *
   * new Date(2020, 0, 1)     -> "2019-12-31T19:00:00Z"
   * this.setArgs(2020, 0, 1) -> "2020-01-01T09:00:00Z"
   *
   * This effectively allows creating a DateTime by numeric
   * values while ignoring the system time (and preserving
   * the timezone and locale). The strategy here is to first
   * set the values in UTC, then subtract the offset, which
   * is derived from either the DateTime's internal timezone
   * or the global timezone.
   */
  setArgs(...args: number[]) {
    const enumerated = args as [number, ...number[]];
    return this.setUTCTime(Date.UTC(...enumerated));
  }

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

  // Allow instanceof check to work across imports.

  [INSTANCE_KEY] = true;

  static [Symbol.hasInstance](obj: any) {
    return obj?.[INSTANCE_KEY];
  }

  setUTCTime(time: number) {
    // Note the target time may have a different offset
    // so do an initial set before adding the offset.
    const dt = this.setTime(time);
    const offset = dt.getTimezoneOffset();
    return dt.setTime(time + offset * ONE_MINUTE);
  }

  // TODO: document and organize compat here

  getVarDate(): VarDate {
    throw new Error('getVarDate is not supported');
  }

  [Symbol.toPrimitive](hint: 'number'): number;
  [Symbol.toPrimitive](hint: 'string' | 'default'): string;
  [Symbol.toPrimitive](hint: string): number | string {
    return hint === 'number' ? this.getTime() : this.toISOString();
  }
}

function isOptionsObject(arg: any) {
  return arg && typeof arg === 'object' && !isDateLike(arg);
}

function isEnumeratedArgs(args: any) {
  if (!Array.isArray(args) || args.length < 2) {
    return false;
  }
  return args.every((arg) => {
    return typeof arg === 'number';
  });
}

function isDateLike(arg: any) {
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

function setComponents(dt: DateTime, components: DateFields, utc?: boolean) {
  components = normalizeComponents(components);

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

function normalizeComponents(components: DateFields) {
  const seconds = components.seconds || components.second;

  if (seconds) {
    const fraction = seconds % 1;
    if (fraction !== 0) {
      components = {
        ...components,
        milliseconds: Math.round(fraction * 1000),
      };
    }
  }

  return components;
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
      return dt.setSeconds(value);
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
      return dt.setUTCSeconds(value);
    case 'millisecond':
      return dt.setUTCMilliseconds(value);
  }
}

function formatRelative(dt: DateTime, options: RelativeOptions = {}) {
  const { min, max, locale, numeric = 'auto' } = options;
  const now = new DateTime(options.now);

  const ms = dt.getTime() - now.getTime();
  const msAbs = Math.abs(ms);

  // Fall back to non-relative formats if outside defined
  // bounds. If we are within a day show a time format,
  // otherwise show a date fromat. For example:
  //
  // dt.relative({
  //  min: new DateTime().rewind(6, 'hours')
  // })
  //
  // Will progressively render:

  // - 1 minute ago
  // - 5 hours ago
  // - 11:00pm
  // - March 15
  // - June 15 2018
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
