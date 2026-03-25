import { describe, expect, test } from 'bun:test';
import { findFile, getFilePath, countItems, getFileIcon } from './utils';
import type { FileNode } from './types';

describe('file-browser utils', () => {
  describe('getFileIcon', () => {
    test('returns FileCode2 for .ts files', () => {
      const icon = getFileIcon('test.ts');
      expect(icon).toBeTruthy();
    });

    test('returns FileCode2 for .tsx files', () => {
      const icon = getFileIcon('component.tsx');
      expect(icon).toBeTruthy();
    });

    test('returns FileJson for .json files', () => {
      const icon = getFileIcon('package.json');
      expect(icon).toBeTruthy();
    });

    test('returns FileJson for .yaml files', () => {
      const icon = getFileIcon('config.yaml');
      expect(icon).toBeTruthy();
    });

    test('returns Settings for Dockerfile', () => {
      const icon = getFileIcon('Dockerfile');
      expect(icon).toBeTruthy();
    });

    test('returns Settings for Makefile', () => {
      const icon = getFileIcon('Makefile');
      expect(icon).toBeTruthy();
    });

    test('returns FileLock for .gitignore', () => {
      const icon = getFileIcon('.gitignore');
      expect(icon).toBeTruthy();
    });

    test('returns FileKey for LICENSE', () => {
      const icon = getFileIcon('LICENSE');
      expect(icon).toBeTruthy();
    });

    test('returns FileText for README', () => {
      const icon = getFileIcon('README.md');
      expect(icon).toBeTruthy();
    });

    test('returns FileKey for .env files', () => {
      const icon = getFileIcon('.env.production');
      expect(icon).toBeTruthy();
    });

    test('returns Terminal for .sh files', () => {
      const icon = getFileIcon('script.sh');
      expect(icon).toBeTruthy();
    });

    test('returns Image for .svg files', () => {
      const icon = getFileIcon('icon.svg');
      expect(icon).toBeTruthy();
    });

    test('returns default FileType for unknown extensions', () => {
      const icon = getFileIcon('file.xyz');
      expect(icon).toBeTruthy();
    });
  });

  describe('findFile', () => {
    const tree: FileNode[] = [
      { name: 'src', type: 'folder', children: [{ name: 'index.ts', type: 'file' }] },
      { name: 'package.json', type: 'file' },
    ];

    test('finds file by name', () => {
      const result = findFile(tree, 'index.ts');
      expect(result).toBeTruthy();
      expect(result?.name).toBe('index.ts');
    });

    test('returns null for non-existent file', () => {
      const result = findFile(tree, 'nonexistent.ts');
      expect(result).toBeNull();
    });

    test('finds file in nested folder', () => {
      const result = findFile(tree, 'package.json');
      expect(result).toBeTruthy();
      expect(result?.name).toBe('package.json');
    });
  });

  describe('getFilePath', () => {
    const tree: FileNode[] = [
      {
        name: 'src',
        type: 'folder',
        children: [{ name: 'index.ts', type: 'file' }],
      },
      { name: 'package.json', type: 'file' },
    ];

    test('returns correct path for nested file', () => {
      const path = getFilePath(tree, 'index.ts');
      expect(path).toBe('src/index.ts');
    });

    test('returns correct path for root file', () => {
      const path = getFilePath(tree, 'package.json');
      expect(path).toBe('package.json');
    });

    test('returns empty string for non-existent file', () => {
      const path = getFilePath(tree, 'missing.ts');
      expect(path).toBe('');
    });
  });

  describe('countItems', () => {
    test('returns 1 for file node', () => {
      const fileNode: FileNode = { name: 'test.ts', type: 'file' };
      expect(countItems(fileNode)).toBe(1);
    });

    test('counts all items in folder recursively', () => {
      const folderNode: FileNode = {
        name: 'src',
        type: 'folder',
        children: [
          { name: 'a.ts', type: 'file' },
          { name: 'b.ts', type: 'file' },
          {
            name: 'nested',
            type: 'folder',
            children: [{ name: 'c.ts', type: 'file' }],
          },
        ],
      };
      expect(countItems(folderNode)).toBe(3);
    });

    test('returns 0 for empty folder', () => {
      const emptyFolder: FileNode = { name: 'empty', type: 'folder' };
      expect(countItems(emptyFolder)).toBe(0);
    });
  });
});
