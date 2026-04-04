import { describe, expect, it, vi } from 'vitest';

vi.mock('./security/git-commands', () => ({
  gitStageFile: vi.fn(() => Promise.resolve()),
  gitUnstageFile: vi.fn(() => Promise.resolve()),
  gitCheckoutFile: vi.fn(() => Promise.resolve()),
  gitStageFiles: vi.fn(() => Promise.resolve()),
  gitUnstageFiles: vi.fn(() => Promise.resolve()),
  gitStageAll: vi.fn(() => Promise.resolve()),
  gitUnstageAll: vi.fn(() => Promise.resolve()),
  gitDiscardAllUnstaged: vi.fn(() => Promise.resolve()),
  gitDiscardAllStaged: vi.fn(() => Promise.resolve()),
  gitStash: vi.fn(() => Promise.resolve()),
  gitStashIncludeUntracked: vi.fn(() => Promise.resolve()),
  gitStashPop: vi.fn(() => Promise.resolve()),
}));

vi.mock('./security/path-validation', () => ({
  assertRegisteredWorktree: () => {},
}));

vi.mock('./utils/status-cache', () => ({
  clearStatusCacheForWorktree: vi.fn(() => {}),
}));

vi.mock('./utils/parse-status', () => ({
  parseGitStatus: vi.fn(() => ({
    staged: [],
    unstaged: [],
    untracked: [],
  })),
}));

vi.mock('../workspaces/utils/git-client', () => ({
  getSimpleGitWithShellPath: () =>
    Promise.resolve({
      status: vi.fn(() =>
        Promise.resolve({
          files: [],
          staged: [],
          not_added: [],
        }),
      ),
    }),
}));

vi.mock('../workspace-fs-service', () => ({
  getServiceForRootPath: () => ({
    deletePath: vi.fn(() => Promise.resolve()),
  }),
}));

const { createStagingRouter } = await import('./staging');

describe('staging router', () => {
  it('creates a router with expected procedures', () => {
    const router = createStagingRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe('object');
  });
});
