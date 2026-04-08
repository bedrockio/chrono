import { isAmbiguousTimeZone, setPseudoTimezone } from './timezone';
import { DateTimeOptions } from './types';
import { getUnitForIndex } from './units';

// Allow any dates parseable by Javascript, however
// exclude odd results that may be caused by partial
// input. For example "08" defaults to August 2001,
// which is unexpected. Additionally do simple year
// checks to prevent unexpected input.
export function parseDate(str: string, options: DateTimeOptions) {
  const { timeZone } = options;

  str = expandShortISOFormats(str);
  str = stripIncompleteInput(str);

  const date = new Date(str);

  if (date.getFullYear() === 2001 && !str.includes('2001')) {
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

  setPseudoTimezone(date, options);

  return date;
}

const ISO_YEAR_REG = /^[+-]?\d{4,5}$/;
const ISO_MONTH_REG = /^[+-]?\d{4,5}-\d{2}$/;
const ISO_DATE_REG = /^[+-]?\d{4,5}-\d{2}-\d{2}$/;

// In Javascript, parsable date formats that do not include timezone
// information are expected to be parsed in the system timezone. The
// exception to this is ISO-8601 "date-only forms" which includes
// anything that leaves off the time components. According to MDN this
// is due to "a historical spec error that was not consistent with
// ISO-8601 but could not be changed due to web compatibility".
//
// This leads to the following inconsistency in parsing:
//
// - "June 27, 2025" - System time - 2025-06-27T00:04:00.000Z
// - "6/27/2025"     - System time - 2025-06-27T00:04:00.000Z
// - "2025-06-27"    - UTC         - 2025-06-27T00:00:00.000Z
// - "2025-06"       - UTC         - 2025-06-27T00:00:00.000Z
// - "2025"          - UTC         - 2025-06-27T00:00:00.000Z
//
// Assuming a timezone that is GMT-04.
//
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
// https://maggiepint.com/2017/04/11/fixing-javascript-date-web-compatibility-and-reality/
//
// Normalizing these short formats here to be full ISO-8601 ensures
// that they will be consistently parsed in the system time zone.
function expandShortISOFormats(str: string) {
  if (ISO_YEAR_REG.test(str)) {
    str += '-01-01T00:00:00.000';
  } else if (ISO_MONTH_REG.test(str)) {
    str += '-01T00:00:00.000';
  } else if (ISO_DATE_REG.test(str)) {
    str += 'T00:00:00.000';
  }

  return str;
}

// Javascript will happily parse ambiguous digits that
// are almost never intentional with odd defaults that
// exist for historical reasons. For example:
//
// - new Date('8')   -> Aug 1, 2001
// - new Date('08')  -> Aug 1, 2001
// - new Date('18')  -> Invalid Date
// - new Date('58')  -> Jan 1, 1958
// - new Date('508') -> Jan 1, 508
//
// For this reason strip all digit-only input less than
// four characters as it cannot be disambiguated.
function stripIncompleteInput(str: string) {
  return str.replace(/^\d{1,3}$/, '');
}

// Time string parsing

const TIME_REG =
  /^([012]?\d)(?::?(\d{2}))?(?::(\d{2}))?(?:\.(\d{3}))?(Z)?(?: ?(a|p)\.?m?\.?)?$/i;

interface TimeParams {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

interface ParsedTime {
  utc?: boolean;
  params: TimeParams;
}

type TimeUnit = keyof TimeParams;

export function parseTime(str: string): ParsedTime {
  if (!str) {
    return {
      params: {
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      },
      utc: false,
    };
  }

  const match = str.match(TIME_REG);

  if (!match) {
    throw new Error('Invalid time value');
  }

  const utc = !!match[5];
  const ampm = (match[6] || '').trim().toLowerCase();
  const isAm = ampm === 'a';
  const isPm = ampm === 'p';
  const arr = match?.slice(1, 5);

  const params = {} as TimeParams;

  for (let i = 0; i < arr.length; i++) {
    const str = match?.[i + 1];

    const unit = getUnitForIndex(i + 4) as TimeUnit;

    if (str) {
      let value = parseInt(str);

      if (unit === 'hour') {
        if (isAm && value === 12) {
          value = 0;
        } else if (isPm && value < 12) {
          value += 12;
        }
      }

      params[unit] = value;
    } else {
      params[unit] = 0;
    }
  }

  return {
    utc,
    params,
  };
}
