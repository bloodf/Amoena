import { describe, expect, it, vi } from 'vitest';

vi.mock('main/lib/analytics', () => ({
  track: vi.fn(() => {}),
}));

vi.mock('./db-helpers', () => ({
  getMaxProjectChildTabOrder: vi.fn(() => 0),
  setLastActiveWorkspace: vi.fn(() => {}),
  activateProject: vi.fn(() => {}),
  touchWorkspace: vi.fn(() => {}),
  updateActiveWorkspaceIfRemoved: vi.fn(() => {}),
}));

vi.mock('./base-branch', () => ({
  resolveWorkspaceBaseBranch: vi.fn(() => 'main'),
}));

vi.mock('./base-branch-config', () => ({
  setBranchBaseConfig: vi.fn(() => Promise.resolve()),
}));

vi.mock('./git', () => ({
  listExternalWorktrees: vi.fn(() => Promise.resolve([])),
  worktreeExists: vi.fn(() => Promise.resolve(true)),
  listBranches: vi.fn(() => Promise.resolve({ local: ['main'], remote: [] })),
}));

vi.mock('./resolve-worktree-path', () => ({
  resolveWorktreePath: vi.fn(() => '/repo/worktrees/feature'),
}));

vi.mock('./setup', () => ({
  copyAmoenaConfigToWorktree: vi.fn(() => {}),
  loadSetupConfig: vi.fn(() => null),
}));

const mockInsertReturningGet = vi.hoisted(() =>
  vi.fn(() => ({
    id: 'ws-1',
    projectId: 'p1',
    worktreeId: 'wt1',
    type: 'worktree',
    branch: 'feature',
    name: 'feature',
    tabOrder: 1,
  })),
);

const mockSelectGet = vi.hoisted(() =>
  vi.fn(() => ({
    id: 'p1',
    mainRepoPath: '/repo',
    defaultBranch: 'main',
    workspaceBaseBranch: null,
  })),
);

vi.mock('main/lib/local-db', () => ({
  localDb: {
    insert: () => ({
      values: () => ({
        returning: () => ({
          get: mockInsertReturningGet,
        }),
      }),
    }),
    select: () => ({
      from: () => ({
        where: () => ({
          get: mockSelectGet,
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          run: vi.fn(() => {}),
        }),
      }),
    }),
    delete: () => ({
      where: () => ({
        run: vi.fn(() => {}),
      }),
    }),
  },
}));

const { createWorkspaceFromWorktree, createWorkspaceFromExternalWorktree } =
  await import('./workspace-creation');

describe('workspace-creation', () => {
  describe('createWorkspaceFromWorktree', () => {
    it('creates a workspace and returns it', () => {
      const result = createWorkspaceFromWorktree({
        projectId: 'p1',
        worktreeId: 'wt1',
        branch: 'feature',
        name: 'feature',
      });
      expect(result).toBeDefined();
      expect(result.id).toBe('ws-1');
    });
  });

  describe('createWorkspaceFromExternalWorktree', () => {
    it('returns undefined when no external worktree found', async () => {
      const result = await createWorkspaceFromExternalWorktree({
        projectId: 'p1',
        branch: 'feature',
        name: 'feature',
      });
      expect(result).toBeUndefined();
    });
  });
});
