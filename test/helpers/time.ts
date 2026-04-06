import { type Clock, createClock, timers } from '@sinonjs/fake-timers';

let clock: Clock;

export function mockTime(time: string) {
  if (!time) {
    throw new Error('Time mocks require a starting date.');
  }
  clock = createClock();
  globalThis.Date = clock.Date as DateConstructor;
  setTime(time);
}

export function unmockTime() {
  globalThis.Date = timers.Date as unknown as DateConstructor;
}

export function setTime(time: string | number | Date) {
  if (typeof time === 'string') {
    time = new Date(time);
  }
  if (time instanceof Date) {
    time = time.getTime();
  }
  clock.setSystemTime(time);
}

export function advanceTime(ms: number) {
  clock.setSystemTime(Date.now() + ms);
}
