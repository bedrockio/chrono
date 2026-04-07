// https://moment.github.io/luxon/#/formatting?id=table-of-tokens

import { getMeridiem, getPart } from './intl';
import { DateLike, IntlOptions } from './types';

type Tokenizer = (date: DateLike, options?: IntlOptions) => string;

const TOKENS: Record<string, Tokenizer> = {
  // Year
  yy(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'year', {
      ...options,
      year: '2-digit',
    });
  },
  yyyy(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'year', {
      ...options,
      year: 'numeric',
    });
  },
  // Month
  M(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'month', {
      ...options,
      month: 'numeric',
    });
  },
  MM(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'month', {
      ...options,
      month: '2-digit',
    });
  },
  // Day
  d(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'day', {
      ...options,
      day: 'numeric',
    });
  },
  dd(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'day', {
      ...options,
      day: '2-digit',
    });
  },
  // Hour 12
  h(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'hour', {
      ...options,
      hour: 'numeric',
      hour12: true,
    });
  },
  hh(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'hour', {
      ...options,
      hour: '2-digit',
      hour12: true,
    });
  },
  // Hour 24, unpadded.
  // Intl pads the hour to 2 digits when `minute` is also requested in the
  // format string, so we strip the leading zero ourselves to keep `H`
  // unpadded. See "5:05 AM" / "0:05 AM" cases in DateTime.test.ts.
  H(date: DateLike, options?: IntlOptions) {
    let str = getPart(date, 'hour', {
      ...options,
      hour: 'numeric',
      hourCycle: 'h23',
    });
    str = str.replace(/^0/, '');
    return str;
  },
  HH(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'hour', {
      ...options,
      hour: '2-digit',
      hourCycle: 'h23',
    });
  },
  // Minute.
  // Intl produces ambiguous, prose-like output when `minute` is requested
  // alone, so we always pair it with `hour` to force a numeric `minute`
  // part. The hour value itself is discarded by `getPart`.
  m(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'minute', {
      ...options,
      hour: 'numeric',
      minute: 'numeric',
    });
  },
  mm(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'minute', {
      ...options,
      hour: 'numeric',
      minute: '2-digit',
    });
  },
  // Second.
  // Same workaround as `minute` — pair with `minute` so Intl returns a
  // numeric `second` part instead of prose.
  s(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'second', {
      ...options,
      second: 'numeric',
    });
  },
  ss(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'second', {
      ...options,
      minute: '2-digit',
      second: '2-digit',
    });
  },
  // Meridiem
  a(date: DateLike, options?: IntlOptions) {
    return getMeridiem(date, {
      ...options,
      lower: true,
    });
  },
  A(date: DateLike, options?: IntlOptions) {
    return getMeridiem(date, options);
  },
  // Timezone
  Z(date: DateLike, options?: IntlOptions) {
    let str = getPart(date, 'timeZoneName', {
      ...options,
      timeZoneName: 'shortOffset',
    });
    str = str.replace(/^[a-z]+/i, '');
    return str || '+0';
  },
  ZZ(date: DateLike, options?: IntlOptions) {
    let str = getPart(date, 'timeZoneName', {
      ...options,
      timeZoneName: 'longOffset',
    });
    str = str.replace(/^[a-z]+/i, '');
    str = str.replace(/:/, '');
    return str || '+0000';
  },
  ZZZ(date: DateLike, options?: IntlOptions) {
    let str = getPart(date, 'timeZoneName', {
      ...options,
      timeZoneName: 'longOffset',
    });
    str = str.replace(/^[a-z]+/i, '');
    return str || '+00:00';
  },
  ZZZZ(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'timeZoneName', {
      ...options,
      timeZoneName: 'short',
    });
  },
  ZZZZZ(date: DateLike, options?: IntlOptions) {
    return getPart(date, 'timeZoneName', {
      ...options,
      timeZoneName: 'long',
    });
  },
};

export function formatWithTokens(
  date: DateLike,
  format: string,
  options?: IntlOptions,
) {
  let buffer = '';
  let result = '';
  let isLiteral = false;

  function flush() {
    const fn = TOKENS[buffer];

    if (fn && !isLiteral) {
      result += fn(date, options);
    } else {
      result += buffer;
    }

    buffer = '';
  }

  for (let i = 0; i < format.length; i++) {
    const char = format.charAt(i);
    const last = format.charAt(i - 1);
    if (last === '' || last === char) {
      buffer += char;
    } else {
      flush();
      if (char === "'" || char === '"') {
        isLiteral = !isLiteral;
      } else {
        buffer += char;
      }
    }
  }

  flush();

  return result;
}
