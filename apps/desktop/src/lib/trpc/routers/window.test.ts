import { describe, expect, it, vi } from 'vitest';
import { BrowserWindow } from 'electron';

const mockDialog = vi.hoisted(() =>
  vi.fn(() =>
    Promise.resolve({
      canceled: false,
      filePaths: ['/Users/test/selected'],
    }),
  ),
);

vi.mock('electron', () => ({
  dialog: {
    showOpenDialog: mockDialog,
  },
  default: {
    dialog: {
      showOpenDialog: mockDialog,
    },
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    minimize: vi.fn(),
    maximize: vi.fn(),
    unmaximize: vi.fn(),
    close: vi.fn(),
    isMaximized: vi.fn(() => false),
  })),
}));

vi.mock('node:fs/promises', () => ({
  default: {
    stat: vi.fn(() => Promise.resolve({ isDirectory: () => true })),
    readFile: vi.fn(() => Promise.resolve(Buffer.from('fakeimage'))),
  },
}));

vi.mock('node:os', () => ({
  default: {
    homedir: () => '/Users/test',
  },
}));

vi.mock('node:path', () => ({
  extname: () => '.png',
  join: (a: string, b: string) => `${a}/${b}`,
  resolve: (a: string, b: string) => `${a}/${b}`,
}));

let mockWindow: BrowserWindow | null = null;

const { createWindowRouter } = await import('./window');

describe('window router', () => {
  const getWindow = () => mockWindow;

  it('creates a router with expected shape', () => {
    const router = createWindowRouter(getWindow);
    expect(router).toBeDefined();
    expect(typeof router).toBe('object');
  });

  describe('minimize mutation', () => {
    it('minimizes the window', () => {
      const router = createWindowRouter(getWindow);
      const caller = router.createCaller({});

      const mockMinimize = vi.fn(() => {});
      mockWindow!.minimize = mockMinimize;

      const result = caller.mutation('window.minimize', {});

      expect(result).toEqual({ success: true });
    });

    it('returns failure when no window', () => {
      const router = createWindowRouter(() => null);
      const caller = router.createCaller({});

      const result = caller.mutation('window.minimize', {});

      expect(result).toEqual({ success: false });
    });
  });

  describe('maximize mutation', () => {
    it('maximizes the window', () => {
      const router = createWindowRouter(getWindow);
      const caller = router.createCaller({});

      const mockIsMaximized = vi.fn(() => false);
      const mockMaximize = vi.fn(() => {});
      mockWindow!.isMaximized = mockIsMaximized;
      mockWindow!.maximize = mockMaximize;

      const result = caller.mutation('window.maximize', {});

      expect(result).toHaveProperty('success', true);
    });

    it('unmaximizes when already maximized', () => {
      const router = createWindowRouter(getWindow);
      const caller = router.createCaller({});

      const mockIsMaximized = vi.fn(() => true);
      const mockUnmaximize = vi.fn(() => {});
      mockWindow!.isMaximized = mockIsMaximized;
      mockWindow!.unmaximize = mockUnmaximize;

      const result = caller.mutation('window.maximize', {});

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('isMaximized', false);
    });
  });

  describe('close mutation', () => {
    it('closes the window', () => {
      const router = createWindowRouter(getWindow);
      const caller = router.createCaller({});

      const mockClose = vi.fn(() => {});
      mockWindow!.close = mockClose;

      const result = caller.mutation('window.close', {});

      expect(result).toEqual({ success: true });
    });

    it('returns failure when no window', () => {
      const router = createWindowRouter(() => null);
      const caller = router.createCaller({});

      const result = caller.mutation('window.close', {});

      expect(result).toEqual({ success: false });
    });
  });

  describe('isMaximized query', () => {
    it('returns window maximized state', () => {
      const router = createWindowRouter(getWindow);
      const caller = router.createCaller({});

      const mockIsMaximized = vi.fn(() => true);
      mockWindow!.isMaximized = mockIsMaximized;

      const result = caller.query('window.isMaximized', {});

      expect(result).toBe(true);
    });

    it('returns false when no window', () => {
      const router = createWindowRouter(() => null);
      const caller = router.createCaller({});

      const result = caller.query('window.isMaximized', {});

      expect(result).toBe(false);
    });
  });

  describe('getPlatform query', () => {
    it('returns the platform', () => {
      const router = createWindowRouter(getWindow);
      const caller = router.createCaller({});

      const result = caller.query('window.getPlatform', {});

      expect(result).toBe(process.platform);
    });
  });

  describe('getHomeDir query', () => {
    it('returns the home directory', () => {
      const router = createWindowRouter(getWindow);
      const caller = router.createCaller({});

      const result = caller.query('window.getHomeDir', {});

      expect(result).toBe('/Users/test');
    });
  });

  describe('getDirectoryStatus query', () => {
    it('returns directory status for existing path', async () => {
      const router = createWindowRouter(getWindow);
      const caller = router.createCaller({});

      const result = await caller.query('window.getDirectoryStatus', {
        path: '/Users/test',
      });

      expect(result).toEqual({ exists: true, isDirectory: true });
    });

    it('returns not exists for non-existent path', async () => {
      const router = createWindowRouter(getWindow);
      const caller = router.createCaller({});

      // Mock stat to throw for non-existent path
      const mockStat = vi.fn(() => Promise.reject(new Error('ENOENT')));

      const result = await caller.query('window.getDirectoryStatus', {
        path: '/non/existent',
      });

      expect(result).toEqual({ exists: false, isDirectory: false });
    });
  });

  describe('selectDirectory mutation', () => {
    it('opens directory picker dialog', async () => {
      const router = createWindowRouter(getWindow);
      const caller = router.createCaller({});

      const result = await caller.mutation('window.selectDirectory', {
        title: 'Select Folder',
        defaultPath: '/Users/test',
      });

      expect(result).toHaveProperty('canceled', false);
      expect(result).toHaveProperty('path', '/Users/test/selected');
    });

    it('returns canceled when dialog is canceled', async () => {
      mockDialog.showOpenDialog = vi.fn(() =>
        Promise.resolve({
          canceled: true,
          filePaths: [],
        }),
      );

      const router = createWindowRouter(getWindow);
      const caller = router.createCaller({});

      const result = await caller.mutation('window.selectDirectory', {});

      expect(result).toEqual({ canceled: true, path: null });
    });

    it('returns canceled when no window available', async () => {
      const router = createWindowRouter(() => null);
      const caller = router.createCaller({});

      const result = await caller.mutation('window.selectDirectory', {});

      expect(result).toEqual({ canceled: true, path: null });
    });
  });

  describe('selectImageFile mutation', () => {
    it('opens image picker dialog', async () => {
      const router = createWindowRouter(getWindow);
      const caller = router.createCaller({});

      const result = await caller.mutation('window.selectImageFile', {});

      expect(result).toHaveProperty('canceled', false);
      expect(result).toHaveProperty('dataUrl');
    });

    it('returns canceled when dialog is canceled', async () => {
      mockDialog.showOpenDialog = vi.fn(() =>
        Promise.resolve({
          canceled: true,
          filePaths: [],
        }),
      );

      const router = createWindowRouter(getWindow);
      const caller = router.createCaller({});

      const result = await caller.mutation('window.selectImageFile', {});

      expect(result).toEqual({ canceled: true, dataUrl: null });
    });
  });
});
