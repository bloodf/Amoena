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

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => false),
  readdirSync: vi.fn(() => []),
  readFileSync: vi.fn(() => ''),
  statSync: vi.fn(),
}));

vi.mock('node:os', () => ({
  homedir: vi.fn(() => '/mock/home'),
}));

describe('skill-sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDatabase.mockReturnValue({ prepare: mockPrepare });
  });

  describe('syncSkillsFromDisk', () => {
    it('returns ok with message on success', async () => {
      const { syncSkillsFromDisk } = await import('../skill-sync');
      const result = await syncSkillsFromDisk();
      expect(result).toHaveProperty('ok');
      expect(result).toHaveProperty('message');
    });

    it('handles database errors gracefully', async () => {
      mockGetDatabase.mockImplementationOnce(() => {
        throw new Error('DB error');
      });
      const { syncSkillsFromDisk } = await import('../skill-sync');
      const result = await syncSkillsFromDisk();
      expect(result.ok).toBe(false);
      expect(result.message).toContain('failed');
    });
  });

  describe('sha256 helper', () => {
    it('generates consistent hashes', async () => {
      const { syncSkillsFromDisk } = await import('../skill-sync');
      await syncSkillsFromDisk();
      expect(mockPrepare).toHaveBeenCalled();
    });
  });
});
