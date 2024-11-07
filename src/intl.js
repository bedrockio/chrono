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
