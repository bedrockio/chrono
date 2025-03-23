/**
 * @typedef {"year"|"years"|"month"|"months"|"week"|"weeks"|"day"|"days"|
 *           "hour"|"hours"|"minute"|"minutes"|"second"|"seconds"} TimeUnit
 */

/**
 * @typedef {DateTime|Date|number|string} DateLike
 */

import {
  getWeekdays,
  getMeridiem,
  getMonthName,
  getWeekdayName,
  getSystemTimeZone,
} from './intl';

import { parseDate } from './parse';
import { formatWithLocale } from './locale';
import { formatWithTokens } from './tokens';
import { getTimezoneOffset } from './timezone';
import { normalizeUnit, getUnitIndex } from './units';

import {
  DATE_MED,
  DATE_SHORT,
  DATE_NARROW,
  DATE_MED_WEEKDAY,
  TIME_MED,
  TIME_SHORT,
  TIME_HOUR,
  TIME_SHORT_HOUR,
  TIME_WITH_ZONE,
  DATETIME_MED,
  DATETIME_SHORT,
  DATETIME_NARROW,
  DATETIME_MED_WEEKDAY,
  MONTH_YEAR,
  MONTH_YEAR_SHORT,
} from './locale';

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_WEEK = 7 * ONE_DAY;

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
  static DATE_MED = DATE_MED;
  static DATE_SHORT = DATE_SHORT;
  static DATE_NARROW = DATE_NARROW;
  static DATE_MED_WEEKDAY = DATE_MED_WEEKDAY;
  static TIME_MED = TIME_MED;
  static TIME_SHORT = TIME_SHORT;
  static TIME_HOUR = TIME_HOUR;
  static TIME_SHORT_HOUR = TIME_SHORT_HOUR;
  static TIME_WITH_ZONE = TIME_WITH_ZONE;
  static DATETIME_MED = DATETIME_MED;
  static DATETIME_SHORT = DATETIME_SHORT;
  static DATETIME_NARROW = DATETIME_NARROW;
  static DATETIME_MED_WEEKDAY = DATETIME_MED_WEEKDAY;
  static MONTH_YEAR = MONTH_YEAR;
  static MONTH_YEAR_SHORT = MONTH_YEAR_SHORT;

  static options = {};

  /**
   * Gets the global timezone.
   */
  static getTimeZone() {
    return this.options.timeZone;
  }

  /**
   * Sets the global timezone.
   *
   * @param {string} timeZone
   */
  static setTimeZone(timeZone) {
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
   *
   * @param {string} locale
   */
  static setLocale(locale) {
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
   *
   * @param {Object} options
   */
  static setOptions(options) {
    for (let [key, value] of Object.entries(options)) {
      if (value === null) {
        delete this.options[key];
      } else if (value) {
        this.options[key] = value;
      }
    }
  }

  /**
   * Returns the minimum value passed in as a DateTime.
   *
   * @param {...DateLike} args
   * @returns DateTime
   */
  static min(...args) {
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
   *
   * @param {...DateLike} args
   * @returns DateTime
   */
  static max(...args) {
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
   *
   * @param {DateLike} arg
   * @param {DateLike} min
   * @param {DateLike} max
   * @returns DateTime
   */
  static clamp(arg, min, max) {
    if (!arg) {
      return null;
    }
    return this.min(this.max(arg, min), max);
  }

  /**
   * Gets the months of the year for a given locale. Options are:
   *
   * - `locale` - If not passed will use the global locale or fall
   *              back to the system locale.
   * - `style` -  Will be passed as `month` to Intl.DateTimeFormat. Default `long`.
   *
   * @param {Object} options
   * @param {string} [options.locale]
   * @param {"long"|"short"|"narrow"} [options.style]
   */
  static getMonths(options = {}) {
    let { locale, style = 'long' } = options;

    locale ||= DateTime.options.locale;

    const formatter = new Intl.DateTimeFormat(locale, {
      month: style,
    });

    return Array.from(new Array(12), (_, i) => {
      return formatter.format(new Date(2020, i));
    });
  }

  /**
   * Gets the weekday names for a given locale. Options are:
   *
   * - `locale` - If not passed will use the global locale or fall
   *              back to the system locale.
   * - `start` -  An explicit start day of the week, 0 for sunday, 6 for Saturday.
   *              Will fall back to the locale defined first day.
   * - `style` -  Will be passed as `weekday` to Intl.DateTimeFormat. Default `long`.
   *
   * @param {Object} options
   * @param {string} [options.locale]
   * @param {number} [options.start]
   * @param {"long"|"short"|"narrow"} [options.style]
   */
  static getWeekdays(options = {}) {
    return getWeekdays({
      ...this.options,
      ...options,
    });
  }

  /**
   * Gets the meridiem tokens (am/pm) a given locale. Options are:
   *
   * - `locale` - If not passed will use the global locale or fall
   *              back to the system locale.
   * - `lower` -  Return the tokens in lower case.
   * - `style` -  When "short" will return a/p for am/pm tokens only.
   *
   * @param {Object} options
   * @param {string} [options.locale]
   * @param {number} [options.lower]
   * @param {"long"|"short"} [options.style]
   */
  static getMeridiem(options = {}) {
    return Array.from(new Array(2), (_, i) => {
      const date = new Date(Date.UTC(2020, 0, 1, i * 12));
      return getMeridiem(date, {
        ...this.options,
        ...options,
        timeZone: 'UTC',
      });
    });
  }

  /**
   * Creates a DateTime from various input. A single argument may be date input
   * or an options object. Two arguments represents input and an options object.
   * If no arguments are passed the DateTime will be the current date.
   *
   * If the input is a string that specifies a timezone or offset it will be used
   * as is. Otherwise if the `timeZone` option is specified or a global timezone
   * is set it will be parsed in that timezone. If no timezone can be derived the
   * system offset will be used instead.
   *
   * @param {...DateLike|Object} args
   *
   * @example
   * new DateTime();
   * new DateTime('2025-01-01');
   * new DateTime(1735689600000);
   * new DateTime({
   *   locale: 'en-US',
   *   timeZone: 'America/New_York'
   * });
   * new DateTime('Jan 1 2025', {
   *   locale: 'en-US',
   *   timeZone: 'America/New_York'
   * });
   */
  constructor(...args) {
    let options;

    this.date = new Date();
    if (args.length === 0 || isOptionsObject(args[0])) {
      options = args[0];
      args = [];
    } else if (!isEnumeratedArgs(args)) {
      options = {
        ...args[0]?.options,
        ...args[1],
      };
      args = [args[0] ?? Date.now()];
    }

    options = {
      ...DateTime.options,
      ...options,
    };

    if (typeof args[0] === 'string') {
      this.date = parseDate(args[0], options);
    } else {
      // @ts-ignore
      this.date = new Date(...args);
    }

    this.utc = null;
    this.options = options;
    this.offset = getTimezoneOffset(this.date, options);
  }

  // Compatibility

  /**
   * Returns the numeric value of the DateTime instance.
   * @returns {number}
   */
  valueOf() {
    return this.getTime();
  }

  /**
   * Returns a default formatted string that represents the DateTime.
   */
  toString() {
    return this.format();
  }

  /**
   * Returns the [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601)
   * representation of the DateTime.
   */
  toISOString() {
    return this.date.toISOString();
  }

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
   * Returns the date component of the DateTime. The result will
   * be in the specified timezone, either that passed or set globally.
   *
   * @example
   * 2025-01-01
   */
  toDate() {
    const str = toUTC(this).toISOString();
    return str.split('T')[0];
  }

  /**
   * Returns the time component of the DateTime. The result will
   * be in the specified timezone, either that passed or set globally.
   *
   * @example
   * 12:30:00.000
   */
  toTime() {
    const str = toUTC(this).toISOString();
    return str.split('T')[1].slice(0, -1);
  }

  /**
   * Returns the unix timestamp of the DateTime.
   */
  getTime() {
    return this.date.getTime();
  }

  /**
   * Sets the unix timestamp of the DateTime.
   * @param {number} time
   */
  setTime(time) {
    return new DateTime(time, this.options);
  }

  /**
   * Sets the internal timezone of the DateTime.
   * @param {string} timeZone
   */
  setZone(timeZone) {
    return new DateTime(this.date, {
      ...this.options,
      timeZone,
    });
  }

  /**
   * Equivalent to `toISOString`.
   */
  toJSON() {
    return this.date.toISOString();
  }

  // Formatting

  /**
   * Formats the DateTime using various formats accessible as static
   * members of the DateTime class.
   *
   * @param {Object} format
   * @param {Object} options
   */
  format(format = DateTime.DATETIME_MED, options) {
    // Merge everything with defaults.
    options = {
      ...this.options,
      ...options,
    };

    if (typeof format === 'string') {
      return formatWithTokens(this, format, options);
    } else {
      return formatWithLocale(this, {
        ...options,
        ...format,
      });
    }
  }

  /**
   * Formats the date component of the DateTime using a standard
   * representation. The local or global locale will be used when
   * specified.
   *
   * @example
   * January 1, 2025
   */
  formatDate() {
    return this.format(DateTime.DATE_MED);
  }

  /**
   * Formats the time component of the DateTime using a standard
   * representation. The local or global locale will be used when
   * specified.
   *
   * @example
   * 9:00am
   */
  formatTime() {
    return this.format(DateTime.TIME_MED);
  }

  /**
   * Formats the hours component of the DateTime. The local or
   * global locale will be used when specified.
   *
   * @example
   * 9am
   */
  formatHours() {
    return this.format(DateTime.TIME_HOUR);
  }

  /**
   * Formats the month and year components of the DateTime. The
   * local or global locale will be used when specified.
   *
   * @example
   * January 2025
   */
  formatMonthYear() {
    return this.format(DateTime.MONTH_YEAR);
  }

  /**
   * Formats the month and year components of the DateTime in a
   * shortened format. The local or global locale will be used
   * when specified.
   *
   * @example
   * Jan 2025
   */
  formatMonthYearShort() {
    return this.format(DateTime.MONTH_YEAR_SHORT);
  }

  // Relative Formatting

  /**
   * Formats the DateTime in a relative format. Allowed options are:
   *
   * - `now`     - Offset to format relative to. Defaults to the current time.
   * - `min`     - When set will return undefined if the DateTime is before this date.
   * - `max`     - When set will return undefined if the DateTime is after this date.
   * - `numeric` - Passed to Intl.RelativeTimeFormat. Defaults to `auto` but may
   *               also be `always`.
   *
   * @param {Object} [options]
   * @param {DateLike} [options.now]
   * @param {DateLike} [options.min]
   * @param {DateLike} [options.max]
   * @param {string} [options.numeric]
   *
   */
  relative(options) {
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
   * @param {number|Object.<string, number>} by
   * @param {TimeUnit} [unit]
   *
   * @example
   * new DateTime().advance(6, 'months')
   * new DateTime().advance({
   *   months: 6,
   *   days: 15
   * })
   */
  advance(by, unit) {
    return advanceDate(this, 1, by, unit);
  }

  /**
   * Rewinds the DateTime. When the first argument is a number it must
   * be followed by a unit rewinding by that many units. If the first
   * argument is an object it will rewind the date by multiple units.
   *
   * @param {number|Object.<string, number>} by
   * @param {TimeUnit} [unit]
   *
   * @example
   * new DateTime().rewind(6, 'months')
   * new DateTime().rewind({
   *   months: 6,
   *   days: 15
   * })
   */
  rewind(by, unit) {
    return advanceDate(this, -1, by, unit);
  }

  // Edges

  /**
   * Rewinds the DateTime to the start of the specified unit.
   * @param {("year"|"month"|"week"|"day"|"hour"|"minute"|"second")} unit
   */
  startOf(unit) {
    return startOf(this, unit);
  }

  /**
   * Advances the DateTime to the end of the specified unit.
   * @param {("year"|"month"|"week"|"day"|"hour"|"minute"|"second")} unit
   */
  endOf(unit) {
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
    return isNaN(this.getTime());
  }

  /**
   * Returns true if the DateTime is valid.
   */
  isValid() {
    return !this.isInvalid();
  }

  /**
   * Returns true if the DateTime is equivalent to the passed value..
   *
   * @param {DateLike} arg
   */
  isEqual(arg) {
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
   * Alias for `getFullYear`.
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
  setFullYear(year) {
    const utc = toUTC(this);
    return this.setUTCTime(utc.setUTCFullYear(year));
  }

  /**
   * Alias for `setFullYear`.
   */
  setYear(year) {
    return this.setFullYear(year);
  }

  /**
   * Sets the month of the DateTime. Note that months are zero based so
   * January is 0.
   */
  setMonth(month) {
    const utc = toUTC(this);
    return this.setUTCTime(utc.setUTCMonth(month));
  }

  /**
   * Sets the date of the DateTime.
   */
  setDate(date) {
    const utc = toUTC(this);
    return this.setUTCTime(utc.setUTCDate(date));
  }

  /**
   * Sets the hours of the DateTime.
   */
  setHours(hours) {
    const utc = toUTC(this);
    return this.setUTCTime(utc.setUTCHours(hours));
  }

  /**
   * Sets the minutes of the DateTime.
   */
  setMinutes(minutes) {
    const utc = toUTC(this);
    return this.setUTCTime(utc.setUTCMinutes(minutes));
  }

  /**
   * Sets the seconds of the DateTime.
   */
  setSeconds(seconds) {
    const utc = toUTC(this);
    return this.setUTCTime(utc.setUTCSeconds(seconds));
  }

  /**
   * Sets the milliseconds of the DateTime.
   */
  setMilliseconds(milliseconds) {
    const utc = toUTC(this);
    return this.setUTCTime(utc.setUTCMilliseconds(milliseconds));
  }

  // UTC Setters

  /**
   * Sets full year of the DateTime in UTC.
   */
  setUTCFullYear(year) {
    const date = new Date(this.date);
    return this.setTime(date.setUTCFullYear(year));
  }

  /**
   * Sets month of the DateTime in UTC.
   */
  setUTCMonth(month) {
    const date = new Date(this.date);
    return this.setTime(date.setUTCMonth(month));
  }

  /**
   * Sets date of the DateTime in UTC.
   */
  setUTCDate(utcDate) {
    const date = new Date(this.date);
    return this.setTime(date.setUTCDate(utcDate));
  }

  /**
   * Sets hours of the DateTime in UTC.
   */
  setUTCHours(hours) {
    const date = new Date(this.date);
    return this.setTime(date.setUTCHours(hours));
  }

  /**
   * Sets minutes of the DateTime in UTC.
   */
  setUTCMinutes(minutes) {
    const date = new Date(this.date);
    return this.setTime(date.setUTCMinutes(minutes));
  }

  /**
   * Sets seconds of the DateTime in UTC.
   */
  setUTCSeconds(seconds) {
    const date = new Date(this.date);
    return this.setTime(date.setUTCSeconds(seconds));
  }

  /**
   * Sets milliseconds of the DateTime in UTC.
   */
  setUTCMilliseconds(milliseconds) {
    const date = new Date(this.date);
    return this.setTime(date.setUTCMilliseconds(milliseconds));
  }

  /**
   * Sets components of the DateTime by name.
   *
   * @param {Object} components
   * @param {number} [components.year] - The year to set.
   * @param {number} [components.month] - The month to set.
   * @param {number} [components.day] - The day of the month to set.
   * @param {number} [components.hour] - The hours to set.
   * @param {number} [components.hours] - The hours to set.
   * @param {number} [components.minute] - The minutes to set.
   * @param {number} [components.minutes] - The minutes to set.
   * @param {number} [components.second] - The seconds to set.
   * @param {number} [components.seconds] - The seconds to set.
   * @param {number} [components.millisecond] - The milliseconds to set.
   * @param {number} [components.milliseconds] - The milliseconds to set.
   */
  set(components) {
    return setComponents(this, components);
  }

  // Create a new date from arguments. This is identical
  // to using the overloaded constructor, however where
  // numeric values there are relative to the system time,
  // the result here will be relative to the derived timezone.
  //
  // For example:
  //
  // - System time is GMT-5
  // - DateTime.setTimeZone('Asia/Tokyo') (GMT+9)
  //
  // new Date(2020, 0, 1)     -> "2019-12-31T19:00:00Z"
  // this.setArgs(2020, 0, 1) -> "2020-01-01T09:00:00Z"
  //
  // This effectively allows creating a DateTime by numeric
  // values while ignoring the system time (and preserving
  // the timezone and locale). The strategy here is to first
  // set the values in UTC, then subtract the offset, which
  // is derived from either the DateTime's internal timezone
  // or the global timezone.

  /**
   * Sets the arguments for the UTC time.
   *
   * @param {...number} args - A list of arguments representing the date components.
   */
  setArgs(...args) {
    // @ts-ignore
    return this.setUTCTime(Date.UTC(...args));
  }

  /**
   * Returns the IANA timezone.
   * @returns {string}
   */
  getTimeZone() {
    return this.options.timeZone || getSystemTimeZone();
  }

  /**
   * Alias for {@link getTimeZone}.
   */
  getTimezone() {
    return this.getTimeZone();
  }

  /**
   * Gets the timezone offset of the DateTime in minutes. This may
   * be the offset of the local or global timezone if one is set,
   * otherwise will be the system offset.
   *
   * @returns {number}
   */
  getTimeZoneOffset() {
    return this.offset;
  }

  /**
   * Alias for {@link getTimeZoneOffset}.
   */
  getTimezoneOffset() {
    return this.offset;
  }

  /**
   * Returns the English name of the month. `style` follows Intl format
   * with `compact` as a special 2 character form. Default is `long`.
   *
   * @param {'long'|'short'|'compact'|'narrow'} [style]
   */
  getMonthName(style = 'long') {
    return getMonthName(this, style);
  }

  /**
   * Returns the English name of the weekday. `style` follows Intl format
   * with `compact` as a special 2 character form. Default is `long`.
   *
   * @param {'long'|'short'|'compact'|'narrow'} [style]
   */
  getWeekdayName(style = 'long') {
    return getWeekdayName(this, style);
  }

  setUTCTime(time) {
    // Note the target time may have a different offset
    // so do an initial set before adding the offset.
    const dt = this.setTime(time);
    const offset = dt.getTimezoneOffset();
    return dt.setTime(time + offset * ONE_MINUTE);
  }
}

function isOptionsObject(arg) {
  return arg && typeof arg === 'object' && !isDateLike(arg);
}

function isEnumeratedArgs(args) {
  if (args.length < 2) {
    return false;
  }
  return args.every((arg) => {
    return typeof arg === 'number';
  });
}

function isDateLike(arg) {
  return arg instanceof Date || arg instanceof DateTime;
}

function advanceDate(dt, dir, by, unit) {
  if (typeof by === 'number' && typeof unit === 'string') {
    return advanceDate(dt, dir, {
      [unit]: by,
    });
  }

  for (let [name, value] of Object.entries(by)) {
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

function setComponents(dt, components) {
  const names = Object.keys(components);

  names.sort((a, b) => {
    return getUnitIndex(a) - getUnitIndex(b);
  });

  for (let name of names) {
    const value = components[name];

    name = normalizeUnit(name);

    switch (name) {
      case 'year':
        dt = dt.setFullYear(value);
        break;
      case 'month':
        dt = dt.setMonth(value - 1);
        break;
      case 'day':
        dt = dt.setDate(value);
        break;
      case 'hour':
        dt = dt.setHours(value);
        break;
      case 'minute':
        dt = dt.setMinutes(value);
        break;
      case 'second':
        dt = dt.setSeconds(value);
        break;
      case 'millisecond':
        dt = dt.setMilliseconds(value);
        break;
    }
  }

  return dt;
}

function formatRelative(date, options = {}) {
  const { min, max, locale, numeric = 'auto', now = new DateTime() } = options;
  const ms = date - now;

  // Return nothing up front if the offset is outside
  // defined bounds. This allows a fallback to an absolute
  // date. For example:
  //
  // dt.relative({
  //  min: new DateTime().rewind(6, 'months')
  // }) || dt.format();
  //
  // This will render a relative format no earlier than
  // 6 months and fall back to an absolute format otherwise.
  if (date < min || date > max) {
    return;
  }

  const msAbs = Math.abs(ms);
  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric,
  });

  // For simple offsets we can return up front just by
  // converting units. Note that we are ignoring days
  // with more or less than 24 hours due to DST shifts
  // as this is acceptable for this case.
  if (msAbs < ONE_MINUTE) {
    return formatter.format(Math.trunc(ms / ONE_SECOND), 'seconds');
  } else if (msAbs < ONE_HOUR) {
    return formatter.format(Math.trunc(ms / ONE_MINUTE), 'minutes');
  } else if (msAbs < ONE_DAY) {
    return formatter.format(Math.trunc(ms / ONE_HOUR), 'hours');
  } else if (msAbs < ONE_WEEK) {
    return formatter.format(Math.trunc(ms / ONE_DAY), 'days');
  }

  // Months are trickier as they do not have an exact
  // number of days, so switch strategies here and use
  // the month offset with years (for example 24 for 2
  // years) as a pivot point to determine which unit
  // to render.
  const months = getMonthOffset(date, now);
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
    const day1 = date.getDate();
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
    const weekOffset = Math.trunc(ms / ONE_WEEK);
    return formatter.format(weekOffset, 'weeks');
  } else if (format === 'months') {
    return formatter.format(months, 'months');
  } else if (format === 'years') {
    const yearOffset = Math.trunc(months / 12);
    return formatter.format(yearOffset, 'years');
  }
}

function getMonthOffset(d1, d2) {
  const yearOffset = d1.getFullYear() - d2.getFullYear();
  const monthOffset = d1.getMonth() - d2.getMonth();
  return yearOffset * 12 + monthOffset;
}

function toUTC(dt) {
  const offset = dt.getTimezoneOffset();
  return new Date(dt.getTime() - offset * ONE_MINUTE);
}

// When rewinding dates we need to ensure that
// we "fall back" instead of falling forward. For
// example when rewinding one month from 12-31 we
// should land on 11-30, not 12-01.
function advanceMonthSafe(dt, by) {
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

function startOf(dt, unit) {
  const index = getUnitIndex(unit);

  const year = dt.getFullYear();
  const month = index < 1 ? 0 : dt.getMonth();

  let day;
  if (unit === 'week') {
    day = dt.getDate() - dt.getDay();
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

function endOf(dt, unit) {
  const index = getUnitIndex(unit);

  const year = dt.getFullYear();
  const month = index < 1 ? 11 : dt.getMonth();

  let day;
  if (unit === 'week') {
    day = dt.getDate() + (6 - dt.getDay());
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

function daysInMonth(dt) {
  return 32 - new Date(dt.getFullYear(), dt.getMonth(), 32).getDate();
}
