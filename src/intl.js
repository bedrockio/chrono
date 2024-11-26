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

export function getFirstDayOfWeek(locale = getSystemLocale()) {
  try {
    // @ts-ignore
    return new Intl.Locale(locale).weekInfo.firstDay;
  } catch {
    return 0;
  }
}

function getSystemLocale() {
  return new Intl.DateTimeFormat().resolvedOptions().locale;
}
