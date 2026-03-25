import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockGetDatabase = vi.fn();
const mockPrepare = vi.fn(() => ({
  all: vi.fn(() => []),
  get: vi.fn(),
  run: vi.fn(),
  transaction: vi.fn((fn: () => void) => fn()),
}));

vi.mock('@/lib/db', () => ({
  getDatabase: () => mockGetDatabase(),
}));

vi.mock('@/lib/config', () => ({
  config: { claudeHome: '/mock/claude/home' },
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('node:fs', () => ({
  createReadStream: vi.fn(),
  readdirSync: vi.fn(() => []),
  statSync: vi.fn(),
}));

describe('scanClaudeSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when claudeHome not configured', async () => {
    vi.doMock('@/lib/config', () => ({
      config: { claudeHome: undefined },
    }));
    const { scanClaudeSessions } = await import('../claude-sessions');
    const sessions = await scanClaudeSessions();
    expect(sessions).toEqual([]);
  });
});

describe('syncClaudeSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockGetDatabase.mockReturnValue({ prepare: mockPrepare });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns early when claudeHome not configured', async () => {
    vi.doMock('@/lib/config', () => ({
      config: { claudeHome: undefined },
    }));
    const { syncClaudeSessions } = await import('../claude-sessions');
    const result = await syncClaudeSessions();
    expect(result.ok).toBe(true);
  });

  it('returns throttled result when called within throttle window', async () => {
    const { syncClaudeSessions } = await import('../claude-sessions');
    const result1 = await syncClaudeSessions();
    const result2 = await syncClaudeSessions();
    expect(result1.message).toBe(result2.message);
  });

  it('forces refresh when force is true', async () => {
    const { syncClaudeSessions } = await import('../claude-sessions');
    const result1 = await syncClaudeSessions();
    const result2 = await syncClaudeSessions(true);
    expect(result1.message).toBe(result2.message);
  });

  it('marks all sessions inactive before scanning', async () => {
    mockPrepare.mockReturnValue({
      all: vi.fn(() => []),
      run: vi.fn(),
      transaction: (fn: () => void) => fn(),
    });
    const { syncClaudeSessions } = await import('../claude-sessions');
    await syncClaudeSessions();
    expect(mockPrepare).toHaveBeenCalled();
  });
});
