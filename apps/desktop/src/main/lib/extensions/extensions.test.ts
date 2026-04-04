import { describe, expect, it, vi } from 'vitest';

const mockLoadExtension = vi.hoisted(() => vi.fn(() => Promise.resolve({ version: '1.0.0' })));
const mockGetExtension = vi.hoisted(() => vi.fn(() => null));

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/test'),
    getAppPath: vi.fn(() => '/tmp/test'),
    isPackaged: false,
  },
  session: {
    defaultSession: {
      extensions: {
        loadExtension: mockLoadExtension,
        getExtension: mockGetExtension,
      },
    },
    fromPartition: () => ({
      extensions: {
        loadExtension: mockLoadExtension,
        getExtension: mockGetExtension,
      },
    }),
  },
}));

vi.mock('main/env.main', () => ({
  env: {
    NODE_ENV: 'test',
  },
}));

const { loadReactDevToolsExtension, loadWebviewBrowserExtension } = await import('./index');

describe('extensions', () => {
  describe('loadReactDevToolsExtension', () => {
    it('does not throw', async () => {
      // In test env (not development), should return early
      await expect(loadReactDevToolsExtension()).resolves.toBeUndefined();
    });
  });

  describe('loadWebviewBrowserExtension', () => {
    it('does not throw when extension not found', async () => {
      await expect(loadWebviewBrowserExtension()).resolves.toBeUndefined();
    });
  });
});
