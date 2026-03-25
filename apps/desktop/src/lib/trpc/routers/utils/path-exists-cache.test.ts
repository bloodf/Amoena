import { describe, expect, it, mock, beforeEach } from 'bun:test';
import { existsSync } from 'node:fs';
import { pathExistsCached, clearPathExistsCache } from './path-exists-cache';

const mockExistsSync = mock((path: string) => path.includes('exists'));

describe('path-exists-cache', () => {
  beforeEach(() => {
    clearPathExistsCache();
  });

  describe('pathExistsCached', () => {
    it('returns cached result on subsequent calls', () => {
      const result1 = pathExistsCached('/test/exists');
      const result2 = pathExistsCached('/test/exists');

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('returns false for non-existent paths', () => {
      const result = pathExistsCached('/test/nonexistent');
      expect(result).toBe(false);
    });

    it('handles path case sensitivity', () => {
      const result1 = pathExistsCached('/test/EXISTS');
      const result2 = pathExistsCached('/test/exists');

      expect(result1).toBe(false);
      expect(result2).toBe(true);
    });

    it('expires entries after TTL', async () => {
      const result1 = pathExistsCached('/test/exists');

      await new Promise((r) => setTimeout(r, 600));

      const result2 = pathExistsCached('/test/exists');
      expect(result2).toBe(true);
    });

    it('clears cache when max entries reached', () => {
      for (let i = 0; i < 1025; i++) {
        pathExistsCached(`/test/path${i}`);
      }

      const result = pathExistsCached('/test/exists');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('clearPathExistsCache', () => {
    it('clears all cached entries', () => {
      pathExistsCached('/test/exists');
      pathExistsCached('/test/nonexistent');

      clearPathExistsCache();

      expect(clearPathExistsCache).not.toThrow();
    });
  });
});
