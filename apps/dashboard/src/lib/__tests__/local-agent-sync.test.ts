import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockGetDatabase = vi.fn();
const mockLogAuditEvent = vi.fn();
const mockPrepare = vi.fn(() => ({
  all: vi.fn(() => []),
  get: vi.fn(),
  run: vi.fn(),
  transaction: vi.fn((fn: () => void) => fn()),
}));

vi.mock('@/lib/db', () => ({
  getDatabase: () => mockGetDatabase(),
  logAuditEvent: mockLogAuditEvent,
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => false),
  readdirSync: vi.fn(() => []),
  readFileSync: vi.fn(() => ''),
  statSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

describe('local-agent-sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDatabase.mockReturnValue({ prepare: mockPrepare });
  });

  describe('syncLocalAgents', () => {
    it('returns ok with message on success', async () => {
      const { syncLocalAgents } = await import('../local-agent-sync');
      const result = await syncLocalAgents();
      expect(result).toHaveProperty('ok');
      expect(result).toHaveProperty('message');
    });

    it('handles database errors gracefully', async () => {
      mockGetDatabase.mockImplementationOnce(() => {
        throw new Error('DB error');
      });
      const { syncLocalAgents } = await import('../local-agent-sync');
      const result = await syncLocalAgents();
      expect(result.ok).toBe(false);
      expect(result.message).toContain('failed');
    });
  });

  describe('writeLocalAgentSoul', () => {
    it('writes soul content to disk', async () => {
      const { writeLocalAgentSoul } = await import('../local-agent-sync');
      expect(() => writeLocalAgentSoul('/test/dir', 'soul content')).not.toThrow();
    });
  });
});
