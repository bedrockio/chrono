const TIMEZONE_REG = /Z|[A-Z]{3}|[+-]\d{2}:?\d{2}$/;
const ISO_DATE_REG = /^[+-]?\d{4,5}(-?\d{2})?(-?\d{2})?$/;

export function isAmbiguousTimeZone(str) {
  return !TIMEZONE_REG.test(str) && !ISO_DATE_REG.test(str);
}
