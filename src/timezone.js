const TIMEZONE_REG = /Z|[A-Z]{3}|[+-]\d{2}:?\d{2}$/;

export function isAmbiguousTimeZone(str) {
  return !TIMEZONE_REG.test(str);
}

// This method returns the offset for a given timezone,
// otherwise falling back to the system offset.
export function getTimezoneOffset(date, options) {
  const { timeZone } = options;
  const systemOffset = date.getTimezoneOffset();

  if (!timeZone) {
    return systemOffset;
  }

  // The string formatted in a given timezone.
  // For example if the moment is 2020-01-01T00:00:00.000Z
  // and the timezone is America/New_York, this will return
  // "12/31/2019, 7:00:00 PM".
  const inZone = date.toLocaleString('en-US', {
    timeZone: options.timeZone,
  });

  // The offset in minutes between the local date and the
  // parsed date. In the above example this will return 300
  // if the system is in UTC time. Note that offets are
  // negative when the timezone is ahead of GMT so GMT+9 is
  // -540. Note also that round is needed as the output
  // format will not contain milliseconds, however this can
  // be disregarded when rounding to the nearest minute.
  // @ts-ignore
  let offset = Math.round((date - new Date(inZone)) / 60000);

  // If the system is NOT in UTC time, we need to add its
  // offset so that it is not taken into account. In the
  // above example if our system time is GMT+9 then the
  // output string will be parsed as "2019-12-31T10:00:00Z",
  // or 19:00 minus a 9 hour offset and the delta will be
  // 5 hours + 9 hours = 14 hours (840)
  // Adding the system offset will result in:
  // 14 hours (840) + -9 hours (-540) = 5 hours (300)
  // which is our intended offset of GMT-5 for
  // America/New_York in EST.
  offset += systemOffset;

  return offset;
}
