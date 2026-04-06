import { DateTime, FormatOptions } from './types';
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
} as const;

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
} as const;

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
} as const;

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
} as const;

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
} as const;

/**
 * A short time format.
 *
 * @constant
 * @example
 * 9am
 */
export const TIME_SHORT = {
  hour: 'numeric',
} as const;

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
} as const;

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
} as const;

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
} as const;

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
} as const;

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
} as const;

export function formatWithLocale(dt: DateTime, options: FormatOptions = {}) {
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
