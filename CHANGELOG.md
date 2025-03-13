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
