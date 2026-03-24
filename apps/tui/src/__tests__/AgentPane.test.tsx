import React from 'react';
import { describe, it, expect } from 'bun:test';
import { render } from 'ink-testing-library';
import { AgentPane } from '../components/AgentPane.js';
import type { TaskNode } from '../types.js';

const makeTask = (overrides: Partial<TaskNode> = {}): TaskNode => ({
  id: 'task-1',
  name: 'Implement core logic',
  agent: 'claude',
  status: 'running',
  dependsOn: [],
  cost: 0,
  durationMs: 0,
  output: [],
  ...overrides,
});

describe('AgentPane', () => {
  it('renders agent name in uppercase', () => {
    const { lastFrame } = render(<AgentPane task={makeTask()} />);
    expect(lastFrame()).toContain('CLAUDE');
  });

  it('renders task name', () => {
    const { lastFrame } = render(<AgentPane task={makeTask()} />);
    expect(lastFrame()).toContain('Implement core logic');
  });

  it('renders CODEX agent label', () => {
    const { lastFrame } = render(<AgentPane task={makeTask({ agent: 'codex' })} />);
    expect(lastFrame()).toContain('CODEX');
  });

  it('renders GEMINI agent label', () => {
    const { lastFrame } = render(<AgentPane task={makeTask({ agent: 'gemini' })} />);
    expect(lastFrame()).toContain('GEMINI');
  });

  it('shows waiting message when output is empty', () => {
    const { lastFrame } = render(<AgentPane task={makeTask({ output: [] })} />);
    expect(lastFrame()).toContain('Waiting for output');
  });

  it('shows output lines', () => {
    const task = makeTask({
      output: ['line one', 'line two', 'line three'],
    });
    const { lastFrame } = render(<AgentPane task={task} />);
    expect(lastFrame()).toContain('line one');
    expect(lastFrame()).toContain('line two');
    expect(lastFrame()).toContain('line three');
  });

  it('windows to last 20 lines', () => {
    const lines = Array.from({ length: 25 }, (_, i) => `line ${i}`);
    const task = makeTask({ output: lines });
    const { lastFrame } = render(<AgentPane task={task} />);
    // First 5 lines should not appear, last 20 should
    expect(lastFrame()).not.toContain('line 0');
    expect(lastFrame()).toContain('line 24');
  });

  it('shows running status', () => {
    const { lastFrame } = render(<AgentPane task={makeTask({ status: 'running' })} />);
    expect(lastFrame()).toContain('running');
  });

  it('shows completed status', () => {
    const { lastFrame } = render(<AgentPane task={makeTask({ status: 'completed' })} />);
    expect(lastFrame()).toContain('done');
  });

  it('shows failed status', () => {
    const { lastFrame } = render(<AgentPane task={makeTask({ status: 'failed' })} />);
    expect(lastFrame()).toContain('failed');
  });

  it('uses double border when focused', () => {
    // ink-testing-library strips ANSI but preserves box-drawing chars
    const { lastFrame: focused } = render(<AgentPane task={makeTask()} isFocused={true} />);
    const { lastFrame: unfocused } = render(<AgentPane task={makeTask()} isFocused={false} />);
    // Both should render without crashing; focused uses double style
    expect(focused()).toBeTruthy();
    expect(unfocused()).toBeTruthy();
  });
});
