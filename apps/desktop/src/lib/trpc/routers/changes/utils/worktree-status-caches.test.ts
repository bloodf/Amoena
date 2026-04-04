import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockClearGitHubCachesForWorktree = vi.fn(() => {});
const mockClearStatusCacheForWorktree = vi.fn(() => {});

vi.mock('../../workspaces/utils/github', () => ({
  clearGitHubCachesForWorktree: mockClearGitHubCachesForWorktree,
}));

vi.mock('./status-cache', () => ({
  clearStatusCacheForWorktree: mockClearStatusCacheForWorktree,
}));

const { clearWorktreeStatusCaches } = await import('./worktree-status-caches');

beforeEach(() => {
  mockClearGitHubCachesForWorktree.mockClear();
  mockClearStatusCacheForWorktree.mockClear();
});

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
