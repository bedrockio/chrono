import type DateTime from './DateTime';

export type DateFields = Partial<Record<Unit, number>>;
export type AdvanceBy = number | DateFields;

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
  /** Locale */
  locale?: string | null;
  /** Timezone */
  timeZone?: string | null;
  /** First day of the week */
  firstDayOfWeek?: number;
}

export interface DateTimeOptions {
  /** Locale */
  locale?: string;
  /** Timezone */
  timeZone?: string;
  /** First day of the week */
  firstDayOfWeek?: number;
}

export interface CalendarMonthOptions extends DateTimeOptions {
  /** Normalizes output to always have 6 weeks. */
  normalize?: boolean;
}

export interface RelativeOptions extends DateTimeOptions {
  /**  Offset to format relative to. Defaults to the current time. */
  now?: DateResolvable;
  /** When set will return undefined if the DateTime is before this date. */
  min?: DateResolvable;
  /** When set will return undefined if the DateTime is after this date. */
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
  /** Locale */
  locale?: string;
  /** Format style for AM/PM display */
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

export type { DateTime };
