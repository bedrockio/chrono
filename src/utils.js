export function isInvalidDate(date) {
  return Number.isNaN(date.getTime());
}

export function daysInMonth(date) {
  return 32 - new Date(date.getFullYear(), date.getMonth(), 32).getDate();
}
