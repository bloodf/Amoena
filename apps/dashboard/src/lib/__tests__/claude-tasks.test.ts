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

describe('scanClaudeCodeTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty result when claudeHome not configured', async () => {
    vi.doMock('@/lib/config', () => ({
      config: { claudeHome: undefined },
    }));
    const { scanClaudeCodeTasks } = await import('../claude-tasks');
    const result = scanClaudeCodeTasks();
    expect(result.teams).toEqual([]);
    expect(result.tasks).toEqual([]);
  });

  it('returns empty arrays when no teams directory', async () => {
    const { scanClaudeCodeTasks } = await import('../claude-tasks');
    const result = scanClaudeCodeTasks();
    expect(Array.isArray(result.teams)).toBe(true);
    expect(Array.isArray(result.tasks)).toBe(true);
  });
});

describe('getClaudeCodeTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns cached result when called within throttle window', async () => {
    const { getClaudeCodeTasks } = await import('../claude-tasks');
    const result1 = getClaudeCodeTasks();
    const result2 = getClaudeCodeTasks();
    expect(result1).toBe(result2);
  });

  it('forces refresh when force is true', async () => {
    const { getClaudeCodeTasks } = await import('../claude-tasks');
    const result1 = getClaudeCodeTasks();
    const result2 = getClaudeCodeTasks(true);
    expect(result1).toEqual(result2);
  });
});

describe('safeParse', () => {
  it('returns null for invalid JSON', async () => {
    const { safeParse } = await import('../claude-tasks');
    const result = safeParse<{ key: string }>('/nonexistent/path.json');
    expect(result).toBeNull();
  });
});
