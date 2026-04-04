import { describe, expect, it } from 'vitest';
import type { GitChangesStatus } from 'shared/changes-types';
import {
  STATUS_CACHE_TTL_MS,
  makeStatusCacheKey,
  getCachedStatus,
  setCachedStatus,
  getInFlightStatus,
  setInFlightStatus,
  clearInFlightStatus,
  clearStatusCacheForWorktree,
} from './status-cache';

describe('status-cache', () => {
  describe('makeStatusCacheKey', () => {
    it('creates key from worktreePath and defaultBranch', () => {
      const key = makeStatusCacheKey('/path/to/repo', 'main');
      expect(key).toBe('/path/to/repo:main');
    });

    it('handles different branches', () => {
      const key = makeStatusCacheKey('/path/to/repo', 'develop');
      expect(key).toBe('/path/to/repo:develop');
    });
  });

  describe('getCachedStatus / setCachedStatus', () => {
    it('returns null for non-existent key', () => {
      const result = getCachedStatus('non-existent-key');
      expect(result).toBeNull();
    });

    it('returns cached result within TTL', () => {
      const cacheKey = 'test-key';
      const status: GitChangesStatus = {
        branch: 'main',
        defaultBranch: 'main',
        commits: [],
        staged: [],
        unstaged: [],
        untracked: [],
        againstBase: [],
        ahead: 0,
        behind: 0,
        pushCount: 0,
        pullCount: 0,
        hasUpstream: false,
      };

      setCachedStatus(cacheKey, status);
      const result = getCachedStatus(cacheKey);

      expect(result).toEqual(status);
    });

    it('returns cached value without time passage', async () => {
      const cacheKey = 'fresh-key';
      const status: GitChangesStatus = {
        branch: 'main',
        defaultBranch: 'main',
        commits: [],
        staged: [],
        unstaged: [],
        untracked: [],
        againstBase: [],
        ahead: 0,
        behind: 0,
        pushCount: 0,
        pullCount: 0,
        hasUpstream: false,
      };

      setCachedStatus(cacheKey, status);

      const result = getCachedStatus(cacheKey);
      expect(result).toEqual(status);
    });

    it('returns cached value on immediate getCachedStatus', () => {
      const cacheKey = 'immediate-get';
      const status: GitChangesStatus = {
        branch: 'main',
        defaultBranch: 'main',
        commits: [],
        staged: [],
        unstaged: [],
        untracked: [],
        againstBase: [],
        ahead: 0,
        behind: 0,
        pushCount: 0,
        pullCount: 0,
        hasUpstream: false,
      };

      setCachedStatus(cacheKey, status);

      const result = getCachedStatus(cacheKey);
      expect(result).toEqual(status);
    });
  });

  describe('inFlightStatus', () => {
    it('returns null for non-existent key', () => {
      const result = getInFlightStatus('non-existent');
      expect(result).toBeNull();
    });

    it('sets and gets in-flight status', () => {
      const cacheKey = 'inflight-key';
      const promise = Promise.resolve({} as GitChangesStatus);

      setInFlightStatus(cacheKey, promise);
      const result = getInFlightStatus(cacheKey);

      expect(result).toBe(promise);
    });

    it('clears in-flight status', () => {
      const cacheKey = 'to-clear';
      const promise = Promise.resolve({} as GitChangesStatus);

      setInFlightStatus(cacheKey, promise);
      clearInFlightStatus(cacheKey);

      const result = getInFlightStatus(cacheKey);
      expect(result).toBeNull();
    });
  });

  describe('clearStatusCacheForWorktree', () => {
    it('clears all cache entries for a worktree', () => {
      const worktreePath = '/path/to/worktree';
      const status: GitChangesStatus = {
        branch: 'main',
        defaultBranch: 'main',
        commits: [],
        staged: [],
        unstaged: [],
        untracked: [],
        againstBase: [],
        ahead: 0,
        behind: 0,
        pushCount: 0,
        pullCount: 0,
        hasUpstream: false,
      };

      setCachedStatus(makeStatusCacheKey(worktreePath, 'main'), status);
      setCachedStatus(makeStatusCacheKey(worktreePath, 'develop'), status);
      setCachedStatus(makeStatusCacheKey('/other/path', 'main'), status);

      clearStatusCacheForWorktree(worktreePath);

      expect(getCachedStatus(makeStatusCacheKey(worktreePath, 'main'))).toBeNull();
      expect(getCachedStatus(makeStatusCacheKey(worktreePath, 'develop'))).toBeNull();
      expect(getCachedStatus(makeStatusCacheKey('/other/path', 'main'))).not.toBeNull();
    });

    it('clears in-flight status for worktree', () => {
      const worktreePath = '/path/to/worktree';
      const promise = Promise.resolve({} as GitChangesStatus);

      setInFlightStatus(makeStatusCacheKey(worktreePath, 'main'), promise);
      setInFlightStatus(makeStatusCacheKey('/other/path', 'main'), promise);

      clearStatusCacheForWorktree(worktreePath);

      expect(getInFlightStatus(makeStatusCacheKey(worktreePath, 'main'))).toBeNull();
      expect(getInFlightStatus(makeStatusCacheKey('/other/path', 'main'))).not.toBeNull();
    });
  });
});
