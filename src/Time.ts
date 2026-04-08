import DateTime from './DateTime';
import { TIME_LONG, TIME_MEDIUM, TIME_SHORT, formatWithLocale } from './locale';
import { parseTime } from './parse';
import { TIME_SYMBOL } from './symbols';
import { formatWithTokens } from './tokens';

import {
  FormatOptions,
  SingularTimeUnit,
  TimeParams,
  TimeResolvable,
  TimeUnit,
} from './types';

import { getUnitIndex, normalizeUnit } from './units';

const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;
const ONE_SECOND = 1000;

/**
 * A generic time of day with hours, minutes, seconds, and milliseconds.
 *
 * Unlike {@link DateTime}, a `Time` is not anchored to a specific
 * calendar date or timezone — it represents a time in the abstract.
 * There are no DST considerations and no 23- or 25-hour days.
 *
 * Values greater than 24 hours are allowed and preserved as-is, not
 * wrapped. This lets a `Time` represent times that spill past midnight
 * in contexts like broadcast schedules or late-night programming
 * (e.g. `25:30` to mean "1:30am the following day").
 *
 * @example
 *
 * new Time('9:45pm');
 * new Time(9, 45);
 * new Time(25, 30); // Allowed; not normalized to 01:30
 */
export default class Time {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;

  /**
   * Creates a Time representing the current time of day.
   *
   * @example
   *
   * new Time();
   */
  constructor();

  /**
   * Creates a Time by parsing a string. Accepts 24-hour and 12-hour
   * (`am`/`pm`) formats. Hours greater than 24 are allowed.
   *
   * @example
   *
   * new Time('9:45pm');
   * new Time('25:30');
   */
  constructor(input: string);

  /**
   * Creates a Time from a duration in milliseconds. Values greater
   * than 24 hours are preserved, not wrapped.
   *
   * @example
   *
   * new Time(78300000); // 21:45:00.000
   */
  constructor(input: number);

  /**
   * Creates a Time from the time-of-day components of a `Date`,
   * `DateTime`, or another `Time`. When passed another `Time` this
   * acts as a copy constructor.
   *
   * @example
   *
   * new Time(date);
   * new Time(dt);
   * new Time(existingTime);
   */
  constructor(input: TimeResolvable);

  /**
   * Creates a Time from individual components. Must include at least
   * hours and minutes. Values greater than 24 hours are allowed.
   *
   * @example
   *
   * new Time(12, 30);
   * new Time(25, 30, 0);
   */
  constructor(
    hours: number,
    minutes: number,
    seconds?: number,
    milliseconds?: number,
  );

  constructor(...args: any[]) {
    if (args.length > 1) {
      this.hours = args[0];
      this.minutes = args[1];
      this.seconds = args[2] ?? 0;
      this.milliseconds = args[3] ?? 0;
    } else if (typeof args[0] === 'string') {
      try {
        const parsed = parseTime(args[0]);
        this.hours = parsed.params.hour;
        this.minutes = parsed.params.minute;
        this.seconds = parsed.params.second;
        this.milliseconds = parsed.params.millisecond;
      } catch {
        this.hours = NaN;
        this.minutes = NaN;
        this.seconds = NaN;
        this.milliseconds = NaN;
      }
    } else if (typeof args[0] === 'number') {
      const num = args[0];
      this.hours = Math.floor(num / ONE_HOUR);
      this.minutes = Math.floor(num / ONE_MINUTE) % 60;
      this.seconds = Math.floor(num / ONE_SECOND) % 60;
      this.milliseconds = num % 1000;
    } else if (args[0] instanceof Time) {
      const time = args[0];
      this.hours = time.hours;
      this.minutes = time.minutes;
      this.seconds = time.seconds;
      this.milliseconds = time.milliseconds;
    } else {
      const dt = new DateTime(args[0]);
      this.hours = dt.getHours();
      this.minutes = dt.getMinutes();
      this.seconds = dt.getSeconds();
      this.milliseconds = dt.getMilliseconds();
    }
  }

