import { DateLike, DateTime } from './types';

export function isInvalidDate(date: DateLike) {
  return Number.isNaN(date.getTime());
}

export function daysInMonth(dt: DateTime) {
  return 32 - new Date(dt.getFullYear(), dt.getMonth(), 32).getDate();
}
