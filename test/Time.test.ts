import { beforeEach, describe, expect, it } from 'vitest';

import DateTime from '../src/DateTime';
import Time from '../src/Time';
import { mockTime, unmockTime } from './helpers/mocks';

beforeEach(() => {
  DateTime.setLocale('en-US');
  DateTime.setTimeZone('America/New_York');
});

describe('Time', () => {
  describe('constructor', () => {
    describe('no arguments', () => {
      it('should be the current time when no argument passed', () => {
        mockTime('2025-01-01T10:15:20.300Z');
        expect(new Time().toISOString()).toBe('05:15:20.300');
        unmockTime();
      });
    });

    describe('string argument', () => {
      it('should parse a string value', () => {
        expect(new Time('00:00:00.000').toISOString()).toBe('00:00:00.000');
        expect(new Time('01:02:03.450').toISOString()).toBe('01:02:03.450');
      });

      it('should parse with meridiem', () => {
        expect(new Time('9:45am').toISOString()).toBe('09:45:00.000');
        expect(new Time('9:45pm').toISOString()).toBe('21:45:00.000');
        expect(new Time('7a').toISOString()).toBe('07:00:00.000');
        expect(new Time('7p').toISOString()).toBe('19:00:00.000');
        expect(new Time('7am').toISOString()).toBe('07:00:00.000');
        expect(new Time('7pm').toISOString()).toBe('19:00:00.000');
        expect(new Time('7 am').toISOString()).toBe('07:00:00.000');
        expect(new Time('7 pm').toISOString()).toBe('19:00:00.000');
        expect(new Time('7a.m.').toISOString()).toBe('07:00:00.000');
        expect(new Time('7p.m.').toISOString()).toBe('19:00:00.000');
        expect(new Time('7 a.m.').toISOString()).toBe('07:00:00.000');
        expect(new Time('7 p.m.').toISOString()).toBe('19:00:00.000');
        expect(new Time('7AM').toISOString()).toBe('07:00:00.000');
        expect(new Time('7PM').toISOString()).toBe('19:00:00.000');
      });

      it('should parse without meridiem or colon', () => {
        expect(new Time('130').toISOString()).toBe('01:30:00.000');
        expect(new Time('730').toISOString()).toBe('07:30:00.000');
        expect(new Time('1230').toISOString()).toBe('12:30:00.000');
      });

      it('should parse with meridiem but no colon', () => {
        expect(new Time('130a').toISOString()).toBe('01:30:00.000');
        expect(new Time('130am').toISOString()).toBe('01:30:00.000');
        expect(new Time('130p').toISOString()).toBe('13:30:00.000');
        expect(new Time('130pm').toISOString()).toBe('13:30:00.000');
        expect(new Time('730am').toISOString()).toBe('07:30:00.000');
        expect(new Time('730pm').toISOString()).toBe('19:30:00.000');
        expect(new Time('1230am').toISOString()).toBe('00:30:00.000');
        expect(new Time('1230pm').toISOString()).toBe('12:30:00.000');
      });

      it('should parse 12am as midnight and 12pm as noon', () => {
        expect(new Time('12am').toISOString()).toBe('00:00:00.000');
        expect(new Time('12pm').toISOString()).toBe('12:00:00.000');
        expect(new Time('12:30am').toISOString()).toBe('00:30:00.000');
        expect(new Time('12:30pm').toISOString()).toBe('12:30:00.000');
        expect(new Time('5:00pm').toISOString()).toBe('17:00:00.000');
      });

      it('should parse but ignore zulu time', () => {
        expect(new Time('00:00:00.000Z').toISOString()).toBe('00:00:00.000');
        expect(new Time('01:02:03.450Z').toISOString()).toBe('01:02:03.450');
      });

      it('should be invalid on bad input', () => {
        expect(new Time('bad').isInvalid()).toBe(true);
      });
    });

    describe('numeric argument', () => {
      it('should accept a duration in milliseconds', () => {
        expect(new Time(0).toISOString()).toBe('00:00:00.000');
        expect(new Time(1000).toISOString()).toBe('00:00:01.000');
        expect(new Time(60 * 1000).toISOString()).toBe('00:01:00.000');
        expect(new Time(60 * 60 * 1000).toISOString()).toBe('01:00:00.000');
      });

      it('should accept a compound duration', () => {
        const ms = 9 * 60 * 60 * 1000 + 45 * 60 * 1000 + 30 * 1000 + 500;
        expect(new Time(ms).toISOString()).toBe('09:45:30.500');
      });

      it('should accept the last millisecond of the day', () => {
        const ms = 24 * 60 * 60 * 1000 - 1;
        expect(new Time(ms).toISOString()).toBe('23:59:59.999');
      });

      it('should truncate fractional numeric durations', () => {
        expect(new Time(1500.5).toISOString()).toBe('00:00:01.500');
      });

      it('should be invalid for a negative numeric duration', () => {
        expect(new Time(-1500).isInvalid()).toBe(true);
      });
    });

    describe('enumerated arguments', () => {
      it('should accept hours and minutes', () => {
        expect(new Time(9, 45).toISOString()).toBe('09:45:00.000');
      });

      it('should accept hours, minutes, and seconds', () => {
        expect(new Time(9, 45, 30).toISOString()).toBe('09:45:30.000');
      });

      it('should accept all components', () => {
        expect(new Time(9, 45, 30, 500).toISOString()).toBe('09:45:30.500');
      });

      it('should accept midnight', () => {
        expect(new Time(0, 0).toISOString()).toBe('00:00:00.000');
      });
    });

    describe('Date argument', () => {
      it('should take the time components of a Date', () => {
        const date = new Date('2025-01-01T10:15:20.300Z');
        expect(new Time(date).toISOString()).toBe('05:15:20.300');
      });
    });

    describe('DateTime argument', () => {
      it('should take the time components of a DateTime', () => {
        const dt = new DateTime('2025-01-01T10:15:20.300Z');
        expect(new Time(dt).toISOString()).toBe('05:15:20.300');
      });
    });

    describe('Time argument', () => {
      it('should clone an existing Time', () => {
        const original = new Time(9, 45, 30, 500);
        expect(new Time(original).toISOString()).toBe('09:45:30.500');
      });

      it('should preserve overflow values when cloning', () => {
        const original = new Time(25, 30);
        expect(new Time(original).toISOString()).toBe('25:30:00.000');
      });
    });

    describe('normalization', () => {
      it('should normalize parsed strings with out-of-bounds components', () => {
        expect(new Time('09:99').toISOString()).toBe('10:39:00.000');
        expect(new Time('09:00:99').toISOString()).toBe('09:01:39.000');
      });

      it('should truncate fractional component values', () => {
        expect(new Time(9, 30.5).toISOString()).toBe('09:30:00.000');
        expect(new Time(9, 30.7, 30.9, 500.9).toISOString()).toBe(
          '09:30:30.500',
        );
      });

      it('should be invalid when constructed with components that produce a negative time', () => {
        expect(new Time(-1, 0).isInvalid()).toBe(true);
        expect(new Time(0, -1).isInvalid()).toBe(true);
      });
    });

    describe('overflow', () => {
      it('should allow enumerated hours greater than 24', () => {
        expect(new Time(25, 30).toISOString()).toBe('25:30:00.000');
        expect(new Time(28, 0, 0).toISOString()).toBe('28:00:00.000');
      });

      it('should allow a numeric duration greater than 24 hours', () => {
        const ms = 25 * 60 * 60 * 1000 + 30 * 60 * 1000;
        expect(new Time(ms).toISOString()).toBe('25:30:00.000');
      });

      it('should parse strings with hours greater than 24', () => {
        expect(new Time('25:30').toISOString()).toBe('25:30:00.000');
        expect(new Time('26:00:00').toISOString()).toBe('26:00:00.000');
      });

      it('should not treat overflow values as equal to their modular equivalents', () => {
        expect(new Time(25, 0).valueOf()).not.toBe(new Time(1, 0).valueOf());
        expect(new Time('26:00').valueOf()).not.toBe(
          new Time('02:00').valueOf(),
        );
      });
    });
  });

  describe('clone', () => {
    it('should produce a copy with the same components', () => {
      const time = new Time(9, 45, 30, 500);
      expect(time.clone().toISOString()).toBe('09:45:30.500');
    });

    it('should produce a distinct instance', () => {
      const time = new Time(9, 45);
      expect(time.clone()).not.toBe(time);
    });

    it('should preserve overflow values', () => {
      expect(new Time(25, 30).clone().toISOString()).toBe('25:30:00.000');
    });
  });

  describe('isEqual', () => {
    it('should return true for two Times with the same components', () => {
      expect(new Time(9, 45).isEqual(new Time(9, 45))).toBe(true);
      expect(new Time(9, 45, 30, 500).isEqual(new Time(9, 45, 30, 500))).toBe(
        true,
      );
    });

    it('should return false for Times with different components', () => {
      expect(new Time(9, 45).isEqual(new Time(9, 46))).toBe(false);
      expect(new Time(9, 45).isEqual(new Time(10, 45))).toBe(false);
    });

    it('should not treat overflow values as equal to their modular equivalents', () => {
      expect(new Time(25, 0).isEqual(new Time(1, 0))).toBe(false);
    });
  });

  describe('clamp', () => {
    it('should leave times within a single day unchanged', () => {
      expect(new Time(0, 0).clamp().toISOString()).toBe('00:00:00.000');
      expect(new Time(9, 0).clamp().toISOString()).toBe('09:00:00.000');
      expect(new Time(23, 59, 59, 999).clamp().toISOString()).toBe(
        '23:59:59.999',
      );
    });

    it('should clamp overflowing times to 23:59:59.999', () => {
      expect(new Time(24, 0).clamp().toISOString()).toBe('23:59:59.999');
      expect(new Time(25, 30).clamp().toISOString()).toBe('23:59:59.999');
      expect(new Time(48, 0).clamp().toISOString()).toBe('23:59:59.999');
    });

    it('should clamp negative-result times to 00:00:00.000', () => {
      const time = new Time(0, 0).setMinutes(-1);
      expect(time.clamp().toISOString()).toBe('00:00:00.000');
    });

    it('should leave NaN-invalid times unchanged', () => {
      const time = new Time('bad');
      expect(time.clamp().isInvalid()).toBe(true);
    });
  });

  describe('set', () => {
    it('should replace specified components and preserve others', () => {
      const time = new Time(9, 45, 30, 500);
      expect(time.set({ hours: 14 }).toISOString()).toBe('14:45:30.500');
      expect(time.set({ minutes: 0 }).toISOString()).toBe('09:00:30.500');
    });

    it('should accept multiple components at once', () => {
      const time = new Time(9, 45, 30, 500);
      expect(time.set({ hours: 14, minutes: 0 }).toISOString()).toBe(
        '14:00:30.500',
      );
    });

    it('should accept both singular and plural keys', () => {
      const time = new Time(9, 45, 30, 500);
      expect(time.set({ hour: 14 }).toISOString()).toBe('14:45:30.500');
      expect(time.set({ minute: 0 }).toISOString()).toBe('09:00:30.500');
      expect(time.set({ second: 0, millisecond: 0 }).toISOString()).toBe(
        '09:45:00.000',
      );
    });

    it('should allow overflow values', () => {
      expect(new Time(9, 0).set({ hours: 25 }).toISOString()).toBe(
        '25:00:00.000',
      );
    });

    it('should carry over when overshooting', () => {
      const time = new Time(9, 0);
      expect(time.set({ minutes: 60 }).toISOString()).toBe('10:00:00.000');
      expect(time.set({ seconds: 60 }).toISOString()).toBe('09:01:00.000');
      expect(time.set({ milliseconds: 1000 }).toISOString()).toBe(
        '09:00:01.000',
      );
    });

    it('should cascade down for negative values', () => {
      const time = new Time(9, 30);
      expect(time.set({ minutes: -1 }).toISOString()).toBe('08:59:00.000');
      expect(time.set({ seconds: -1 }).toISOString()).toBe('09:29:59.000');
      expect(time.set({ milliseconds: -1 }).toISOString()).toBe('09:29:59.999');
    });

    it('should truncate fractional component values', () => {
      const time = new Time(9, 0);
      expect(time.set({ minutes: 30.7 }).toISOString()).toBe('09:30:00.000');
      expect(time.set({ seconds: 30.9 }).toISOString()).toBe('09:00:30.000');
    });

    it('should be invalid when the result would be a negative time', () => {
      const time = new Time(0, 30);
      expect(time.set({ minutes: -60 }).isInvalid()).toBe(true);
      expect(time.set({ hours: -1 }).isInvalid()).toBe(true);
    });

    it('should validate atomically rather than per-component', () => {
      // hours: -1 alone would be negative, but combined with minutes: 120
      // (which cascades to +2 hours) the final state is valid (1:00:00).
      const time = new Time(0, 30);
      expect(time.set({ hours: -1, minutes: 120 }).toISOString()).toBe(
        '01:00:00.000',
      );
    });
  });

  describe('toParams', () => {
    it('should return an object with singular component keys', () => {
      const time = new Time(14, 30, 45, 250);
      expect(time.toParams()).toEqual({
        hour: 14,
        minute: 30,
        second: 45,
        millisecond: 250,
      });
    });

    it('should default seconds and milliseconds to zero', () => {
      const time = new Time(9, 15);
      expect(time.toParams()).toEqual({
        hour: 9,
        minute: 15,
        second: 0,
        millisecond: 0,
      });
    });

    it('should preserve hours greater than 24 without wrapping', () => {
      const time = new Time(26, 0);
      expect(time.toParams().hour).toBe(26);
    });

  });

  describe('setHours', () => {
    it('should replace the hours and preserve other components', () => {
      const time = new Time(9, 45, 30, 500);
      expect(time.setHours(14).toISOString()).toBe('14:45:30.500');
    });

    it('should preserve hours greater than 24 without wrapping', () => {
      const time = new Time(9, 0);
      expect(time.setHours(25).toISOString()).toBe('25:00:00.000');
    });

    it('should be invalid when the result would be a negative time', () => {
      const time = new Time(9, 0);
      expect(time.setHours(-1).isInvalid()).toBe(true);
    });
  });

  describe('setMinutes', () => {
    it('should replace the minutes and preserve other components', () => {
      const time = new Time(9, 45, 30, 500);
      expect(time.setMinutes(0).toISOString()).toBe('09:00:30.500');
    });

    it('should carry over into hours when overshooting 59', () => {
      const time = new Time(9, 0);
      expect(time.setMinutes(60).toISOString()).toBe('10:00:00.000');
      expect(time.setMinutes(70).toISOString()).toBe('10:10:00.000');
      expect(time.setMinutes(180).toISOString()).toBe('12:00:00.000');
    });

    it('should cascade down when given a negative value', () => {
      const time = new Time(9, 30);
      expect(time.setMinutes(-1).toISOString()).toBe('08:59:00.000');
      expect(time.setMinutes(-60).toISOString()).toBe('08:00:00.000');
      expect(time.setMinutes(-90).toISOString()).toBe('07:30:00.000');
    });

    it('should be invalid when the result would be a negative time', () => {
      const time = new Time(0, 30);
      expect(time.setMinutes(-60).isInvalid()).toBe(true);
    });
  });

  describe('setSeconds', () => {
    it('should replace the seconds and preserve other components', () => {
      const time = new Time(9, 45, 30, 500);
      expect(time.setSeconds(0).toISOString()).toBe('09:45:00.500');
    });

    it('should carry over into minutes when overshooting 59', () => {
      const time = new Time(9, 0, 0);
      expect(time.setSeconds(60).toISOString()).toBe('09:01:00.000');
      expect(time.setSeconds(75).toISOString()).toBe('09:01:15.000');
    });

    it('should cascade down when given a negative value', () => {
      const time = new Time(9, 0, 30);
      expect(time.setSeconds(-1).toISOString()).toBe('08:59:59.000');
    });

    it('should be invalid when the result would be a negative time', () => {
      const time = new Time(0, 0, 30);
      expect(time.setSeconds(-60).isInvalid()).toBe(true);
    });
  });

  describe('setMilliseconds', () => {
    it('should replace the milliseconds and preserve other components', () => {
      const time = new Time(9, 45, 30, 500);
      expect(time.setMilliseconds(0).toISOString()).toBe('09:45:30.000');
    });

    it('should carry over into seconds when overshooting 999', () => {
      const time = new Time(9, 0, 0, 0);
      expect(time.setMilliseconds(1000).toISOString()).toBe('09:00:01.000');
      expect(time.setMilliseconds(1500).toISOString()).toBe('09:00:01.500');
    });

    it('should cascade down when given a negative value', () => {
      const time = new Time(9, 0, 0, 500);
      expect(time.setMilliseconds(-1).toISOString()).toBe('08:59:59.999');
    });

    it('should be invalid when the result would be a negative time', () => {
      const time = new Time(0, 0, 0, 500);
      expect(time.setMilliseconds(-1000).isInvalid()).toBe(true);
    });
  });

  describe('startOf', () => {
    it('should rewind to the start of the hour', () => {
      expect(new Time(9, 45, 30, 500).startOf('hour').toISOString()).toBe(
        '09:00:00.000',
      );
    });

    it('should rewind to the start of the minute', () => {
      expect(new Time(9, 45, 30, 500).startOf('minute').toISOString()).toBe(
        '09:45:00.000',
      );
    });

    it('should rewind to the start of the second', () => {
      expect(new Time(9, 45, 30, 500).startOf('second').toISOString()).toBe(
        '09:45:30.000',
      );
    });

    it('should preserve overflow hours', () => {
      expect(new Time(25, 45, 30, 500).startOf('hour').toISOString()).toBe(
        '25:00:00.000',
      );
    });
  });

  describe('endOf', () => {
    it('should advance to the end of the hour', () => {
      expect(new Time(9, 45, 30, 500).endOf('hour').toISOString()).toBe(
        '09:59:59.999',
      );
    });

    it('should advance to the end of the minute', () => {
      expect(new Time(9, 45, 30, 500).endOf('minute').toISOString()).toBe(
        '09:45:59.999',
      );
    });

    it('should advance to the end of the second', () => {
      expect(new Time(9, 45, 30, 500).endOf('second').toISOString()).toBe(
        '09:45:30.999',
      );
    });

    it('should preserve overflow hours', () => {
      expect(new Time(25, 45, 30, 500).endOf('hour').toISOString()).toBe(
        '25:59:59.999',
      );
    });
  });

  describe('advance', () => {
    it('should advance by hours', () => {
      expect(new Time(9, 0).advance(2, 'hours').toISOString()).toBe(
        '11:00:00.000',
      );
    });

    it('should advance by minutes', () => {
      expect(new Time(9, 0).advance(30, 'minutes').toISOString()).toBe(
        '09:30:00.000',
      );
    });

    it('should preserve overflow when advancing past midnight', () => {
      expect(new Time(23, 0).advance(2, 'hours').toISOString()).toBe(
        '25:00:00.000',
      );
    });

    it('should accept an object of multiple units', () => {
      expect(
        new Time(9, 0).advance({ hours: 2, minutes: 30 }).toISOString(),
      ).toBe('11:30:00.000');
    });

    it('should accept both singular and plural keys in the object form', () => {
      expect(
        new Time(9, 0).advance({ hour: 2, minute: 30 }).toISOString(),
      ).toBe('11:30:00.000');
    });
  });

  describe('rewind', () => {
    it('should rewind by hours', () => {
      expect(new Time(11, 0).rewind(2, 'hours').toISOString()).toBe(
        '09:00:00.000',
      );
    });

    it('should rewind by minutes', () => {
      expect(new Time(9, 30).rewind(30, 'minutes').toISOString()).toBe(
        '09:00:00.000',
      );
    });

    it('should accept an object of multiple units', () => {
      expect(
        new Time(11, 30).rewind({ hours: 2, minutes: 30 }).toISOString(),
      ).toBe('09:00:00.000');
    });

    it('should accept both singular and plural keys in the object form', () => {
      expect(
        new Time(11, 30).rewind({ hour: 2, minute: 30 }).toISOString(),
      ).toBe('09:00:00.000');
    });
  });

  describe('time of day', () => {
    it('should identify night between 00:00 and 05:59', () => {
      expect(new Time(0, 0).isNight()).toBe(true);
      expect(new Time(3, 0).isNight()).toBe(true);
      expect(new Time(5, 59, 59, 999).isNight()).toBe(true);
      expect(new Time(6, 0).isNight()).toBe(false);
    });

    it('should identify morning between 06:00 and 11:59', () => {
      expect(new Time(6, 0).isMorning()).toBe(true);
      expect(new Time(9, 0).isMorning()).toBe(true);
      expect(new Time(11, 59, 59, 999).isMorning()).toBe(true);
      expect(new Time(12, 0).isMorning()).toBe(false);
    });

    it('should identify afternoon between 12:00 and 17:59', () => {
      expect(new Time(12, 0).isAfternoon()).toBe(true);
      expect(new Time(15, 0).isAfternoon()).toBe(true);
      expect(new Time(17, 59, 59, 999).isAfternoon()).toBe(true);
      expect(new Time(18, 0).isAfternoon()).toBe(false);
    });

    it('should identify evening between 18:00 and 23:59', () => {
      expect(new Time(18, 0).isEvening()).toBe(true);
      expect(new Time(21, 0).isEvening()).toBe(true);
      expect(new Time(23, 59, 59, 999).isEvening()).toBe(true);
      expect(new Time(0, 0).isEvening()).toBe(false);
    });

    it('should mod hours by 24 for overflow values', () => {
      expect(new Time(25, 0).isNight()).toBe(true);
      expect(new Time(30, 0).isMorning()).toBe(true);
      expect(new Time(36, 0).isAfternoon()).toBe(true);
      expect(new Time(42, 0).isEvening()).toBe(true);
    });
  });

  describe('format', () => {
    it('should format with 12-hour tokens', () => {
      const time = new Time(9, 45);
      expect(time.format('h:mm a')).toBe('9:45 am');
      expect(time.format('hh:mm A')).toBe('09:45 AM');
    });

    it('should format with 24-hour tokens', () => {
      const time = new Time(21, 5);
      expect(time.format('H:mm')).toBe('21:05');
      expect(time.format('HH:mm')).toBe('21:05');
    });

    it('should format with seconds', () => {
      const time = new Time(9, 45, 30);
      expect(time.format('h:mm:ss a')).toBe('9:45:30 am');
    });
  });

  describe('toString', () => {
    it('should return the medium format', () => {
      expect(new Time(9, 0).toString()).toBe('9:00am');
    });
  });

  describe('format presets', () => {
    it('should format long', () => {
      expect(new Time(9, 0).toLong()).toBe('9:00:00am');
    });

    it('should format medium', () => {
      expect(new Time(9, 0).toMedium()).toBe('9:00am');
    });

    it('should format short', () => {
      expect(new Time(9, 0).toShort()).toBe('9am');
    });
  });

  describe('clock option', () => {
    it('should format the long preset in 24-hour clock', () => {
      const time = new Time(21, 0);
      expect(time.toLong({ clock: '24h' })).toBe('21:00:00');
    });

    it('should format the medium preset in 24-hour clock', () => {
      const time = new Time(21, 0);
      expect(time.toMedium({ clock: '24h' })).toBe('21:00');
    });

    it('should format the short preset in 24-hour clock', () => {
      const time = new Time(21, 0);
      expect(time.toShort({ clock: '24h' })).toBe('21');
    });

    it('should apply to format() with no other options', () => {
      const time = new Time(21, 0);
      expect(time.format({ clock: '24h' })).toBe('21:00');
    });

    it('should compose with the locale option', () => {
      const time = new Time(21, 0);
      expect(time.format({ locale: 'de-DE', clock: '24h' })).toBe('21:00');
    });

    it('should force 12-hour clock when explicitly requested', () => {
      const time = new Time(21, 0);
      expect(time.toMedium({ clock: '12h' })).toBe('9:00pm');
    });
  });

  describe('invalid', () => {
    it('should format invalid Times as "Invalid Time"', () => {
      const time = new Time('bad');
      expect(time.toString()).toBe('Invalid Time');
      expect(time.toISOString()).toBe('Invalid Time');
      expect(time.format()).toBe('Invalid Time');
      expect(time.format('h:mm a')).toBe('Invalid Time');
      expect(time.format({ hour: 'numeric' })).toBe('Invalid Time');
      expect(time.toLong()).toBe('Invalid Time');
      expect(time.toMedium()).toBe('Invalid Time');
      expect(time.toShort()).toBe('Invalid Time');
      expect(`${time}`).toBe('Invalid Time');
    });

    it('should format negative-result Times as "Invalid Time"', () => {
      expect(new Time(-1).toString()).toBe('Invalid Time');
      expect(new Time(0, 0).setMinutes(-1).toString()).toBe('Invalid Time');
    });
  });
});
