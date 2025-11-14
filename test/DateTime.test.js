import { beforeEach, describe, expect, it } from 'vitest';

import DateTime from '../src/DateTime';
import { mockTime, unmockTime } from './helpers/time';

beforeEach(() => {
  DateTime.setLocale('en-US');
  DateTime.setTimeZone('Asia/Tokyo');
});

describe('DateTime', () => {
  describe('static', () => {
    describe('min', () => {
      it('should find the minimum datetime', async () => {
        expect(
          DateTime.min(
            new DateTime('2025-01-02'),
            new DateTime('2025-01-03'),
            new DateTime('2025-01-01'),
          ),
        ).toEqual(new DateTime('2025-01-01'));
      });

      it('should coerce non DateTimes', async () => {
        expect(
          DateTime.min(
            new Date('2025-01-01T15:00:00.000Z'),
            new Date('2025-01-02T15:00:00.000Z'),
            new Date('2024-12-31T15:00:00.000Z'),
          ),
        ).toEqual(new DateTime('2025-01-01'));
      });

      it('should return null when no arguments', async () => {
        expect(DateTime.min()).toBe(null);
      });
    });

    describe('max', () => {
      it('should find the maximum datetime', async () => {
        expect(
          DateTime.max(
            new DateTime('2025-01-02'),
            new DateTime('2025-01-03'),
            new DateTime('2025-01-01'),
          ),
        ).toEqual(new DateTime('2025-01-03'));
      });

      it('should coerce non DateTimes', async () => {
        expect(
          DateTime.max(
            new Date('2025-01-01T15:00:00.000Z'),
            new Date('2025-01-02T15:00:00.000Z'),
            new Date('2024-12-31T15:00:00.000Z'),
          ),
        ).toEqual(new DateTime('2025/01/03'));
      });

      it('should return null when no arguments', async () => {
        expect(DateTime.max()).toBe(null);
      });
    });

    describe('clamp', () => {
      it('should clamp the datetime', async () => {
        expect(
          DateTime.clamp(
            new DateTime('2025-01-03'),
            new DateTime('2025-01-01'),
            new DateTime('2025-01-02'),
          ),
        ).toEqual(new DateTime('2025-01-02'));
      });

      it('should coerce non DateTimes', async () => {
        expect(
          DateTime.clamp(
            new Date('2025-01-02T15:00:00.000Z'),
            new Date('2024-12-31T15:00:00.000Z'),
            new Date('2025-01-01T15:00:00.000Z'),
          ),
        ).toEqual(new DateTime('2025/01/02'));
      });

      it('should return null when no arguments', async () => {
        expect(DateTime.clamp()).toBe(null);
      });
    });

    describe('getMonths', () => {
      describe('English', () => {
        it('should get long months', async () => {
          expect(
            DateTime.getMonths({
              locale: 'en-US',
            }),
          ).toEqual([
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ]);
        });

        it('should get short months', async () => {
          expect(
            DateTime.getMonths({
              style: 'short',
              locale: 'en-US',
            }),
          ).toEqual([
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ]);
        });

        it('should get narrow months', async () => {
          expect(
            DateTime.getMonths({
              style: 'narrow',
              locale: 'en-US',
            }),
          ).toEqual([
            'J',
            'F',
            'M',
            'A',
            'M',
            'J',
            'J',
            'A',
            'S',
            'O',
            'N',
            'D',
          ]);
        });
      });

      describe('Japanese', () => {
        it('should get long months', async () => {
          expect(
            DateTime.getMonths({
              locale: 'ja-JP',
            }),
          ).toEqual([
            '1月',
            '2月',
            '3月',
            '4月',
            '5月',
            '6月',
            '7月',
            '8月',
            '9月',
            '10月',
            '11月',
            '12月',
          ]);
        });

        it('should get short months', async () => {
          expect(
            DateTime.getMonths({
              style: 'short',
              locale: 'ja-JP',
            }),
          ).toEqual([
            '1月',
            '2月',
            '3月',
            '4月',
            '5月',
            '6月',
            '7月',
            '8月',
            '9月',
            '10月',
            '11月',
            '12月',
          ]);
        });

        it('should get narrow months', async () => {
          expect(
            DateTime.getMonths({
              style: 'narrow',
              locale: 'ja-JP',
            }),
          ).toEqual([
            '1月',
            '2月',
            '3月',
            '4月',
            '5月',
            '6月',
            '7月',
            '8月',
            '9月',
            '10月',
            '11月',
            '12月',
          ]);
        });
      });

      describe('other', () => {
        it('should get respect the global locale', async () => {
          DateTime.setLocale('es-ES');
          expect(DateTime.getMonths()).toEqual([
            'enero',
            'febrero',
            'marzo',
            'abril',
            'mayo',
            'junio',
            'julio',
            'agosto',
            'septiembre',
            'octubre',
            'noviembre',
            'diciembre',
          ]);
          DateTime.setLocale('en-US');
        });
      });
    });

    describe('getWeekdays', () => {
      describe('English', () => {
        it('should get long weekdays', async () => {
          expect(
            DateTime.getWeekdays({
              locale: 'en-US',
            }),
          ).toEqual([
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ]);
        });

        it('should get short weekdays', async () => {
          expect(
            DateTime.getWeekdays({
              style: 'short',
              locale: 'en-US',
            }),
          ).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
        });

        it('should get compact weekdays', async () => {
          expect(
            DateTime.getWeekdays({
              style: 'compact',
              locale: 'en-US',
            }),
          ).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
        });

        it('should get narrow weekdays', async () => {
          expect(
            DateTime.getWeekdays({
              style: 'narrow',
              locale: 'en-US',
            }),
          ).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
        });
      });

      describe('Japanese', () => {
        it('should get long weekdays', async () => {
          expect(
            DateTime.getWeekdays({
              locale: 'ja-JP',
            }),
          ).toEqual([
            '日曜日',
            '月曜日',
            '火曜日',
            '水曜日',
            '木曜日',
            '金曜日',
            '土曜日',
          ]);
        });

        it('should get short weekdays', async () => {
          expect(
            DateTime.getWeekdays({
              style: 'short',
              locale: 'ja-JP',
            }),
          ).toEqual(['日', '月', '火', '水', '木', '金', '土']);
        });

        it('should get compact weekdays', async () => {
          expect(
            DateTime.getWeekdays({
              style: 'compact',
              locale: 'ja-JP',
            }),
          ).toEqual(['日', '月', '火', '水', '木', '金', '土']);
        });

        it('should get narrow weekdays', async () => {
          expect(
            DateTime.getWeekdays({
              style: 'narrow',
              locale: 'ja-JP',
            }),
          ).toEqual(['日', '月', '火', '水', '木', '金', '土']);
        });
      });

      describe('compact', () => {
        it('should have correct compact forms for other languages', async () => {
          function assertCompact(locale, expected) {
            expect(
              DateTime.getWeekdays({
                style: 'compact',
                locale,
              }),
            ).toEqual(expected);
          }

          assertCompact('en-GB', ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);

          assertCompact('fr', ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']);
          assertCompact('es', ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']);
          assertCompact('it', ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do']);
          assertCompact('pt', ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sá']);

          assertCompact('de', ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
          assertCompact('nl', ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']);
          assertCompact('ru', ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']);

          assertCompact('sv', ['Må', 'Ti', 'On', 'To', 'Fr', 'Lö', 'Sö']);
          assertCompact('da', ['Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø']);
          assertCompact('no', ['Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø']);
          assertCompact('fi', ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su']);
          assertCompact('is', ['Má', 'Þr', 'Mi', 'Fi', 'Fö', 'La', 'Su']);

          // Note that Ni appears to be just N but this is an exception.
          assertCompact('pl', ['Po', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Ni']);
          assertCompact('cs', ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']);
          assertCompact('sk', ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']);

          // Not supported. Should be "narrow".
          assertCompact('he', ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']);
          assertCompact('hu', ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V']);
          assertCompact('zh', ['一', '二', '三', '四', '五', '六', '日']);
          assertCompact('ja', ['日', '月', '火', '水', '木', '金', '土']);
          assertCompact('ko', ['일', '월', '화', '수', '목', '금', '토']);
        });
      });

      describe('other', () => {
        it('should get respect the global locale', async () => {
          DateTime.setLocale('es-ES');
          expect(DateTime.getWeekdays()).toEqual([
            'lunes',
            'martes',
            'miércoles',
            'jueves',
            'viernes',
            'sábado',
            'domingo',
          ]);
          DateTime.setLocale('en-US');
        });

        it('should allow an explicit start offset', async () => {
          expect(
            DateTime.getWeekdays({
              start: 5,
            }),
          ).toEqual([
            'Friday',
            'Saturday',
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
          ]);
        });

        it('should get Satuday as the starting day of the week', async () => {
          DateTime.setLocale('fa-AF');
          expect(DateTime.getWeekdays()).toEqual([
            // Saturday
            'شنبه',
            'یکشنبه',
            'دوشنبه',
            'سه‌شنبه',
            'چهارشنبه',
            'پنجشنبه',
            'جمعه',
          ]);
          DateTime.setLocale('en-US');
        });
      });
    });

    describe('getMeridiem', () => {
      describe('English', () => {
        it('should get long meridiem', async () => {
          expect(
            DateTime.getMeridiem({
              locale: 'en-US',
            }),
          ).toEqual(['AM', 'PM']);
        });

        it('should get short meridiem', async () => {
          expect(
            DateTime.getMeridiem({
              style: 'short',
              locale: 'en-US',
            }),
          ).toEqual(['A', 'P']);
        });

        it('should use lower case', async () => {
          expect(
            DateTime.getMeridiem({
              lower: true,
              locale: 'en-US',
            }),
          ).toEqual(['am', 'pm']);
        });
      });

      describe('Japanese', () => {
        it('should get long meridiem', async () => {
          expect(
            DateTime.getMeridiem({
              locale: 'ja-JP',
            }),
          ).toEqual(['午前', '午後']);
        });

        it('should get short meridiem', async () => {
          expect(
            DateTime.getMeridiem({
              style: 'short',
              locale: 'ja-JP',
            }),
          ).toEqual(['午前', '午後']);
        });
      });

      describe('other', () => {
        it('should get respect the global locale', async () => {
          DateTime.setLocale('ko-KR');
          expect(DateTime.getMeridiem()).toEqual(['오전', '오후']);
          DateTime.setLocale('en-US');
        });
      });
    });

    describe('setOptions', () => {
      it('should set options together', async () => {
        DateTime.setOptions({
          locale: 'ja-JP',
          timeZone: 'America/New_York',
        });
        expect(DateTime.getTimeZone()).toBe('America/New_York');
        expect(DateTime.getLocale()).toBe('ja-JP');
        expect(DateTime.getOptions()).toEqual({
          locale: 'ja-JP',
          timeZone: 'America/New_York',
        });
      });

      it('should unset options', async () => {
        DateTime.setOptions({
          locale: 'ja-JP',
          timeZone: 'America/New_York',
        });
        DateTime.setOptions({
          locale: null,
          timeZone: 'America/New_York',
        });
        expect(DateTime.getTimeZone()).toBe('America/New_York');
        expect(DateTime.getLocale()).toBe(undefined);
        expect(DateTime.getOptions()).toEqual({
          timeZone: 'America/New_York',
        });
      });

      it('should not unset with undefined', async () => {
        DateTime.setOptions({
          locale: 'ja-JP',
          timeZone: 'America/New_York',
        });
        DateTime.setOptions({
          locale: undefined,
          timeZone: 'America/New_York',
        });
        expect(DateTime.getTimeZone()).toBe('America/New_York');
        expect(DateTime.getLocale()).toBe('ja-JP');
        expect(DateTime.getOptions()).toEqual({
          locale: 'ja-JP',
          timeZone: 'America/New_York',
        });
      });
    });
  });

  describe('constructor', () => {
    describe('no arguments', () => {
      it('should be the current time when no argument passed', () => {
        mockTime('2025-01-01T00:00:00.000Z');
        expect(new DateTime().getTime()).toBe(Date.now());
        unmockTime();
      });

      it('should be the current time when undefined passed', () => {
        mockTime('2025-01-01T00:00:00.000Z');
        expect(new DateTime(undefined).getTime()).toBe(Date.now());
        unmockTime();
      });

      it('should allow passing a single options object', () => {
        mockTime('2025-01-01T00:00:00.000Z');
        const dt = new DateTime({
          timeZone: 'America/New_York',
        });
        expect(dt.getTime()).toBe(Date.now());
        expect(dt.options.timeZone).toBe('America/New_York');
        unmockTime();
      });
    });

    describe('string argument', () => {
      it('should parse a string value', () => {
        expect(new DateTime('2020-01-01T00:00:00.000Z').toISOString()).toBe(
          '2020-01-01T00:00:00.000Z',
        );
      });

      it('should not parse incomplete dates as 2001', () => {
        const dt = new DateTime();
        expect(new DateTime('08')).toEqual(new DateTime(dt.getYear(), 7));
      });

      it('should parse correctly for timezone around DST shifts', () => {
        expect(
          new DateTime('2020-11-01T02:00:00.000', {
            timeZone: 'Asia/Tokyo',
          }).toISOString(),
        ).toEqual('2020-10-31T17:00:00.000Z');
        expect(
          new DateTime('2020-11-01', {
            timeZone: 'America/New_York',
          }).toISOString(),
        ).toEqual('2020-11-01T04:00:00.000Z');
        expect(
          new DateTime('2020-11-01T01:00:00.00', {
            timeZone: 'America/New_York',
          }).toISOString(),
        ).toEqual('2020-11-01T05:00:00.000Z');
        expect(
          new DateTime('2020-11-01T02:00:00.00', {
            timeZone: 'America/New_York',
          }).toISOString(),
        ).toEqual('2020-11-01T05:00:00.000Z');
      });

      it('should parse half-hour timezones', async () => {
        expect(
          new DateTime('2020-11-01', {
            timeZone: 'Asia/Kolkata',
          }).toISOString(),
        ).toEqual('2020-10-31T18:30:00.000Z');
      });

      it('should be invalid on bad input', async () => {
        expect(new DateTime('bad').isInvalid()).toBe(true);
      });
    });

    describe('numeric argument', () => {
      it('should accept a numeric value', () => {
        const time = Date.parse('2020-01-01T00:00:00.000Z');
        expect(new DateTime(time).toISOString()).toBe(
          '2020-01-01T00:00:00.000Z',
        );
      });
    });

    describe('enumerated arguments', () => {
      it('should allow enumerated arguments', () => {
        expect(new DateTime(2025, 2, 24).toISOString()).toBe(
          '2025-03-23T15:00:00.000Z',
        );
      });

      it('should respect all enumerated arguments', () => {
        expect(new DateTime(2025, 1, 2, 3, 4, 5, 6).toISOString()).toBe(
          '2025-02-01T18:04:05.006Z',
        );
      });
    });

    describe('date argument', () => {
      it('should wrap a date', () => {
        const date = new Date('2020-01-01T00:00:00.000Z');
        expect(new DateTime(date).toISOString()).toBe(
          '2020-01-01T00:00:00.000Z',
        );
      });

      it('should clone a wrapped date', () => {
        const date = new Date('2020-01-01T00:00:00.000Z');
        const dt = new DateTime(date);
        date.setDate(15);
        expect(dt.toISOString()).toBe('2020-01-01T00:00:00.000Z');
      });
    });

    describe('DateTime argument', () => {
      it('should create a clone when passed another DateTime', () => {
        const dt1 = new DateTime('2020-01-01T00:00:00.000Z');
        const dt2 = new DateTime(dt1);
        expect(dt2).not.toBe(dt1);
        expect(dt2.toISOString()).toBe('2020-01-01T00:00:00.000Z');
      });

      it('should preserve options on clone', () => {
        const dt1 = new DateTime('2020-01-01T00:00:00.000Z', {
          timeZone: 'America/New_York',
        });
        const dt2 = new DateTime(dt1);
        expect(dt2).not.toBe(dt1);
        expect(dt2.options.timeZone).toBe('America/New_York');
      });
    });

    describe('timezones', () => {
      it('should respect timezone passed in options object', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000', {
          timeZone: 'America/New_York',
        });
        expect(dt.toISOString()).toBe('2020-01-01T05:00:00.000Z');
      });

      it('should respect the globally set timezone', () => {
        DateTime.setTimeZone('America/New_York');
        const dt = new DateTime('2020-01-01T00:00:00.000');
        expect(dt.toISOString()).toBe('2020-01-01T05:00:00.000Z');
      });

      it('should respect the system time when no timezone is set', () => {
        DateTime.setTimeZone(null);
        const dt = new DateTime('2020-01-01T00:00:00.000');
        expect(dt.toISOString()).toBe(
          new Date('2020-01-01T00:00:00.000').toISOString(),
        );
      });

      it('should correctly parse YYYY-MM-DD', () => {
        const dt = new DateTime('2020-01-01', {
          timeZone: 'America/New_York',
        });
        expect(dt.toISOString()).toBe('2020-01-01T05:00:00.000Z');
      });

      it('should correctly parse YYYY-MM', () => {
        const dt = new DateTime('2020-01', {
          timeZone: 'America/New_York',
        });
        expect(dt.toISOString()).toBe('2020-01-01T05:00:00.000Z');
      });

      it('should correctly parse YYYY', () => {
        const dt = new DateTime('2020-01', {
          timeZone: 'America/New_York',
        });
        expect(dt.toISOString()).toBe('2020-01-01T05:00:00.000Z');
      });
    });

    describe('options', () => {
      it('should error on invalid timezone', () => {
        expect(() => {
          new DateTime({
            timeZone: 'bad timezone',
          });
        }).toThrow('Invalid time zone specified: bad');
      });

      it('should error on invalid locale', () => {
        expect(() => {
          new DateTime({
            locale: 'bad locale',
          });
        }).toThrow('Incorrect locale information provided');
      });
    });
  });

  describe('toString', () => {
    it('should return a medium format', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.toString()).toBe('January 1, 2020 at 9:00am');
    });
  });

  describe('Basic Formatting', () => {
    describe('default', () => {
      it('default is medium datetime', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.format()).toBe('January 1, 2020 at 9:00am');
      });

      it('should not merge options into default format', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(
          dt.format({
            month: 'short',
          }),
        ).toBe('Jan');
      });
    });
  });

  describe('token based formatting', () => {
    it('should format time with tokens', () => {
      const dt = new DateTime('2020-01-01T05:05:08.000Z', {
        timeZone: 'UTC',
      });
      expect(dt.format('h:mm a')).toBe('5:05 am');
      expect(dt.format('H:mm A')).toBe('5:05 AM');
      expect(dt.format('HH:mm A')).toBe('05:05 AM');
      expect(dt.format('mm:s')).toBe('05:8');
      expect(dt.format('mm:ss')).toBe('05:08');
      expect(dt.format('M/d/yyyy')).toBe('1/1/2020');
      expect(dt.format('MM/dd/yyyy')).toBe('01/01/2020');
      expect(dt.format('Z')).toBe('+0');
      expect(dt.format('ZZ')).toBe('+0000');
      expect(dt.format('ZZZ')).toBe('+00:00');
      expect(dt.format('ZZZZ')).toBe('UTC');
      expect(dt.format('ZZZZZ')).toBe('Coordinated Universal Time');
    });

    it('should format time with tokens in zone', () => {
      const dt = new DateTime('2020-01-01T05:05:03.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.format('h:mm a')).toBe('12:05 am');
      expect(dt.format('H:mm A')).toBe('0:05 AM');
      expect(dt.format('HH:mm A')).toBe('00:05 AM');
      expect(dt.format('mm:s')).toBe('05:3');
      expect(dt.format('mm:ss')).toBe('05:03');
      expect(dt.format('M/d/yyyy')).toBe('1/1/2020');
      expect(dt.format('MM/dd/yyyy')).toBe('01/01/2020');
      expect(dt.format('Z')).toBe('-5');
      expect(dt.format('ZZ')).toBe('-0500');
      expect(dt.format('ZZZ')).toBe('-05:00');
      expect(dt.format('ZZZZ')).toBe('EST');
      expect(dt.format('ZZZZZ')).toBe('Eastern Standard Time');
    });

    it('should not interpolate literals in tokens', () => {
      const dt = new DateTime('2020-01-01T05:55:03.000Z', {
        timeZone: 'UTC',
      });
      expect(dt.format("H 'hours and' mm 'minutes'")).toBe(
        '5 hours and 55 minutes',
      );
    });
  });

  describe('timezones', () => {
    it('should allow setting a global timezone', () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.toString()).toBe('December 31, 2019 at 7:00pm');
    });

    it('should get the globally set timezone', () => {
      expect(DateTime.getTimeZone()).toBe('Asia/Tokyo');
    });

    it('should not unset global timezone with undefined', () => {
      DateTime.setTimeZone();
      expect(DateTime.getTimeZone()).toBe('Asia/Tokyo');
    });

    it('should allow passing timezone in constructor', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.toString()).toBe('December 31, 2019 at 7:00pm');
    });

    it('should allow passing timezone in options', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(
        dt.format(
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          },
          {
            timeZone: 'America/New_York',
          },
        ),
      ).toBe('December 31, 2019');
    });

    it('use system time when not set', () => {
      DateTime.setTimeZone(null);
      const str = '2020-01-01T00:00:00.000Z';
      expect(new DateTime(str).toString()).toMatch(
        new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(new Date(str)),
      );
    });
  });

  describe('locales', () => {
    it('should allow setting a global locale', () => {
      DateTime.setLocale('ja-JP');
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.toString()).toBe('2020年1月1日 9:00');
    });

    it('should get the globally set locale', () => {
      expect(DateTime.getLocale()).toBe('en-US');
    });

    it('should not unset global timezone with undefined', () => {
      DateTime.setLocale();
      expect(DateTime.getLocale()).toBe('en-US');
    });

    it('should allow passing locale in constructor', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        locale: 'ja-JP',
      });
      expect(dt.toString()).toBe('2020年1月1日 9:00');
    });

    it('should allow passing locale in options', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(
        dt.format(
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          },
          {
            locale: 'ja-JP',
          },
        ),
      ).toBe('2020年1月1日');
    });

    it('use system locale when not set', () => {
      DateTime.setLocale();
      const str = '2020-01-01T00:00:00.000Z';
      expect(new DateTime(str).toString()).toMatch(
        new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Tokyo',
        }).format(new Date(str)),
      );
      DateTime.setLocale('en-US');
    });
  });

  describe('set', () => {
    it('should set components', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'UTC',
      });
      expect(
        dt
          .set({
            hours: 5,
            minutes: 30,
          })
          .toISOString(),
      ).toBe('2020-01-01T05:30:00.000Z');
      expect(
        dt
          .set({
            year: 2028,
            month: 12,
            minutes: 30,
          })
          .toISOString(),
      ).toBe('2028-12-01T00:30:00.000Z');
    });

    it('should set components in a timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(
        dt
          .set({
            hours: 5,
            minutes: 30,
          })
          .toISOString(),
      ).toBe('2019-12-31T10:30:00.000Z');
      expect(
        dt
          .set({
            year: 2028,
            month: 12,
            minutes: 30,
          })
          .toISOString(),
      ).toBe('2029-01-01T00:30:00.000Z');
    });

    it('should set components in intended order', () => {
      const dt = new DateTime('2020-02-15T00:00:00.000Z');
      expect(
        dt
          .set({
            day: 30,
            month: 3,
          })
          .toISOString(),
      ).toBe('2020-03-30T00:00:00.000Z');
    });

    it('should set fractional seconds', () => {
      const dt = new DateTime('2020-02-15T00:00:00.000Z');
      expect(
        dt
          .set({
            seconds: 30.572,
          })
          .toISOString(),
      ).toBe('2020-02-15T00:00:30.572Z');
    });
  });

  describe('advance', () => {
    it('should advance by a year', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'year').toISOString()).toBe(
        '2021-01-01T00:00:00.000Z',
      );
    });

    it('should advance by a month', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'month').toISOString()).toBe(
        '2020-02-01T00:00:00.000Z',
      );
    });

    it('should advance by a week', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'week').toISOString()).toBe(
        '2020-01-08T00:00:00.000Z',
      );
    });

    it('should advance by a day', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'day').toISOString()).toBe(
        '2020-01-02T00:00:00.000Z',
      );
    });

    it('should advance by an hour', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'hour').toISOString()).toBe(
        '2020-01-01T01:00:00.000Z',
      );
    });

    it('should advance by a minute', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'minute').toISOString()).toBe(
        '2020-01-01T00:01:00.000Z',
      );
    });

    it('should advance by a second', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'second').toISOString()).toBe(
        '2020-01-01T00:00:01.000Z',
      );
    });

    it('should advance by a millisecond', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(1, 'millisecond').toISOString()).toBe(
        '2020-01-01T00:00:00.001Z',
      );
    });

    it('should advance by multiple', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(
        dt
          .advance({
            years: 2,
            months: 3,
            days: 4,
          })
          .toISOString(),
      ).toBe('2022-04-05T00:00:00.000Z');
    });

    it('should not modify the date', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      dt.advance(2, 'years');
      expect(dt.toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });

    it('should advance by negative value', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.advance(-2, 'years').toISOString()).toBe(
        '2018-01-01T00:00:00.000Z',
      );
    });
  });

  describe('rewind', () => {
    it('should rewind by a year', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'year').toISOString()).toBe(
        '2019-01-01T00:00:00.000Z',
      );
    });

    it('should rewind by a month', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'month').toISOString()).toBe(
        '2019-12-01T00:00:00.000Z',
      );
    });

    it('should rewind by a week', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'week').toISOString()).toBe(
        '2019-12-25T00:00:00.000Z',
      );
    });

    it('should rewind by a day', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'day').toISOString()).toBe(
        '2019-12-31T00:00:00.000Z',
      );
    });

    it('should rewind by an hour', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'hour').toISOString()).toBe(
        '2019-12-31T23:00:00.000Z',
      );
    });

    it('should rewind by a minute', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'minute').toISOString()).toBe(
        '2019-12-31T23:59:00.000Z',
      );
    });

    it('should rewind by a second', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'second').toISOString()).toBe(
        '2019-12-31T23:59:59.000Z',
      );
    });

    it('should rewind by a millisecond', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(1, 'millisecond').toISOString()).toBe(
        '2019-12-31T23:59:59.999Z',
      );
    });

    it('should rewind by multiple', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(
        dt
          .rewind({
            years: 2,
            months: 3,
            days: 4,
          })
          .toISOString(),
      ).toBe('2017-09-27T00:00:00.000Z');
    });

    it('should not modify the date', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      dt.rewind(2, 'years');
      expect(dt.toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });

    it('should rewind by negative value', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.rewind(-2, 'years').toISOString()).toBe(
        '2022-01-01T00:00:00.000Z',
      );
    });

    it('should correctly fall back on edge', () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2023-07-30T12:00:00.000Z');
      expect(dt.rewind(1, 'month').toISOString()).toBe(
        '2023-06-30T12:00:00.000Z',
      );
    });
  });

  describe('startOf', () => {
    it('should move to the start of the year', () => {
      const dt = new DateTime('2020-03-04T05:06:07.000Z');
      expect(dt.startOfYear().toISOString()).toBe('2019-12-31T15:00:00.000Z');
    });

    it('should move to the start of the month', () => {
      const dt = new DateTime('2020-03-04T05:06:07.000Z');
      expect(dt.startOfMonth().toISOString()).toBe('2020-02-29T15:00:00.000Z');
    });

    it('should move to the start of the week', () => {
      const dt = new DateTime('2020-04-01T05:06:07.000Z');
      expect(dt.startOfWeek().toISOString()).toBe('2020-03-28T15:00:00.000Z');
    });

    it('should move to the start of the calendar month', () => {
      const dt = new DateTime('2020-04-01T05:06:07.000Z');
      expect(dt.startOfCalendarMonth().toISOString()).toBe(
        '2020-03-28T15:00:00.000Z',
      );
    });

    it('should preserve timezone', () => {
      const dt = new DateTime('2020-04-01T05:06:07.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.startOfYear().getTimezoneOffset()).toBe(300);
    });

    it('should error on unknown unit', () => {
      expect(() => {
        new DateTime().startOf('foo');
      }).toThrow('Unknown unit "foo"');
    });
  });

  describe('endOf', () => {
    it('should move to the end of the year', () => {
      const dt = new DateTime('2020-03-04T05:06:07.000Z');
      expect(dt.endOfYear().toISOString()).toBe('2020-12-31T14:59:59.999Z');
    });

    it('should move to the end of the year from a month with less days', () => {
      const dt = new DateTime('2024-11-01T00:00:00.000Z');
      expect(dt.endOfYear().toISOString()).toBe('2024-12-31T14:59:59.999Z');
    });

    it('should move to the end of the month', () => {
      const dt = new DateTime('2020-03-04T05:06:07.000Z');
      expect(dt.endOfMonth().toISOString()).toBe('2020-03-31T14:59:59.999Z');
    });

    it('should move to the end of the week', () => {
      const dt = new DateTime('2020-04-01T05:06:07.000Z');
      expect(dt.endOfWeek().toISOString()).toBe('2020-04-04T14:59:59.999Z');
    });

    it('should move to the end of the calendar month', () => {
      const dt = new DateTime('2020-04-01T05:06:07.000Z');
      expect(dt.endOfCalendarMonth().toISOString()).toBe(
        '2020-05-02T14:59:59.999Z',
      );
    });

    it('should error on unknown unit', () => {
      expect(() => {
        new DateTime().endOf('foo');
      }).toThrow('Unknown unit "foo"');
    });
  });

  describe('setArgs', () => {
    it('should set by arguments', () => {
      const dt = new DateTime();
      expect(dt.setArgs(2020, 1, 2).toISOString()).toBe(
        '2020-02-01T15:00:00.000Z',
      );
    });

    it('should respect the internal timezone', () => {
      const dt = new DateTime(Date.now(), {
        timeZone: 'America/New_York',
      });
      expect(dt.setArgs(2020, 1, 2).toISOString()).toBe(
        '2020-02-02T05:00:00.000Z',
      );
    });
  });

  describe('setTimeZone', () => {
    it('should set the internal timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.setTimeZone('UTC').endOf('month').toISOString()).toBe(
        '2020-01-31T23:59:59.999Z',
      );
    });
  });

  describe('setZone', () => {
    it('should be an alias for setTimeZone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.setZone('UTC').endOf('month').toISOString()).toBe(
        '2020-01-31T23:59:59.999Z',
      );
    });
  });

  describe('isValid', () => {
    it('should correctly identify valid input', () => {
      expect(new DateTime(NaN).isValid()).toBe(false);
      expect(new DateTime('').isValid()).toBe(false);
      expect(new DateTime('2020').isValid()).toBe(true);
      expect(new DateTime(undefined).isValid()).toBe(true);
      expect(new DateTime(null).isValid()).toBe(true);
    });
  });

  describe('isInvalid', () => {
    it('should correctly identify invalid input', () => {
      expect(new DateTime(NaN).isInvalid()).toBe(true);
      expect(new DateTime('').isInvalid()).toBe(true);
      expect(new DateTime('2020').isInvalid()).toBe(false);
      expect(new DateTime(undefined).isInvalid()).toBe(false);
      expect(new DateTime(null).isInvalid()).toBe(false);
    });
  });

  describe('isEqual', () => {
    it('equal', () => {
      const dt = new DateTime('2025-01-01');
      expect(dt.isEqual(new DateTime(dt))).toBe(true);
      expect(dt.isEqual(dt.date)).toBe(true);
      expect(dt.isEqual(dt.getTime())).toBe(true);
      expect(dt.isEqual('2025-01-01')).toBe(true);
    });

    it('not equal', () => {
      const dt = new DateTime('2025-01-01');

      expect(dt.isEqual(new DateTime(dt))).toBe(true);
      expect(dt.isEqual(dt.date)).toBe(true);
      expect(dt.isEqual(dt.getTime())).toBe(true);
      expect(dt.isEqual('2025-01-01')).toBe(true);

      // Not equal
      expect(dt.isEqual(new DateTime('2025-01-02'))).toBe(false);
      expect(dt.isEqual(new Date('2025-01-01T15:00:00.000Z'))).toBe(false);
      expect(dt.isEqual('2025-01-02')).toBe(false);
    });

    it('other', () => {
      expect(new DateTime('2025-01-01').isEqual(null)).toBe(false);
      expect(new DateTime('2025-01-01').isEqual(NaN)).toBe(false);
      expect(new DateTime('2025-01-01').isEqual(false)).toBe(false);
      expect(new DateTime('2025-01-01').isEqual(undefined)).toBe(false);
    });
  });

  describe('resetTime', () => {
    it('should reset the time', () => {
      const dt = new DateTime('2020-03-04T05:06:07.000Z');
      expect(dt.resetTime().toISOString()).toBe('2020-03-03T15:00:00.000Z');
    });
  });

  describe('date formatting', () => {
    describe('toDate', () => {
      it('should get the date', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.toDate()).toBe('2020-01-01');
      });

      it('should account for timezone', () => {
        DateTime.setTimeZone('America/New_York');
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.toDate()).toBe('2019-12-31');
      });
    });

    describe('toDateLong', () => {
      it('should return long format', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.toDateLong()).toBe('January 1, 2020');
      });

      it('should be able to pass extra params', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(
          dt.toDateLong({
            hour: 'numeric',
          }),
        ).toBe('January 1, 2020 at 9am');
      });
    });

    describe('toDateMedium', () => {
      it('should return medium format', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.toDateMedium()).toBe('Jan 1, 2020');
      });

      it('should be able to pass extra params', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(
          dt.toDateMedium({
            hour: 'numeric',
          }),
        ).toBe('Jan 1, 2020, 9am');
      });
    });

    describe('toDateShort', () => {
      it('should return short format', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.toDateShort()).toBe('1/1/2020');
      });

      it('should be able to pass extra params', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(
          dt.toDateShort({
            hour: 'numeric',
          }),
        ).toBe('1/1/2020, 9am');
      });
    });
  });

  describe('time formatting', () => {
    describe('toTime', () => {
      it('should get the time', () => {
        const dt = new DateTime('2020-01-01T00:10:20.300Z');
        expect(dt.toTime()).toBe('09:10:20.300');
      });

      it('should account for timezone', () => {
        DateTime.setTimeZone('America/New_York');
        const dt = new DateTime('2020-01-01T00:10:20.300Z');
        expect(dt.toTime()).toBe('19:10:20.300');
      });
    });

    describe('toTimeWithZone', () => {
      it('should use short zone by default', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.toTimeWithZone()).toBe('9:00am GMT+9');
      });

      it('should format with long zone', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.toTimeWithZone('long')).toBe('9:00am Japan Standard Time');
      });

      it('should format with short generic zone', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.toTimeWithZone('shortGeneric')).toBe('9:00am Japan Time');
      });

      it('should format with long generic zone', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.toTimeWithZone('longGeneric')).toBe(
          '9:00am Japan Standard Time',
        );
      });

      it('should be able to pass extra params', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(
          dt.toTimeWithZone({
            hour: '2-digit',
          }),
        ).toBe('09:00am GMT+9');
      });
    });

    describe('toTimeLong', () => {
      it('should return long format', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.toTimeLong()).toBe('9:00:00am');
      });

      it('should be able to pass extra params', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(
          dt.toTimeLong({
            hour: '2-digit',
          }),
        ).toBe('09:00:00am');
      });
    });

    describe('toTimeMedium', () => {
      it('should return medium format', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.toTimeMedium()).toBe('9:00am');
      });

      it('should be able to pass extra params', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(
          dt.toTimeMedium({
            hour: '2-digit',
          }),
        ).toBe('09:00am');
      });
    });

    describe('toTimeShort', () => {
      it('should return short format', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.toTimeShort()).toBe('9am');
      });

      it('should be able to pass extra params', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(
          dt.toTimeShort({
            hour: '2-digit',
          }),
        ).toBe('09am');
      });

      it('should be able to format short meridiem', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(
          dt.toTimeShort({
            meridiem: 'short',
          }),
        ).toBe('9a');
      });

      it('should be able to format caps meridiem', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(
          dt.toTimeShort({
            meridiem: 'caps',
          }),
        ).toBe('9AM');
      });

      it('should be able to format space meridiem', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(
          dt.toTimeShort({
            meridiem: 'space',
          }),
        ).toBe('9 am');
      });

      it('should be able to format period meridiem', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(
          dt.toTimeShort({
            meridiem: 'period',
          }),
        ).toBe('9 a.m.');
      });
    });
  });

  describe('datetime formatting', () => {
    describe('formatWithZone', () => {
      it('should format with short zone by default', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.formatWithZone()).toBe('January 1, 2020 at 9:00am GMT+9');
      });

      it('should format with long zone', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.formatWithZone('long')).toBe(
          'January 1, 2020 at 9:00am Japan Standard Time',
        );
      });

      it('should format with short generic zone', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.formatWithZone('shortGeneric')).toBe(
          'January 1, 2020 at 9:00am Japan Time',
        );
      });

      it('should format with long generic zone', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.formatWithZone('longGeneric')).toBe(
          'January 1, 2020 at 9:00am Japan Standard Time',
        );
      });

      it('should be able to pass extra params', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(
          dt.formatWithZone({
            hour: '2-digit',
          }),
        ).toBe('January 1, 2020 at 09:00am GMT+9');
      });
    });

    describe('formatLong', () => {
      it('should return long format', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.formatLong()).toBe('January 1, 2020 at 9:00am');
      });
    });

    describe('formatMedium', () => {
      it('should return medium format', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.formatMedium()).toBe('Jan 1, 2020, 9:00am');
      });
    });

    describe('formatShort', () => {
      it('should return short format', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.formatShort()).toBe('1/1/2020, 9:00am');
      });
    });
  });

  describe('month-year formatting', () => {
    it('should format month-year', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.toMonthYear()).toBe('January 2020');
    });

    it('should use short month', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.toMonthYear('short')).toBe('Jan 2020');
    });

    it('should be able to pass extra params', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(
        dt.toMonthYear({
          hour: '2-digit',
        }),
      ).toBe('January 2020 at 09am');
    });
  });

  describe('month-day formatting', () => {
    it('should format month-day', () => {
      const dt = new DateTime('2020-11-14T00:00:00.000Z');
      expect(dt.toMonthDay()).toBe('November 14');
    });

    it('should use short month', () => {
      const dt = new DateTime('2020-11-14T00:00:00.000Z');
      expect(dt.toMonthDay('short')).toBe('Nov 14');
    });

    it('should be able to pass extra params', () => {
      const dt = new DateTime('2020-11-14T00:00:00.000Z');
      expect(
        dt.toMonthDay({
          hour: 'numeric',
        }),
      ).toBe('November 14 at 9am');
    });
  });

  describe('toISODate', () => {
    it('should get the date', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.toISODate()).toBe('2020-01-01');
    });

    it('should not account for timezone', () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.toISODate()).toBe('2020-01-01');
    });
  });

  describe('toISOTime', () => {
    it('should get the time', () => {
      const dt = new DateTime('2020-01-01T12:10:20.300Z');
      expect(dt.toISOTime()).toBe('12:10:20.300');
    });

    it('should not account for timezone', () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2020-01-01T12:10:20.300Z');
      expect(dt.toISOTime()).toBe('12:10:20.300');
    });
  });

  describe('daysInMonth', () => {
    it('should get days in January', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.daysInMonth()).toBe(31);
    });

    it('should get days in leap year', () => {
      const dt = new DateTime('2020-02-01T00:00:00.000Z');
      expect(dt.daysInMonth()).toBe(29);
    });

    it('should get days in non leap year', () => {
      const dt = new DateTime('2021-02-01T00:00:00.000Z');
      expect(dt.daysInMonth()).toBe(28);
    });
  });

  describe('clone', () => {
    it('should clone the datetime', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.clone().toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });
  });

  describe('relative', () => {
    describe('basic', () => {
      it('5 years ago', () => {
        expect(new DateTime().rewind(5, 'years').relative()).toBe(
          '5 years ago',
        );
      });

      it('last year', () => {
        expect(new DateTime().rewind(1, 'year').relative()).toBe('last year');
      });

      it('11 months ago', () => {
        expect(new DateTime().rewind(11, 'months').relative()).toBe(
          '11 months ago',
        );
      });

      it('last month', () => {
        expect(new DateTime().rewind(1, 'month').relative()).toBe('last month');
      });

      it('3 weeks ago', () => {
        expect(new DateTime().rewind(21, 'days').relative()).toBe(
          '3 weeks ago',
        );
      });

      it('last week', () => {
        expect(new DateTime().rewind(7, 'days').relative()).toBe('last week');
      });

      it('6 days ago', () => {
        expect(new DateTime().rewind(6, 'days').relative()).toBe('6 days ago');
      });

      it('yesterday', () => {
        expect(new DateTime().rewind(1, 'day').relative()).toBe('yesterday');
      });

      it('23 hours ago', () => {
        expect(new DateTime().rewind(23, 'hours').relative()).toBe(
          '23 hours ago',
        );
      });

      it('1 hour ago', () => {
        expect(new DateTime().rewind(1, 'hour').relative()).toBe('1 hour ago');
      });

      it('59 minutes ago', () => {
        expect(new DateTime().rewind(59, 'minutes').relative()).toBe(
          '59 minutes ago',
        );
      });

      it('1 minute ago', () => {
        expect(new DateTime().rewind(1, 'minute').relative()).toBe(
          '1 minute ago',
        );
      });

      it('59 seconds ago', () => {
        expect(new DateTime().rewind(59, 'seconds').relative()).toBe(
          '59 seconds ago',
        );
      });

      it('1 seconds ago', () => {
        expect(new DateTime().rewind(1, 'second').relative()).toBe(
          '1 second ago',
        );
      });

      it('now', () => {
        mockTime('2025-01-01T00:00:00.000Z');
        expect(new DateTime().rewind(500, 'milliseconds').relative()).toBe(
          'now',
        );
        unmockTime();
      });
    });

    describe('future', () => {
      it('next year', () => {
        expect(new DateTime().advance(13, 'months').relative()).toBe(
          'next year',
        );
      });

      it('tomorrow', () => {
        expect(new DateTime().advance(25, 'hours').relative()).toBe('tomorrow');
      });
    });

    describe('rounding', () => {
      it('should round up when a second off', () => {
        mockTime('2025-03-04T00:00:01.000Z');
        expect(new DateTime('2025-03-04T02:00:00.000Z').relative()).toBe(
          'in 2 hours',
        );
        unmockTime();
      });

      it('should round up when a minute off', () => {
        mockTime('2025-03-04T00:01:00.000Z');
        expect(new DateTime('2025-03-04T02:00:00.000Z').relative()).toBe(
          'in 2 hours',
        );
        unmockTime();
      });

      it('should round up when 30 minutes off', () => {
        mockTime('2025-03-04T00:30:00.000Z');
        expect(new DateTime('2025-03-04T02:00:00.000Z').relative()).toBe(
          'in 2 hours',
        );
        unmockTime();
      });

      it('should round down when 31 minutes off', () => {
        mockTime('2025-03-04T00:31:00.000Z');
        expect(new DateTime('2025-03-04T02:00:00.000Z').relative()).toBe(
          'in 1 hour',
        );
        unmockTime();
      });

      it('should use hours when exactly 60 minutes', () => {
        mockTime('2025-03-04T01:00:00.000Z');
        expect(new DateTime('2025-03-04T02:00:00.000Z').relative()).toBe(
          'in 1 hour',
        );
        unmockTime();
      });

      it('should use minutes when 59 minutes', () => {
        mockTime('2025-03-04T01:01:00.000Z');
        expect(new DateTime('2025-03-04T02:00:00.000Z').relative()).toBe(
          'in 59 minutes',
        );
        unmockTime();
      });

      it('should round correctly for years', () => {
        mockTime('2025-01-01T00:00:00.000Z');
        expect(new DateTime('2026-01-01T00:00:00.000Z').relative()).toBe(
          'next year',
        );
        expect(new DateTime('2026-06-01T00:00:00.000Z').relative()).toBe(
          'next year',
        );
        expect(new DateTime('2026-07-01T00:00:00.000Z').relative()).toBe(
          'in 2 years',
        );
        expect(new DateTime('2026-12-31T00:00:00.000Z').relative()).toBe(
          'in 2 years',
        );
        expect(new DateTime('2027-01-01T00:00:00.000Z').relative()).toBe(
          'in 2 years',
        );
        expect(new DateTime('2027-07-01T00:00:00.000Z').relative()).toBe(
          'in 3 years',
        );
        unmockTime();
      });
    });

    describe('locales', () => {
      it('should format by global locale', () => {
        DateTime.setLocale('ja-JP');
        expect(new DateTime().rewind(1, 'day').relative()).toBe('昨日');
        DateTime.setLocale('en-US');
      });

      it('should format by internal locale', () => {
        const dt = new DateTime(Date.now() - 24 * 60 * 60 * 1000, {
          locale: 'ja-JP',
        });
        expect(dt.relative()).toBe('昨日');
      });

      it('should format by options object', () => {
        expect(
          new DateTime().rewind(1, 'day').relative({
            locale: 'ja-JP',
          }),
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
        it('should format relative to another now', () => {
          const d1 = new DateTime('2020-01-01T00:00:00.000Z');
          const d2 = new DateTime('2020-07-01T00:00:00.000Z');
          expect(
            d1.relative({
              now: d2,
            }),
          ).toBe('6 months ago');
        });
      });

      describe('min', () => {
        it('should format as date past cutoff', () => {
          mockTime('2025-01-01T00:00:00.000Z');

          expect(
            new DateTime().rewind(1, 'year').relative({
              min: new DateTime().rewind(6, 'months'),
            }),
          ).toBe('January 1, 2024');

          const now = new DateTime();
          const next = now.rewind(6, 'months');
          const months = getMonthOffset(now, next);

          expect(
            next.relative({
              min: new DateTime().rewind(8, 'months'),
            }),
          ).toBe(`${months} months ago`);

          expect(
            new DateTime().rewind(2, 'days').relative({
              min: new DateTime().rewind(6, 'months'),
            }),
          ).toBe('2 days ago');

          unmockTime();
        });

        it('should return a time if still same day', () => {
          mockTime('2025-01-01T09:00:00.000Z');

          expect(
            new DateTime().rewind(1, 'hour').relative({
              min: new DateTime().rewind(3, 'hours'),
            }),
          ).toBe('1 hour ago');

          expect(
            new DateTime().rewind(6, 'hours').relative({
              min: new DateTime().rewind(3, 'hours'),
            }),
          ).toBe('12:00pm');

          unmockTime();
        });

        it('should return a day and month if same year', () => {
          mockTime('2025-06-15T09:00:00.000Z');

          expect(
            new DateTime().rewind(19, 'hours').relative({
              min: new DateTime().rewind(6, 'hours'),
            }),
          ).toBe('June 14');

          unmockTime();
        });
      });

      describe('max', () => {
        it('should format as date past cutoff', () => {
          mockTime('2025-01-01T00:00:00.000Z');

          expect(
            new DateTime().advance(1, 'year').relative({
              max: new DateTime().advance(6, 'months'),
            }),
          ).toBe('January 1, 2026');

          const now = new DateTime();
          const next = now.advance(6, 'months');
          const months = getMonthOffset(now, next);
          expect(
            next.relative({
              max: next,
            }),
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
              }),
          ).toBe('in 2 days');

          unmockTime();
        });
      });

      describe('numeric', () => {
        it('should allow passing the numeric flag', () => {
          expect(
            new DateTime().rewind(1, 'day').relative({
              numeric: 'always',
            }),
          ).toBe('1 day ago');
        });
      });
    });
  });

  describe('getTimezoneOffset', () => {
    it('should report correctly for the timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getTimezoneOffset()).toBe(300);
    });

    it('should report correctly for global timezone', () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.getTimezoneOffset()).toBe(300);
    });

    it('should report the system offset when not timezone set', () => {
      DateTime.setTimeZone(null);
      expect(new DateTime().getTimezoneOffset()).toBe(
        new Date().getTimezoneOffset(),
      );
    });
  });

  describe('getTimeZoneOffset', () => {
    it('should be an alias', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getTimeZoneOffset()).toBe(300);
    });
  });

  describe('getTimeZone', () => {
    it('should return the IANA timezone', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getTimeZone()).toBe('America/New_York');
    });

    it('should return globally set timezone', async () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.getTimeZone()).toBe('America/New_York');
    });

    it('should return system timezone when none set', async () => {
      DateTime.setTimeZone(null);
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      const system = new Intl.DateTimeFormat().resolvedOptions().timeZone;
      expect(dt.getTimeZone()).toBe(system);
    });
  });

  describe('getTimezone', () => {
    it('should be alias', async () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getTimezone()).toBe('America/New_York');
    });
  });

  describe('getters', () => {
    it('should get the correct year for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getFullYear()).toBe(2019);
    });

    it('should alias getFullYear as getYear', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getYear()).toBe(2019);
    });

    it('should get the correct month for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getMonth()).toBe(11);
    });

    it('should get the correct date for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getDate()).toBe(31);
    });

    it('should get the correct weekday for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getDay()).toBe(2);
    });

    it('should get the correct hours for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getHours()).toBe(19);
    });

    it('should get the correct minutes for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getMinutes()).toBe(0);
    });

    it('should get the correct seconds for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getSeconds()).toBe(0);
    });

    it('should get the correct milliseconds for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.getMilliseconds()).toBe(0);
    });
  });

  describe('setters', () => {
    it('should have setYear a shortcut', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z');
      expect(dt.setYear(2019).toISOString()).toBe('2019-01-01T00:00:00.000Z');
    });

    it('should set the correct year for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.setFullYear(2019).toISOString()).toBe(
        '2020-01-01T00:00:00.000Z',
      );
    });

    it('should set the correct month for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.setMonth(11).toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });

    it('should set the correct date for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.setDate(31).toISOString()).toBe('2020-01-01T00:00:00.000Z');
    });

    it('should set the correct hours for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.setHours(20).toISOString()).toBe('2020-01-01T01:00:00.000Z');
    });

    it('should set the correct minutes for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.setMinutes(30).toISOString()).toBe('2020-01-01T00:30:00.000Z');
    });

    it('should set the correct seconds for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.setSeconds(30).toISOString()).toBe('2020-01-01T00:00:30.000Z');
    });

    it('should set the correct milliseconds for timezone', () => {
      const dt = new DateTime('2020-01-01T00:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.setMilliseconds(500).toISOString()).toBe(
        '2020-01-01T00:00:00.500Z',
      );
    });
  });

  describe('named getters', () => {
    describe('months', () => {
      it('should get the long month name by default', () => {
        expect(new DateTime('2020-01-01').getMonthName()).toBe('January');
        expect(new DateTime('2020-02-01').getMonthName()).toBe('February');
        expect(new DateTime('2020-03-01').getMonthName()).toBe('March');
        expect(new DateTime('2020-04-01').getMonthName()).toBe('April');
        expect(new DateTime('2020-05-01').getMonthName()).toBe('May');
        expect(new DateTime('2020-06-01').getMonthName()).toBe('June');
        expect(new DateTime('2020-07-01').getMonthName()).toBe('July');
        expect(new DateTime('2020-08-01').getMonthName()).toBe('August');
        expect(new DateTime('2020-09-01').getMonthName()).toBe('September');
        expect(new DateTime('2020-10-01').getMonthName()).toBe('October');
        expect(new DateTime('2020-11-01').getMonthName()).toBe('November');
        expect(new DateTime('2020-12-01').getMonthName()).toBe('December');
      });

      it('should get the short month name', () => {
        expect(new DateTime('2020-01-01').getMonthName('short')).toBe('Jan');
        expect(new DateTime('2020-02-01').getMonthName('short')).toBe('Feb');
        expect(new DateTime('2020-03-01').getMonthName('short')).toBe('Mar');
        expect(new DateTime('2020-04-01').getMonthName('short')).toBe('Apr');
        expect(new DateTime('2020-05-01').getMonthName('short')).toBe('May');
        expect(new DateTime('2020-06-01').getMonthName('short')).toBe('Jun');
        expect(new DateTime('2020-07-01').getMonthName('short')).toBe('Jul');
        expect(new DateTime('2020-08-01').getMonthName('short')).toBe('Aug');
        expect(new DateTime('2020-09-01').getMonthName('short')).toBe('Sep');
        expect(new DateTime('2020-10-01').getMonthName('short')).toBe('Oct');
        expect(new DateTime('2020-11-01').getMonthName('short')).toBe('Nov');
        expect(new DateTime('2020-12-01').getMonthName('short')).toBe('Dec');
      });

      it('should get the compact month name', () => {
        expect(new DateTime('2020-01-01').getMonthName('compact')).toBe('Ja');
        expect(new DateTime('2020-02-01').getMonthName('compact')).toBe('Fe');
        expect(new DateTime('2020-03-01').getMonthName('compact')).toBe('Ma');
        expect(new DateTime('2020-04-01').getMonthName('compact')).toBe('Ap');
        expect(new DateTime('2020-05-01').getMonthName('compact')).toBe('Ma');
        expect(new DateTime('2020-06-01').getMonthName('compact')).toBe('Ju');
        expect(new DateTime('2020-07-01').getMonthName('compact')).toBe('Ju');
        expect(new DateTime('2020-08-01').getMonthName('compact')).toBe('Au');
        expect(new DateTime('2020-09-01').getMonthName('compact')).toBe('Se');
        expect(new DateTime('2020-10-01').getMonthName('compact')).toBe('Oc');
        expect(new DateTime('2020-11-01').getMonthName('compact')).toBe('No');
        expect(new DateTime('2020-12-01').getMonthName('compact')).toBe('De');
      });

      it('should get the narrow month name', () => {
        expect(new DateTime('2020-01-01').getMonthName('narrow')).toBe('J');
        expect(new DateTime('2020-02-01').getMonthName('narrow')).toBe('F');
        expect(new DateTime('2020-03-01').getMonthName('narrow')).toBe('M');
        expect(new DateTime('2020-04-01').getMonthName('narrow')).toBe('A');
        expect(new DateTime('2020-05-01').getMonthName('narrow')).toBe('M');
        expect(new DateTime('2020-06-01').getMonthName('narrow')).toBe('J');
        expect(new DateTime('2020-07-01').getMonthName('narrow')).toBe('J');
        expect(new DateTime('2020-08-01').getMonthName('narrow')).toBe('A');
        expect(new DateTime('2020-09-01').getMonthName('narrow')).toBe('S');
        expect(new DateTime('2020-10-01').getMonthName('narrow')).toBe('O');
        expect(new DateTime('2020-11-01').getMonthName('narrow')).toBe('N');
        expect(new DateTime('2020-12-01').getMonthName('narrow')).toBe('D');
      });

      it('should return english regardless of locale', () => {
        const dt = new DateTime('2020-01-01', {
          locale: 'ja-JP',
        });

        expect(dt.getMonthName()).toBe('January');
      });

      it('should consider respect time zone ', () => {
        const dt = new DateTime('2025-08-01T00:00:00.000Z', {
          timeZone: 'America/New_York',
        });

        expect(dt.getMonthName()).toBe('July');
      });
    });

    describe('weekdays', () => {
      it('should get the long weekday name', () => {
        expect(new DateTime('2020-01-05').getWeekdayName()).toBe('Sunday');
        expect(new DateTime('2020-01-06').getWeekdayName()).toBe('Monday');
        expect(new DateTime('2020-01-07').getWeekdayName()).toBe('Tuesday');
        expect(new DateTime('2020-01-08').getWeekdayName()).toBe('Wednesday');
        expect(new DateTime('2020-01-09').getWeekdayName()).toBe('Thursday');
        expect(new DateTime('2020-01-10').getWeekdayName()).toBe('Friday');
        expect(new DateTime('2020-01-11').getWeekdayName()).toBe('Saturday');
      });

      it('should get the short weekday name', () => {
        expect(new DateTime('2020-01-05').getWeekdayName('short')).toBe('Sun');
        expect(new DateTime('2020-01-06').getWeekdayName('short')).toBe('Mon');
        expect(new DateTime('2020-01-07').getWeekdayName('short')).toBe('Tue');
        expect(new DateTime('2020-01-08').getWeekdayName('short')).toBe('Wed');
        expect(new DateTime('2020-01-09').getWeekdayName('short')).toBe('Thu');
        expect(new DateTime('2020-01-10').getWeekdayName('short')).toBe('Fri');
        expect(new DateTime('2020-01-11').getWeekdayName('short')).toBe('Sat');
      });

      it('should get the compact weekday name', () => {
        expect(new DateTime('2020-01-05').getWeekdayName('compact')).toBe('Su');
        expect(new DateTime('2020-01-06').getWeekdayName('compact')).toBe('Mo');
        expect(new DateTime('2020-01-07').getWeekdayName('compact')).toBe('Tu');
        expect(new DateTime('2020-01-08').getWeekdayName('compact')).toBe('We');
        expect(new DateTime('2020-01-09').getWeekdayName('compact')).toBe('Th');
        expect(new DateTime('2020-01-10').getWeekdayName('compact')).toBe('Fr');
        expect(new DateTime('2020-01-11').getWeekdayName('compact')).toBe('Sa');
      });

      it('should get the narrow weekday name', () => {
        expect(new DateTime('2020-01-05').getWeekdayName('narrow')).toBe('S');
        expect(new DateTime('2020-01-06').getWeekdayName('narrow')).toBe('M');
        expect(new DateTime('2020-01-07').getWeekdayName('narrow')).toBe('T');
        expect(new DateTime('2020-01-08').getWeekdayName('narrow')).toBe('W');
        expect(new DateTime('2020-01-09').getWeekdayName('narrow')).toBe('T');
        expect(new DateTime('2020-01-10').getWeekdayName('narrow')).toBe('F');
        expect(new DateTime('2020-01-11').getWeekdayName('narrow')).toBe('S');
      });

      it('should return english regardless of locale', () => {
        const dt = new DateTime('2020-01-01', {
          locale: 'ja-JP',
        });

        expect(dt.getWeekdayName()).toBe('Wednesday');
      });

      it('should consider respect time zone ', () => {
        const dt = new DateTime('2025-08-12T18:00:00.000Z', {
          timeZone: 'America/New_York',
        });

        expect(dt.getWeekdayName()).toBe('Tuesday');
      });
    });
  });

  describe('DST', () => {
    it('should fix forward shift', () => {
      const dt = new DateTime('2023-03-12T05:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.advance(1, 'day').toISOString()).toBe(
        '2023-03-13T04:00:00.000Z',
      );
    });

    it('should fix forward shift with global timezone', () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2023-03-12T05:00:00.000Z');
      expect(dt.advance(1, 'day').toISOString()).toBe(
        '2023-03-13T04:00:00.000Z',
      );
    });

    it('should fix backward shift', () => {
      const dt = new DateTime('2023-11-05T04:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.advance(1, 'day').toISOString()).toBe(
        '2023-11-06T05:00:00.000Z',
      );
    });

    it('should fix backward shift with global timezone', () => {
      DateTime.setTimeZone('America/New_York');
      const dt = new DateTime('2023-11-05T04:00:00.000Z');
      expect(dt.advance(1, 'day').toISOString()).toBe(
        '2023-11-06T05:00:00.000Z',
      );
    });

    it('should fix shifts when setting week', () => {
      // Note that the DST changed at April 29th at 2am in 1973.

      let dt;

      // The start of May 1st at 12:00am
      dt = new DateTime('1973-05-01T04:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.startOfWeek().toISOString()).toBe('1973-04-29T05:00:00.000Z');

      // The start of Apr 29st at 12:00am
      dt = new DateTime('1973-04-29T05:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.endOfWeek().toISOString()).toBe('1973-05-06T03:59:59.999Z');
    });

    it('should fix forward shift when setting components', () => {
      const dt = new DateTime('2025-03-09T05:00:00.000Z', {
        timeZone: 'America/New_York',
      });
      expect(dt.set({ day: 10 }).toISOString()).toBe(
        '2025-03-10T04:00:00.000Z',
      );
    });

    it('should not be affected by system DST shifts', () => {
      const dt = new DateTime('2026-03-01').setDate(15);
      expect(dt.toISOString()).toBe('2026-03-14T15:00:00.000Z');
    });
  });

  describe('calendar weeks', () => {
    describe('startOfWeek', () => {
      it('should move to Monday in the UK', () => {
        const dt = new DateTime('2020-03-18T05:06:07.000Z', {
          locale: 'en-UK',
          timeZone: 'Europe/London',
        });
        expect(dt.startOfWeek().toISOString()).toBe('2020-03-16T00:00:00.000Z');
      });

      it('should move to Saturday in Algeria', () => {
        const dt = new DateTime('2020-03-18T05:06:07.000Z', {
          locale: 'ar-DZ',
          timeZone: 'Africa/Algiers',
        });
        expect(dt.startOfWeek().toISOString()).toBe('2020-03-13T23:00:00.000Z');
      });
    });

    describe('endOfWeek', () => {
      it('should move to Sunday in the UK', () => {
        const dt = new DateTime('2020-03-18T05:06:07.000Z', {
          locale: 'en-UK',
          timeZone: 'Europe/London',
        });
        expect(dt.endOfWeek().toISOString()).toBe('2020-03-22T23:59:59.999Z');
      });

      it('should move to Friday in Algeria', () => {
        const dt = new DateTime('2020-03-18T05:06:07.000Z', {
          locale: 'ar-DZ',
          timeZone: 'Africa/Algiers',
        });
        expect(dt.endOfWeek().toISOString()).toBe('2020-03-20T22:59:59.999Z');
      });
    });

    describe('startOfCalendarMonth', () => {
      it('should be Monday in the UK', () => {
        const dt = new DateTime('2020-03-18T05:06:07.000Z', {
          locale: 'en-UK',
          timeZone: 'Europe/London',
        });
        expect(dt.startOfCalendarMonth().toISOString()).toBe(
          '2020-02-24T00:00:00.000Z',
        );
      });

      it('should be Saturday in Algeria', () => {
        const dt = new DateTime('2020-03-18T05:06:07.000Z', {
          locale: 'ar-DZ',
          timeZone: 'Africa/Algiers',
        });
        expect(dt.startOfCalendarMonth().toISOString()).toBe(
          '2020-02-28T23:00:00.000Z',
        );
      });

      it('should respect Unicode extension', () => {
        const dt = new DateTime('2020-03-18T05:06:07.000Z', {
          locale: 'en-u-fw-sat',
          timeZone: 'UTC',
        });
        expect(dt.startOfCalendarMonth().toISOString()).toBe(
          '2020-02-29T00:00:00.000Z',
        );
      });

      it('should respect hard coded value', () => {
        const dt = new DateTime('2020-03-18T05:06:07.000Z', {
          firstDayOfWeek: 6,
          timeZone: 'UTC',
        });
        expect(dt.startOfCalendarMonth().toISOString()).toBe(
          '2020-02-29T00:00:00.000Z',
        );
      });
    });

    describe('endOfCalendarMonth', () => {
      it('should be Monday in the UK', () => {
        const dt = new DateTime('2020-03-18T05:06:07.000Z', {
          locale: 'en-UK',
          timeZone: 'Europe/London',
        });
        expect(dt.endOfCalendarMonth().toISOString()).toBe(
          '2020-04-05T22:59:59.999Z',
        );
      });

      it('should be Saturday in Algeria', () => {
        const dt = new DateTime('2020-03-18T05:06:07.000Z', {
          locale: 'ar-DZ',
          timeZone: 'Africa/Algiers',
        });
        expect(dt.endOfCalendarMonth().toISOString()).toBe(
          '2020-04-03T22:59:59.999Z',
        );
      });

      it('should respect Unicode extension', () => {
        const dt = new DateTime('2020-03-18T05:06:07.000Z', {
          locale: 'en-u-fw-sat',
          timeZone: 'UTC',
        });
        expect(dt.endOfCalendarMonth().toISOString()).toBe(
          '2020-04-03T23:59:59.999Z',
        );
      });

      it('should respect hard coded value', () => {
        const dt = new DateTime('2020-03-18T05:06:07.000Z', {
          firstDayOfWeek: 6,
          timeZone: 'UTC',
        });
        expect(dt.endOfCalendarMonth().toISOString()).toBe(
          '2020-04-03T23:59:59.999Z',
        );
      });
    });
  });

  describe('compatibility', () => {
    it('toISOString', () => {
      const str = '2020-01-01T00:00:00.000Z';
      expect(new DateTime(str).toISOString()).toBe(new Date(str).toISOString());
    });

    it('toJSON', () => {
      const str = '2020-01-01T00:00:00.000Z';
      expect(new DateTime(str).toJSON()).toBe(new Date(str).toJSON());
    });

    it('getTime', () => {
      const str = '2020-01-01T00:00:00.000Z';
      expect(new DateTime(str).getTime()).toBe(new Date(str).getTime());
    });

    it('setTime', () => {
      const str = '2020-01-01T00:00:00.000Z';
      const time = Date.parse(str);
      expect(new DateTime().setTime(time).toISOString()).toBe(str);
    });

    it('valueOf', () => {
      const d1 = new DateTime('2020-01-01T00:00:00.000Z');
      const d2 = new DateTime('2020-01-02T00:00:00.000Z');
      expect(d2 - d1).toBe(24 * 60 * 60 * 1000);
    });

    describe('UTC getters', () => {
      it('should have correct UTC getters', () => {
        const dt = new DateTime('2020-01-01T15:16:17.400Z');
        expect(dt.getUTCFullYear()).toBe(2020);
        expect(dt.getUTCMonth()).toBe(0);
        expect(dt.getUTCDate()).toBe(1);
        expect(dt.getUTCDay()).toBe(3);
        expect(dt.getUTCHours()).toBe(15);
        expect(dt.getUTCMinutes()).toBe(16);
        expect(dt.getUTCSeconds()).toBe(17);
        expect(dt.getUTCMilliseconds()).toBe(400);
      });
    });

    describe('UTC setters', () => {
      it('should have correct UTC setters', () => {
        const dt = new DateTime('2020-01-01T00:00:00.000Z');
        expect(dt.setUTCFullYear(2022).toISOString()).toBe(
          '2022-01-01T00:00:00.000Z',
        );
        expect(dt.setUTCMonth(1).toISOString()).toBe(
          '2020-02-01T00:00:00.000Z',
        );
        expect(dt.setUTCDate(15).toISOString()).toBe(
          '2020-01-15T00:00:00.000Z',
        );
        expect(dt.setUTCHours(10).toISOString()).toBe(
          '2020-01-01T10:00:00.000Z',
        );
        expect(dt.setUTCMinutes(20).toISOString()).toBe(
          '2020-01-01T00:20:00.000Z',
        );
        expect(dt.setUTCSeconds(30).toISOString()).toBe(
          '2020-01-01T00:00:30.000Z',
        );
        expect(dt.setUTCMilliseconds(400).toISOString()).toBe(
          '2020-01-01T00:00:00.400Z',
        );
      });
    });
  });

  describe('extensions', () => {
    describe('setTime', () => {
      it('should set parsed time components by a string', async () => {
        mockTime('2025-01-01T12:00:00.000Z');

        const dt = new DateTime();

        expect(dt.setTime('11').toISOString()).toBe('2025-01-01T02:00:00.000Z');

        expect(dt.setTime('11:00').toISOString()).toBe(
          '2025-01-01T02:00:00.000Z',
        );

        expect(dt.setTime('11:45').toISOString()).toBe(
          '2025-01-01T02:45:00.000Z',
        );

        expect(dt.setTime('11:45:15').toISOString()).toBe(
          '2025-01-01T02:45:15.000Z',
        );

        expect(dt.setTime('11:45:15.200').toISOString()).toBe(
          '2025-01-01T02:45:15.200Z',
        );

        unmockTime();
      });

      it('should set UTC time components by a string', async () => {
        mockTime('2025-01-01T12:00:00.000Z');

        const dt = new DateTime();

        expect(dt.setTime('11Z').toISOString()).toBe(
          '2025-01-01T11:00:00.000Z',
        );

        expect(dt.setTime('11:00Z').toISOString()).toBe(
          '2025-01-01T11:00:00.000Z',
        );

        expect(dt.setTime('11:45Z').toISOString()).toBe(
          '2025-01-01T11:45:00.000Z',
        );

        expect(dt.setTime('11:45:15Z').toISOString()).toBe(
          '2025-01-01T11:45:15.000Z',
        );

        expect(dt.setTime('11:45:15.200Z').toISOString()).toBe(
          '2025-01-01T11:45:15.200Z',
        );

        unmockTime();
      });

      it('should unset time by empty string', async () => {
        mockTime('2025-01-01T12:00:00.000Z');

        expect(new DateTime().setTime('').toISOString()).toBe(
          '2024-12-31T15:00:00.000Z',
        );

        unmockTime();
      });

      it('should handle standard errors', async () => {
        mockTime('2025-01-01T12:00:00.000Z');

        const dt = new DateTime();

        expect(() => {
          dt.setTime('bad').toISOString();
        }).toThrow('Invalid time value');

        expect(() => {
          dt.setTime('11.25').toISOString();
        }).toThrow('Invalid time value');

        unmockTime();
      });
    });
  });
});
