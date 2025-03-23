import { isAmbiguousTimeZone, getTimezoneOffset } from './timezone';

// Allow any dates parseable by Javascript, however
// exclude odd results that may be caused by partial
// input. For example "08" defaults to August 2001,
// which is unexpected. Additionally do simple year
// checks to prevent unexpected input.
export function parseDate(str, options) {
  const { timeZone } = options;

  const date = new Date(str);

  if (date.getFullYear() === 2001 && !str.includes(2001)) {
    date.setFullYear(new Date().getFullYear());
  }

  // There is no way to determine if the incoming string
  // contains timezone information or not simply by parsing
  // so passing off to utility method to determine this by
  // regex check. If no timezone is specified or the string
  // itself contains timezone information then it is ok to
  // use the system parsed date.
  if (!timeZone || !isAmbiguousTimeZone(str)) {
    return date;
  }

  const localOffset = getTimezoneOffset(date, options);
  const systemOffset = date.getTimezoneOffset();

  date.setMinutes(date.getMinutes() - systemOffset + localOffset);
  return date;
}
