import { describe, expect, test } from 'bun:test';
import { getEditorLanguage } from './utils';

describe('file-editor utils', () => {
  describe('getEditorLanguage', () => {
    test('returns typescript for .ts files', () => {
      expect(getEditorLanguage('test.ts')).toBe('typescript');
    });

    test('returns tsx for .tsx files', () => {
      expect(getEditorLanguage('component.tsx')).toBe('tsx');
    });

    test('returns javascript for .js files', () => {
      expect(getEditorLanguage('script.js')).toBe('javascript');
    });

    test('returns jsx for .jsx files', () => {
      expect(getEditorLanguage('component.jsx')).toBe('jsx');
    });

    test('returns css for .css files', () => {
      expect(getEditorLanguage('styles.css')).toBe('css');
    });

    test('returns json for .json files', () => {
      expect(getEditorLanguage('package.json')).toBe('json');
    });

    test('returns markdown for .md files', () => {
      expect(getEditorLanguage('README.md')).toBe('markdown');
    });

    test('returns bash for .sh files', () => {
      expect(getEditorLanguage('script.sh')).toBe('bash');
    });

    test('returns yaml for .yaml files', () => {
      expect(getEditorLanguage('config.yaml')).toBe('yaml');
    });

    test('returns yaml for .yml files', () => {
      expect(getEditorLanguage('config.yml')).toBe('yaml');
    });

    test('returns toml for .toml files', () => {
      expect(getEditorLanguage('config.toml')).toBe('toml');
    });

    test('returns markup for .html files', () => {
      expect(getEditorLanguage('index.html')).toBe('markup');
    });

    test('returns plaintext for unknown extensions', () => {
      expect(getEditorLanguage('file.xyz')).toBe('plaintext');
    });

    test('returns plaintext for files without extension', () => {
      expect(getEditorLanguage('Makefile')).toBe('plaintext');
    });

    test('handles uppercase extensions', () => {
      expect(getEditorLanguage('test.TS')).toBe('typescript');
    });

    test('handles mixed case extensions', () => {
      expect(getEditorLanguage('test.Ts')).toBe('typescript');
    });
  });
});
