/**
 * A medium date format.
 *
 * @constant
 * @example
 * January 1, 2020
 */
export const DATE_MED = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

/**
 * A short date format.
 *
 * @constant
 * @example
 * Jan 1, 2020
 */
export const DATE_SHORT = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

/**
 * A narrow date format.
 *
 * @constant
 * @example
 * 1/1/2020
 */
export const DATE_NARROW = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
};

/**
 * A medium date format that includes the weekday.
 *
 * @constant
 * @example
 * Wednesday, January 1, 2020
 */
export const DATE_MED_WEEKDAY = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
};

/**
 * A medium time format.
 *
 * @constant
 * @example
 * 9:00am
 */
export const TIME_MED = {
  hour: 'numeric',
  minute: '2-digit',
};

/**
 * A short time format.
 *
 * @constant
 * @example
 * 9:00a
 */
export const TIME_SHORT = {
  hour: 'numeric',
  minute: '2-digit',
  shortDayPeriod: true,
};

/**
 * A medium hour format.
 *
 * @constant
 * @example
 * 9pm
 */
export const TIME_HOUR = {
  hour: 'numeric',
};

/**
 * A short hour format.
 *
 * @constant
 * @example
 * 9p
 */
export const TIME_SHORT_HOUR = {
  hour: 'numeric',
  shortDayPeriod: true,
};

/**
 * A time format that includes the timezone.
 *
 * @constant
 * @example
 * 9:00am Japan Standard Time
 */
export const TIME_WITH_ZONE = {
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'long',
};

/**
 * A medium datetime format.
 *
 * @constant
 * @example
 * January 1, 2020 9:00pm
 */
export const DATETIME_MED = {
  ...DATE_MED,
  ...TIME_MED,
};

/**
 * A short datetime format.
 *
 * @constant
 * @example
 * Jan 1, 2020 9:00pm
 */
export const DATETIME_SHORT = {
  ...DATE_SHORT,
  ...TIME_MED,
};

/**
 * A narrow datetime format.
 *
 * @constant
 * @example
 * 1/1/2020 9:00pm
 */
export const DATETIME_NARROW = {
  ...DATE_NARROW,
  ...TIME_MED,
};

/**
 * A medium datetime format that includes the weekday.
 *
 * @constant
 * @example
 * Wednesday, January 1, 2020 9:00pm
 */
export const DATETIME_MED_WEEKDAY = {
  ...DATE_MED_WEEKDAY,
  ...TIME_MED,
};

/**
 * A medium month and year format.
 *
 * @constant
 * @example
 * January 2020
 */
export const MONTH_YEAR = {
  year: 'numeric',
  month: 'long',
};

/**
 * A short month and year format.
 *
 * @constant
 * @example
 * Jan 2020
 */
export const MONTH_YEAR_SHORT = {
  year: 'numeric',
  month: 'short',
};

export function formatWithLocale(dt, options = {}) {
  const { date } = dt;
  const { locale, shortDayPeriod, ...rest } = options;

  // Note that Intl.DateTimeFormat which Date uses can be
  // passed unknown options without complaining.
  let str = date.toLocaleString(locale, rest);

  // Make AM/PM prettier.
  // Note: node environments may format with
  // U+202F NARROW NO BREAK SPACE
  // https://unicode-explorer.com/c/202F
  str = str.replace(/\s(AM|PM)/, (match, ampm) => {
    return ampm.toLowerCase();
  });

  if (shortDayPeriod) {
    str = str.replace(/(a|p)m/, '$1');
  }

  return str;
}
