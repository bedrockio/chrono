// Weekday

export function getWeekdays(options) {
  let { locale, start, style = 'long' } = options;

  locale ||= getSystemLocale();
  start ||= getFirstDayOfWeek(locale);

  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: getIntlWeekdayStyle(locale, style),
  });

  return Array.from(new Array(7), (_, i) => {
    const day = (1 + i + start) % 7;
    let token = formatter.format(new Date(2017, 0, day));
    if (style === 'compact') {
      const caps = token.charAt(0).toUpperCase();
      const rest = token.charAt(1);
      token = caps + rest;
    }
    return token;
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

function getIntlWeekdayStyle(locale, style) {
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
    return new Intl.Locale(locale).weekInfo.firstDay;
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
  const { locale, timeZone, ...rest } = options;
  const formatter = new Intl.DateTimeFormat(locale, {
    ...rest,
    timeZone,
  });
  const parts = formatter.formatToParts(arg);
  const part = parts.find((p) => {
    return p.type === type;
  });
  return part?.value || '';
}

// Utils

export function getSystemLocale() {
  return new Intl.DateTimeFormat().resolvedOptions().locale;
}

export function getSystemTimeZone() {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone;
}
