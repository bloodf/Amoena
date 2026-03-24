import React from 'react';
import { describe, it, expect, mock } from 'bun:test';
import { render } from 'ink-testing-library';
import { GoalInput } from '../components/GoalInput.js';

describe('GoalInput', () => {
  it('renders the prompt text', () => {
    const { lastFrame } = render(
      <GoalInput
        mode="standalone"
        availableAgents={['claude']}
        onSubmit={mock()}
        onSwitchToTemplates={mock()}
      />,
    );
    expect(lastFrame()).toContain('What should your agents build today?');
  });

  it('shows STANDALONE mode indicator', () => {
    const { lastFrame } = render(
      <GoalInput
        mode="standalone"
        availableAgents={[]}
        onSubmit={mock()}
        onSwitchToTemplates={mock()}
      />,
    );
    expect(lastFrame()).toContain('[STANDALONE]');
  });

  it('shows SERVER mode indicator', () => {
    const { lastFrame } = render(
      <GoalInput
        mode="server"
        availableAgents={['claude']}
        onSubmit={mock()}
        onSwitchToTemplates={mock()}
      />,
    );
    expect(lastFrame()).toContain('[SERVER]');
  });

  it('shows available agents', () => {
    const { lastFrame } = render(
      <GoalInput
        mode="standalone"
        availableAgents={['claude', 'codex']}
        onSubmit={mock()}
        onSwitchToTemplates={mock()}
      />,
    );
    expect(lastFrame()).toContain('Claude (Anthropic)');
    expect(lastFrame()).toContain('Codex (OpenAI)');
  });

  it('shows message when no agents available', () => {
    const { lastFrame } = render(
      <GoalInput
        mode="standalone"
        availableAgents={[]}
        onSubmit={mock()}
        onSwitchToTemplates={mock()}
      />,
    );
    expect(lastFrame()).toContain('No agents available');
  });

  it('shows keyboard shortcuts hint', () => {
    const { lastFrame } = render(
      <GoalInput
        mode="standalone"
        availableAgents={[]}
        onSubmit={mock()}
        onSwitchToTemplates={mock()}
      />,
    );
    expect(lastFrame()).toContain('Tab: templates');
    expect(lastFrame()).toContain('Enter: submit');
  });
});
