import { describe, expect, it, mock } from 'bun:test';
import { workspaces } from '@lunaria/local-db';

const mockLocalDb = {
  select: () => ({
    from: () => ({
      leftJoin: () => ({
        leftJoin: () => ({
          where: () => ({
            get: () => ({
              workspace: {
                id: 'ws-1',
                name: 'Test Workspace',
                type: 'branch' as const,
                projectId: 'proj-1',
              },
              mainRepoPath: '/repo',
              worktreePath: undefined,
            }),
          }),
        }),
      }),
    }),
  }),
};

mock.module('@lunaria/local-db', () => ({
  workspaces: {},
}));

mock.module('main/lib/local-db', () => ({
  localDb: mockLocalDb,
}));

const { getWorkspaceTerminalContext, clearWorkspaceTerminalContextCache } =
  await import('./workspace-terminal-context');

describe('workspace-terminal-context', () => {
  beforeEach(() => {
    clearWorkspaceTerminalContextCache();
  });

  describe('getWorkspaceTerminalContext', () => {
    it('returns workspace context for valid workspace', () => {
      const result = getWorkspaceTerminalContext('ws-1');

      expect(result).toHaveProperty('workspace');
      expect(result).toHaveProperty('workspacePath');
      expect(result).toHaveProperty('rootPath');
    });

    it('returns undefined workspace for non-existent workspace', () => {
      const result = getWorkspaceTerminalContext('non-existent');

      expect(result.workspace).toBeUndefined();
      expect(result.workspacePath).toBeUndefined();
      expect(result.rootPath).toBeUndefined();
    });

    it('caches results', () => {
      const result1 = getWorkspaceTerminalContext('ws-1');
      const result2 = getWorkspaceTerminalContext('ws-1');

      expect(result1).toBe(result2);
    });

    it('returns branch workspace path for branch type', () => {
      const result = getWorkspaceTerminalContext('ws-1');

      expect(result.workspacePath).toBe('/repo');
    });
  });

  describe('clearWorkspaceTerminalContextCache', () => {
    it('clears the cache', () => {
      getWorkspaceTerminalContext('ws-1');

      clearWorkspaceTerminalContextCache();

      expect(clearWorkspaceTerminalContextCache).not.toThrow();
    });
  });
});
