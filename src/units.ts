import { SingularUnit, Unit } from './types';

const UNITS = [
  'year',
  'month',
  'week',
  'day',
  'hour',
  'minute',
  'second',
  'millisecond',
] as const;

export function getUnitIndex(unit: Unit) {
  unit = normalizeUnit(unit);
  return UNITS.indexOf(unit);
}

export function getUnitForIndex(index: number) {
  return UNITS[index];
}

export function normalizeUnit(unit: Unit): SingularUnit {
  unit = unit.replace(/s$/, '') as SingularUnit;
  if (!UNITS.includes(unit)) {
    throw new Error(`Unknown unit "${unit}"`);
  }
  return unit;
}
