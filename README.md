# Chrono

Chrono is a minimal library to simplify working with dates in Javascript. It has
built-in locale and timezone support.

Concepts

- [Installation](#installation)
- [Documentation](#documentation)
- [DateTime](#datetime)
- [Interval](#interval)
- [Time](#time)

## Installation

```shell
yarn install @bedrockio/chrono
```

## Documentation

https://bedrockio.github.io/chrono/

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

For common formats there are convenience methods. For full control, the
`format` method accepts a locale options object or a token string.

#### Convenience Methods

```js
const dt = new DateTime('2020-01-01T14:00:00.000Z', {
  timeZone: 'America/New_York',
});

dt.toLong();   // "January 1, 2020 at 9:00am"
dt.toMedium(); // "Jan 1, 2020, 9:00am"
dt.toShort();  // "1/1/2020, 9:00am"

dt.toDateLong();   // "January 1, 2020"
dt.toDateMedium(); // "Jan 1, 2020"
dt.toDateShort();  // "1/1/2020"

dt.toTimeLong();   // "9:00:00am"
dt.toTimeMedium(); // "9:00am"
dt.toTimeShort();  // "9am"

dt.toLongWithZone();       // "January 1, 2020 at 9:00am GMT-5"
dt.toLongWithZone('long'); // "January 1, 2020 at 9:00am Eastern Standard Time"
dt.toTimeWithZone();       // "9:00am GMT-5"
```

#### Locale Formatting

Passing an object to `format` uses `Intl.DateTimeFormat` to produce a
human-readable string in a specific locale. The locale used in order
will be:

- Passed in the options to `format`
- The internal locale of the `DateTime`
- The globally set locale
- The system locale

```js
const dt = new DateTime('2020-01-01T14:00:00.000Z', {
  timeZone: 'America/New_York',
});

dt.format({
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
// "January 1, 2020"
```

#### Token Formatting

Passing a string will format the date using tokens and ignoring locales.

```js
const dt = new DateTime('2020-01-01T14:00:00.000Z', {
  timeZone: 'America/New_York',
});

dt.format('h:mm a');   // "9:00 am"
dt.format('M/d/yyyy'); // "1/1/2020"
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
| Z     | narrow timezone offset (`-5`)                |
| ZZ    | short timezone offset (`-0500`)              |
| ZZZ   | long timezone offset (`-05:00`)              |
| ZZZZ  | short timezone name (`EST`)                  |
| ZZZZZ | long timezone name (`Eastern Standard Time`) |

### Native Date Compatibility

`DateTime` provides passthroughs to the standard `Date` methods
(`toUTCString`, `toLocaleString`, `toJSON`, etc.) so that it can stand
in for a `Date` in code that calls them. Each delegates directly to the
underlying `Date` and produces exactly what the spec defines.

The one exception is `toString`, which deliberately diverges from the
native form to produce a more readable result for implicit
stringification (template literals, logs, errors). Use `dt.date.toString()`
if you need the literal native format.

## Interval

The `Interval` object represents an interval of time:

```js
import { DateTime, Interval } from '@bedrockio/chrono';

const lastYear = new DateTime().rewind(1, 'year');
const nextYear = new DateTime().advance(1, 'year');

const interval = new Interval(lastYear, nextYear);

// The number of days in this interval.
const days = interval.days();
```

## Time

The `Time` object represents a generic time of day, with no associated
date or timezone. It is useful for representing times in the abstract —
for scheduling, display, or comparison — without binding to a specific
calendar moment.

```js
import { Time } from '@bedrockio/chrono';

const noon = new Time(12, 0);
const meeting = new Time('9:30am');
const duration = new Time(35100000); // 9:45:00.000

// Like DateTime, Time is immutable.
const later = meeting.advance(15, 'minutes'); // "9:45am"
```

Hours greater than 24 are allowed and preserved (not normalized), which
lets a `Time` represent times that spill past midnight — useful for
broadcast schedules or late-night programming:

```js
new Time('25:30').toISOString(); // "25:30:00.000"
```
