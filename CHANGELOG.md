## 0.9.1

- Allow unsetting time by empty string.
- Allow fractional seconds in `set`.

## 0.9.0

- Added `setTime` extension than can parse a time string.

## 0.8.0

- Aligned date formatting styles better.
- `formatDate` -> `toDateMedium`.
- `formatTime` -> `toTimeMedium`.
- `formatHours` -> `toTimeShort`.
- Removed all static `presets` and instead allow params to all methods.
- `setZone` -> `setTimeZone` with alias.
- `relative` now has intelligent fallback past bounds.
- Added `toMonthYear`.
- Added `toMonthDay`.

## 0.7.0

- Allow locales to specify first day of week.
- Moved from Jest to Vitest.

## 0.6.5

- Fixed ESM target issues in compiling.

## 0.6.4

- Fixed CJS target issues in compiling.

## 0.6.3

- Fixed DST shift issues.
- Fixed relative time truncate instead of round.
- Allow better instance of tests across frames.

## 0.6.2

- Fix for time zones not taken account in `getWeekdayName`.

## 0.6.1

- Parse ISO-8601 date only formats as either local or system time. This differs
  from the Date constructor but provides consistency.

## 0.6.0

- Single date-like in Interval constructor assumes ending now.
- Added `toQuery` method for use with `Model.search`.

## 0.5.0

- Constructor now accepts enumerated arguments.
- Don't allow odd parsing of 2001 for basic date parsing.
- Fix for CJS build issue.

## 0.4.5

- Moved to TS based build system.

## 0.4.4

- Better options handling.
- Added `DateTime.getTimeZone`.
- Added `DateTime.getLocale`.
- Added `DateTime.getOptions`.

## 0.4.3

- Moved `types` into exports.

## 0.4.2

- Added `getMonthName`.
- Added `getWeekdayName`.
- Removed checkOffsetShift helper.

## 0.4.1

- Added duration shortcuts on interval.
- DateTime constructor should clone options.
- Added `getTimeZone` and aliases for caps.

## 0.4.0

- Added custom "compact" style to `DateTime.getWeekdays`.
- Handling other DST shifts.
- Added `normalize` flag to `Interval.getCalendarMonth` to always span 6 weeks.
- Added `DateTime.clamp`.
- Handle inclusive intervals.
- Handle setting components in unintended order.
- Fixed `DateTime.getMeridiem` ordering.
- Better documentation.

## 0.3.0

- Added basic token formatting.
- Added setting datetime components.

## 0.2.1

- Added DateTime.getMonths.
- Added DateTime.getWeekdays.
- Added DateTime.getMeridiem.

## 0.2.0

- Strings in DateTime constructor that do not specify a timezone will now
  respect the local or global timezone.
- Formalized documentation.
- Added tests for Interval.
- Allowing more complex input for Interval constructor.
- Changed Interval#toISOString to actually follow ISO format.
- Allowing units in Interval#duration.
- Added Interval#split.
- Added Interval#isEqual.
- Added Interval#divide.
- Added DateTime#isEqual.
- Added DateTime#getYear.
- Added DateTime.min.
- Added DateTime.max.

## 0.1.0

- Initial release.
