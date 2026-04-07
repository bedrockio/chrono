import DateTime from './DateTime';
import { CalendarMonthOptions, DateResolvable, Unit } from './types';
import { normalizeUnit } from './units';

/**
 * An immutable range between two {@link DateTime} instances.
 *
 * An `Interval` always has a concrete start and end.
 *
 * @example
 *
 * import { Interval, DateTime } from '@bedrockio/chrono';
 *
 * const year = Interval.getYear('2026-04-07');
 * year.contains(new DateTime('2026-12-31')); // true
 * year.days();                               // 365
 */
export default class Interval {
  // Static factories

  /**
   * Returns an interval spanning the year of the input date.
   *
   * @example
   *
   * Interval.getYear('2026-04-07'); // 2026-01-01 → 2026-12-31
   */
  static getYear(date?: DateResolvable) {
    return new Interval(
      new DateTime(date).startOfYear(),
      new DateTime(date).endOfYear(),
    );
  }

  /**
   * Returns an interval spanning the full calendar month containing
   * the input date — the first day of the week at the start of the
   * month through the last day of the week at the end. Useful for
   * rendering month grids in calendar UIs.
   *
   * @example
   *
   * Interval.getCalendarMonth('2026-04-07'); // 2026-03-29 → 2026-05-02
   */
  static getCalendarMonth(
    date?: DateResolvable,
    options?: CalendarMonthOptions,
  ) {
    const { normalize, ...dateOptions } = options || {};

    let interval = new Interval(
      new DateTime(date, dateOptions).startOfCalendarMonth(),
      new DateTime(date, dateOptions).endOfCalendarMonth(),
    );

    if (normalize) {
      const weeks = Math.round(interval.duration('weeks'));
      if (weeks < 6) {
        const offset = 6 - weeks;
        interval = new Interval(
          interval.start,
          interval.end.advance(offset, 'weeks'),
        );
      }
    }

    return interval;
  }

  /**
   * Returns an interval spanning the month of the input date.
   *
   * @example
   *
   * Interval.getMonth('2026-04-07'); // 2026-04-01 → 2026-04-30
   */
  static getMonth(date: DateResolvable) {
    return new Interval(
      new DateTime(date).startOfMonth(),
      new DateTime(date).endOfMonth(),
    );
  }

  /**
   * Returns an interval spanning the week of the input date.
   *
   * @example
   *
   * Interval.getWeek('2026-04-07'); // 2026-04-05 → 2026-04-11
   */
  static getWeek(date: DateResolvable) {
    return new Interval(
      new DateTime(date).startOfWeek(),
      new DateTime(date).endOfWeek(),
    );
  }

  /**
   * Returns an interval spanning the full day of the input date.
   *
   * @example
   *
   * Interval.getDay('2026-04-07'); // 2026-04-07 00:00 → 23:59:59.999
   */
  static getDay(date: DateResolvable) {
    return new Interval(
      new DateTime(date).startOfDay(),
      new DateTime(date).endOfDay(),
    );
  }

  start: DateTime;
  end: DateTime;

  // Constructor

  /**
   * Creates an interval from an
   * [ISO-8601 time interval string](https://en.wikipedia.org/wiki/ISO_8601#Time_intervals).
   *
   * @example
   *
   * new Interval('2023-01-01/2023-01-02');
   */
  constructor(input: string);

  /**
   * Creates a copy of an existing interval.
   *
   * @example
   *
   * new Interval(otherInterval);
   */
  constructor(input: Interval);

  /**
   * Creates an interval from a discrete start and end. Each argument
   * accepts any value the {@link DateTime} constructor accepts.
   *
   * @example
   *
   * new Interval(new DateTime('2023-01-01'), new DateTime('2023-01-02'));
   * new Interval('2023-01-01', '2023-01-02');
   */
  constructor(start: DateResolvable, end: DateResolvable);

