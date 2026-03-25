import { describe, it, expect } from 'bun:test';
import type { TaskNode } from '../types.js';

// ---------------------------------------------------------------------------
// AgentPaneGrid logic tests — we test the filtering and layout logic
// extracted from the component since ink-testing-library is not available
// in this worktree.
// ---------------------------------------------------------------------------

const SIDE_BY_SIDE_MAX = 3;
const MIN_WIDTH_FOR_SIDE_BY_SIDE = 120;

const makeTask = (overrides: Partial<TaskNode> = {}): TaskNode => ({
  id: 'task-1',
  name: 'Implement feature',
  agent: 'claude',
  status: 'running',
  dependsOn: [],
  cost: 0,
  durationMs: 0,
  output: [],
  ...overrides,
});

/** Mirrors the active-task filter in AgentPaneGrid */
function filterActiveTasks(tasks: readonly TaskNode[]): TaskNode[] {
  return tasks.filter(
    (t) => t.status === 'running' || t.status === 'completed' || t.status === 'failed',
  );
}

/** Mirrors the layout decision logic in AgentPaneGrid */
function useSideBySide(activeTasks: readonly TaskNode[], terminalWidth: number): boolean {
  return activeTasks.length <= SIDE_BY_SIDE_MAX && terminalWidth >= MIN_WIDTH_FOR_SIDE_BY_SIDE;
}

describe('AgentPaneGrid — active task filtering', () => {
  it('returns empty for no tasks', () => {
    expect(filterActiveTasks([])).toEqual([]);
  });

  it('returns empty when all tasks are queued', () => {
    const tasks = [makeTask({ status: 'queued' }), makeTask({ id: 't2', status: 'queued' })];
    expect(filterActiveTasks(tasks)).toEqual([]);
  });

  it('includes running tasks', () => {
    const tasks = [makeTask({ status: 'running' })];
    expect(filterActiveTasks(tasks)).toHaveLength(1);
  });

  it('includes completed tasks', () => {
    const tasks = [makeTask({ status: 'completed' })];
    expect(filterActiveTasks(tasks)).toHaveLength(1);
  });

  it('includes failed tasks', () => {
    const tasks = [makeTask({ status: 'failed' })];
    expect(filterActiveTasks(tasks)).toHaveLength(1);
  });

  it('excludes skipped tasks', () => {
    const tasks = [makeTask({ status: 'skipped' })];
    expect(filterActiveTasks(tasks)).toHaveLength(0);
  });

  it('filters mixed statuses correctly', () => {
    const tasks = [
      makeTask({ id: 't1', status: 'running' }),
      makeTask({ id: 't2', status: 'queued' }),
      makeTask({ id: 't3', status: 'completed' }),
      makeTask({ id: 't4', status: 'skipped' }),
      makeTask({ id: 't5', status: 'failed' }),
    ];
    const active = filterActiveTasks(tasks);
    expect(active).toHaveLength(3);
    expect(active.map((t) => t.id)).toEqual(['t1', 't3', 't5']);
  });
});

describe('AgentPaneGrid — layout decision', () => {
  it('uses side-by-side for 1 task on wide terminal', () => {
    const tasks = [makeTask()];
    expect(useSideBySide(tasks, 120)).toBe(true);
  });

  it('uses side-by-side for 3 tasks on wide terminal', () => {
    const tasks = [makeTask({ id: 't1' }), makeTask({ id: 't2' }), makeTask({ id: 't3' })];
    expect(useSideBySide(tasks, 150)).toBe(true);
  });

  it('uses stacked for 4+ tasks', () => {
    const tasks = Array.from({ length: 4 }, (_, i) => makeTask({ id: `t${i}` }));
    expect(useSideBySide(tasks, 200)).toBe(false);
  });

  it('uses stacked for narrow terminal', () => {
    const tasks = [makeTask()];
    expect(useSideBySide(tasks, 80)).toBe(false);
  });

  it('uses stacked at boundary width 119', () => {
    const tasks = [makeTask()];
    expect(useSideBySide(tasks, 119)).toBe(false);
  });

  it('uses side-by-side at exact boundary 120', () => {
    const tasks = [makeTask()];
    expect(useSideBySide(tasks, 120)).toBe(true);
  });

  it('uses stacked for many tasks even on very wide terminal', () => {
    const tasks = Array.from({ length: 6 }, (_, i) => makeTask({ id: `t${i}` }));
    expect(useSideBySide(tasks, 300)).toBe(false);
  });
});
