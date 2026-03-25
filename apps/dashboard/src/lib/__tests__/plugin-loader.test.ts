import { describe, expect, it } from 'vitest';

describe('loadPlugins', () => {
  it('is a no-op function that does not throw', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { loadPlugins } = require('../plugin-loader');
    expect(typeof loadPlugins).toBe('function');
    expect(() => loadPlugins()).not.toThrow();
  });

  it('returns undefined (void function)', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { loadPlugins } = require('../plugin-loader');
    const result = loadPlugins();
    expect(result).toBeUndefined();
  });
});
