import React from 'react';
import { describe, it, expect } from 'bun:test';
import { render } from 'ink-testing-library';
import { StatusBar } from '../components/StatusBar.js';
import type { GoalRun } from '../types.js';

const makeRun = (overrides: Partial<GoalRun> = {}): GoalRun => ({
  id: 'run-1',
  goal: 'Build something',
  status: 'running',
  tasks: [],
  totalCost: 0,
  startedAt: Date.now(),
  ...overrides,
});

describe('StatusBar', () => {
  it('renders without a run', () => {
    const { lastFrame } = render(
      <StatusBar run={null} mode="standalone" connected={false} />,
    );
    expect(lastFrame()).toContain('Tasks:');
  });

  it('shows task counts', () => {
    const run = makeRun({
      tasks: [
        { id: 't1', name: 'A', agent: 'claude', status: 'completed', dependsOn: [], cost: 0, durationMs: 0, output: [] },
        { id: 't2', name: 'B', agent: 'claude', status: 'running', dependsOn: [], cost: 0, durationMs: 0, output: [] },
        { id: 't3', name: 'C', agent: 'claude', status: 'queued', dependsOn: [], cost: 0, durationMs: 0, output: [] },
      ],
    });
    const { lastFrame } = render(
      <StatusBar run={run} mode="standalone" connected={false} />,
    );
    const frame = lastFrame();
    expect(frame).toContain('1');  // completed
    expect(frame).toContain('3');  // total
  });

  it('shows cost formatted to 4 decimal places', () => {
    const run = makeRun({ totalCost: 0.0042 });
    const { lastFrame } = render(
      <StatusBar run={run} mode="standalone" connected={false} />,
    );
    expect(lastFrame()).toContain('$0.0042');
  });

  it('shows STANDALONE mode label', () => {
    const { lastFrame } = render(
      <StatusBar run={null} mode="standalone" connected={false} />,
    );
    expect(lastFrame()).toContain('[STANDALONE]');
  });

  it('shows SERVER mode label when connected', () => {
    const { lastFrame } = render(
      <StatusBar run={null} mode="server" connected={true} />,
    );
    expect(lastFrame()).toContain('[SERVER');
  });

  it('shows active agent count', () => {
    const run = makeRun({
      tasks: [
        { id: 't1', name: 'A', agent: 'claude', status: 'running', dependsOn: [], cost: 0, durationMs: 0, output: [] },
        { id: 't2', name: 'B', agent: 'codex', status: 'running', dependsOn: [], cost: 0, durationMs: 0, output: [] },
      ],
    });
    const { lastFrame } = render(
      <StatusBar run={run} mode="standalone" connected={false} />,
    );
    expect(lastFrame()).toContain('Active:');
  });

  it('shows elapsed time label', () => {
    const { lastFrame } = render(
      <StatusBar run={makeRun()} mode="standalone" connected={false} />,
    );
    expect(lastFrame()).toContain('Elapsed:');
  });
});
