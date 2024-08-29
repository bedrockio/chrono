import DateTime from '../src/DateTime';

DateTime.setLocale('en-US');
DateTime.setTimeZone('Asia/Tokyo');

describe('DateTime', () => {
  describe('constructor', () => {
    it('should be the current time when no argument passed', async () => {
      expect(new DateTime().getTime()).toBeCloseTo(Date.now(), -1);
    });

    it('should be the current time when undefined passed', async () => {
      expect(new DateTime(undefined).getTime()).toBeCloseTo(Date.now(), -1);
    });

    it('should accept a string value', async () => {
      expect(new DateTime('2020-01-01T00:00:00.000Z').toISOString()).toBe(
        '2020-01-01T00:00:00.000Z'
      );
    });

    it('should accept a numeric value', async () => {
      const time = Date.parse('2020-01-01T00:00:00.000Z');
      expect(new DateTime(time).toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });

    it('should wrap a date', async () => {
      const date = new Date('2020-01-01T00:00:00.000Z');
      expect(new DateTime(date).toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });

    it('should clone a wrapped date', async () => {
      const date = new Date('2020-01-01T00:00:00.000Z');
      const dt = new DateTime(date);
      date.setDate(15);
      expect(dt.toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });

    it('should create a clone when passed another DateTime', async () => {
      const dt1 = new DateTime('2020-01-01T00:00:00.000Z');
      const dt2 = new DateTime(dt1);
      expect(dt2).not.toBe(dt1);
      expect(dt2.toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });
  });

  describe('toString', () => {
    it('should return a medium format', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.toString()).toBe('January 1, 2020 at 9:00am');
    });
  });

  describe('formatting', () => {
    describe('format', () => {
      it('default is medium datetime', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format()).toBe('January 1, 2020 at 9:00am');
      });

      it('datetime with weekday', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format(DateTime.DATETIME_MED_WEEKDAY)).toBe(
          'Wednesday, January 1, 2020 at 9:00am'
        );
      });

      it('medium datetime', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format(DateTime.DATETIME_MED)).toBe(
          'January 1, 2020 at 9:00am'
        );
      });

      it('short datetime', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format(DateTime.DATETIME_SHORT)).toBe('Jan 1, 2020, 9:00am');
      });

      it('narrow datetime', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format(DateTime.DATETIME_NARROW)).toBe('1/1/2020, 9:00am');
      });

      it('date with weekday', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format(DateTime.DATE_MED_WEEKDAY)).toBe(
          'Wednesday, January 1, 2020'
        );
      });

      it('medium date', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format(DateTime.DATE_MED)).toBe('January 1, 2020');
      });

      it('short date', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format(DateTime.DATE_SHORT)).toBe('Jan 1, 2020');
      });

      it('narrow date', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format(DateTime.DATE_NARROW)).toBe('1/1/2020');
      });

      it('time with timezone', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format(DateTime.TIME_TIMEZONE)).toBe(
          '9:00am Japan Standard Time'
        );
      });

      it('medium time', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format(DateTime.TIME_MED)).toBe('9:00am');
      });

      it('short time', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format(DateTime.TIME_SHORT)).toBe('9:00a');
      });

      it('hour time', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format(DateTime.TIME_HOUR)).toBe('9am');
      });

      it('short hour time', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format(DateTime.TIME_SHORT_HOUR)).toBe('9a');
      });
    });

    describe('formatDate', () => {
      it('short format the date only', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.formatDate()).toBe('January 1, 2020');
      });
    });

    describe('formatTime', () => {
      it('short format the time only', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.formatTime()).toBe('9:00am');
      });
    });

    describe('formatHours', () => {
      it('short format the hour only', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.formatHours()).toBe('9am');
      });
    });

    describe('formatMonthYear', () => {
      it('short format the month and year', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.formatMonthYear()).toBe('January 2020');
      });

      it('short expose a way to format the short form', async () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format(DateTime.MONTH_YEAR_SHORT)).toBe('Jan 2020');
      });
    });
  });

  describe('timezones', () => {
    it('allow setting a global timezone', async () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.toString()).toBe('December 31, 2019 at 7:00pm');
      DateTime.setTimeZone('Asia/Tokyo');
    });

    it('allow passing timezone in constructor', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.toString()).toBe('December 31, 2019 at 7:00pm');
    });

    it('allow passing timezone in datetime format', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(
        dt.format(DateTime.DATETIME_MED, {
          timeZone: 'America/New_York',
        })
      ).toBe('December 31, 2019 at 7:00pm');
    });

    it('allow passing timezone in date format', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(
        dt.format(DateTime.DATE_MED, {
          timeZone: 'America/New_York',
        })
      ).toBe('December 31, 2019');
    });

    it('allow passing timezone in time format', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(
        dt.format(DateTime.TIME_MED, {
          timeZone: 'America/New_York',
        })
      ).toBe('7:00pm');
    });

    it('use system time when not set', async () => {
      DateTime.setTimeZone();
      const str = '2020-01-01T00:00:00.000Z';
      expect(new DateTime(str).toString()).toMatch(
        new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(new Date(str))
      );
      DateTime.setTimeZone('Asia/Tokyo');
    });
  });

  describe('locales', () => {
    it('allow setting a global locale', async () => {
      DateTime.setLocale('ja-JP');
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.toString()).toBe('2020年1月1日 9:00');
      DateTime.setLocale('en-US');
    });

    it('allow passing locale in constructor', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        locale: 'ja-JP',
      });
      expect(dt.toString()).toBe('2020年1月1日 9:00');
    });

    it('allow passing locale in datetime format', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(
        dt.format(DateTime.DATETIME_MED, {
          locale: 'ja-JP',
        })
      ).toBe('2020年1月1日 9:00');
    });

    it('allow passing locale in date format', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(
        dt.format(DateTime.DATE_MED, {
          locale: 'ja-JP',
        })
      ).toBe('2020年1月1日');
    });

    it('allow passing locale in time format', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(
        dt.format(DateTime.TIME_MED, {
          locale: 'ja-JP',
        })
      ).toBe('9:00');
    });

    it('use system locale when not set', async () => {
      DateTime.setLocale();
      const str = '2020-01-01T00:00:00.000Z';
      expect(new DateTime(str).toString()).toMatch(
        new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Tokyo',
        }).format(new Date(str))
      );
      DateTime.setLocale('en-US');
    });
  });

  describe('advance', () => {
    it('should advance by a year', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'year').toISOString()).toBe(
        '2021-01-01T00:00:00.000Z'
      );
    });

    it('should advance by a month', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'month').toISOString()).toBe(
        '2020-02-01T00:00:00.000Z'
      );
    });

    it('should advance by a week', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'week').toISOString()).toBe(
        '2020-01-08T00:00:00.000Z'
      );
    });

    it('should advance by a day', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'day').toISOString()).toBe(
        '2020-01-02T00:00:00.000Z'
      );
    });

    it('should advance by an hour', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'hour').toISOString()).toBe(
        '2020-01-01T01:00:00.000Z'
      );
    });

    it('should advance by a minute', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'minute').toISOString()).toBe(
        '2020-01-01T00:01:00.000Z'
      );
    });

    it('should advance by a second', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'second').toISOString()).toBe(
        '2020-01-01T00:00:01.000Z'
      );
    });

    it('should advance by a millisecond', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'millisecond').toISOString()).toBe(
        '2020-01-01T00:00:00.001Z'
      );
    });

    it('should advance by multiple', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(
        dt
          .advance({
            years: 2,
            months: 3,
            days: 4,
          })
          .toISOString()
      ).toBe('2022-04-05T00:00:00.000Z');
    });

    it('should not modify the date', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      dt.advance(2, 'years');
      expect(dt.toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });

    it('should advance by negative value', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(-2, 'years').toISOString()).toBe(
        '2018-01-01T00:00:00.000Z'
      );
    });
  });

  describe('rewind', () => {
    it('should rewind by a year', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'year').toISOString()).toBe(
        '2019-01-01T00:00:00.000Z'
      );
    });

    it('should rewind by a month', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'month').toISOString()).toBe(
        '2019-12-01T00:00:00.000Z'
      );
    });

    it('should rewind by a week', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'week').toISOString()).toBe(
        '2019-12-25T00:00:00.000Z'
      );
    });

    it('should rewind by a day', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'day').toISOString()).toBe(
        '2019-12-31T00:00:00.000Z'
      );
    });

    it('should rewind by an hour', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'hour').toISOString()).toBe(
        '2019-12-31T23:00:00.000Z'
      );
    });

    it('should rewind by a minute', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'minute').toISOString()).toBe(
        '2019-12-31T23:59:00.000Z'
      );
    });

    it('should rewind by a second', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'second').toISOString()).toBe(
        '2019-12-31T23:59:59.000Z'
      );
    });

    it('should rewind by a millisecond', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'millisecond').toISOString()).toBe(
        '2019-12-31T23:59:59.999Z'
      );
    });

    it('should rewind by multiple', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(
        dt
          .rewind({
            years: 2,
            months: 3,
            days: 4,
          })
          .toISOString()
      ).toBe('2017-09-27T00:00:00.000Z');
    });

    it('should not modify the date', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      dt.rewind(2, 'years');
      expect(dt.toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });

    it('should rewind by negative value', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(-2, 'years').toISOString()).toBe(
        '2022-01-01T00:00:00.000Z'
      );
    });

    it('should correctly fall back on edge', async () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2023-07-30T12:00:00.000Z');
      expect(dt.rewind(1, 'month').toISOString()).toBe(
        '2023-06-30T12:00:00.000Z'
      );
      DateTime.setTimeZone('Asia/Tokyo');
    });
  });

  describe('startOf', () => {
    it('should move to the start of the year', async () => {
      const dt = new DateTime('2020-03-04T05:06:07.000Z');
      expect(dt.startOfYear().toISOString()).toBe('2019-12-31T15:00:00.000Z');
    });

    it('should move to the start of the month', async () => {
      const dt = new DateTime('2020-03-04T05:06:07.000Z');
      expect(dt.startOfMonth().toISOString()).toBe('2020-02-29T15:00:00.000Z');
    });

    it('should move to the start of the week', async () => {
      const dt = new DateTime('2020-04-01T05:06:07.000Z');
      expect(dt.startOfWeek().toISOString()).toBe('2020-03-28T15:00:00.000Z');
    });

    it('should move to the start of the calendar month', async () => {
      const dt = new DateTime('2020-04-01T05:06:07.000Z');
      expect(dt.startOfCalendarMonth().toISOString()).toBe(
        '2020-03-28T15:00:00.000Z'
      );
    });

    it('should preserve timezone', async () => {
      const dt = new DateTime('2020-04-01T05:06:07.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.startOfYear().getTimezoneOffset()).toBe(300);
    });
  });

  describe('endOf', () => {
    it('should move to the end of the year', async () => {
      const dt = new DateTime('2020-03-04T05:06:07.000Z');
      expect(dt.endOfYear().toISOString()).toBe('2020-12-31T14:59:59.999Z');
    });

    it('should move to the end of the month', async () => {
      const dt = new DateTime('2020-03-04T05:06:07.000Z');
      expect(dt.endOfMonth().toISOString()).toBe('2020-03-31T14:59:59.999Z');
    });

    it('should move to the end of the week', async () => {
      const dt = new DateTime('2020-04-01T05:06:07.000Z');
      expect(dt.endOfWeek().toISOString()).toBe('2020-04-04T14:59:59.999Z');
    });

    it('should move to the end of the calendar month', async () => {
      const dt = new DateTime('2020-04-01T05:06:07.000Z');
      expect(dt.endOfCalendarMonth().toISOString()).toBe(
        '2020-05-02T14:59:59.999Z'
      );
    });
  });

  describe('setArgs', () => {
    it('should be able to set by arguments', async () => {
      const dt = new DateTime();
      expect(dt.setArgs(2020, 1, 2).toISOString()).toBe(
        '2020-02-01T15:00:00.000Z'
      );
    });

    it('should respect the internal timezone', async () => {
      const dt = new DateTime(Date.now(), {
        timeZone: 'America/New_York',
      });
      expect(dt.setArgs(2020, 1, 2).toISOString()).toBe(
        '2020-02-02T05:00:00.000Z'
      );
    });
  });

  describe('isValid', () => {
    it('should correctly identify valid input', async () => {
      expect(new DateTime(NaN).isValid()).toBe(false);
      expect(new DateTime('').isValid()).toBe(false);
      expect(new DateTime('2020').isValid()).toBe(true);
      expect(new DateTime(undefined).isValid()).toBe(true);
      expect(new DateTime(null).isValid()).toBe(true);
    });
  });

  describe('isInvalid', () => {
    it('should correctly identify invalid input', async () => {
      expect(new DateTime(NaN).isInvalid()).toBe(true);
      expect(new DateTime('').isInvalid()).toBe(true);
      expect(new DateTime('2020').isInvalid()).toBe(false);
      expect(new DateTime(undefined).isInvalid()).toBe(false);
      expect(new DateTime(null).isInvalid()).toBe(false);
    });
  });

  describe('resetTime', () => {
    it('should reset the time', async () => {
      const dt = new DateTime('2020-03-04T05:06:07.000Z');
      expect(dt.resetTime().toISOString()).toBe('2020-03-03T15:00:00.000Z');
    });
  });

  describe('toDate', () => {
    it('should get the date', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.toDate()).toBe('2020-01-01');
    });

    it('should account for timezone', async () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.toDate()).toBe('2019-12-31');
      DateTime.setTimeZone('Asia/Tokyo');
    });
  });

  describe('toTime', () => {
    it('should get the time', async () => {
      const dt = new DateTime('2020-01-01T00:10:20.300Z');
      expect(dt.toTime()).toBe('09:10:20.300');
    });

    it('should account for timezone', async () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2020-01-01T00:10:20.300Z');
      expect(dt.toTime()).toBe('19:10:20.300');
      DateTime.setTimeZone('Asia/Tokyo');
    });
  });

  describe('toISODate', () => {
    it('should get the date', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.toISODate()).toBe('2020-01-01');
    });

    it('should not account for timezone', async () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.toISODate()).toBe('2020-01-01');
      DateTime.setTimeZone('Asia/Tokyo');
    });
  });

  describe('toISOTime', () => {
    it('should get the time', async () => {
      const dt = new DateTime('2020-01-01T12:10:20.300Z');
      expect(dt.toISOTime()).toBe('12:10:20.300');
    });

    it('should not account for timezone', async () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2020-01-01T12:10:20.300Z');
      expect(dt.toISOTime()).toBe('12:10:20.300');
      DateTime.setTimeZone('Asia/Tokyo');
    });
  });

  describe('daysInMonth', () => {
    it('should get days in January', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.daysInMonth()).toBe(31);
    });

    it('should get days in leap year', async () => {
      const dt = new DateTime('2020-02-01T00:00:00.000Z');
      expect(dt.daysInMonth()).toBe(29);
    });

    it('should get days in non leap year', async () => {
      const dt = new DateTime('2021-02-01T00:00:00.000Z');
      expect(dt.daysInMonth()).toBe(28);
    });
  });

  describe('clone', () => {
    it('should clone the datetime', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.clone().toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });
  });

  describe('relative', () => {
    describe('basic', () => {
      it('5 years ago', async () => {
        expect(new DateTime().rewind(5, 'years').relative()).toBe(
          '5 years ago'
        );
      });

      it('last year', async () => {
        expect(new DateTime().rewind(1, 'year').relative()).toBe('last year');
      });

      it('11 months ago', async () => {
        expect(new DateTime().rewind(11, 'months').relative()).toBe(
          '11 months ago'
        );
      });

      it('last month', async () => {
        expect(new DateTime().rewind(1, 'month').relative()).toBe('last month');
      });

      it('3 weeks ago', async () => {
        expect(new DateTime().rewind(21, 'days').relative()).toBe(
          '3 weeks ago'
        );
      });

      it('last week', async () => {
        expect(new DateTime().rewind(7, 'days').relative()).toBe('last week');
      });

      it('6 days ago', async () => {
        expect(new DateTime().rewind(6, 'days').relative()).toBe('6 days ago');
      });

      it('yesterday', async () => {
        expect(new DateTime().rewind(1, 'day').relative()).toBe('yesterday');
      });

      it('23 hours ago', async () => {
        expect(new DateTime().rewind(23, 'hours').relative()).toBe(
          '23 hours ago'
        );
      });

      it('1 hour ago', async () => {
        expect(new DateTime().rewind(1, 'hour').relative()).toBe('1 hour ago');
      });

      it('59 minutes ago', async () => {
        expect(new DateTime().rewind(59, 'minutes').relative()).toBe(
          '59 minutes ago'
        );
      });

      it('1 minute ago', async () => {
        expect(new DateTime().rewind(1, 'minute').relative()).toBe(
          '1 minute ago'
        );
      });

      it('59 seconds ago', async () => {
        expect(new DateTime().rewind(59, 'seconds').relative()).toBe(
          '59 seconds ago'
        );
      });

      it('1 seconds ago', async () => {
        expect(new DateTime().rewind(1, 'second').relative()).toBe(
          '1 second ago'
        );
      });

      it('now', async () => {
        expect(new DateTime().rewind(500, 'milliseconds').relative()).toBe(
          'now'
        );
      });
    });

    describe('advancing', () => {
      it('next year', async () => {
        expect(new DateTime().advance(13, 'months').relative()).toBe(
          'next year'
        );
      });

      it('tomorrow', async () => {
        expect(new DateTime().advance(25, 'hours').relative()).toBe('tomorrow');
      });
    });

    describe('locales', () => {
      it('should format by global locale', async () => {
        DateTime.setLocale('ja-JP');
        expect(new DateTime().rewind(1, 'day').relative()).toBe('昨日');
        DateTime.setLocale('en-US');
      });

      it('should format by internal locale', async () => {
        const dt = new DateTime(Date.now() - 24 * 60 * 60 * 1000, {
          locale: 'ja-JP',
        });
        expect(dt.relative()).toBe('昨日');
      });

      it('should format by options object', async () => {
        expect(
          new DateTime().rewind(1, 'day').relative({
            locale: 'ja-JP',
          })
        ).toBe('昨日');
      });
    });

    describe('options', () => {
      // Advancing months may cause a shift when
      // not enough days so need to calculate the
      // offset dynamically.
      function getMonthOffset(dt1, dt2) {
        const month1 = dt1.getMonth();
        const month2 = dt2.getMonth();
        if (month1 <= month2) {
          return month2 - month1;
        } else {
          return month2 + (12 - month1);
        }
      }

      describe('now', () => {
        it('should format relative to another now', async () => {
          const d1 = new DateTime('2020-01-01T00:00:00.000Z');
          const d2 = new DateTime('2020-07-01T00:00:00.000Z');
          expect(
            d1.relative({
              now: d2,
            })
          ).toBe('6 months ago');
        });
      });

      describe('min', () => {
        it('should not format if past cutoff', async () => {
          expect(
            new DateTime().rewind(1, 'year').relative({
              min: new DateTime().rewind(6, 'months'),
            })
          ).toBeUndefined();

          const now = new DateTime();
          const next = now.rewind(6, 'months');
          const months = getMonthOffset(now, next);

          expect(
            next.relative({
              min: new DateTime().rewind(8, 'months'),
            })
          ).toBe(`${months} months ago`);

          expect(
            new DateTime().rewind(2, 'days').relative({
              min: new DateTime().rewind(6, 'months'),
            })
          ).toBe('2 days ago');
        });
      });

      describe('max', () => {
        it('should not format if past cutoff', async () => {
          expect(
            new DateTime().advance(1, 'year').relative({
              max: new DateTime().advance(6, 'months'),
            })
          ).toBeUndefined();

          const now = new DateTime();
          const next = now.advance(6, 'months');
          const months = getMonthOffset(now, next);
          expect(
            next.relative({
              max: next,
            })
          ).toBe(`in ${months} months`);

          // Small offset to prevent 1ms lag in testing.
          expect(
            new DateTime()
              .advance({
                days: 2,
                seconds: 1,
              })
              .relative({
                max: new DateTime().advance(6, 'months'),
              })
          ).toBe('in 2 days');
        });
      });

      describe('numeric', () => {
        it('should allow passing the numeric flag', async () => {
          expect(
            new DateTime().rewind(1, 'day').relative({
              numeric: 'always',
            })
          ).toBe('1 day ago');
        });
      });
    });
  });

  describe('getTimezoneOffset', () => {
    it('should report correctly for the timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getTimezoneOffset()).toBe(300);
    });

    it('should report correctly for global timezone', async () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.getTimezoneOffset()).toBe(300);
      DateTime.setTimeZone('Asia/Tokyo');
    });

    it('should report the system offset when not timezone set', async () => {
      DateTime.setTimeZone();
      expect(new DateTime().getTimezoneOffset()).toBe(
        new Date().getTimezoneOffset()
      );
      DateTime.setTimeZone('Asia/Tokyo');
    });
  });

  describe('getters', () => {
    it('should get the correct year for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getFullYear()).toBe(2019);
    });

    it('should get the correct month for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getMonth()).toBe(11);
    });

    it('should get the correct date for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getDate()).toBe(31);
    });

    it('should get the correct weekday for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getDay()).toBe(2);
    });

    it('should get the correct hours for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getHours()).toBe(19);
    });

    it('should get the correct minutes for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getMinutes()).toBe(0);
    });

    it('should get the correct seconds for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getSeconds()).toBe(0);
    });

    it('should get the correct milliseconds for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getMilliseconds()).toBe(0);
    });
  });

  describe('setters', () => {
    it('should set the correct year for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.setFullYear(2019).toISOString()).toBe(
        '2020-01-01T00:00:00.000Z'
      );
    });

    it('should set the correct month for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.setMonth(11).toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });

    it('should set the correct date for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.setDate(31).toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });

    it('should set the correct hours for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.setHours(20).toISOString()).toBe('2020-01-01T01:00:00.000Z');
    });

    it('should set the correct minutes for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.setMinutes(30).toISOString()).toBe('2020-01-01T00:30:00.000Z');
    });

    it('should set the correct seconds for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.setSeconds(30).toISOString()).toBe('2020-01-01T00:00:30.000Z');
    });

    it('should set the correct milliseconds for timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.setMilliseconds(500).toISOString()).toBe(
        '2020-01-01T00:00:00.500Z'
      );
    });
  });

  describe('DST', () => {
    it('should compensate for DST forward shift', async () => {
      const dt = new DateTime('2023-03-12T05:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.advance(1, 'day').toISOString()).toBe(
        '2023-03-13T04:00:00.000Z'
      );
    });

    it('should compensate for DST forward shift with global timezone', async () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2023-03-12T05:00:00.000Z');
      expect(dt.advance(1, 'day').toISOString()).toBe(
        '2023-03-13T04:00:00.000Z'
      );
      DateTime.setTimeZone('Asia/Tokyo');
    });

    it('should compensate for DST backward shift', async () => {
      const dt = new DateTime('2023-11-05T04:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.advance(1, 'day').toISOString()).toBe(
        '2023-11-06T05:00:00.000Z'
      );
    });

    it('should compensate for DST backward shift with global timezone', async () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2023-11-05T04:00:00.000Z');
      expect(dt.advance(1, 'day').toISOString()).toBe(
        '2023-11-06T05:00:00.000Z'
      );
      DateTime.setTimeZone('Asia/Tokyo');
    });
  });

  describe('compatibility', () => {
    it('toISOString', async () => {
      const str = '2020-01-01T00:00:00.000Z';
      expect(new DateTime(str).toISOString()).toBe(new Date(str).toISOString());
    });

    it('toJSON', async () => {
      const str = '2020-01-01T00:00:00.000Z';
      expect(new DateTime(str).toJSON()).toBe(new Date(str).toJSON());
    });

    it('getTime', async () => {
      const str = '2020-01-01T00:00:00.000Z';
      expect(new DateTime(str).getTime()).toBe(new Date(str).getTime());
    });

    it('setTime', async () => {
      const str = '2020-01-01T00:00:00.000Z';
      const time = Date.parse(str);
      expect(new DateTime().setTime(time).toISOString()).toBe(str);
    });

    it('valueOf', async () => {
      const d1 = new DateTime('2020-01-01T00:00:00.000Z');
      const d2 = new DateTime('2020-01-02T00:00:00.000Z');
      expect(d2 - d1).toBe(24 * 60 * 60 * 1000);
    });
  });
});
