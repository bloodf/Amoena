import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { TeamCommunicationFlow } from './TeamCommunicationFlow';
import { TeamListPane } from './TeamListPane';
import type { AgentTeam } from './types';

const teams: AgentTeam[] = [
  {
    id: 'team-1',
    name: 'Runtime Team',
    description: 'Primary runtime squad',
    status: 'active',
    totalTokens: '12k',
    startedAt: 'now',
    completedTasks: 1,
    totalTasks: 2,
    agents: [
      {
        id: 'agent-1',
        name: 'Navigator',
        role: 'Lead',
        model: 'claude-4-sonnet',
        tuiColor: 'tui-claude',
        status: 'working',
        decisionWeight: 0.8,
        currentTask: 'Plan runtime patch',
        messagesExchanged: 4,
      },
      {
        id: 'agent-2',
        name: 'Verifier',
        role: 'QA',
        model: 'gpt-5',
        tuiColor: 'tui-opencode',
        status: 'waiting',
        decisionWeight: 0.4,
        currentTask: 'Wait for delta',
        messagesExchanged: 2,
      },
    ],
  },
  {
    id: 'team-2',
    name: 'Docs Team',
    description: 'Documentation and handoff',
    status: 'completed',
    totalTokens: '4k',
    startedAt: 'later',
    completedTasks: 3,
    totalTasks: 3,
    agents: [],
  },
];

describe('team list and communication flow', () => {
  test('selects teams and renders status pills for different lifecycle states', () => {
    const onSelectTeam = vi.fn(() => {});
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={onSelectTeam} />);

    fireEvent.click(screen.getByText('Docs Team'));
    expect(onSelectTeam).toHaveBeenCalledWith('team-2');
    expect(screen.getByText('completed')).toBeTruthy();
    expect(screen.getByText('Runtime Team')).toBeTruthy();
  });

  test('renders communication cards, statuses, and consensus weighting details', () => {
    render(<TeamCommunicationFlow team={teams[0]} />);

    expect(screen.getAllByText('Navigator').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Verifier').length).toBeGreaterThan(0);
    expect(screen.getByText('4 msgs')).toBeTruthy();
    expect(screen.getByText(/Weighted by decision authority/i)).toBeTruthy();
  });
});
