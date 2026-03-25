import { describe, expect, it, mock } from 'bun:test';
import { EventEmitter } from 'node:events';

const mockWorkerTaskRunner = Object.assign(new EventEmitter(), {
  runTask: mock(() => Promise.resolve({})),
  dispose: mock(() => Promise.resolve()),
});

mock.module('../../../workers/WorkerTaskRunner', () => ({
  WorkerTaskRunner: class extends EventEmitter {
    constructor() {
      super();
    }
    runTask = mockWorkerTaskRunner.runTask;
    dispose = mockWorkerTaskRunner.dispose;
  },
}));

mock.module('electron', () => ({
  app: {
    getAppPath: () => '/app/path',
    once: () => {},
  },
}));

const { runGitTask } = await import('./git-task-runner');

describe('git-task-runner', () => {
  describe('runGitTask', () => {
    it('runs a getStatus task', async () => {
      mockWorkerTaskRunner.runTask.mockImplementation(() =>
        Promise.resolve({
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
        }),
      );

      const result = await runGitTask('getStatus', {
        worktreePath: '/test/worktree',
        defaultBranch: 'main',
      });

      expect(result).toHaveProperty('branch');
      expect(mockWorkerTaskRunner.runTask).toHaveBeenCalled();
    });

    it('runs a getCommitFiles task', async () => {
      mockWorkerTaskRunner.runTask.mockImplementation(() =>
        Promise.resolve([
          {
            path: 'file.ts',
            status: 'modified' as const,
            additions: 5,
            deletions: 3,
          },
        ]),
      );

      const result = await runGitTask('getCommitFiles', {
        worktreePath: '/test/worktree',
        commitHash: 'abc123',
      });

      expect(Array.isArray(result)).toBe(true);
      expect(mockWorkerTaskRunner.runTask).toHaveBeenCalled();
    });
  });
});