  constructor(...args: any[]) {
    let start;
    let end;

    if (args.length === 1) {
      const arg = args[0];
      if (arg instanceof Interval) {
        start = arg.start;
        end = arg.end;
      } else if (isIsoInterval(arg)) {
        [start, end] = arg.split('/');
      } else {
        throw new Error('Single argument must be an Interval or a string.');
      }
    } else if (args.length === 2) {
      start = args[0];
      end = args[1];
    } else {
      throw new Error('Requires 1-2 arguments.');
    }

    start = new DateTime(start);
    end = new DateTime(end);

    if (start.isInvalid() || end.isInvalid()) {
      throw new Error('Invalid dates for interval.');
    } else if (start > end) {
      throw new Error('Interval start cannot be after the end.');
    }

    this.start = start;
    this.end = end;
  }

  /**
   * Returns a copy of the interval.
   */
  clone() {
    return new Interval(this.start, this.end);
  }

  /**
   * Returns the interval as a human readable string.
   */
  toString() {
    return `${this.start.toString()} - ${this.end.toString()}`;
  }

  /**
   * Returns the interval in ISO-8601 format.
   * https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   */
  toISOString() {
    return `${this.start.toISOString()}/${this.end.toISOString()}`;
  }

  /**
   * Returns an object that can be passed into a query.
   * Most notably for use with range-based search in
   * [@bedrockio/model](https://github.com/bedrockio/model/blob/master/README.md#range-based-search).
   */
  toQuery() {
    return {
      gte: this.start.toISOString(),
      lte: this.end.toISOString(),
    };
  }

  /**
   * Returns true if the interval overlaps the passed argument.
   */
  overlaps(arg: Interval | DateResolvable) {
    if (arg instanceof Interval) {
      return arg.end > this.start && arg.start < this.end;
    } else if (arg) {
      const date = new DateTime(arg);
      return date > this.start && date < this.end;
    } else {
      return false;
    }
  }

  /**
   * Returns true if the argument passed is contained by the interval.
   */
  contains(arg: Interval | DateResolvable) {
    if (arg instanceof Interval) {
      return arg.start >= this.start && arg.end <= this.end;
    } else if (arg) {
      const date = new DateTime(arg);
      return date >= this.start && date <= this.end;
    } else {
      return false;
    }
  }

  /**
   * Returns the union of this interval and the specified interval.
   */
  union(interval: Interval) {
    return new Interval(
      Math.min(this.start.getTime(), interval.start.getTime()),
      Math.max(this.end.getTime(), interval.end.getTime()),
    );
  }

  /**
   * Returns the intersection of this interval and the specified interval.
   * Returns null if intervals don't intersect.
   */
  intersection(interval: Interval) {
    const start = Math.max(this.start.getTime(), interval.start.getTime());
    const end = Math.min(this.end.getTime(), interval.end.getTime());

    if (start > end) {
      return null;
    }

    return new Interval(start, end);
  }

  /**
   * Gets the duration of the interval. If a unit is specified, will return
   * the duration in that unit, otherwise returns milliseconds. Note that
   * "months" is a special unit with no defined duration so the result will
   * be computed by walking the months in the interval, otherwise the duration
   * will be computed numerically.
   */
  duration(unit?: Unit): number {
    if (unit) {
      return getDurationByUnit(this, unit);
    } else {
      return this.end.getTime() - this.start.getTime();
    }
  }

  /**
   * Gets the duration of the interval in years.
   */
  years() {
    return this.duration('years');
  }

  /**
   * Gets the duration of the interval in months.
   */
  months() {
    return this.duration('months');
  }

  /**
   * Gets the duration of the interval in weeks.
   */
  weeks() {
    return this.duration('weeks');
  }

  /**
   * Gets the duration of the interval in days.
   */
  days() {
    return this.duration('days');
  }

  /**
   * Gets the duration of the interval in hours.
   */
  hours() {
    return this.duration('hours');
  }

  /**
   * Gets the duration of the interval in minutes.
   */
  minutes() {
    return this.duration('minutes');
  }

  /**
   * Gets the duration of the interval in seconds.
   */
  seconds() {
    return this.duration('seconds');
  }

