import { isAmbiguousTimeZone } from '../src/timezone';

function assertAmbiguous(str, expected) {
  expect(isAmbiguousTimeZone(str)).toBe(expected);
}

describe('timezone', () => {
  describe('isAmbiguousTimeZone', () => {
    it('should correctly identify ambiguous time zones', () => {
      // RFC 2822 / RFC 1123 Date Format
      assertAmbiguous('Thu, 07 Nov 2024 14:53:00 GMT', false);
      assertAmbiguous('Fri, 08 Nov 2024 10:30:00 +0000', false);
      assertAmbiguous('Sat, 09 Nov 2024 23:45:00 -0500', false);
      assertAmbiguous('Mon, 11 Nov 2024 08:15:00 +0530', false);
      assertAmbiguous('Wed, 13 Nov 2024 17:20:00 -0200', false);

      // Date Strings with GMT Offset
      assertAmbiguous('Thu, 07 Nov 2024 14:53:00 GMT+0200', false);
      assertAmbiguous('Fri, 08 Nov 2024 09:30:00 GMT-0700', false);
      assertAmbiguous('Sat, 09 Nov 2024 18:45:00 GMT+0000', false);
      assertAmbiguous('Sun, 10 Nov 2024 22:10:00 GMT-0330', false);

      // Date Strings with Time Zone Abbreviations
      assertAmbiguous('Thu, 07 Nov 2024 14:53:00 EST', false);
      assertAmbiguous('Fri, 08 Nov 2024 10:30:00 PST', false);
      assertAmbiguous('Sat, 09 Nov 2024 23:45:00 CST', false);
      assertAmbiguous('Sun, 10 Nov 2024 16:20:00 MST', false);

      // Custom Formats
      assertAmbiguous('2024/11/07 14:53:00 UTC', false);
      assertAmbiguous('2024-11-07 14:53:00 GMT', false);

      // Custom Formats with Time Zone Offset
      assertAmbiguous('11-07-2024 14:53:00 GMT+0100', false);
      assertAmbiguous('November 7, 2024 2:53:00 PM GMT+0200', false);
      assertAmbiguous('07 Nov 2024 14:53:00 GMT-0500', false);

      // Custom Formats with Time Zone Offset in Words
      assertAmbiguous('Thu Nov 07 2024 14:53:00 GMT+02:00', false);
      assertAmbiguous('Fri Nov 08 2024 09:30:00 GMT-07:00', false);

      // ANSI C's `ctime()` Format (No explicit time zone information)
      assertAmbiguous('Thu Nov  7 14:53:00 2024', true);
      assertAmbiguous('Fri Nov  8 10:30:00 2024', true);
      assertAmbiguous('Sat Nov  9 23:45:00 2024', true);

      // Standard ISO 8601 Date Formats (without time zone)
      assertAmbiguous('2024-11-07T14:53:00', true);
      assertAmbiguous('2024-11-07T14:53:00.123', true);

      // Note that for our purposes here the date-only ISO-8601 format
      // is considered to be ambiguous. The Javascript Date constructor
      // will always treat formats that do not have time components as
      // being in UTC but we are trying to rectify this to achieve
      // consistency.
      // https://maggiepint.com/2017/04/11/fixing-javascript-date-web-compatibility-and-reality/
      assertAmbiguous('2024-11-07', true);

      // Variations of Date Formats
      assertAmbiguous('2024/11/07 14:53:00', true);
      assertAmbiguous('2024/11/07 14:53', true);
      assertAmbiguous('2024-11-07 14:53:00', true);
      assertAmbiguous('2024.11.07 14:53:00', true);

      // Date and Time (12-hour format with AM/PM)
      assertAmbiguous('November 7, 2024 2:53:00 PM', true);
      assertAmbiguous('Nov 7, 2024 2:53 PM', true);

      // Date-Only Formats
      assertAmbiguous('11/07/2024', true);
      assertAmbiguous('2024/11/07', true);
      assertAmbiguous('November 7, 2024', true);
      assertAmbiguous('Nov 7, 2024', true);
    });
  });
});
