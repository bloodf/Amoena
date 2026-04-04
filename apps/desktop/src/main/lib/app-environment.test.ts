import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TEST_ROOT = join(tmpdir(), `app-env-test-${process.pid}-${Date.now()}`);

vi.mock('shared/constants', () => ({
  AMOENA_DIR_NAME: '.amoena-test',
}));

// Set env before import
process.env.AMOENA_HOME_DIR = join(TEST_ROOT, '.amoena-test');

const { AMOENA_HOME_DIR, ensureAmoenaHomeDirExists, APP_STATE_PATH, WINDOW_STATE_PATH } =
  await import('./app-environment');

describe('app-environment', () => {
  beforeEach(() => {
    mkdirSync(TEST_ROOT, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
  });

  describe('AMOENA_HOME_DIR', () => {
    it('is a non-empty string', () => {
      expect(typeof AMOENA_HOME_DIR).toBe('string');
      expect(AMOENA_HOME_DIR.length).toBeGreaterThan(0);
    });
  });

  describe('ensureAmoenaHomeDirExists', () => {
    it('creates the directory if it does not exist', () => {
      const targetDir = AMOENA_HOME_DIR;
      if (existsSync(targetDir)) {
        rmSync(targetDir, { recursive: true, force: true });
      }
      ensureAmoenaHomeDirExists();
      expect(existsSync(targetDir)).toBe(true);
    });

    it('does not throw if directory already exists', () => {
      ensureAmoenaHomeDirExists();
      expect(() => ensureAmoenaHomeDirExists()).not.toThrow();
    });
  });

  describe('derived paths', () => {
    it('APP_STATE_PATH ends with app-state.json', () => {
      expect(APP_STATE_PATH).toContain('app-state.json');
    });

    it('WINDOW_STATE_PATH ends with window-state.json', () => {
      expect(WINDOW_STATE_PATH).toContain('window-state.json');
    });
  });
});
