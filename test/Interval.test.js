import DateTime from '../src/DateTime';
import Interval from '../src/Interval';

DateTime.setTimeZone('Asia/Tokyo');

describe('Interval', () => {
  describe('constructor', () => {
    it('should be able to create from strings', () => {
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z'
      );
      expect(interval.toISOString()).toBe(
        '2025-01-01T00:00:00.000Z/2026-01-01T00:00:00.000Z'
      );
      expect(interval.duration()).toBe(365 * 24 * 60 * 60 * 1000);
    });

    it('should be able to create from native dates', () => {
      const interval = new Interval(
        new Date('2025-01-01T00:00:00.000Z'),
        new Date('2026-01-01T00:00:00.000Z')
      );
      expect(interval.toISOString()).toBe(
        '2025-01-01T00:00:00.000Z/2026-01-01T00:00:00.000Z'
      );
      expect(interval.duration()).toBe(365 * 24 * 60 * 60 * 1000);
    });

    it('should be able to create from DateTime', () => {
      const interval = new Interval(
        new DateTime('2025-01-01T00:00:00.000Z'),
        new DateTime('2026-01-01T00:00:00.000Z')
      );
      expect(interval.toISOString()).toBe(
        '2025-01-01T00:00:00.000Z/2026-01-01T00:00:00.000Z'
      );
      expect(interval.duration()).toBe(365 * 24 * 60 * 60 * 1000);
    });

    it('should be able to create from timestamp', () => {
      const interval = new Interval(
        new Date('2025-01-01T00:00:00.000Z').getTime(),
        new Date('2026-01-01T00:00:00.000Z').getTime()
      );
      expect(interval.toISOString()).toBe(
        '2025-01-01T00:00:00.000Z/2026-01-01T00:00:00.000Z'
      );
      expect(interval.duration()).toBe(365 * 24 * 60 * 60 * 1000);
    });

    it('should error when start is after end', () => {
      expect(() => {
        new Interval(
          new Date('2026-01-01T00:00:00.000Z').getTime(),
          new Date('2025-01-01T00:00:00.000Z').getTime()
        );
      }).toThrow('Interval start cannot be after the end.');
    });

    it('should error when date is invalid', () => {
      expect(() => {
        new Interval(new Date(NaN), new Date(NaN));
      }).toThrow('Invalid dates for interval.');
    });

    it('should be able to create from an ISO duration', () => {
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z/2026-01-01T00:00:00.000Z'
      );
      expect(interval.toISOString()).toBe(
        '2025-01-01T00:00:00.000Z/2026-01-01T00:00:00.000Z'
      );
      expect(interval.duration()).toBe(365 * 24 * 60 * 60 * 1000);
    });

    it('should be able to create from short ISO duration', () => {
      const interval = new Interval('2025-01-01Z/2026-01-01Z');
      expect(interval.toISOString()).toBe(
        '2025-01-01T00:00:00.000Z/2026-01-01T00:00:00.000Z'
      );
      expect(interval.duration()).toBe(365 * 24 * 60 * 60 * 1000);
    });

    it('should clone an interval when passed', () => {
      const interval1 = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z'
      );
      const interval2 = new Interval(interval1);
      expect(interval2).not.toBe(interval1);
      expect(interval2).toEqual(interval1);
    });
  });

  describe('clone', () => {
    it('should clone the interval', () => {
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z'
      );
      const clone = interval.clone();
      expect(clone).not.toBe(interval);
      expect(clone.start).toEqual(interval.start);
      expect(clone.end).toEqual(interval.end);
    });
  });

  describe('toString', () => {
    it('should serialize', () => {
      const dt1 = new DateTime('2025-01-01T00:00:00.000Z');
      const dt2 = new DateTime('2026-01-01T00:00:00.000Z');
      const interval = new Interval(dt1, dt2);
      expect(interval.toString()).toBe(`${dt1.toString()} - ${dt2.toString()}`);
    });
  });

  describe('toISOString', () => {
    it('should serialize ISO8601', () => {
      const dt1 = new DateTime('2025-01-01T00:00:00.000Z');
      const dt2 = new DateTime('2026-01-01T00:00:00.000Z');
      const interval = new Interval(dt1, dt2);
      expect(interval.toISOString()).toBe(
        `${dt1.toISOString()}/${dt2.toISOString()}`
      );
    });
  });

  describe('overlaps', () => {
    it('should correctly indicate overlaps', () => {
      const year1 = '2025-01-01T00:00:00.000Z';
      const year2 = '2026-01-01T00:00:00.000Z';
      const year3 = '2027-01-01T00:00:00.000Z';
      expect(
        new Interval(year1, year3).overlaps(new Interval(year1, year2))
      ).toBe(true);
      expect(
        new Interval(year1, year2).overlaps(new Interval(year1, year3))
      ).toBe(true);
      expect(
        new Interval(year1, year2).overlaps(new Interval(year2, year3))
      ).toBe(false);
      expect(
        new Interval(year2, year3).overlaps(new Interval(year1, year2))
      ).toBe(false);
    });

    it('should work with strings', () => {
      const year1 = '2025-01-01T00:00:00.000Z';
      const year2 = '2026-01-01T00:00:00.000Z';
      const year3 = '2027-01-01T00:00:00.000Z';
      expect(new Interval(year1, year3).overlaps(year2)).toBe(true);
      expect(new Interval(year1, year2).overlaps(year3)).toBe(false);
    });

    it('should work with native dates', () => {
      const year1 = '2025-01-01T00:00:00.000Z';
      const year2 = '2026-01-01T00:00:00.000Z';
      const year3 = '2027-01-01T00:00:00.000Z';
      expect(new Interval(year1, year3).overlaps(new Date(year2))).toBe(true);
      expect(new Interval(year1, year2).overlaps(new Date(year3))).toBe(false);
    });

    it('should work with DateTime', () => {
      const year1 = '2025-01-01T00:00:00.000Z';
      const year2 = '2026-01-01T00:00:00.000Z';
      const year3 = '2027-01-01T00:00:00.000Z';
      expect(new Interval(year1, year3).overlaps(new DateTime(year2))).toBe(
        true
      );
      expect(new Interval(year1, year2).overlaps(new DateTime(year3))).toBe(
        false
      );
    });
  });

  describe('contains', () => {
    it('should correctly indicate contains', () => {
      const year1 = '2025-01-01T00:00:00.000Z';
      const year2 = '2026-01-01T00:00:00.000Z';
      const year3 = '2027-01-01T00:00:00.000Z';
      expect(
        new Interval(year1, year3).contains(new Interval(year1, year2))
      ).toBe(true);
      expect(
        new Interval(year1, year3).contains(new Interval(year2, year3))
      ).toBe(true);
      expect(
        new Interval(year1, year2).contains(new Interval(year1, year3))
      ).toBe(false);
    });

    it('should work with strings', () => {
      const year1 = '2025-01-01T00:00:00.000Z';
      const year2 = '2026-01-01T00:00:00.000Z';
      const year3 = '2027-01-01T00:00:00.000Z';
      expect(new Interval(year1, year3).contains(year2)).toBe(true);
      expect(new Interval(year1, year3).contains(year3)).toBe(true);
      expect(new Interval(year1, year2).contains(year3)).toBe(false);
    });

    it('should work with native dates', () => {
      const year1 = '2025-01-01T00:00:00.000Z';
      const year2 = '2026-01-01T00:00:00.000Z';
      const year3 = '2027-01-01T00:00:00.000Z';
      expect(new Interval(year1, year3).contains(new Date(year2))).toBe(true);
      expect(new Interval(year1, year3).contains(new Date(year3))).toBe(true);
      expect(new Interval(year1, year2).contains(new Date(year3))).toBe(false);
    });

    it('should work with DateTime', () => {
      const year1 = '2025-01-01T00:00:00.000Z';
      const year2 = '2026-01-01T00:00:00.000Z';
      const year3 = '2027-01-01T00:00:00.000Z';
      expect(new Interval(year1, year3).contains(new DateTime(year2))).toBe(
        true
      );
      expect(new Interval(year1, year3).contains(new DateTime(year3))).toBe(
        true
      );
      expect(new Interval(year1, year2).contains(new DateTime(year3))).toBe(
        false
      );
    });
  });

  describe('union', () => {
    it('should create a union', () => {
      const year1 = '2025-01-01T00:00:00.000Z';
      const year2 = '2026-01-01T00:00:00.000Z';
      const year3 = '2027-01-01T00:00:00.000Z';
      expect(
        new Interval(year1, year2).union(new Interval(year2, year3))
      ).toEqual(new Interval(year1, year3));
      expect(
        new Interval(year2, year3).union(new Interval(year1, year2))
      ).toEqual(new Interval(year1, year3));
      expect(
        new Interval(year1, year3).union(new Interval(year1, year2))
      ).toEqual(new Interval(year1, year3));
    });
  });

  describe('intersection', () => {
    it('should create an intersection', () => {
      const year1 = '2025-01-01T00:00:00.000Z';
      const year2 = '2026-01-01T00:00:00.000Z';
      const year3 = '2027-01-01T00:00:00.000Z';
      expect(
        new Interval(year1, year3).intersection(new Interval(year2, year3))
      ).toEqual(new Interval(year2, year3));
      expect(
        new Interval(year2, year3).intersection(new Interval(year1, year3))
      ).toEqual(new Interval(year2, year3));
    });

    it('should return null if no intersection', () => {
      const year1 = '2025-01-01T00:00:00.000Z';
      const year2 = '2026-01-01T00:00:00.000Z';
      const year3 = '2027-01-01T00:00:00.000Z';
      const year4 = '2028-01-01T00:00:00.000Z';
      expect(
        new Interval(year1, year2).intersection(new Interval(year3, year4))
      ).toBe(null);
    });
  });

  describe('duration', () => {
    it('should get the duration of the interval', () => {
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z'
      );
      expect(interval.duration()).toBe(365 * 24 * 60 * 60 * 1000);
    });

    describe('units basic', () => {
      it('should get the duration of the interval in years', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        expect(interval.duration('years')).toBe(1);
      });

      it('should get the duration of the interval in months', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        expect(interval.duration('months')).toBe(12);
      });

      it('should get the duration of the interval in weeks', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        expect(interval.duration('weeks')).toBe(365 / 7);
      });

      it('should get the duration of the interval in days', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        expect(interval.duration('days')).toBe(365);
      });

      it('should get the duration of the interval in hours', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        expect(interval.duration('hours')).toBe(365 * 24);
      });

      it('should get the duration of the interval in minutes', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        expect(interval.duration('minutes')).toBe(365 * 24 * 60);
      });

      it('should get the duration of the interval in seconds', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        expect(interval.duration('seconds')).toBe(365 * 24 * 60 * 60);
      });
    });

    describe('units complex', () => {
      it('should get days in a year on a leap year', () => {
        const interval = new Interval(
          '2020-01-01T00:00:00.000Z',
          '2021-01-01T00:00:00.000Z'
        );
        expect(interval.duration('days')).toBe(366);
      });

      it('should get a duration in years for the exact halfway point in the year', () => {
        // Halfway through 2025 falls at noon on July 2nd.
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2025-07-02T12:00:00.000Z'
        );
        expect(interval.duration('years')).toBe(0.5);
      });

      it('should get a duration in months exact halfway through January', () => {
        // Halfway through January falls at noon on the 16th.
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2025-01-16T12:00:00.000Z'
        );
        expect(interval.duration('months')).toBe(0.5);
      });

      it('should get a short duration in minutes', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2025-01-01T00:30:00.000Z'
        );
        expect(interval.duration('minutes')).toBe(30);
      });

      it('should be aware that there are 23 hours during a DST spring forward', () => {
        const start = new DateTime('2024-03-10T00:00:00.000', {
          timeZone: 'America/New_York',
        });
        const end = new DateTime('2024-03-11T00:00:00.000', {
          timeZone: 'America/New_York',
        });
        const interval = new Interval(start, end);
        expect(interval.duration('hours')).toBe(23);
      });

      it('should be aware that there are 25 hours during a DST fall back', () => {
        const start = new DateTime('2024-11-03T00:00:00.000', {
          timeZone: 'America/New_York',
        });
        const end = new DateTime('2024-11-04T00:00:00.000', {
          timeZone: 'America/New_York',
        });
        const interval = new Interval(start, end);
        expect(interval.duration('hours')).toBe(25);
      });
    });
  });

  describe('split', () => {
    describe('basic', () => {
      it('should split the interval by a string', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        expect(interval.split('2025-07-01T00:00:00.000Z')).toEqual([
          new Interval('2025-01-01T00:00:00.000Z', '2025-07-01T00:00:00.000Z'),
          new Interval('2025-07-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
        ]);
      });

      it('should split the interval by a number', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        expect(interval.split(Date.parse('2025-07-01T00:00:00.000Z'))).toEqual([
          new Interval('2025-01-01T00:00:00.000Z', '2025-07-01T00:00:00.000Z'),
          new Interval('2025-07-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
        ]);
      });

      it('should split the interval by a native date', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        expect(interval.split(new Date('2025-07-01T00:00:00.000Z'))).toEqual([
          new Interval('2025-01-01T00:00:00.000Z', '2025-07-01T00:00:00.000Z'),
          new Interval('2025-07-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
        ]);
      });

      it('should split the interval by a DateTime', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        expect(
          interval.split(new DateTime('2025-07-01T00:00:00.000Z'))
        ).toEqual([
          new Interval('2025-01-01T00:00:00.000Z', '2025-07-01T00:00:00.000Z'),
          new Interval('2025-07-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
        ]);
      });
    });

    describe('by intervals', () => {
      it('should split the interval by another interval', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        const middle = new Interval(
          '2025-06-01T00:00:00.000Z',
          '2025-08-01T00:00:00.000Z'
        );
        expect(interval.split(middle)).toEqual([
          new Interval('2025-01-01T00:00:00.000Z', '2025-06-01T00:00:00.000Z'),
          new Interval('2025-08-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
        ]);
      });

      it('should split by an interval that overlaps the start', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        const middle = new Interval(
          '2024-07-01T00:00:00.000Z',
          '2025-07-01T00:00:00.000Z'
        );
        expect(interval.split(middle)).toEqual([
          new Interval('2025-07-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
        ]);
      });

      it('should split by an interval that overlaps the end', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        const middle = new Interval(
          '2025-07-01T00:00:00.000Z',
          '2026-07-01T00:00:00.000Z'
        );
        expect(interval.split(middle)).toEqual([
          new Interval('2025-01-01T00:00:00.000Z', '2025-07-01T00:00:00.000Z'),
        ]);
      });
    });

    describe('other', () => {
      it('should split when input before interval start', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        expect(interval.split('2024-01-01T00:00:00.000Z')).toEqual([
          new Interval('2025-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
        ]);
      });

      it('should split when input after interval end', () => {
        const interval = new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        );
        expect(interval.split('2027-01-01T00:00:00.000Z')).toEqual([
          new Interval('2025-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
        ]);
      });
    });
  });

  describe('divide', () => {
    it('should divide the interval into 2 equal parts', () => {
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z'
      );
      expect(interval.divide(2)).toEqual([
        new Interval('2025-01-01T00:00:00.000Z', '2025-07-02T12:00:00.000Z'),
        new Interval('2025-07-02T12:00:00.000Z', '2026-01-01T00:00:00.000Z'),
      ]);
    });

    it('should divide the interval into 6 equal parts', () => {
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2025-01-02T00:00:00.000Z'
      );
      expect(interval.divide(6)).toEqual([
        new Interval('2025-01-01T00:00:00.000Z', '2025-01-01T04:00:00.000Z'),
        new Interval('2025-01-01T04:00:00.000Z', '2025-01-01T08:00:00.000Z'),
        new Interval('2025-01-01T08:00:00.000Z', '2025-01-01T12:00:00.000Z'),
        new Interval('2025-01-01T12:00:00.000Z', '2025-01-01T16:00:00.000Z'),
        new Interval('2025-01-01T16:00:00.000Z', '2025-01-01T20:00:00.000Z'),
        new Interval('2025-01-01T20:00:00.000Z', '2025-01-02T00:00:00.000Z'),
      ]);
    });
  });

  describe('isEqual', () => {
    it('equal', () => {
      expect(
        new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        ).isEqual(
          new Interval('2025-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')
        )
      ).toBe(true);
    });

    it('not equal', () => {
      expect(
        new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        ).isEqual(
          new Interval('2025-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z')
        )
      ).toBe(false);
    });

    it('other', () => {
      expect(
        new Interval(
          '2025-01-01T00:00:00.000Z',
          '2026-01-01T00:00:00.000Z'
        ).isEqual(null)
      ).toBe(false);
    });
  });

  describe('getYears', () => {
    it('should get the years in the interval', () => {
      DateTime.setTimeZone('UTC');
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2027-01-01T00:00:00.000Z'
      );
      expect(interval.getYears()).toEqual([
        new Interval('2025-01-01T00:00:00.000Z', '2025-12-31T23:59:59.999Z'),
        new Interval('2026-01-01T00:00:00.000Z', '2026-12-31T23:59:59.999Z'),
      ]);
    });
  });

  describe('getMonths', () => {
    it('should get the months in the interval', () => {
      DateTime.setTimeZone('UTC');
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z'
      );
      expect(interval.getMonths()).toEqual([
        new Interval('2025-01-01T00:00:00.000Z', '2025-01-31T23:59:59.999Z'),
        new Interval('2025-02-01T00:00:00.000Z', '2025-02-28T23:59:59.999Z'),
        new Interval('2025-03-01T00:00:00.000Z', '2025-03-31T23:59:59.999Z'),
        new Interval('2025-04-01T00:00:00.000Z', '2025-04-30T23:59:59.999Z'),
        new Interval('2025-05-01T00:00:00.000Z', '2025-05-31T23:59:59.999Z'),
        new Interval('2025-06-01T00:00:00.000Z', '2025-06-30T23:59:59.999Z'),
        new Interval('2025-07-01T00:00:00.000Z', '2025-07-31T23:59:59.999Z'),
        new Interval('2025-08-01T00:00:00.000Z', '2025-08-31T23:59:59.999Z'),
        new Interval('2025-09-01T00:00:00.000Z', '2025-09-30T23:59:59.999Z'),
        new Interval('2025-10-01T00:00:00.000Z', '2025-10-31T23:59:59.999Z'),
        new Interval('2025-11-01T00:00:00.000Z', '2025-11-30T23:59:59.999Z'),
        new Interval('2025-12-01T00:00:00.000Z', '2025-12-31T23:59:59.999Z'),
      ]);
    });
  });

  describe('getWeeks', () => {
    it('should get the weeks in the interval', () => {
      DateTime.setTimeZone('UTC');
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2025-02-01T00:00:00.000Z'
      );
      expect(interval.getWeeks()).toEqual([
        new Interval('2024-12-29T00:00:00.000Z', '2025-01-04T23:59:59.999Z'),
        new Interval('2025-01-05T00:00:00.000Z', '2025-01-11T23:59:59.999Z'),
        new Interval('2025-01-12T00:00:00.000Z', '2025-01-18T23:59:59.999Z'),
        new Interval('2025-01-19T00:00:00.000Z', '2025-01-25T23:59:59.999Z'),
        new Interval('2025-01-26T00:00:00.000Z', '2025-02-01T23:59:59.999Z'),
      ]);
    });
  });

  describe('getDays', () => {
    it('should get the days in the interval', () => {
      DateTime.setTimeZone('UTC');
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2025-01-08T00:00:00.000Z'
      );
      expect(interval.getDays()).toEqual([
        new Interval('2025-01-01T00:00:00.000Z', '2025-01-01T23:59:59.999Z'),
        new Interval('2025-01-02T00:00:00.000Z', '2025-01-02T23:59:59.999Z'),
        new Interval('2025-01-03T00:00:00.000Z', '2025-01-03T23:59:59.999Z'),
        new Interval('2025-01-04T00:00:00.000Z', '2025-01-04T23:59:59.999Z'),
        new Interval('2025-01-05T00:00:00.000Z', '2025-01-05T23:59:59.999Z'),
        new Interval('2025-01-06T00:00:00.000Z', '2025-01-06T23:59:59.999Z'),
        new Interval('2025-01-07T00:00:00.000Z', '2025-01-07T23:59:59.999Z'),
      ]);
    });
  });

  describe('getHours', () => {
    it('should get the hours in the interval', () => {
      DateTime.setTimeZone('UTC');
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2025-01-01T06:00:00.000Z'
      );
      expect(interval.getHours()).toEqual([
        new Interval('2025-01-01T00:00:00.000Z', '2025-01-01T00:59:59.999Z'),
        new Interval('2025-01-01T01:00:00.000Z', '2025-01-01T01:59:59.999Z'),
        new Interval('2025-01-01T02:00:00.000Z', '2025-01-01T02:59:59.999Z'),
        new Interval('2025-01-01T03:00:00.000Z', '2025-01-01T03:59:59.999Z'),
        new Interval('2025-01-01T04:00:00.000Z', '2025-01-01T04:59:59.999Z'),
        new Interval('2025-01-01T05:00:00.000Z', '2025-01-01T05:59:59.999Z'),
      ]);
    });
  });

  describe('getMinutes', () => {
    it('should get the minutes in the interval', () => {
      DateTime.setTimeZone('UTC');
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2025-01-01T00:05:00.000Z'
      );
      expect(interval.getMinutes()).toEqual([
        new Interval('2025-01-01T00:00:00.000Z', '2025-01-01T00:00:59.999Z'),
        new Interval('2025-01-01T00:01:00.000Z', '2025-01-01T00:01:59.999Z'),
        new Interval('2025-01-01T00:02:00.000Z', '2025-01-01T00:02:59.999Z'),
        new Interval('2025-01-01T00:03:00.000Z', '2025-01-01T00:03:59.999Z'),
        new Interval('2025-01-01T00:04:00.000Z', '2025-01-01T00:04:59.999Z'),
      ]);
    });
  });

  describe('getSeconds', () => {
    it('should get the seconds in the interval', () => {
      DateTime.setTimeZone('UTC');
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2025-01-01T00:00:05.000Z'
      );
      expect(interval.getSeconds()).toEqual([
        new Interval('2025-01-01T00:00:00.000Z', '2025-01-01T00:00:00.999Z'),
        new Interval('2025-01-01T00:00:01.000Z', '2025-01-01T00:00:01.999Z'),
        new Interval('2025-01-01T00:00:02.000Z', '2025-01-01T00:00:02.999Z'),
        new Interval('2025-01-01T00:00:03.000Z', '2025-01-01T00:00:03.999Z'),
        new Interval('2025-01-01T00:00:04.000Z', '2025-01-01T00:00:04.999Z'),
      ]);
    });
  });

  describe('getUnits', () => {
    it('should get the years in the interval', () => {
      DateTime.setTimeZone('UTC');
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2027-01-01T00:00:00.000Z'
      );
      expect(interval.getUnits('year')).toEqual([
        new Interval('2025-01-01T00:00:00.000Z', '2025-12-31T23:59:59.999Z'),
        new Interval('2026-01-01T00:00:00.000Z', '2026-12-31T23:59:59.999Z'),
      ]);
    });

    it('should error on unknown unit', () => {
      DateTime.setTimeZone('UTC');
      const interval = new Interval(
        '2025-01-01T00:00:00.000Z',
        '2027-01-01T00:00:00.000Z'
      );
      expect(() => {
        interval.getUnits('foo');
      }).toThrow('Unknown unit "foo"');
    });
  });
});
