import DateTime from '../src/DateTime';

describe('equality', () => {
  it('should have instanceof equality across modules', async () => {
    let mod;
    jest.isolateModules(() => {
      // require again in a fresh registry
      mod = require('../src');
    });

    const dt = new DateTime();
    const edt = new mod.DateTime();

    expect(dt instanceof DateTime).toBe(true);
    expect(edt instanceof DateTime).toBe(true);
    expect(dt instanceof mod.DateTime).toBe(true);
    expect(edt instanceof mod.DateTime).toBe(true);
  });
});
