import React from 'react';
import { describe, it, expect } from 'bun:test';
import { render } from 'ink-testing-library';
import { TaskDag } from '../components/TaskDag.js';
import type { TaskNode } from '../types.js';

const makeTask = (overrides: Partial<TaskNode> = {}): TaskNode => ({
  id: 'task-1',
  name: 'Plan & research',
  agent: 'claude',
  status: 'queued',
  dependsOn: [],
  cost: 0,
  durationMs: 0,
  output: [],
  ...overrides,
});

describe('TaskDag', () => {
  it('shows waiting message when no tasks', () => {
    const { lastFrame } = render(<TaskDag tasks={[]} />);
    expect(lastFrame()).toContain('Waiting for tasks');
  });

  it('renders task graph header', () => {
    const { lastFrame } = render(<TaskDag tasks={[makeTask()]} />);
    expect(lastFrame()).toContain('Task Graph');
  });

  it('renders task name', () => {
    const { lastFrame } = render(<TaskDag tasks={[makeTask()]} />);
    expect(lastFrame()).toContain('Plan & research');
  });

  it('renders agent name', () => {
    const { lastFrame } = render(<TaskDag tasks={[makeTask({ agent: 'codex' })]} />);
    expect(lastFrame()).toContain('[codex]');
  });

  it('shows completed status icon for completed task', () => {
    const { lastFrame } = render(
      <TaskDag tasks={[makeTask({ status: 'completed' })]} />,
    );
    expect(lastFrame()).toContain('◉');
  });

  it('shows running status icon for running task', () => {
    const { lastFrame } = render(
      <TaskDag tasks={[makeTask({ status: 'running' })]} />,
    );
    expect(lastFrame()).toContain('⟳');
  });

  it('shows failed status icon for failed task', () => {
    const { lastFrame } = render(
      <TaskDag tasks={[makeTask({ status: 'failed' })]} />,
    );
    expect(lastFrame()).toContain('✗');
  });

  it('shows queued status icon for queued task', () => {
    const { lastFrame } = render(
      <TaskDag tasks={[makeTask({ status: 'queued' })]} />,
    );
    expect(lastFrame()).toContain('◌');
  });

  it('shows cost for completed tasks with cost > 0', () => {
    const { lastFrame } = render(
      <TaskDag tasks={[makeTask({ status: 'completed', cost: 0.0023 })]} />,
    );
    expect(lastFrame()).toContain('$0.0023');
  });

  it('renders multiple tasks', () => {
    const tasks: TaskNode[] = [
      makeTask({ id: 't1', name: 'Task A' }),
      makeTask({ id: 't2', name: 'Task B', dependsOn: ['t1'] }),
    ];
    const { lastFrame } = render(<TaskDag tasks={tasks} />);
    expect(lastFrame()).toContain('Task A');
    expect(lastFrame()).toContain('Task B');
  });
});
