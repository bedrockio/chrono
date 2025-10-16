/**
 * A long date format.
 *
 * @constant
 * @example
 * January 1, 2020
 */
export const DATE_LONG = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

/**
 * A medium date format.
 *
 * @constant
 * @example
 * Jan 1, 2020
 */
export const DATE_MEDIUM = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

/**
 * A short date format.
 *
 * @constant
 * @example
 * 1/1/2020
 */
export const DATE_SHORT = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
};

/**
 * A long time format.
 *
 * @constant
 * @example
 * 9:00:00am
 */
export const TIME_LONG = {
  hour: 'numeric',
  minute: '2-digit',
  second: 'numeric',
};

/**
 * A medium time format.
 *
 * @constant
 * @example
 * 9:00am
 */
export const TIME_MEDIUM = {
  hour: 'numeric',
  minute: '2-digit',
};

/**
 * A short time format.
 *
 * @constant
 * @example
 * 9am
 */
export const TIME_SHORT = {
  hour: 'numeric',
};

/**
 * A long datetime format.
 *
 * @constant
 * @example
 * January 1, 2020 at 9:00am
 */
export const DATETIME_LONG = {
  ...DATE_LONG,
  ...TIME_MEDIUM,
};

/**
 * A medium datetime format.
 *
 * @constant
 * @example
 * Jan 1, 2020, 9:00am
 */
export const DATETIME_MEDIUM = {
  ...DATE_MEDIUM,
  ...TIME_MEDIUM,
};

/**
 * A short datetime format.
 *
 * @constant
 * @example
 * 1/1/2020, 9:00am
 */
export const DATETIME_SHORT = {
  ...DATE_SHORT,
  ...TIME_MEDIUM,
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
 * A medium month and day format.
 *
 * @constant
 * @example
 * January 2020
 */
export const MONTH_DAY = {
  month: 'long',
  day: 'numeric',
};

export function formatWithLocale(dt, options = {}) {
  const { date } = dt;
  const { locale, meridiem, ...rest } = options;

  // Note that Intl.DateTimeFormat which Date uses can be
  // passed unknown options without complaining.
  let str = date.toLocaleString(locale, rest);

  // Make AM/PM prettier.
  // Note: node environments may format with
  // U+202F NARROW NO BREAK SPACE
  // https://unicode-explorer.com/c/202F
  str = str.replace(/\s(AM|PM)/, (match, ampm) => {
    if (meridiem === 'space') {
      ampm = ' ' + ampm;
    }
    if (meridiem !== 'caps') {
      ampm = ampm.toLowerCase();
    }
    return ampm;
  });

  if (meridiem === 'short') {
    str = str.replace(/(a|p)m/, '$1');
  } else if (meridiem === 'period') {
    str = str.replace(/(a|p)m/, ' $1.m.');
  }

  return str;
}
