import { describe, expect, it, vi } from 'vitest';
import { EventEmitter } from 'node:events';

const mockBrowserManager = Object.assign(new EventEmitter(), {
  register: vi.fn(() => {}),
  unregister: vi.fn(() => {}),
  navigate: vi.fn(() => {}),
  getWebContents: vi.fn(() => ({
    canGoBack: () => true,
    canGoForward: () => true,
    goBack: vi.fn(() => {}),
    goForward: vi.fn(() => {}),
    reload: vi.fn(() => {}),
    reloadIgnoringCache: vi.fn(() => {}),
    getURL: () => 'https://example.com',
    getTitle: () => 'Example',
    isLoading: () => false,
  })),
  screenshot: vi.fn(() => Promise.resolve('base64screenshot')),
  evaluateJS: vi.fn(() => Promise.resolve({ result: 'success' })),
  getConsoleLogs: vi.fn(() => [{ level: 'log', message: 'test', timestamp: Date.now() }]),
  openDevTools: vi.fn(() => {}),
  getDevToolsUrl: vi.fn(() => Promise.resolve('devtools://test')),
});

vi.mock('main/lib/browser/browser-manager', () => ({
  browserManager: mockBrowserManager,
}));

vi.mock('electron', () => ({
  session: {
    fromPartition: () => ({
      clearStorageData: vi.fn(() => Promise.resolve()),
      clearCache: vi.fn(() => Promise.resolve()),
    }),
  },
}));

const { createBrowserRouter } = await import('./browser');

describe('browser router', () => {
  it('creates a router with expected shape', () => {
    const router = createBrowserRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe('object');
  });

  describe('register mutation', () => {
    it('registers a browser pane', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('browser.register', {
        paneId: 'pane-1',
        webContentsId: 123,
      });

      expect(result).toEqual({ success: true });
      expect(mockBrowserManager.register).toHaveBeenCalledWith('pane-1', 123);
    });
  });

  describe('unregister mutation', () => {
    it('unregisters a browser pane', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('browser.unregister', {
        paneId: 'pane-1',
      });

      expect(result).toEqual({ success: true });
      expect(mockBrowserManager.unregister).toHaveBeenCalledWith('pane-1');
    });
  });

  describe('navigate mutation', () => {
    it('navigates to a URL', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('browser.navigate', {
        paneId: 'pane-1',
        url: 'https://example.com',
      });

      expect(result).toEqual({ success: true });
      expect(mockBrowserManager.navigate).toHaveBeenCalledWith('pane-1', 'https://example.com');
    });
  });

  describe('goBack mutation', () => {
    it('goes back in browser history', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('browser.goBack', {
        paneId: 'pane-1',
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe('goForward mutation', () => {
    it('goes forward in browser history', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('browser.goForward', {
        paneId: 'pane-1',
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe('reload mutation', () => {
    it('reloads the page', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('browser.reload', {
        paneId: 'pane-1',
      });

      expect(result).toEqual({ success: true });
    });

    it('hard reloads when specified', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('browser.reload', {
        paneId: 'pane-1',
        hard: true,
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe('screenshot mutation', () => {
    it('returns base64 screenshot', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('browser.screenshot', {
        paneId: 'pane-1',
      });

      expect(result).toHaveProperty('base64');
      expect(mockBrowserManager.screenshot).toHaveBeenCalledWith('pane-1');
    });
  });

  describe('evaluateJS mutation', () => {
    it('evaluates JavaScript in the page', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('browser.evaluateJS', {
        paneId: 'pane-1',
        code: 'document.title',
      });

      expect(result).toHaveProperty('result');
    });
  });

  describe('getConsoleLogs query', () => {
    it('returns console logs for a pane', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.query('browser.getConsoleLogs', {
        paneId: 'pane-1',
      });

      expect(Array.isArray(result)).toBe(true);
      expect(mockBrowserManager.getConsoleLogs).toHaveBeenCalledWith('pane-1');
    });
  });

  describe('getPageInfo query', () => {
    it('returns page information', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.query('browser.getPageInfo', {
        paneId: 'pane-1',
      });

      expect(result).toBeTruthy();
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('canGoBack');
      expect(result).toHaveProperty('canGoForward');
      expect(result).toHaveProperty('isLoading');
    });

    it('returns null for unknown pane', async () => {
      mockBrowserManager.getWebContents = vi.fn(() => null);

      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.query('browser.getPageInfo', {
        paneId: 'unknown-pane',
      });

      expect(result).toBeNull();
    });
  });

  describe('clearBrowsingData mutation', () => {
    it('clears cookies', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('browser.clearBrowsingData', {
        type: 'cookies',
      });

      expect(result).toEqual({ success: true });
    });

    it('clears cache', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('browser.clearBrowsingData', {
        type: 'cache',
      });

      expect(result).toEqual({ success: true });
    });

    it('clears storage', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('browser.clearBrowsingData', {
        type: 'storage',
      });

      expect(result).toEqual({ success: true });
    });

    it('clears all data', async () => {
      const router = createBrowserRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('browser.clearBrowsingData', {
        type: 'all',
      });

      expect(result).toEqual({ success: true });
    });
  });
});
