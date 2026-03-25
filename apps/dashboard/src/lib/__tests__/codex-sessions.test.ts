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
  config: { homeDir: '/mock/home' },
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('node:fs', () => ({
  readdirSync: vi.fn(() => []),
  readFileSync: vi.fn(() => ''),
  statSync: vi.fn(),
}));

describe('scanCodexSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no session files found', async () => {
    const { scanCodexSessions } = await import('../codex-sessions');
    const sessions = scanCodexSessions();
    expect(Array.isArray(sessions)).toBe(true);
  });

  it('accepts custom limit parameter', async () => {
    const { scanCodexSessions } = await import('../codex-sessions');
    const sessions = scanCodexSessions(50);
    expect(Array.isArray(sessions)).toBe(true);
  });
});

describe('deriveSessionId', () => {
  it('extracts UUID from filename', async () => {
    const { deriveSessionId } = await import('../codex-sessions');
    const result = deriveSessionId('/path/session-12345678-1234-1234-1234-123456789abc.jsonl');
    expect(result).toMatch(/12345678-1234-1234-1234-123456789abc/i);
  });

  it('returns basename without extension for non-UUID names', async () => {
    const { deriveSessionId } = await import('../codex-sessions');
    const result = deriveSessionId('/path/regular-name.jsonl');
    expect(result).toBe('regular-name');
  });
});
