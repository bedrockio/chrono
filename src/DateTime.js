// A timezone and locale aware DateTime.
// This class assumes that support exists for:
//
// - Intl.DateTimeFormat
// - Intl.RelativeTimeFormat

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_WEEK = 7 * ONE_DAY;

const UNITS = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];

export default class DateTime {
  // January 1, 2020
  static DATE_MED = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  // Jan 1, 2020
  static DATE_SHORT = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  // 1/1/2020
  static DATE_NARROW = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };

  // Wednesday, January 1, 2020
  static DATE_MED_WEEKDAY = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  };

  // 9:00am
  static TIME_MED = {
    hour: 'numeric',
    minute: '2-digit',
  };

  // 9:00a
  static TIME_SHORT = {
    hour: 'numeric',
    minute: '2-digit',
    shortDayPeriod: true,
  };

  // 9pm
  static TIME_HOUR = {
    hour: 'numeric',
  };

  // 9p
  static TIME_SHORT_HOUR = {
    hour: 'numeric',
    shortDayPeriod: true,
  };

  // 9:00am Japan Standard Time
  static TIME_TIMEZONE = {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'long',
  };

  // January 1, 2020 9:00pm
  static DATETIME_MED = {
    ...this.DATE_MED,
    ...this.TIME_MED,
  };

  // Jan 1, 2020 9:00pm
  static DATETIME_SHORT = {
    ...this.DATE_SHORT,
    ...this.TIME_MED,
  };

  // 1/1/2020 9:00pm
  static DATETIME_NARROW = {
    ...this.DATE_NARROW,
    ...this.TIME_MED,
  };

  // Wednesday, January 1, 2020 9:00pm
  static DATETIME_MED_WEEKDAY = {
    ...this.DATE_MED_WEEKDAY,
    ...this.TIME_MED,
  };

  // January 2020
  static MONTH_YEAR = {
    year: 'numeric',
    month: 'long',
  };

  // Jan 2020
  static MONTH_YEAR_SHORT = {
    year: 'numeric',
    month: 'short',
  };

  static options = {};

  static setTimeZone(timeZone) {
    this.setOptions({
      timeZone,
    });
  }

  static setLocale(locale) {
    this.setOptions({
      locale,
    });
  }

  static setOptions(options) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  constructor(...args) {
    if (args.length === 0 || isOptionsObject(args[0])) {
      this.date = new Date();
      this.options = args[0] || {};
    } else {
      this.date = new Date(args[0] ?? Date.now());
      this.options = args[1];
    }
    this.offset = null;
    this.utc = null;
  }

  // Compatibility

  /**
   * Returns the numeric value of the DateTime instance.
   * @returns {number}
   */
  valueOf() {
    return this.getTime();
  }

  toString() {
    return this.format();
  }

  toISOString() {
    return this.date.toISOString();
  }

  toISODate() {
    const str = this.toISOString();
    return str.split('T')[0];
  }

  toISOTime() {
    const str = this.toISOString();
    return str.split('T')[1].slice(0, -1);
  }

  toDate() {
    const str = this.toUTC().toISOString();
    return str.split('T')[0];
  }

  toTime() {
    const str = this.toUTC().toISOString();
    return str.split('T')[1].slice(0, -1);
  }

  getTime() {
    return this.date.getTime();
  }

  setTime(time) {
    return new DateTime(time, this.options);
  }

  toJSON() {
    return this.date.toISOString();
  }

  // Formatting

  /**
   * @param {Object} format
   * @param {Object} options
   */
  format(format = DateTime.DATETIME_MED, options) {
    // Merge everything with defaults.
    options = {
      ...DateTime.options,
      ...this.options,
      ...options,
      ...format,
    };

    // Note that Intl.DateTimeFormat which Date uses can be
    // passed unknown options without complaining.
    let str = this.date.toLocaleString(options.locale, options);

    // Make AM/PM prettier.
    // Note: node environments may format with
    // U+202F NARROW NO BREAK SPACE
    // https://unicode-explorer.com/c/202F
    str = str.replace(/\s(AM|PM)/, (match, ampm) => {
      return ampm.toLowerCase();
    });

    if (format.shortDayPeriod) {
      str = str.replace(/(a|p)m/, '$1');
    }

    return str;
  }

  formatDate() {
    return this.format(DateTime.DATE_MED);
  }

  formatTime() {
    return this.format(DateTime.TIME_MED);
  }

  formatHours() {
    return this.format(DateTime.TIME_HOUR);
  }

  formatMonthYear() {
    return this.format(DateTime.MONTH_YEAR);
  }

  formatMonthYearShort() {
    return this.format(DateTime.MONTH_YEAR_SHORT);
  }

  // Relative Formatting

  relative(options) {
    return formatRelative(this, {
      ...DateTime.options,
      ...this.options,
      ...options,
    });
  }

  // Advancing

  advance(by, unit) {
    return advanceDate(this, 1, by, unit);
  }

  rewind(by, unit) {
    return advanceDate(this, -1, by, unit);
  }

  // Edges

  startOf(unit) {
    return startOf(this, unit);
  }

  endOf(unit) {
    return endOf(this, unit);
  }

  // Convenience methods

  startOfYear() {
    return this.startOf('year');
  }

  startOfMonth() {
    return this.startOf('month');
  }

  startOfCalendarMonth() {
    return this.startOfMonth().startOfWeek();
  }

  startOfWeek() {
    return this.startOf('week');
  }

  startOfDay() {
    return this.startOf('day');
  }

  endOfYear() {
    return this.endOf('year');
  }

  endOfMonth() {
    return this.endOf('month');
  }

  endOfCalendarMonth() {
    return this.endOfMonth().endOfWeek();
  }

  endOfWeek() {
    return this.endOf('week');
  }

  endOfDay() {
    return this.endOf('day');
  }

  // Other

  daysInMonth() {
    return daysInMonth(this);
  }

  resetTime() {
    return this.setArgs(this.getFullYear(), this.getMonth(), this.getDate());
  }

  isInvalid() {
    return isNaN(this.getTime());
  }

  isValid() {
    return !this.isInvalid();
  }

  clone() {
    return new DateTime(this.date, this.options);
  }

  // Getters

  getFullYear() {
    return this.toUTC().getUTCFullYear();
  }

  getMonth() {
    return this.toUTC().getUTCMonth();
  }

  getDate() {
    return this.toUTC().getUTCDate();
  }

  getDay() {
    return this.toUTC().getUTCDay();
  }

  getHours() {
    return this.toUTC().getUTCHours();
  }

  getMinutes() {
    return this.toUTC().getUTCMinutes();
  }

  getSeconds() {
    return this.toUTC().getUTCSeconds();
  }

  getMilliseconds() {
    return this.toUTC().getUTCMilliseconds();
  }

  setFullYear(year) {
    const utc = this.toUTC();
    return this.setUTCTime(utc.setUTCFullYear(year));
  }

  setMonth(month) {
    const utc = this.toUTC();
    return this.setUTCTime(utc.setUTCMonth(month));
  }

  setDate(date) {
    const utc = this.toUTC();
    return this.setUTCTime(utc.setUTCDate(date));
  }

  setHours(hours) {
    const utc = this.toUTC();
    return this.setUTCTime(utc.setUTCHours(hours));
  }

  setMinutes(minutes) {
    const utc = this.toUTC();
    return this.setUTCTime(utc.setUTCMinutes(minutes));
  }

  setSeconds(seconds) {
    const utc = this.toUTC();
    return this.setUTCTime(utc.setUTCSeconds(seconds));
  }

  setMilliseconds(milliseconds) {
    const utc = this.toUTC();
    return this.setUTCTime(utc.setUTCMilliseconds(milliseconds));
  }

  // Shortcut for setFullYear
  setYear(year) {
    return this.setFullYear(year);
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

  getTimezoneOffset() {
    this.offset ||= getTimezoneOffset(this.date, {
      ...DateTime.options,
      ...this.options,
    });
    return this.offset;
  }

  // Private

  toUTC() {
    this.utc ||= toUTC(this);
    return this.utc;
  }

  setUTCTime(time) {
    const dt = this.setTime(time);
    const offset = dt.getTimezoneOffset();
    return dt.setTime(dt.getTime() + offset * ONE_MINUTE);
  }
}

