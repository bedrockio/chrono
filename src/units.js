const UNITS = [
  'year',
  'month',
  'week',
  'day',
  'hour',
  'minute',
  'second',
  'millisecond',
];

export function getUnitIndex(unit) {
  unit = normalizeUnit(unit);
  return UNITS.indexOf(unit);
}

export function normalizeUnit(unit) {
  unit = unit.replace(/s$/, '');
  if (!UNITS.includes(unit)) {
    throw new Error(`Unknown unit "${unit}"`);
  }
  return unit;
}
