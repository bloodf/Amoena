import { describe, expect, it } from 'vitest';

describe('loadPlugins', () => {
  it('is a no-op function that does not throw', async () => {
    const { loadPlugins } = await import('../plugin-loader');
    expect(typeof loadPlugins).toBe('function');
    expect(() => loadPlugins()).not.toThrow();
  });

  it('returns undefined (void function)', async () => {
    const { loadPlugins } = await import('../plugin-loader');
    const result = loadPlugins();
    expect(result).toBeUndefined();
  });
});
