// Internal preset FormatOptions objects used as building blocks for the
// convenience methods on DateTime (toDateLong, formatMedium, etc.).
// These are not part of the public API.

import { DateLike, FormatOptions } from './types';

export const DATE_LONG = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
} as const;

export const DATE_MEDIUM = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
} as const;

export const DATE_SHORT = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
} as const;

export const TIME_LONG = {
  hour: 'numeric',
  minute: '2-digit',
  second: 'numeric',
} as const;

export const TIME_MEDIUM = {
  hour: 'numeric',
  minute: '2-digit',
} as const;

export const TIME_SHORT = {
  hour: 'numeric',
} as const;

export const DATETIME_LONG = {
  ...DATE_LONG,
  ...TIME_MEDIUM,
} as const;

export const DATETIME_MEDIUM = {
  ...DATE_MEDIUM,
  ...TIME_MEDIUM,
} as const;

export const DATETIME_SHORT = {
  ...DATE_SHORT,
  ...TIME_MEDIUM,
} as const;

export const MONTH_YEAR = {
  year: 'numeric',
  month: 'long',
} as const;

export const MONTH_DAY = {
  month: 'long',
  day: 'numeric',
} as const;

export function formatWithLocale(date: DateLike, options: FormatOptions = {}) {
  const { locale, clock, meridiem, ...rest } = options;

  if (clock === '12h') {
    rest.hour12 = true;
  } else if (clock === '24h') {
    rest.hour12 = false;
  }

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
