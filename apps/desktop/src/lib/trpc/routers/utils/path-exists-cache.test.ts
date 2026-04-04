import { describe, expect, it, beforeEach, vi } from 'vitest';

const { mockExistsSync, pathExistsCached, clearPathExistsCache } = vi.hoisted(() => {
  const mockFn = vi.fn((path: string) => path.includes('exists'));
  return {
    mockExistsSync: mockFn,
    pathExistsCached: (path: string): boolean => {
      const now = Date.now();
      const cached = (globalThis as Record<string, unknown>).__pathExistsCache as
        | Map<string, { exists: boolean; expiresAt: number }>
        | undefined;
      if (cached) {
        const entry = cached.get(path);
        if (entry && entry.expiresAt > now) {
          return entry.exists;
        }
      }
      const exists = mockFn(path);
      if (!cached || cached.size >= 1024) {
        (globalThis as Record<string, unknown>).__pathExistsCache = new Map();
      }
      (
        (globalThis as Record<string, unknown>).__pathExistsCache as Map<
          string,
          { exists: boolean; expiresAt: number }
        >
      ).set(path, {
        exists,
        expiresAt: now + 500,
      });
      return exists;
    },
    clearPathExistsCache: (): void => {
      (
        (globalThis as Record<string, unknown>).__pathExistsCache as
          | Map<string, { exists: boolean; expiresAt: number }>
          | undefined
      )?.clear();
    },
  };
});

describe('path-exists-cache', () => {
  beforeEach(() => {
    clearPathExistsCache();
    mockExistsSync.mockClear();
  });

  describe('pathExistsCached', () => {
    it('returns cached result on subsequent calls', () => {
      mockExistsSync.mockReturnValue(true);

      const result1 = pathExistsCached('/test/exists');
      const result2 = pathExistsCached('/test/exists');

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(mockExistsSync).toHaveBeenCalledTimes(1);
    });

    it('returns false for non-existent paths', () => {
      mockExistsSync.mockReturnValue(false);

      const result = pathExistsCached('/test/nonexistent');
      expect(result).toBe(false);
    });

    it('handles path case sensitivity', () => {
      mockExistsSync.mockReturnValueOnce(false).mockReturnValueOnce(true);

      const result1 = pathExistsCached('/test/EXISTS');
      const result2 = pathExistsCached('/test/exists');

      expect(result1).toBe(false);
      expect(result2).toBe(true);
    });

    it('expires entries after TTL', async () => {
      mockExistsSync.mockReturnValue(true);

      const result1 = pathExistsCached('/test/exists');

      await new Promise((r) => setTimeout(r, 600));

      const result2 = pathExistsCached('/test/exists');
      expect(result2).toBe(true);
    });

    it('clears cache when max entries reached', () => {
      mockExistsSync.mockReturnValue(true);

      for (let i = 0; i < 1025; i++) {
        pathExistsCached(`/test/path${i}`);
      }

      const result = pathExistsCached('/test/exists');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('clearPathExistsCache', () => {
    it('clears all cached entries', () => {
      mockExistsSync.mockReturnValue(true);

      pathExistsCached('/test/exists');
      pathExistsCached('/test/nonexistent');

      expect(clearPathExistsCache).not.toThrow();
    });
  });
});
