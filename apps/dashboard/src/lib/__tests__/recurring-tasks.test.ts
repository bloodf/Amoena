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

vi.mock('@/lib/schedule-parser', () => ({
  isCronDue: vi.fn(() => false),
}));

describe('recurring-tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDatabase.mockReturnValue({ prepare: mockPrepare });
  });

  describe('spawnRecurringTasks', () => {
    it('returns ok: true with message when no templates exist', async () => {
      const { spawnRecurringTasks } = await import('../recurring-tasks');
      const result = await spawnRecurringTasks();
      expect(result.ok).toBe(true);
    });

    it('handles database errors gracefully', async () => {
      mockGetDatabase.mockImplementationOnce(() => {
        throw new Error('DB error');
      });
      const { spawnRecurringTasks } = await import('../recurring-tasks');
      const result = await spawnRecurringTasks();
      expect(result.ok).toBe(false);
      expect(result.message).toContain('failed');
    });
  });

  describe('formatDateSuffix', () => {
    it('returns formatted date string', async () => {
      const { formatDateSuffix } = await import('../recurring-tasks');
      const result = formatDateSuffix();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{2}$/);
    });
  });
});
