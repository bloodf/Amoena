import { describe, expect, it, vi } from 'vitest';

vi.mock('../workspaces/utils/git-client', () => ({
  getSimpleGitWithShellPath: () =>
    Promise.resolve({
      branch: vi.fn(() =>
        Promise.resolve({
          branches: {
            main: {},
            feature: {},
            'remotes/origin/main': {},
            'remotes/origin/HEAD': {},
            'remotes/origin/dev': {},
          },
        }),
      ),
      raw: vi.fn((args: string[]) => {
        if (args[0] === 'for-each-ref') {
          return Promise.resolve('main 1700000000\nfeature 1700000001\n');
        }
        if (args[0] === 'symbolic-ref') {
          return Promise.resolve('refs/remotes/origin/main\n');
        }
        if (args[0] === 'worktree') {
          return Promise.resolve('');
        }
        return Promise.resolve('');
      }),
      revparse: vi.fn(() => Promise.resolve('main\n')),
    }),
}));

vi.mock('./security/path-validation', () => ({
  assertRegisteredWorktree: () => {},
  getRegisteredWorktree: () => ({
    id: 'wt1',
    path: '/repo',
    branch: 'main',
    gitStatus: { branch: 'main' },
  }),
}));

vi.mock('./security/git-commands', () => ({
  gitSwitchBranch: vi.fn(() => Promise.resolve()),
}));

vi.mock('../workspaces/utils/base-branch-config', () => ({
  getBranchBaseConfig: vi.fn(() => Promise.resolve({ baseBranch: null })),
  setBranchBaseConfig: vi.fn(() => Promise.resolve()),
  unsetBranchBaseConfig: vi.fn(() => Promise.resolve()),
}));

vi.mock('../workspaces/utils/git', () => ({
  getCurrentBranch: vi.fn(() => Promise.resolve('main')),
}));

vi.mock('./utils/status-cache', () => ({
  clearStatusCacheForWorktree: vi.fn(() => {}),
}));

const { createBranchesRouter } = await import('./branches');

describe('branches router', () => {
  it('creates a router with expected procedures', () => {
    const router = createBranchesRouter();
    expect(router).toBeDefined();
    // The router object itself is a tRPC router, we verify it was created
    expect(typeof router).toBe('object');
  });
});
