import { describe, expect, it, vi } from 'vitest';
import type { SimpleGit } from 'simple-git';
import type { ChangedFile } from 'shared/changes-types';
import { parseDiffNumstat } from './parse-status';

const mockParseDiffNumstat = vi.hoisted(() =>
  vi.fn(() => new Map<string, { additions: number; deletions: number }>()),
);

vi.mock('./parse-status', () => ({
  parseDiffNumstat: mockParseDiffNumstat,
}));

const { applyNumstatToFiles } = await import('./apply-numstat');

describe('apply-numstat', () => {
  describe('applyNumstatToFiles', () => {
    it('does nothing when files array is empty', async () => {
      const git = {} as SimpleGit;
      const files: ChangedFile[] = [];
      const diffArgs = ['diff', '--numstat'];

      await applyNumstatToFiles(git, files, diffArgs);

      expect(files).toEqual([]);
    });

    it('applies numstat data to matching files', async () => {
      mockParseDiffNumstat.mockImplementation(() => {
        const map = new Map<string, { additions: number; deletions: number }>();
        map.set('src/index.ts', { additions: 10, deletions: 5 });
        return map;
      });

      const files: ChangedFile[] = [
        { path: 'src/index.ts', status: 'modified', additions: 0, deletions: 0 },
        { path: 'src/other.ts', status: 'modified', additions: 0, deletions: 0 },
      ];
      const git = {
        raw: vi.fn(() => Promise.resolve('10\t5\tsrc/index.ts')),
      } as unknown as SimpleGit;

      await applyNumstatToFiles(git, files, ['diff', '--numstat']);

      expect(files[0].additions).toBe(10);
      expect(files[0].deletions).toBe(5);
      expect(files[1].additions).toBe(0);
      expect(files[1].deletions).toBe(0);
    });

    it('handles files not in numstat output', async () => {
      mockParseDiffNumstat.mockImplementation(() => new Map());

      const files: ChangedFile[] = [
        { path: 'src/new.ts', status: 'added', additions: 0, deletions: 0 },
      ];
      const git = { raw: vi.fn(() => Promise.resolve('')) } as unknown as SimpleGit;

      await applyNumstatToFiles(git, files, ['diff', '--numstat']);

      expect(files[0].additions).toBe(0);
      expect(files[0].deletions).toBe(0);
    });

    it('handles git raw errors gracefully', async () => {
      mockParseDiffNumstat.mockImplementation(() => new Map());

      const files: ChangedFile[] = [
        { path: 'src/index.ts', status: 'modified', additions: 0, deletions: 0 },
      ];
      const git = {
        raw: vi.fn(() => Promise.reject(new Error('git error'))),
      } as unknown as SimpleGit;

      await applyNumstatToFiles(git, files, ['diff', '--numstat']);

      expect(files[0].additions).toBe(0);
      expect(files[0].deletions).toBe(0);
    });
  });
});
