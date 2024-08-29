import DateTime from './DateTime';

export default class Interval {
  static getCalendarMonth(date) {
    return new Interval(
      new DateTime(date).startOfCalendarMonth(),
      new DateTime(date).endOfCalendarMonth()
    );
  }

  static getMonth(date) {
    return new Interval(
      new DateTime(date).startOfMonth(),
      new DateTime(date).endOfMonth()
    );
  }

  static getWeek(date) {
    return new Interval(
      new DateTime(date).startOfWeek(),
      new DateTime(date).endOfWeek()
    );
  }

  static getDay(date) {
    return new Interval(
      new DateTime(date).startOfDay(),
      new DateTime(date).endOfDay()
    );
  }

  constructor(start, end) {
    this.start = new DateTime(start);
    this.end = new DateTime(end);
    if (this.start.isInvalid() || this.end.isInvalid()) {
      throw new Error('Invalid dates for interval.');
    } else if (start >= end) {
      throw new Error('Interval start cannot be after the end.');
    }
  }

  clone() {
    return new Interval(this.start, this.end);
  }

  toString() {
    return `${this.start} - ${this.end}`;
  }

  toISOString() {
    return `${this.start.toISOString()} - ${this.end.toISOString()}`;
  }

  overlaps(arg) {
    if (arg instanceof Interval) {
      return arg.end > this.start && arg.start < this.end;
    } else {
      return arg > this.start && arg < this.end;
    }
  }

  contains(arg) {
    if (arg instanceof Interval) {
      return arg.start >= this.start && arg.end <= this.end;
    } else {
      const date = new DateTime(arg);
      return date >= this.start && date <= this.end;
    }
  }

  union(interval) {
    return new Interval(
      // @ts-ignore
      Math.min(this.start, interval.start),
      // @ts-ignore
      Math.max(this.end, interval.end)
    );
  }

  intersection(interval) {
    return new Interval(
      // @ts-ignore
      Math.max(this.start, interval.start),
      // @ts-ignore
      Math.min(this.end, interval.end)
    );
  }

  duration() {
    // @ts-ignore
    return this.end - this.start;
  }

  getYears() {
    return this.getUnits('year');
  }

  getMonths() {
    return this.getUnits('month');
  }

  getWeeks() {
    return this.getUnits('week');
  }

  getDays() {
    return this.getUnits('day');
  }

  getHours() {
    return this.getUnits('hour');
  }

  getMinutes() {
    return this.getUnits('minute');
  }

  getSeconds() {
    return this.getUnits('second');
  }

  getUnits(unit) {
    const result = [];
    let current = this.start;
    while (current < this.end) {
      result.push(new Interval(current.startOf(unit), current.endOf(unit)));
      current = current.advance(1, unit);
    }
    return result;
  }
}
