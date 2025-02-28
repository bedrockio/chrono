# Chrono

Chrono is a minimal library to simplify working with dates in Javascript. It has
built-in locale and timezone support.

Concepts

- [Installation](#installation)
- [DateTime](#datetime)
- [Interval](#interval)

## Installation

```shell
yarn install @bedrockio/chrono
```

## DateTime

The `DateTime` object maintains basic parity with the built-in `Date` object,
however is immutable and has a number of additional methods:

```js
import { DateTime } from '@bedrockio/chrono';

const now = new DateTime();

// Unlike JS dates, the "set" methods return
// a new instance and do not mutate the date.
const january = now.setMonth(0);
```

Timezones and locales can be set on each instance or globally:

```js
// Sets the timezone for this DateTime
const dt = new DateTime({
  timeZone: 'America/New_York',
  locale: 'en-US',
});

DateTime.setTimeZone('America/New_York');
DateTime.setLocale('en-US');
```

### Date Formatting

The `format` method accepts two styles of input.

#### Locale Formatting

Passing an object will use `Intl.DateTimeFormat` and format a human readable
string in a specific locale. It may be a custom object or defined presets. The
locale used in order will be:

- Passed in the options to `format`
- The internal locale of the `DateTime`
- The globally set locale
- The system locale

```js
const dt = new DateTime('2020-01-01T00:00:00.000Z');

// December 31, 2019 at 7:00pm
dt.format(DateTime.DATETIME_MED);

// January 1, 2020
dt.format({
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
```

Supported presets are:

| Preset               | Example                           |
| -------------------- | --------------------------------- |
| DATE_MED             | January 1, 2020                   |
| DATE_SHORT           | Jan 1, 2020                       |
| DATE_NARROW          | 1/1/2020                          |
| DATE_MED_WEEKDAY     | Wednesday, January 1, 2020        |
| TIME_MED             | 9:00am                            |
| TIME_SHORT           | 9:00a                             |
| TIME_HOUR            | 9pm                               |
| TIME_SHORT_HOUR      | 9p                                |
| TIME_WITH_ZONE       | 9:00am Japan Standard Time        |
| DATETIME_MED         | January 1, 2020 9:00pm            |
| DATETIME_SHORT       | Jan 1, 2020 9:00pm                |
| DATETIME_NARROW      | 1/1/2020 9:00pm                   |
| DATETIME_MED_WEEKDAY | Wednesday, January 1, 2020 9:00pm |
| MONTH_YEAR           | January 2020                      |
| MONTH_YEAR_SHORT     | Jan 2020                          |

#### Token Formatting

Passing a string will format the date using tokens and ignoring locales.

```js
const dt = new DateTime('2020-01-01T00:00:00.000Z');

// 5:05 am
dt.format('h:mm a');

// 1/1/2020
dt.format('M/d/yyyy');
```

Supported tokens are:

| Token | Description                                  |
| ----- | -------------------------------------------- |
| yy    | two-digit year                               |
| yyyy  | four to six digit year                       |
| M     | unpadded month                               |
| MM    | padded month                                 |
| d     | unpadded day of the month                    |
| dd    | padded day of the month                      |
| h     | unpadded hour in 12-hour time                |
| hh    | padded hour in 12-hour time                  |
| H     | unpadded hour in 24-hour time                |
| HH    | padded hour in 24-hour time                  |
| m     | unpadded minute                              |
| mm    | padded minute                                |
| s     | unpadded second                              |
| ss    | padded second                                |
| a     | lowercase meridiem (am/pm)                   |
| A     | uppercase meridiem (AM/PM)                   |
| Z     | narrow timezone offset (`+5`)                |
| ZZ    | short timezone offset (`+5000`)              |
| ZZZ   | long timezone offset (`+5:00`)               |
| ZZZZ  | short timezone name (`EST`)                  |
| ZZZZZ | long timezone name (`Eastern Standard Time`) |

## Interval

The `Interval` object represents an interval of time:

```js
import { DateTime, Interval } from '@bedrockio/chrono';

const lastYear = new DateTime().rewind(1, 'year');
const nextYear = new DateTime().advance(1, 'year');

const interval = new Interval(lastYear, nextYear);

// The number of days in this interval.
const days = interval.getDays();
```

1
