import { describe, expect, it } from 'vitest';

import DateTime from '../src/DateTime';

describe('equality', () => {
  it('should have instanceof equality across modules', async () => {
    const { DateTime: OtherDateTime } = await import('../src');

    const dt = new DateTime();
    const odt = new OtherDateTime();

    expect(dt instanceof DateTime).toBe(true);
    expect(odt instanceof DateTime).toBe(true);
    expect(dt instanceof OtherDateTime).toBe(true);
    expect(odt instanceof OtherDateTime).toBe(true);
  });
});