  /**
   * Returns the total duration of the Time as a number in milliseconds.
   */
  valueOf() {
    return (
      this.hours * ONE_HOUR +
      this.minutes * ONE_MINUTE +
      this.seconds * ONE_SECOND +
      this.milliseconds
    );
  }

  /**
   * Returns the Time in `HH:MM:SS.sss` format. Note that values
   * greater than 24 hours are emitted as-is, which is not strictly
   * ISO-8601 compliant but matches the overflow contract of the class.
   */
  toISOString() {
    const hh = pad(this.hours);
    const mm = pad(this.minutes);
    const ss = pad(this.seconds);
    const ms = pad(this.milliseconds, 3);
    return `${hh}:${mm}:${ss}.${ms}`;
  }

  // Getters

  /**
   * Returns the hours component of the Time.
   */
  getHours() {
    return this.hours;
  }

  /**
   * Returns the minutes component of the Time.
   */
  getMinutes() {
    return this.minutes;
  }

  /**
   * Returns the seconds component of the Time.
   */
  getSeconds() {
    return this.seconds;
  }

  /**
   * Returns the milliseconds component of the Time.
   */
  getMilliseconds() {
    return this.milliseconds;
  }

  // Setters

  /**
   * Returns a new Time with the hours replaced.
   */
  setHours(hours: number) {
    return new Time(hours, this.minutes, this.seconds, this.milliseconds);
  }

  /**
   * Returns a new Time with the minutes replaced.
   */
  setMinutes(minutes: number) {
    return new Time(this.hours, minutes, this.seconds, this.milliseconds);
  }

  /**
   * Returns a new Time with the seconds replaced.
   */
  setSeconds(seconds: number) {
    return new Time(this.hours, this.minutes, seconds, this.milliseconds);
  }

  /**
   * Returns a new Time with the milliseconds replaced.
   */
  setMilliseconds(milliseconds: number) {
    return new Time(this.hours, this.minutes, this.seconds, milliseconds);
  }

  /**
   * Returns a new Time with the given component fields applied.
   * Unspecified components are preserved from the original.
   *
   * @example
   *
   * time.set({ hours: 12, minutes: 30 });
   */
  set(components: TimeParams) {
    return setComponents(this, components);
  }

  // Validation & utilities

  /**
   * Returns true if the Time is invalid.
   */
  isInvalid() {
    return (
      Number.isNaN(this.hours) ||
      Number.isNaN(this.minutes) ||
      Number.isNaN(this.seconds) ||
      Number.isNaN(this.milliseconds)
    );
  }

  /**
   * Returns true if the Time is valid.
   */
  isValid() {
    return !this.isInvalid();
  }

  /**
   * Returns a clone of the Time.
   */
  clone() {
    return new Time(this.hours, this.minutes, this.seconds, this.milliseconds);
  }

  /**
   * Returns true if the Time is equivalent to the passed value.
   */
  isEqual(arg: TimeResolvable) {
    return this.valueOf() === new Time(arg).valueOf();
  }

  // Edges

  /**
   * Rewinds the Time to the start of the specified unit.
   *
   * @example
   *
   * time.startOf('hour'); // Resets minutes/seconds/milliseconds.
   */
  startOf(unit: SingularTimeUnit) {
    return startOf(this, unit);
  }

  /**
   * Advances the Time to the end of the specified unit.
   *
   * @example
   *
   * time.endOf('hour'); // Last minute/second/millisecond
   */
  endOf(unit: SingularTimeUnit) {
    return endOf(this, unit);
  }

  // Advancing

  /**
   * Advances the Time by a number of units.
   *
   * @example
   * new Time().advance(6, 'hours')
   */
  advance(by: number, unit: TimeUnit): Time;

  /**
   * Advances the Time by multiple units at once.
   *
   * @example
   *
   * new Time().advance({
   *   hours: 6,
   *   minutes: 15
   * })
   */
  advance(by: TimeParams): Time;
  advance(by: AdvanceBy, unit?: TimeUnit): Time {
    return advanceTime(this, 1, by, unit);
  }

