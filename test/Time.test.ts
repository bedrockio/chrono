import { beforeEach, describe, expect, it } from 'vitest';

import DateTime from '../src/DateTime';
import Time from '../src/Time';
import { mockTime, unmockTime } from './helpers/time';

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

      it('should parse 12am as midnight and 12pm as noon', () => {
        expect(new Time('12am').toISOString()).toBe('00:00:00.000');
        expect(new Time('12pm').toISOString()).toBe('12:00:00.000');
        expect(new Time('12:30am').toISOString()).toBe('00:30:00.000');
        expect(new Time('12:30pm').toISOString()).toBe('12:30:00.000');
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
  });

  describe('setHours', () => {
    it('should replace the hours and preserve other components', () => {
      const time = new Time(9, 45, 30, 500);
      expect(time.setHours(14).toISOString()).toBe('14:45:30.500');
    });
  });

  describe('setMinutes', () => {
    it('should replace the minutes and preserve other components', () => {
      const time = new Time(9, 45, 30, 500);
      expect(time.setMinutes(0).toISOString()).toBe('09:00:30.500');
    });
  });

  describe('setSeconds', () => {
    it('should replace the seconds and preserve other components', () => {
      const time = new Time(9, 45, 30, 500);
      expect(time.setSeconds(0).toISOString()).toBe('09:45:00.500');
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
});
