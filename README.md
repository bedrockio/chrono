# Chrono

Chrono is a minimal library to simplify working with dates in Javascript. It has
built-in local and timezone support.

Concepts

- [Installation](#installation)
- [DateTime](#datetime)
- [Interval](#interval)

## Installation

```shell
yarn install @bedrockio/yada
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
DateTime.setLocal('en-US');
```

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