function isOptionsObject(arg) {
  return arg && typeof arg === 'object' && !isDateClass(arg);
}

function isDateClass(arg) {
  return arg instanceof Date || arg instanceof DateTime;
}

function advanceDate(dt, dir, by, unit) {
  if (typeof by === 'number' && typeof unit === 'string') {
    return advanceDate(dt, dir, {
      [unit]: by,
    });
  }

  const options = {
    ...DateTime.options,
    ...dt.options,
  };

  const date = new Date(dt.date);
  const localOffset = getTimezoneOffset(date, options);
  const systemOffset = date.getTimezoneOffset();

  for (let [key, val] of Object.entries(by)) {
    val *= dir;

    switch (key) {
      case 'year':
      case 'years':
        date.setFullYear(date.getFullYear() + val);
        break;
      case 'month':
      case 'months':
        advanceMonthSafe(date, val);
        break;
      case 'week':
      case 'weeks':
        date.setDate(date.getDate() + val * 7);
        break;
      case 'day':
      case 'days':
        date.setDate(date.getDate() + val);
        break;
      case 'hour':
      case 'hours':
        date.setHours(date.getHours() + val);
        break;
      case 'minute':
      case 'minutes':
        date.setMinutes(date.getMinutes() + val);
        break;
      case 'second':
      case 'seconds':
        date.setSeconds(date.getSeconds() + val);
        break;
      case 'millisecond':
      case 'milliseconds':
        date.setMilliseconds(date.getMilliseconds() + val);
        break;
    }
  }

  // If the timezone offset has shifted due to a
  // DST transition, then add advance the date by
  // the shifted amount to compensate. For example
  // in America/New_York 2023-11-05T04:00:00.000Z
  // will become 2023-11-06T05:00:00.000Z when
  // advancing by one day. In this case the offset
  // will have shifted from 240 to 300. Note that
  // the system may also have shifted and these may
  // cancel out.
  const localShift = getTimezoneOffset(date, options) - localOffset;
  const systemShift = date.getTimezoneOffset() - systemOffset;
  const shift = localShift - systemShift;

  if (shift) {
    date.setTime(date.getTime() + shift * ONE_MINUTE);
  }

  return new DateTime(date, dt.options);
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

// This method returns the offset for a given timezone,
// otherwise falling back to the system offset.
function getTimezoneOffset(date, options) {
  const { timeZone } = options;
  const systemOffset = date.getTimezoneOffset();

  if (!timeZone) {
    return systemOffset;
  }

  // The string formatted in a given timezone.
  // For example if the moment is 2020-01-01T00:00:00.000Z
  // and the timezone is America/New_York, this will return
  // "12/31/2019, 7:00:00 PM".
  const inZone = date.toLocaleString('en-US', {
    timeZone: options.timeZone,
  });

  // The offset in minutes between the local date and the
  // parsed date. In the above example this will return 300
  // if the system is in UTC time. Note that offets are
  // negative when the timezone is ahead of GMT so GMT+9 is
  // -540. Note also that round is needed as the output
  // format will not contain milliseconds, however this can
  // be disregarded when rounding to the nearest minute.
  // @ts-ignore
  let offset = Math.round((date - new Date(inZone)) / 60000);

  // If the system is NOT in UTC time, we need to add its
  // offset so that it is not taken into account. In the
  // above example if our system time is GMT+9 then the
  // output string will be parsed as "2019-12-31T10:00:00Z",
  // or 19:00 minus a 9 hour offset and the delta will be
  // 5 hours + 9 hours = 14 hours (840)
  // Adding the system offset will result in:
  // 14 hours (840) + -9 hours (-540) = 5 hours (300)
  // which is our intended offset of GMT-5 for
  // America/New_York in EST.
  offset += systemOffset;

  return offset;
}

function toUTC(dt) {
  const offset = dt.getTimezoneOffset();
  return new Date(dt.getTime() - offset * ONE_MINUTE);
}

// When rewinding dates we need to ensure that
// we "fall back" instead of falling forward. For
// example when rewinding one month from 12-31 we
// should land on 11-30, not 12-01.
function advanceMonthSafe(date, amt) {
  const isRewind = amt < 0;
  const targetDate = date.getDate();

  date.setMonth(date.getMonth() + amt);

  // If the current date is the 1st and the target
  // was more than the maximum days in any month,
  // then we have fallen forward.
  if (isRewind && targetDate > 28) {
    // When rewinding the month on an edge day the date
    // may fall ahead into a new month. For example setting
    // the month to 1 on March 31 will result in February 31,
    // which effectively falls head to March 3rd.
    if (date.getDate() < 4) {
      // Setting the date to 0 ensures that we will
      // land on the last date of the previous month.
      date.setDate(0);
    }
  }
}

function startOf(dt, unit) {
  const index = UNITS.indexOf(unit);

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
  const index = UNITS.indexOf(unit);

  const year = dt.getFullYear();
  const month = index < 1 ? 11 : dt.getMonth();

  let day;
  if (unit === 'week') {
    day = dt.getDate() + (6 - dt.getDay());
  } else if (index < 3) {
    day = daysInMonth(dt);
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
