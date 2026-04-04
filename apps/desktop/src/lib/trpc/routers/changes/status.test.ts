import { describe, expect, it, vi } from 'vitest';

vi.mock('./security/path-validation', () => ({
  assertRegisteredWorktree: () => {},
}));

vi.mock('./utils/status-cache', () => ({
  clearStatusCacheForWorktree: vi.fn(() => {}),
  getCachedStatus: vi.fn(() => null),
  getInFlightStatus: vi.fn(() => null),
  makeStatusCacheKey: vi.fn((p: string, b: string) => `${p}:${b}`),
  setCachedStatus: vi.fn(() => {}),
  setInFlightStatus: vi.fn(() => {}),
  clearInFlightStatus: vi.fn(() => {}),
}));

vi.mock('./workers/git-task-runner', () => ({
  runGitTask: vi.fn(() =>
    Promise.resolve({
      staged: [],
      unstaged: [],
      untracked: [],
      commits: [],
      stashCount: 0,
      branch: 'main',
    }),
  ),
}));

const { createStatusRouter } = await import('./status');

describe('status router', () => {
  it('creates a router with expected procedures', () => {
    const router = createStatusRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe('object');
  });
});
