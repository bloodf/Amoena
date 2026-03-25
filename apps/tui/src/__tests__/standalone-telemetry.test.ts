import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import type { GoalRun, TaskNode } from '../types.js';

// ---------------------------------------------------------------------------
// We mock better-sqlite3 since it's a native module that may not be available.
// The standalone-telemetry module lazy-loads it via require(), so we test
// the public API (persistGoalRun, loadRecentRuns) with the native module
// unavailable — which exercises the graceful fallback paths.
// ---------------------------------------------------------------------------

const makeTask = (overrides: Partial<TaskNode> = {}): TaskNode => ({
  id: 'task-1',
  name: 'Implement feature',
  agent: 'claude',
  status: 'completed',
  dependsOn: [],
  cost: 0.003,
  durationMs: 1500,
  output: [],
  ...overrides,
});

const makeRun = (overrides: Partial<GoalRun> = {}): GoalRun => ({
  id: 'run-1',
  goal: 'Build a web app',
  status: 'completed',
  tasks: [makeTask()],
  totalCost: 0.003,
  startedAt: Date.now() - 5000,
  finishedAt: Date.now(),
  ...overrides,
});

describe('persistGoalRun', () => {
  it('does not throw when better-sqlite3 is unavailable', async () => {
    const { persistGoalRun } = await import('../engine/standalone-telemetry.js');
    // When no native module, it should silently return
    expect(() => persistGoalRun(makeRun())).not.toThrow();
  });

  it('handles run without finishedAt', async () => {
    const { persistGoalRun } = await import('../engine/standalone-telemetry.js');
    const run = makeRun({ finishedAt: undefined });
    expect(() => persistGoalRun(run)).not.toThrow();
  });

  it('handles run with no tasks', async () => {
    const { persistGoalRun } = await import('../engine/standalone-telemetry.js');
    const run = makeRun({ tasks: [] });
    expect(() => persistGoalRun(run)).not.toThrow();
  });

  it('handles run with multiple tasks', async () => {
    const { persistGoalRun } = await import('../engine/standalone-telemetry.js');
    const run = makeRun({
      tasks: [
        makeTask({ id: 't1', name: 'Plan' }),
        makeTask({ id: 't2', name: 'Build' }),
        makeTask({ id: 't3', name: 'Test' }),
      ],
    });
    expect(() => persistGoalRun(run)).not.toThrow();
  });

  it('handles run with failed status', async () => {
    const { persistGoalRun } = await import('../engine/standalone-telemetry.js');
    const run = makeRun({ status: 'failed' });
    expect(() => persistGoalRun(run)).not.toThrow();
  });
});

describe('loadRecentRuns', () => {
  it('returns empty array when better-sqlite3 is unavailable', async () => {
    const { loadRecentRuns } = await import('../engine/standalone-telemetry.js');
    const runs = loadRecentRuns();
    expect(runs).toEqual([]);
  });

  it('accepts custom limit parameter', async () => {
    const { loadRecentRuns } = await import('../engine/standalone-telemetry.js');
    const runs = loadRecentRuns(5);
    expect(runs).toEqual([]);
  });

  it('returns empty array with default limit', async () => {
    const { loadRecentRuns } = await import('../engine/standalone-telemetry.js');
    const runs = loadRecentRuns();
    expect(Array.isArray(runs)).toBe(true);
    expect(runs).toHaveLength(0);
  });
});
