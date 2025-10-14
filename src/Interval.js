import DateTime from './DateTime';
import { normalizeUnit } from './units';

/**
 * @typedef {DateTime|Date|number|string} DateLike
 */

export default class Interval {
  /**
   * Gets an interval representing the year of the
   * input.
   *
   * @param {DateLike} date
   */
  static getYear(date) {
    return new Interval(
      new DateTime(date).startOfYear(),
      new DateTime(date).endOfYear(),
    );
  }

  /**
   * Gets an interval representing the full calendar
   * month from the first day of the week at the start
   * to the last day of the week at the end.
   *
   * @param {DateLike} date
   * @param {Object} options
   * @param {string} [options.normalize] - Normalizes output to always have 6 weeks.
   * @param {string} [options.locale] - Locale to derive the start of the week.
   * @param {string} [options.timeZone] - IANA timezone to pass to the DateTime.
   * @param {number} [options.firstDayOfWeek] - Hard coded first day of the week.
   */
  static getCalendarMonth(date, options = {}) {
    const { normalize, ...dateOptions } = options;

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
   * Gets an interval representing the month of the
   * input.
   *
   * @param {DateLike} date
   */
  static getMonth(date) {
    return new Interval(
      new DateTime(date).startOfMonth(),
      new DateTime(date).endOfMonth(),
    );
  }

  /**
   * Gets an interval representing the week of the
   * input.
   *
   * @param {DateLike} date
   */
  static getWeek(date) {
    return new Interval(
      new DateTime(date).startOfWeek(),
      new DateTime(date).endOfWeek(),
    );
  }

  /**
   * Gets an interval representing the full day of
   * the input.
   *
   * @param {DateLike} date
   */
  static getDay(date) {
    return new Interval(
      new DateTime(date).startOfDay(),
      new DateTime(date).endOfDay(),
    );
  }

  /**
   * Creates an interval from various input. If two arguments are passed they
   * indicate the start and end of the interval and can be any format accepted
   * by the DateTime constructor. If a single argument is passed it must be a
   * string in [ISO-8601 format](https://en.wikipedia.org/wiki/ISO_8601#Time_intervals)
   * or another interval.
   *
   * @param {...(Interval|DateLike)} args
   *
   * @example
   * new Interval('2023-01-01/2023-01-02');
   * new Interval(new DateTime('2023-01-01'), new DateTime('2023-01-02'));
   */
  constructor(...args) {
    let start;
    let end;
    if (args.length === 1) {
      const arg = args[0];
      if (arg instanceof Interval) {
        start = arg.start;
        end = arg.end;
      } else if (isIsoInterval(arg)) {
        // @ts-ignore
        [start, end] = arg.split('/');
      } else {
        start = arg;
        end = Date.now();
      }
    } else {
      start = args[0];
      end = args[1];
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

  clone() {
    return new Interval(this.start, this.end);
  }

  /**
   * Returns the interval as a human readable string.
   */
  toString() {
    return `${this.start} - ${this.end}`;
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
   *
   * @param {Interval|DateLike} arg
   */
  overlaps(arg) {
    if (arg instanceof Interval) {
      return arg.end > this.start && arg.start < this.end;
    } else {
      const date = new DateTime(arg);
      return date > this.start && date < this.end;
    }
  }

  /**
   * Returns true if the argument passed is contained by the interval.
   *
   * @param {Interval|DateLike} arg
   */
  contains(arg) {
    if (arg instanceof Interval) {
      return arg.start >= this.start && arg.end <= this.end;
    } else {
      const date = new DateTime(arg);
      return date >= this.start && date <= this.end;
    }
  }

  /**
   * Returns the union of this interval and the specified interval.
   *
   * @param {Interval} interval
   */
  union(interval) {
    return new Interval(
      // @ts-ignore
      Math.min(this.start, interval.start),
      // @ts-ignore
      Math.max(this.end, interval.end),
    );
  }

  /**
   * Returns the intersection of this interval and the specified interval.
   * Returns null if intervals don't intersect.
   *
   * @param {Interval} interval
   */
  intersection(interval) {
    // @ts-ignore
    const start = Math.max(this.start, interval.start);
    // @ts-ignore
    const end = Math.min(this.end, interval.end);

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
   *
   * @param {("years"|"months"|"weeks"|"days"|"hours"|"minutes"|"seconds")} [unit]
   * @returns {number}
   */
  duration(unit) {
    if (unit) {
      return getDurationByUnit(this, unit);
    } else {
      // @ts-ignore
      return this.end - this.start;
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
   * Splits the interval into multiple parts by the passed argument.
   * If the passed argument is a specific date and falls outside the
   * bounds of the interval a single element will be returned which is
   * equal to the interval. If another interval is passed and overlaps
   * either end of the interval, a single element will be returned which
   * is the difference between the interval and the passed argument.
   *
   * @param {Interval|DateLike} arg
   */
  split(arg) {
    let interval;
    if (arg instanceof Interval) {
      interval = arg;
    } else {
      const date = new DateTime(arg);
      interval = new Interval(date, date);
    }

    if (interval.start < this.start) {
      // @ts-ignore
      return [new Interval(Math.max(this.start, interval.end), this.end)];
    } else if (interval.end > this.end) {
      // @ts-ignore
      return [new Interval(this.start, Math.min(this.end, interval.start))];
    } else {
      return [
        new Interval(this.start, interval.start),
        new Interval(interval.end, this.end),
      ];
    }
  }

  /**
   * Divides the interval into equal parts.
   *
   * @param {number} parts
   */
  divide(parts) {
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

  isEqual(interval) {
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
   * contained within the interval. Note that this may extend beyond
   * the boundaries of the interval.
   *
   * @param {("year"|"month"|"week"|"day"|"hour"|"minute"|"second")} unit
   */
  getUnits(unit) {
    unit = normalizeUnit(unit);

    let last;
    let result = [];

    walkUnits(this, unit, (current) => {
      const interval = new Interval(current.startOf(unit), current.endOf(unit));
      result.push(interval);
      last = interval;
    });

    // @ts-ignore
    if (last?.end < this.end) {
      // @ts-ignore
      const dt = last.start.advance(1, unit);
      result.push(new Interval(dt.startOf(unit), dt.endOf(unit)));
    }

    return result;
  }
}

function getDurationByUnit(interval, unit) {
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

function getDurationByWalkingUnits(interval, unit) {
  let result = 0;
  walkUnits(interval, unit, () => {
    result += 1;
  });
  return result;
}

function walkUnits(interval, unit, fn) {
  const { start, end } = interval;

  let current = start;
  while (current < end) {
    fn(current);
    current = current.advance(1, unit);
  }
}

function isIsoInterval(arg) {
  return typeof arg === 'string' && arg.includes('/');
}
