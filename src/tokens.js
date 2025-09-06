// https://moment.github.io/luxon/#/formatting?id=table-of-tokens

import { getMeridiem, getPart } from './intl';

const TOKENS = {
  // Year
  yy(dt, options) {
    return getPart(dt, 'year', {
      ...options,
      year: '2-digit',
    });
  },
  yyyy(dt, options) {
    return getPart(dt, 'year', {
      ...options,
      year: 'numeric',
    });
  },
  // Month
  M(dt, options) {
    return getPart(dt, 'month', {
      ...options,
      month: 'numeric',
    });
  },
  MM(dt, options) {
    return getPart(dt, 'month', {
      ...options,
      month: '2-digit',
    });
  },
  // Day
  d(dt, options) {
    return getPart(dt, 'day', {
      ...options,
      day: 'numeric',
    });
  },
  dd(dt, options) {
    return getPart(dt, 'day', {
      ...options,
      day: '2-digit',
    });
  },
  // Hour 12
  h(dt, options) {
    return getPart(dt, 'hour', {
      ...options,
      hour: 'numeric',
      hour12: true,
    });
  },
  hh(dt, options) {
    return getPart(dt, 'hour', {
      ...options,
      hour: '2-digit',
      hour12: true,
    });
  },
  // Hour 24
  H(dt, options) {
    let str = getPart(dt, 'hour', {
      ...options,
      hour: 'numeric',
      hourCycle: 'h23',
    });
    str = str.replace(/^0/, '');
    return str;
  },
  HH(dt, options) {
    return getPart(dt, 'hour', {
      ...options,
      hour: '2-digit',
      hourCycle: 'h23',
    });
  },
  // Minute
  m(dt, options) {
    return getPart(dt, 'minute', {
      ...options,
      hour: 'numeric',
      minute: 'numeric',
    });
  },
  mm(dt, options) {
    return getPart(dt, 'minute', {
      ...options,
      hour: 'numeric',
      minute: '2-digit',
    });
  },
  // Second
  s(dt, options) {
    return getPart(dt, 'second', {
      ...options,
      second: 'numeric',
    });
  },
  ss(dt, options) {
    return getPart(dt, 'second', {
      ...options,
      minute: '2-digit',
      second: '2-digit',
    });
  },
  // Meridiem
  a(dt, options) {
    return getMeridiem(dt, {
      ...options,
      lower: true,
    });
  },
  A(dt, options) {
    return getMeridiem(dt, options);
  },
  // Timezone
  Z(dt, options) {
    let str = getPart(dt, 'timeZoneName', {
      ...options,
      timeZoneName: 'shortOffset',
    });
    str = str.replace(/^[a-z]+/i, '');
    return str || '+0';
  },
  ZZ(dt, options) {
    let str = getPart(dt, 'timeZoneName', {
      ...options,
      timeZoneName: 'longOffset',
    });
    str = str.replace(/^[a-z]+/i, '');
    str = str.replace(/:/, '');
    return str || '+0000';
  },
  ZZZ(dt, options) {
    let str = getPart(dt, 'timeZoneName', {
      ...options,
      timeZoneName: 'longOffset',
    });
    str = str.replace(/^[a-z]+/i, '');
    return str || '+00:00';
  },
  ZZZZ(dt, options) {
    return getPart(dt, 'timeZoneName', {
      ...options,
      timeZoneName: 'short',
    });
  },
  ZZZZZ(dt, options) {
    return getPart(dt, 'timeZoneName', {
      ...options,
      timeZoneName: 'long',
    });
  },
};

export function formatWithTokens(dt, format, options) {
  let buffer = '';
  let result = '';
  let isLiteral = false;

  function flush() {
    const fn = TOKENS[buffer];

    if (fn && !isLiteral) {
      result += fn(dt, options);
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
