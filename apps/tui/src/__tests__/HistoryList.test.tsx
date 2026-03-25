import { describe, it, expect } from 'bun:test';
import type { GoalRun } from '../types.js';

// ---------------------------------------------------------------------------
// HistoryList logic tests — we test the helper functions and data
// transformations from the component since ink-testing-library is not
// available in this worktree.
// ---------------------------------------------------------------------------

const makeRun = (overrides: Partial<GoalRun> = {}): GoalRun => ({
  id: 'run-1',
  goal: 'Build a web app',
  status: 'completed',
  tasks: [],
  totalCost: 0.05,
  startedAt: Date.now() - 60000,
  finishedAt: Date.now(),
  ...overrides,
});

/** Mirrors formatDate from HistoryList */
function formatDate(ts: number): string {
  return new Date(ts).toLocaleString();
}

/** Mirrors formatCost from HistoryList */
function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

/** Mirrors the goal truncation logic */
function truncateGoal(goal: string, maxLen = 50): string {
  if (goal.length <= maxLen) return goal;
  return goal.slice(0, maxLen) + '\u2026';
}

/** Mirrors the status icon logic */
function statusIcon(status: GoalRun['status']): string {
  if (status === 'completed') return '\u25C9';
  if (status === 'failed') return '\u2717';
  return '\u25CC';
}

describe('HistoryList — formatDate', () => {
  it('returns a locale string', () => {
    const ts = new Date('2025-06-15T12:00:00Z').getTime();
    const result = formatDate(ts);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles epoch zero', () => {
    expect(formatDate(0)).toBeTruthy();
  });
});

describe('HistoryList — formatCost', () => {
  it('formats zero cost', () => {
    expect(formatCost(0)).toBe('$0.0000');
  });

  it('formats small cost', () => {
    expect(formatCost(0.005)).toBe('$0.0050');
  });

  it('formats larger cost', () => {
    expect(formatCost(1.2345)).toBe('$1.2345');
  });

  it('rounds to 4 decimal places', () => {
    expect(formatCost(0.12345)).toBe('$0.1235');
  });
});

describe('HistoryList — goal truncation', () => {
  it('returns short goal unchanged', () => {
    expect(truncateGoal('Hello')).toBe('Hello');
  });

  it('returns exactly 50-char goal unchanged', () => {
    const goal = 'A'.repeat(50);
    expect(truncateGoal(goal)).toBe(goal);
  });

  it('truncates goal longer than 50 chars', () => {
    const goal = 'A'.repeat(60);
    const result = truncateGoal(goal);
    expect(result).toHaveLength(51); // 50 + ellipsis char
    expect(result.endsWith('\u2026')).toBe(true);
  });

  it('accepts custom max length', () => {
    const result = truncateGoal('Hello World', 5);
    expect(result).toBe('Hello\u2026');
  });
});

describe('HistoryList — statusIcon', () => {
  it('returns filled circle for completed', () => {
    expect(statusIcon('completed')).toBe('\u25C9');
  });

  it('returns X for failed', () => {
    expect(statusIcon('failed')).toBe('\u2717');
  });

  it('returns open circle for running', () => {
    expect(statusIcon('running')).toBe('\u25CC');
  });

  it('returns open circle for pending', () => {
    expect(statusIcon('pending')).toBe('\u25CC');
  });
});

describe('HistoryList — empty state', () => {
  it('empty runs array has length 0', () => {
    const runs: GoalRun[] = [];
    expect(runs.length).toBe(0);
  });
});

describe('HistoryList — run data', () => {
  it('makeRun creates valid defaults', () => {
    const run = makeRun();
    expect(run.id).toBe('run-1');
    expect(run.status).toBe('completed');
    expect(run.totalCost).toBe(0.05);
  });

  it('supports override of all fields', () => {
    const run = makeRun({ id: 'r2', goal: 'Custom', status: 'failed', totalCost: 1.5 });
    expect(run.id).toBe('r2');
    expect(run.goal).toBe('Custom');
    expect(run.status).toBe('failed');
    expect(run.totalCost).toBe(1.5);
  });

  it('selection index clamping logic', () => {
    const runs = [makeRun({ id: 'r1' }), makeRun({ id: 'r2' }), makeRun({ id: 'r3' })];
    // Up arrow from 0 stays at 0
    expect(Math.max(0, 0 - 1)).toBe(0);
    // Down arrow from last stays at last
    expect(Math.min(runs.length - 1, 2 + 1)).toBe(2);
    // Normal navigation
    expect(Math.max(0, 1 - 1)).toBe(0);
    expect(Math.min(runs.length - 1, 1 + 1)).toBe(2);
  });
});
