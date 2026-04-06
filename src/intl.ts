// Months

import {
  DateLike,
  DateTime,
  DateTimeOptions,
  IntlOptions,
  MeridiemOptions,
  MonthName,
  WeekdayName,
  WeekdayOptions,
} from './types';

export function getMonthName(dt: DateTime, style: MonthName = 'long') {
  return getPart(dt, 'month', {
    style,
    month: style,
    timeZone: dt.getTimeZone(),
  });
}

// Weekdays

export function getWeekdayName(dt: DateTime, style: WeekdayName = 'long') {
  return getPart(dt, 'weekday', {
    style,
    weekday: style,
    timeZone: dt.getTimeZone(),
  });
}

export function getWeekdays(options: WeekdayOptions) {
  resolveIntlOptions(options);

  let { start, locale, style = 'long' } = options;

  start ||= getFirstDayOfWeek(options);

  return Array.from(new Array(7), (_, i) => {
    const day = (1 + i + start) % 7;

    return getPart(new Date(2017, 0, day), 'weekday', {
      locale,
      style,
      weekday: style,
    });
  });
}

const HAS_COMPACT = [
  'en',
  'fr',
  'de',
  'es',
  'it',
  'pt',
  'nl',
  'ru',
  'sv',
  'da',
  'no',
  'fi',
  'is',
  'pl',
  'cs',
  'sk',
];

function normalizeCompact(locale: string, style?: string) {
  if (style === 'compact') {
    const lang = locale.slice(0, 2);
    return HAS_COMPACT.includes(lang) ? 'short' : 'narrow';
  } else {
    return style;
  }
}

// Week Info

export function getFirstDayOfWeek(options: DateTimeOptions) {
  let { firstDayOfWeek, locale } = options;

  if (firstDayOfWeek == null && locale) {
    firstDayOfWeek = getWeekInfo(locale)?.firstDay;
  }

  if (firstDayOfWeek == null) {
    firstDayOfWeek = 0;
  }

  // Normalize to index 0 for Sunday.
  return firstDayOfWeek % 7;
}

function getWeekInfo(code: string) {
  const locale = new Intl.Locale(code) as any;
  return locale.getWeekInfo?.() || locale.weekInfo;
}

// Meridiem

export function getMeridiem(arg: DateLike, options: MeridiemOptions = {}) {
  const { style, lower } = options;

  let part = getPart(arg, 'dayPeriod', {
    ...options,
    hourCycle: 'h12',
    hour: 'numeric',
    minute: 'numeric',
  });
  const isLatin = /^[a|p]m$/i.test(part);

  if (style === 'short' && isLatin) {
    part = part.slice(0, 1);
  }

  if (lower) {
    part = part.toLowerCase();
  }

  return part;
}

interface GetPartOptions extends IntlOptions {
  style?: string;
}

export function getPart(arg: DateLike, type: string, options: GetPartOptions) {
  const { timeZone, style, locale = 'en', ...rest } = options;
  const formatter = new Intl.DateTimeFormat(locale, {
    ...normalizeIntlOptions(locale, rest),
    timeZone,
  });
  const parts = formatter.formatToParts(arg as Date);
  const part = parts.find((p) => {
    return p.type === type;
  });
  let value = part?.value || '';

  if (style === 'compact') {
    const caps = value.charAt(0).toUpperCase();
    const rest = value.charAt(1);
    value = caps + rest;
  }

  return value;
}

function normalizeIntlOptions(locale: string, options: IntlOptions) {
  options.month = normalizeCompact(locale, options.month) as MonthName;
  options.weekday = normalizeCompact(locale, options.weekday) as WeekdayName;
  return options as Intl.DateTimeFormatOptions;
}

// Utils

export function resolveIntlOptions(options: DateTimeOptions) {
  let { locale, timeZone, firstDayOfWeek } = options;

  const resolved = new Intl.DateTimeFormat(locale, {
    timeZone,
  }).resolvedOptions();

  locale ||= resolved.locale;
  timeZone ||= resolved.timeZone;

  return { locale, timeZone, firstDayOfWeek };
}