  /**
   * Rewinds the Time by a number of units.
   *
   * @example
   *
   * new Time().rewind(6, 'hours')
   */
  rewind(by: number, unit: TimeUnit): Time;
  /**
   * Rewinds the DateTime by multiple units at once.
   *
   * @example
   *
   * new Time().rewind({
   *   hours: 6,
   *   minutes: 15
   * })
   */
  rewind(by: TimeParams): Time;
  rewind(by: AdvanceBy, unit?: TimeUnit): Time {
    return advanceTime(this, -1, by, unit);
  }

  // Time of day

  /**
   * Returns true if the Time falls between 00:00 and 05:59. Overflow
   * values (greater than 24 hours) are reduced modulo 24 before
   * checking, so `25:00` is treated as `01:00` and counts as night.
   *
   * @example
   *
   * new Time('3:00').isNight();  // true
   * new Time('25:00').isNight(); // true
   */
  isNight() {
    return isInBounds(this, 0, 6);
  }

  /**
   * Returns true if the Time falls between 06:00 and 11:59.
   *
   * @example
   *
   * new Time('9:00').isMorning(); // true
   */
  isMorning() {
    return isInBounds(this, 6, 12);
  }

  /**
   * Returns true if the Time falls between 12:00 and 17:59.
   *
   * @example
   *
   * new Time('15:00').isAfternoon(); // true
   */
  isAfternoon() {
    return isInBounds(this, 12, 18);
  }

  /**
   * Returns true if the Time falls between 18:00 and 23:59.
   *
   * @example
   *
   * new Time('21:00').isEvening(); // true
   */
  isEvening() {
    return isInBounds(this, 18, 24);
  }

  // Formatting

  /**
   * Formats the Time using the standard locale-based format.
   *
   * @example
   *
   * time.format(); // "9:00am"
   */
  format(): string;

  /**
   * Formats the Time using locale options, mirroring
   * [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options).
   *
   * @example
   *
   * time.format({ hour: 'numeric', minute: '2-digit' }); // "9:00"
   */
  format(format: FormatOptions): string;

  /**
   * Formats the Time using a token string. Tokens are substituted
   * with the time components; any other characters are passed through
   * unchanged. Wrap a substring in single or double quotes to escape
   * it from token replacement.
   *
   * Only time-related tokens are meaningful here. Date and timezone
   * tokens (`yyyy`, `MM`, `Z`, etc.) are technically accepted but will
   * silently emit today's date or the system timezone, which is almost
   * never what you want.
   *
   * @example
   *
   * time.format('hh:mm a'); // 09:30 am
   *
   * ### Token reference
   *
   * | Token | Example | Description                       |
   * | ----- | ------- | --------------------------------- |
   * | `h`   | `9`     | Hour (12-hour clock), no padding  |
   * | `hh`  | `09`    | Hour (12-hour clock), zero-padded |
   * | `H`   | `9`     | Hour (24-hour clock), no padding  |
   * | `HH`  | `09`    | Hour (24-hour clock), zero-padded |
   * | `m`   | `5`     | Minute, no padding                |
   * | `mm`  | `05`    | Minute, zero-padded               |
   * | `s`   | `8`     | Second, no padding                |
   * | `ss`  | `08`    | Second, zero-padded               |
   * | `a`   | `am`    | Meridiem, lower case              |
   * | `A`   | `AM`    | Meridiem, upper case              |
   *
   * For finer-grained control over output (e.g. AM/PM rendering style),
   * see the {@link FormatOptions} overload.
   */
  format(format: string): string;

  format(format?: string | FormatOptions): string {
    if (typeof format === 'string') {
      return formatWithTokens(this.toDate(), format);
    } else {
      format ||= TIME_MEDIUM as FormatOptions;
      return formatWithLocale(this.toDate(), format);
    }
  }

  /**
   * Formats the Time in long style.
   *
   * @example
   *
   * time.toLong(); // "9:00:00am"
   */
  toLong(extra?: FormatOptions) {
    return this.format({
      ...TIME_LONG,
      ...extra,
    });
  }

  /**
   * Formats the Time in medium style.
   *
   * @example
   *
   * time.toMedium(); // "9:00am"
   */
  toMedium(extra?: FormatOptions) {
    return this.format({
      ...TIME_MEDIUM,
      ...extra,
    });
  }

