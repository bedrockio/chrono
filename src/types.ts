import type DateTime from './DateTime';
import type Time from './Time';

export type DateParams = Partial<Record<Unit, number>>;
export type AdvanceBy = number | DateParams;

export type Unit =
  | 'year'
  | 'years'
  | 'month'
  | 'months'
  | 'week'
  | 'weeks'
  | 'day'
  | 'days'
  | 'hour'
  | 'hours'
  | 'minute'
  | 'minutes'
  | 'second'
  | 'seconds'
  | 'millisecond'
  | 'milliseconds';

export type SingularUnit =
  | 'year'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond';

export type TimePrecision =
  | 'minute'
  | 'minutes'
  | 'second'
  | 'seconds'
  | 'millisecond'
  | 'milliseconds';

export type DateLike = DateTime | Date;
export type DateResolvable = DateTime | Date | number | string | undefined;
export type TimeResolvable =
  | DateTime
  | Date
  | Time
  | number
  | string
  | undefined;

export type EnumeratedArgs = [
  number,
  number?,
  number?,
  number?,
  number?,
  number?,
  number?,
];

export interface GlobalDateTimeOptions {
  /**
   * BCP-47 locale tag (e.g. `"en-US"`, `"ja-JP"`) used as the default locale
   * for all DateTime instances. Pass `null` to clear and fall back to the
   * system locale.
   */
  locale?: string | null;
  /**
   * IANA timezone identifier (e.g. `"America/New_York"`, `"UTC"`) used as the
   * default timezone for all DateTime instances. Pass `null` to clear and
   * fall back to the system timezone.
   */
  timeZone?: string | null;
  /**
   * Day to treat as the first day of the week, where `0` is Sunday and `6`
   * is Saturday. Used by `startOf('week')`, calendar generation, etc.
   * Defaults to the locale's convention.
   */
  firstDayOfWeek?: number;
}

export interface DateTimeOptions {
  /**
   * BCP-47 locale tag (e.g. `"en-US"`). Overrides the global locale for
   * this instance only. Defaults to the global locale, then the system locale.
   */
  locale?: string;
  /**
   * IANA timezone identifier (e.g. `"America/New_York"`). Overrides the
   * global timezone for this instance only. Defaults to the global timezone,
   * then the system timezone.
   */
  timeZone?: string;
  /**
   * Day to treat as the first day of the week, where `0` is Sunday and `6`
   * is Saturday. Defaults to the locale's convention.
   */
  firstDayOfWeek?: number;
}

export interface CalendarMonthOptions extends DateTimeOptions {
  /** Normalizes output to always have 6 weeks. */
  normalize?: boolean;
}

export interface RelativeOptions extends DateTimeOptions {
  /** Offset to format relative to. Defaults to the current time. */
  now?: DateResolvable;
  /**
   * Lower bound for relative formatting. DateTimes earlier than this
   * fall back to an absolute format instead of a relative phrase.
   */
  min?: DateResolvable;
  /**
   * Upper bound for relative formatting. DateTimes later than this
   * fall back to an absolute format instead of a relative phrase.
   */
  max?: DateResolvable;
  /** Passed to Intl.RelativeTimeFormat. Defaults to `auto` but may also be `always`. */
  numeric?: 'auto' | 'always';
}

export type TimeZoneName =
  | 'short'
  | 'long'
  | 'shortOffset'
  | 'longOffset'
  | 'shortGeneric'
  | 'longGeneric';

export type MonthName =
  | 'numeric'
  | '2-digit'
  | 'long'
  | 'short'
  | 'compact'
  | 'narrow';

export type WeekdayName = 'long' | 'short' | 'compact' | 'narrow';

export interface IntlOptions
  extends Omit<Intl.DateTimeFormatOptions, 'weekday' | 'month'> {
  locale?: string;
  timeZone?: string;
  weekday?: WeekdayName;
  month?: MonthName;
}

export type FormatOptions = Intl.DateTimeFormatOptions & {
  /**
   * BCP-47 locale tag used for formatting. Defaults to the DateTime's
   * locale, then the global locale, then the system locale.
   */
  locale?: string;
  /**
   * Controls how AM/PM is rendered. These are extra options that fill gaps
   * in `Intl.DateTimeFormat`, which has limited AM/PM styling for English.
   * Examples below show the result for 9 in the morning:
   *
   * - `"short"`  — `9a`
   * - `"caps"`   — `9AM`
   * - `"space"`  — `9 am`
   * - `"period"` — `9 a.m.`
   */
  meridiem?: 'short' | 'period' | 'caps' | 'space';
};

export interface MonthOptions {
  /** If not passed will use the global locale or fall back to the system locale. */
  locale?: string;
  /** Passed as `month` to Intl.DateTimeFormat. Default `long`. */
  style?: 'long' | 'short' | 'narrow';
}

export interface WeekdayOptions {
  /** If not passed will use the global locale or fall back to the system locale. */
  locale?: string;
  /** An explicit start day of the week, 0 for sunday, 6 for Saturday. Will fall back to the locale defined first day. */
  start?: number;
  /** Will be passed as `weekday` to Intl.DateTimeFormat. Default `long`. */
  style?: 'long' | 'short' | 'compact' | 'narrow';
}

export interface MeridiemOptions {
  /** If not passed will use the global locale or fall back to the system locale. */
  locale?: string;
  /** Return the tokens in lower case. */
  lower?: boolean;
  /** When "short" will return a/p for am/pm tokens only. */
  style?: 'long' | 'short' | 'compact' | 'narrow';
  /** Timezone. */
  timeZone?: string;
}

// Time

export type TimeUnit =
  | 'hour'
  | 'hours'
  | 'minute'
  | 'minutes'
  | 'second'
  | 'seconds'
  | 'millisecond'
  | 'milliseconds';

export type SingularTimeUnit = 'hour' | 'minute' | 'second' | 'millisecond';

export type TimeFields = Partial<Record<TimeUnit, number>>;

export type { DateTime };
