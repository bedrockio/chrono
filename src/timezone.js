import { getPart } from './intl';
import { isInvalidDate } from './utils';

const TIMEZONE_REG = /Z|[A-Z]{3}|[+-]\d{2}:?\d{2}$/;
const OFFSET_REG = /([+-])(\d)(?::(\d{2}))?/;

export function isAmbiguousTimeZone(str) {
  return !TIMEZONE_REG.test(str);
}

// This function will advance or rewinde a date so that
// its moment is in the target timezone. Note that the
// act of advancing or rewinding can have unintended
// effects around DST shifts so compensate for those here.
export function setPseudoTimezone(date, options) {
  // First "remove" the system offset to put the date
  // in pseudo ISO time.
  const systemOffset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() - systemOffset);

  const zoneOffset = getTimezoneOffset(date, options);

  // If there is an offset then shift the date so that
  // it is "in" the local timezone.
  if (zoneOffset) {
    date.setMinutes(date.getMinutes() + zoneOffset);
  }

  let shift;

  // The system offset may have changed during a DST shift,
  // for example 2020-11-01 at 2am in Eastern Time so revert.
  shift = date.getTimezoneOffset() - systemOffset;
  if (shift) {
    date.setMinutes(date.getMinutes() - shift);
  }

  // The act of compensating for the system shift may now
  // cause a local timezone shift, so check for this and revert.
  shift = getTimezoneOffset(date, options) - zoneOffset;

  if (shift) {
    date.setMinutes(date.getMinutes() - shift);
  }
}

export function getTimezoneOffset(date, options) {
  if (!options.timeZone) {
    throw new Error('No timezone passed.');
  } else if (isInvalidDate(date)) {
    return null;
  }

  return getTimezoneOffsetByName(date, options);
}

function getTimezoneOffsetByName(date, options) {
  const { timeZone } = options;

  const zoneName = getPart(date, 'timeZoneName', {
    timeZone,
    timeZoneName: 'shortOffset',
  });

  return parseOffset(zoneName);
}

function parseOffset(str) {
  if (str === 'GMT') {
    return 0;
  }

  const match = str.match(OFFSET_REG);

  if (!match) {
    return;
  }

  const [, s, h, m] = match;

  // Note the sign returned from getTimezoneOffset is inverted
  // from the offset name, ie. GMT+9 returns -540.
  const sign = s === '-' ? 1 : -1;

  let offset = Number(h) * 60;

  if (m) {
    offset += Number(m);
  }

  return sign * offset;
}
