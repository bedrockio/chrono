// Months

export function getMonthName(dt, style = 'long') {
  return getPart(dt, 'month', {
    style,
    month: style,
    timeZone: dt.getTimeZone(),
  });
}

// Weekdays

export function getWeekdayName(dt, style = 'long') {
  return getPart(dt, 'weekday', {
    style,
    weekday: style,
    timeZone: dt.getTimeZone(),
  });
}

export function getWeekdays(options) {
  let { start, locale, style = 'long' } = options;

  start ||= getFirstDayOfWeek(locale);
  locale ||= getSystemLocale();

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

function normalizeCompact(locale, style) {
  if (style === 'compact') {
    const lang = locale.slice(0, 2);
    return HAS_COMPACT.includes(lang) ? 'short' : 'narrow';
  } else {
    return style;
  }
}

function getFirstDayOfWeek(locale) {
  try {
    // @ts-ignore
    return new Intl.Locale(locale).getWeekInfo().firstDay;
  } catch {
    return 0;
  }
}

// Meridiem

export function getMeridiem(arg, options = {}) {
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

// Accepts an instance of either Date or DateTime.
export function getPart(arg, type, options) {
  const { timeZone, style, locale = 'en', ...rest } = options;
  const formatter = new Intl.DateTimeFormat(locale, {
    ...normalizeIntlOptions(locale, rest),
    timeZone,
  });
  const parts = formatter.formatToParts(arg);
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

function normalizeIntlOptions(locale, options) {
  options.month = normalizeCompact(locale, options.month);
  options.weekday = normalizeCompact(locale, options.weekday);
  return options;
}

// Utils

export function getSystemLocale() {
  return new Intl.DateTimeFormat().resolvedOptions().locale;
}

export function getSystemTimeZone() {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone;
}
