import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockGetDatabase = vi.fn();
const mockPrepare = vi.fn(() => ({
  all: vi.fn(() => []),
  get: vi.fn(),
  run: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getDatabase: () => mockGetDatabase(),
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

describe('github-sync-poller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDatabase.mockReturnValue({ prepare: mockPrepare });
  });

  describe('startSyncPoller', () => {
    it('starts the poller interval', async () => {
      const { startSyncPoller } = await import('../github-sync-poller');
      startSyncPoller();
      expect(mockPrepare).toHaveBeenCalled();
    });

    it('is idempotent (does not start twice)', async () => {
      const { startSyncPoller } = await import('../github-sync-poller');
      startSyncPoller();
      startSyncPoller();
      expect(mockPrepare).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopSyncPoller', () => {
    it('clears the interval when called after start', async () => {
      const { startSyncPoller, stopSyncPoller } = await import('../github-sync-poller');
      startSyncPoller();
      stopSyncPoller();
      expect(mockPrepare).toHaveBeenCalled();
    });

    it('handles stop without start gracefully', async () => {
      const { stopSyncPoller } = await import('../github-sync-poller');
      expect(() => stopSyncPoller()).not.toThrow();
    });
  });

  describe('getSyncPollerStatus', () => {
    it('returns correct initial status', async () => {
      const { getSyncPollerStatus } = await import('../github-sync-poller');
      const status = getSyncPollerStatus();
      expect(status).toHaveProperty('running');
      expect(status).toHaveProperty('interval');
      expect(typeof status.running).toBe('boolean');
      expect(typeof status.interval).toBe('number');
    });
  });
});
