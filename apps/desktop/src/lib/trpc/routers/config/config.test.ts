import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TEST_ROOT = join(tmpdir(), `config-test-${process.pid}-${Date.now()}`);
const TEST_REPO = join(TEST_ROOT, 'repo');
const TEST_AMOENA_DIR = join(TEST_REPO, '.amoena');
const TEST_CONFIG_PATH = join(TEST_AMOENA_DIR, 'config.json');

vi.mock('../workspaces/utils/setup', () => ({
  loadSetupConfig: vi.fn(() => null),
}));

const mockProject = {
  id: 'proj-1',
  mainRepoPath: TEST_REPO,
  configToastDismissed: false,
};

const mockSelectGet = vi.fn(() => mockProject);

vi.mock('main/lib/local-db', () => ({
  localDb: {
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
  },
}));

const { createConfigRouter } = await import('./config');

describe('config router', () => {
  beforeEach(() => {
    mkdirSync(TEST_AMOENA_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
  });

  it('creates a router', () => {
    const router = createConfigRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe('object');
  });
});