  /**
   * Splits this interval using the passed argument as a cut and
   * returns the resulting intervals.
   *
   * A date-like cut produces two intervals — the parts before and
   * after the cut. A cut that falls outside this interval is a no-op
   * and returns a single-element array equal to this interval.
   *
   * An interval cut removes the overlap from this interval. If the
   * cut interval lies fully inside, the result is the parts before
   * and after it. If the cut interval overlaps a single edge, the
   * result is the trimmed remainder as a single element.
   *
   * @example
   *
   * year.split(july);     // [Jan–July, July–Dec]
   * year.split(jan2024);  // [Jan–Dec] (cut is outside, no-op)
   */
  split(arg: Interval | DateResolvable) {
    let interval;
    if (arg instanceof Interval) {
      interval = arg;
    } else {
      const date = new DateTime(arg);
      interval = new Interval(date, date);
    }

    if (interval.start < this.start) {
      return [
        new Interval(
          Math.max(this.start.getTime(), interval.end.getTime()),
          this.end,
        ),
      ];
    } else if (interval.end > this.end) {
      return [
        new Interval(
          this.start,
          Math.min(this.end.getTime(), interval.start.getTime()),
        ),
      ];
    } else {
      return [
        new Interval(this.start, interval.start),
        new Interval(interval.end, this.end),
      ];
    }
  }

  /**
   * Divides the interval into equal parts.
   */
  divide(parts: number) {
    const result = [];
    const duration = Math.round(this.duration() / parts);
    let time = this.start.getTime();
    for (let i = 0; i < parts; i++) {
      const next = time + duration;
      result.push(new Interval(time, next));
      time = next;
    }
    return result;
  }

  /**
   * Returns true if the two intervals have the same start and end.
   */
  isEqual(interval: Interval) {
    if (interval instanceof Interval) {
      return (
        this.start.isEqual(interval.start) && this.end.isEqual(interval.end)
      );
    } else {
      return false;
    }
  }

  /**
   * Returns an array of intervals representing the years contained
   * within the interval.
   */
  getYears() {
    return this.getUnits('year');
  }

  /**
   * Returns an array of intervals representing the months contained
   * within the interval.
   */
  getMonths() {
    return this.getUnits('month');
  }

  /**
   * Returns an array of intervals representing the weeks contained
   * within the interval.
   */
  getWeeks() {
    return this.getUnits('week');
  }

  /**
   * Returns an array of intervals representing the days contained
   * within the interval.
   */
  getDays() {
    return this.getUnits('day');
  }

  /**
   * Returns an array of intervals representing the hours contained
   * within the interval.
   */
  getHours() {
    return this.getUnits('hour');
  }

  /**
   * Returns an array of intervals representing the minutes contained
   * within the interval.
   */
  getMinutes() {
    return this.getUnits('minute');
  }

  /**
   * Returns an array of intervals representing the seconds contained
   * within the interval.
   */
  getSeconds() {
    return this.getUnits('second');
  }

  /**
   * Returns an array of intervals representing the specified units
   * contained within this interval. Each returned interval is aligned
   * to its unit boundaries — for example `getUnits('day')` on a
   * 9am–11am slice will return a single interval spanning the full
   * day, not the 2-hour slice.
   */
  getUnits(unit: Unit) {
    unit = normalizeUnit(unit);

    let last!: Interval;
    let result: Interval[] = [];

    walkUnits(this, unit, (current) => {
      const interval = new Interval(current.startOf(unit), current.endOf(unit));
      result.push(interval);
      last = interval;
    });

    if (last?.end < this.end) {
      const dt = last.start.advance(1, unit);
      result.push(new Interval(dt.startOf(unit), dt.endOf(unit)));
    }

    return result;
  }
}

function getDurationByUnit(interval: Interval, unit: Unit) {
  unit = normalizeUnit(unit);

  const unitInterval = new Interval(
    interval.start,
    interval.start.advance(1, unit),
  );

  if (unit === 'month' && interval.contains(unitInterval)) {
    // For example 1 year in months
    return getDurationByWalkingUnits(interval, unit);
  } else {
    // For example 1 month in years.
    return interval.duration() / unitInterval.duration();
  }
}

function getDurationByWalkingUnits(interval: Interval, unit: Unit) {
  let result = 0;
  walkUnits(interval, unit, () => {
    result += 1;
  });
  return result;
}

function walkUnits(
  interval: Interval,
  unit: Unit,
  fn: (current: DateTime) => void,
) {
  const { start, end } = interval;

  let current = start;
  while (current < end) {
    fn(current);
    current = current.advance(1, unit);
  }
}

function isIsoInterval(arg: any) {
  return typeof arg === 'string' && arg.includes('/');
}
