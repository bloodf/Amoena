import { describe, expect, it, mock } from 'bun:test';

const mockClearGitHubCachesForWorktree = mock(() => {});
const mockClearStatusCacheForWorktree = mock(() => {});

mock.module('../../workspaces/utils/github', () => ({
  clearGitHubCachesForWorktree: mockClearGitHubCachesForWorktree,
}));

mock.module('./status-cache', () => ({
  clearStatusCacheForWorktree: mockClearStatusCacheForWorktree,
}));

const { clearWorktreeStatusCaches } = await import('./worktree-status-caches');

describe('worktree-status-caches', () => {
  describe('clearWorktreeStatusCaches', () => {
    it('clears both github and status caches', () => {
      const worktreePath = '/path/to/worktree';

      clearWorktreeStatusCaches(worktreePath);

      expect(mockClearGitHubCachesForWorktree).toHaveBeenCalledWith(worktreePath);
      expect(mockClearStatusCacheForWorktree).toHaveBeenCalledWith(worktreePath);
    });

    it('can be called multiple times', () => {
      const worktreePath = '/path/to/worktree';

      clearWorktreeStatusCaches(worktreePath);
      clearWorktreeStatusCaches(worktreePath);

      expect(mockClearGitHubCachesForWorktree).toHaveBeenCalledTimes(2);
      expect(mockClearStatusCacheForWorktree).toHaveBeenCalledTimes(2);
    });
  });
});
