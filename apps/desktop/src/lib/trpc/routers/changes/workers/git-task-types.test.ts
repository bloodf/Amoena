import { describe, expect, it } from 'vitest';
import type { GitTaskPayloadMap, GitTaskResultMap } from './git-task-types';

describe('git-task-types', () => {
  describe('GitTaskPayloadMap', () => {
    it('defines getStatus payload with worktreePath and defaultBranch', () => {
      const payload: GitTaskPayloadMap['getStatus'] = {
        worktreePath: '/path/to/worktree',
        defaultBranch: 'main',
      };
      expect(payload.worktreePath).toBe('/path/to/worktree');
      expect(payload.defaultBranch).toBe('main');
    });

    it('defines getCommitFiles payload with worktreePath and commitHash', () => {
      const payload: GitTaskPayloadMap['getCommitFiles'] = {
        worktreePath: '/path/to/worktree',
        commitHash: 'abc123',
      };
      expect(payload.worktreePath).toBe('/path/to/worktree');
      expect(payload.commitHash).toBe('abc123');
    });
  });

  describe('GitTaskResultMap', () => {
    it('defines getStatus result as GitChangesStatus', () => {
      const result: GitTaskResultMap['getStatus'] = {
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
      expect(result.branch).toBe('main');
    });

    it('defines getCommitFiles result as ChangedFile array', () => {
      const result: GitTaskResultMap['getCommitFiles'] = [
        {
          path: 'src/index.ts',
          status: 'modified',
          additions: 10,
          deletions: 5,
        },
      ];
      expect(result.length).toBe(1);
      expect(result[0].path).toBe('src/index.ts');
    });
  });

  describe('GitTaskType', () => {
    it('has "getStatus" as a valid task type', () => {
      const taskType: GitTaskType = 'getStatus';
      expect(taskType).toBe('getStatus');
    });

    it('has "getCommitFiles" as a valid task type', () => {
      const taskType: GitTaskType = 'getCommitFiles';
      expect(taskType).toBe('getCommitFiles');
    });
  });
});

type GitTaskType = keyof GitTaskPayloadMap;
