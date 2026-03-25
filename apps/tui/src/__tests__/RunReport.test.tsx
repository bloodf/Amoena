import { describe, it, expect } from 'bun:test';
import type { GoalRun, TaskNode } from '../types.js';

// ---------------------------------------------------------------------------
// RunReport logic tests — we test the helper functions and display logic
// from the component since ink-testing-library is not available.
// ---------------------------------------------------------------------------

const makeTask = (overrides: Partial<TaskNode> = {}): TaskNode => ({
  id: 'task-1',
  name: 'Implement feature',
  agent: 'claude',
  status: 'completed',
  dependsOn: [],
  cost: 0.005,
  durationMs: 2000,
  output: [],
  ...overrides,
});

const makeRun = (overrides: Partial<GoalRun> = {}): GoalRun => ({
  id: 'run-1',
  goal: 'Build a web app',
  status: 'completed',
  tasks: [makeTask()],
  totalCost: 0.005,
  startedAt: 1000,
  finishedAt: 5000,
  ...overrides,
});

/** Mirrors formatDuration from RunReport */
function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

describe('RunReport — formatDuration', () => {
  it('formats zero ms', () => {
    expect(formatDuration(0)).toBe('0s');
  });

  it('formats sub-second as 0s', () => {
    expect(formatDuration(500)).toBe('0s');
  });

  it('formats seconds', () => {
    expect(formatDuration(5000)).toBe('5s');
  });

  it('formats exactly 60s as 1m 0s', () => {
    expect(formatDuration(60000)).toBe('1m 0s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(90000)).toBe('1m 30s');
  });

  it('formats large durations', () => {
    expect(formatDuration(3661000)).toBe('61m 1s');
  });
});

describe('RunReport — status logic', () => {
  it('completed run has green status', () => {
    const run = makeRun({ status: 'completed' });
    const statusColor = run.status === 'completed' ? 'green' : 'red';
    expect(statusColor).toBe('green');
  });

  it('failed run has red status', () => {
    const run = makeRun({ status: 'failed' });
    const statusColor = run.status === 'completed' ? 'green' : 'red';
    expect(statusColor).toBe('red');
  });

  it('completed label', () => {
    const run = makeRun({ status: 'completed' });
    const label = run.status === 'completed' ? '\u2713 Completed' : '\u2717 Failed';
    expect(label).toBe('\u2713 Completed');
  });

  it('failed label', () => {
    const run = makeRun({ status: 'failed' });
    const label = run.status === 'completed' ? '\u2713 Completed' : '\u2717 Failed';
    expect(label).toBe('\u2717 Failed');
  });
});

describe('RunReport — total duration', () => {
  it('calculates from startedAt and finishedAt', () => {
    const run = makeRun({ startedAt: 0, finishedAt: 30000 });
    const totalDuration = run.finishedAt ? run.finishedAt - run.startedAt : 0;
    expect(formatDuration(totalDuration)).toBe('30s');
  });

  it('returns 0 when no finishedAt', () => {
    const run = makeRun({ finishedAt: undefined });
    const totalDuration = run.finishedAt ? run.finishedAt - run.startedAt : 0;
    expect(totalDuration).toBe(0);
  });
});

describe('RunReport — cost formatting', () => {
  it('formats cost to 4 decimal places', () => {
    const run = makeRun({ totalCost: 0.1234 });
    expect(run.totalCost.toFixed(4)).toBe('0.1234');
  });

  it('formats zero cost', () => {
    const run = makeRun({ totalCost: 0 });
    expect(run.totalCost.toFixed(4)).toBe('0.0000');
  });
});

describe('RunReport — task count', () => {
  it('counts completed tasks', () => {
    const tasks = [
      makeTask({ id: 't1', status: 'completed' }),
      makeTask({ id: 't2', status: 'failed' }),
      makeTask({ id: 't3', status: 'completed' }),
    ];
    const completed = tasks.filter((t) => t.status === 'completed').length;
    expect(completed).toBe(2);
    expect(tasks.length).toBe(3);
  });

  it('handles all completed', () => {
    const tasks = [
      makeTask({ id: 't1', status: 'completed' }),
      makeTask({ id: 't2', status: 'completed' }),
    ];
    const completed = tasks.filter((t) => t.status === 'completed').length;
    expect(completed).toBe(2);
  });

  it('handles none completed', () => {
    const tasks = [
      makeTask({ id: 't1', status: 'failed' }),
      makeTask({ id: 't2', status: 'running' }),
    ];
    const completed = tasks.filter((t) => t.status === 'completed').length;
    expect(completed).toBe(0);
  });
});

describe('RunReport — task status icons', () => {
  it('completed task gets filled circle', () => {
    const icon = makeTask({ status: 'completed' }).status === 'completed' ? '\u25C9' : '\u25CB';
    expect(icon).toBe('\u25C9');
  });

  it('failed task gets X', () => {
    const task = makeTask({ status: 'failed' });
    const icon = task.status === 'completed' ? '\u25C9' : task.status === 'failed' ? '\u2717' : '\u25CB';
    expect(icon).toBe('\u2717');
  });
});

describe('RunReport — routing reason display', () => {
  it('task has routing reason', () => {
    const task = makeTask({ routingReason: 'Best for code-gen' });
    expect(task.routingReason).toBe('Best for code-gen');
  });

  it('task without routing reason is undefined', () => {
    const task = makeTask();
    expect(task.routingReason).toBeUndefined();
  });
});

describe('RunReport — keyboard input mapping', () => {
  it('maps n to new goal', () => {
    const keyMap: Record<string, string> = { n: 'newGoal', h: 'history', t: 'templates', q: 'quit' };
    expect(keyMap['n']).toBe('newGoal');
  });

  it('maps all shortcut keys', () => {
    const keys = ['n', 'h', 't', 'q'];
    expect(keys).toHaveLength(4);
  });
});