  /**
   * Formats the Time in short style.
   *
   * @example
   *
   * time.toShort(); // "9am"
   */
  toShort(extra?: FormatOptions) {
    return this.format({
      ...TIME_SHORT,
      ...extra,
    });
  }

  // Conversion

  /**
   * Returns a native `Date` with this Time's components attached to
   * **today's date** in the system timezone. Primarily for interop
   * with code that needs a `Date` instance.
   *
   * Note that the date portion is always today — there is no way to
   * combine a Time with a specific date through this method. If that's
   * what you need, construct a `DateTime` directly.
   */
  toDate() {
    const date = new Date();
    date.setHours(this.getHours());
    date.setMinutes(this.getMinutes());
    date.setSeconds(this.getSeconds());
    date.setMilliseconds(this.getMilliseconds());
    return date;
  }

  // Private

  [TIME_SYMBOL] = true;

  // Uses a global Symbol.for key so that instanceof works across
  // different installations or bundled copies of chrono — the usual
  // prototype-chain check fails in those cases.
  static [Symbol.hasInstance](obj: any) {
    return obj?.[TIME_SYMBOL];
  }

  [Symbol.toPrimitive](hint: 'number'): number;
  [Symbol.toPrimitive](hint: 'string' | 'default'): string;
  [Symbol.toPrimitive](hint: string): number | string {
    return hint === 'number' ? this.valueOf() : this.toISOString();
  }
}

function pad(num: number, place: number = 2) {
  return num.toString().padStart(place, '0');
}

function setComponents(time: Time, components: TimeParams) {
  const names = Object.keys(components) as TimeUnit[];

  names.sort((a, b) => {
    return getUnitIndex(a) - getUnitIndex(b);
  });

  for (let name of names) {
    const value = components[name] as number;

    name = normalizeUnit(name) as SingularTimeUnit;
    time = setComponent(time, name, value);
  }

  return time;
}

function setComponent(time: Time, name: SingularTimeUnit, value: number): Time {
  switch (name) {
    case 'hour':
      return time.setHours(value);
    case 'minute':
      return time.setMinutes(value);
    case 'second':
      return time.setSeconds(value);
    case 'millisecond':
      return time.setMilliseconds(value);
  }
}

function startOf(time: Time, unit: SingularTimeUnit) {
  switch (unit) {
    case 'hour':
      return time.set({
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      });
    case 'minute':
      return time.set({
        seconds: 0,
        milliseconds: 0,
      });
    case 'second':
      return time.set({
        milliseconds: 0,
      });
    default:
      return time;
  }
}

function endOf(time: Time, unit: SingularTimeUnit) {
  switch (unit) {
    case 'hour':
      return time.set({
        minutes: 59,
        seconds: 59,
        milliseconds: 999,
      });
    case 'minute':
      return time.set({
        seconds: 59,
        milliseconds: 999,
      });
    case 'second':
      return time.set({
        milliseconds: 999,
      });
    default:
      return time;
  }
}

type AdvanceBy = number | TimeParams;

function advanceTime(time: Time, dir: number, by: AdvanceBy, unit?: TimeUnit) {
  if (typeof by === 'number' && typeof unit === 'string') {
    return advanceTime(time, dir, {
      [unit]: by,
    });
  }

  const entries = Object.entries(by) as [TimeUnit, number][];

  for (let [name, value] of entries) {
    value *= dir;

    name = normalizeUnit(name) as SingularTimeUnit;

    switch (name) {
      case 'hour':
        time = time.setHours(time.getHours() + value);
        break;
      case 'minute':
        time = time.setMinutes(time.getMinutes() + value);
        break;
      case 'second':
        time = time.setSeconds(time.getSeconds() + value);
        break;
      case 'millisecond':
        time = time.setMilliseconds(time.getMilliseconds() + value);
        break;
    }
  }

  return time;
}

// Time of day

function isInBounds(time: Time, minHours: number, maxHours: number) {
  const abs = time.valueOf() % ONE_DAY;

  const min = minHours * ONE_HOUR;
  const max = maxHours * ONE_HOUR;

  return abs >= min && abs < max;
}
