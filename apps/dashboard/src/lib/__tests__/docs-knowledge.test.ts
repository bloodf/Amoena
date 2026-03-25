import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/config', () => ({
  config: { memoryDir: '/mock/memory' },
}));

vi.mock('@/lib/paths', () => ({
  resolveWithin: vi.fn((base, rel) => `${base}/${rel}`),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => true),
  lstat: vi.fn(),
  readdir: vi.fn(),
  readFile: vi.fn(),
  realpath: vi.fn(),
  stat: vi.fn(),
}));

describe('docs-knowledge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizeRelativePath', () => {
    it('normalizes path separators', async () => {
      const { normalizeRelativePath } = await import('../docs-knowledge');
      expect(normalizeRelativePath('a\\b\\c')).toBe('a/b/c');
    });

    it('removes leading slashes', async () => {
      const { normalizeRelativePath } = await import('../docs-knowledge');
      expect(normalizeRelativePath('/leading/slash')).toBe('leading/slash');
    });

    it('handles empty string', async () => {
      const { normalizeRelativePath } = await import('../docs-knowledge');
      expect(normalizeRelativePath('')).toBe('');
    });
  });

  describe('isWithinBase', () => {
    it('returns true for same path', async () => {
      const { isWithinBase } = await import('../docs-knowledge');
      expect(isWithinBase('/base', '/base')).toBe(true);
    });

    it('returns true for subdirectory', async () => {
      const { isWithinBase } = await import('../docs-knowledge');
      expect(isWithinBase('/base', '/base/subdir')).toBe(true);
    });

    it('returns false for path outside base', async () => {
      const { isWithinBase } = await import('../docs-knowledge');
      expect(isWithinBase('/base', '/other/path')).toBe(false);
    });
  });

  describe('listDocsRoots', () => {
    it('returns empty array when memoryDir not configured', async () => {
      vi.doMock('@/lib/config', () => ({
        config: { memoryDir: undefined },
      }));
      const { listDocsRoots } = await import('../docs-knowledge');
      expect(listDocsRoots()).toEqual([]);
    });
  });

  describe('isDocsPathAllowed', () => {
    it('returns false for empty path', async () => {
      const { isDocsPathAllowed } = await import('../docs-knowledge');
      expect(isDocsPathAllowed('')).toBe(false);
    });

    it('returns false when memoryDir not configured', async () => {
      vi.doMock('@/lib/config', () => ({
        config: { memoryDir: undefined },
      }));
      const { isDocsPathAllowed } = await import('../docs-knowledge');
      expect(isDocsPathAllowed('docs/readme.md')).toBe(false);
    });
  });

  describe('isSearchable', () => {
    it('returns true for .md files', async () => {
      const { isSearchable } = await import('../docs-knowledge');
      expect(isSearchable('readme.md')).toBe(true);
    });

    it('returns true for .txt files', async () => {
      const { isSearchable } = await import('../docs-knowledge');
      expect(isSearchable('notes.txt')).toBe(true);
    });

    it('returns false for other extensions', async () => {
      const { isSearchable } = await import('../docs-knowledge');
      expect(isSearchable('image.png')).toBe(false);
      expect(isSearchable('data.json')).toBe(false);
    });
  });
});
