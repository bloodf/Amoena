import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { TeamListPane } from './TeamListPane';
import type { AgentTeam } from './types';

const teams: AgentTeam[] = [
  {
    id: 'team-1',
    name: 'Auth Squad',
    description: 'Handles authentication refactoring',
    status: 'active',
    agents: [
      {
        id: 'a1',
        name: 'Claude',
        role: 'Lead',
        model: 'claude-4',
        tuiColor: '#FF0000',
        status: 'working',
      },
      {
        id: 'a2',
        name: 'Gemini',
        role: 'Worker',
        model: 'gemini-2',
        tuiColor: '#00FF00',
        status: 'idle',
      },
    ],
    totalTokens: '12.5k',
    startedAt: '2025-01-01T00:00:00Z',
    completedTasks: 3,
    totalTasks: 10,
  },
  {
    id: 'team-2',
    name: 'API Team',
    description: 'Building API endpoints',
    status: 'paused',
    agents: [
      {
        id: 'a3',
        name: 'GPT',
        role: 'Developer',
        model: 'gpt-5',
        tuiColor: '#0000FF',
        status: 'paused',
      },
    ],
    totalTokens: '8.2k',
    startedAt: '2025-01-02T00:00:00Z',
    completedTasks: 5,
    totalTasks: 5,
  },
];

describe('TeamListPane', () => {
  test('renders the Agent Teams heading', () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={vi.fn(() => {})} />);
    expect(screen.getByText('Agent teams')).toBeTruthy();
  });

  test('renders all team names', () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={vi.fn(() => {})} />);
    expect(screen.getByText('Auth Squad')).toBeTruthy();
    expect(screen.getByText('API Team')).toBeTruthy();
  });

  test('renders team descriptions', () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={vi.fn(() => {})} />);
    expect(screen.getByText('Handles authentication refactoring')).toBeTruthy();
    expect(screen.getByText('Building API endpoints')).toBeTruthy();
  });

  test('renders team status badges', () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={vi.fn(() => {})} />);
    expect(screen.getByText('active')).toBeTruthy();
    expect(screen.getByText('paused')).toBeTruthy();
  });

  test('shows agent count for each team', () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={vi.fn(() => {})} />);
    expect(screen.getByText('2 agents')).toBeTruthy();
    expect(screen.getByText('1 agents')).toBeTruthy();
  });

  test('shows token usage for each team', () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={vi.fn(() => {})} />);
    expect(screen.getByText('12.5k')).toBeTruthy();
    expect(screen.getByText('8.2k')).toBeTruthy();
  });

  test('shows task progress text', () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={vi.fn(() => {})} />);
    expect(screen.getByText('3/10 tasks')).toBeTruthy();
    expect(screen.getByText('5/5 tasks')).toBeTruthy();
  });

  test('marks selected team with aria-selected', () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={vi.fn(() => {})} />);
    const options = screen.getAllByRole('option');
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    expect(options[1].getAttribute('aria-selected')).toBe('false');
  });

  test('calls onSelectTeam when a team is clicked', () => {
    const onSelectTeam = vi.fn((_id: string) => {});
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={onSelectTeam} />);
    fireEvent.click(screen.getByText('API Team'));
    expect(onSelectTeam).toHaveBeenCalledWith('team-2');
  });

  test('renders New Team button', () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={vi.fn(() => {})} />);
    expect(screen.getByLabelText('Create new team')).toBeTruthy();
  });

  test('renders the navigation landmark', () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={vi.fn(() => {})} />);
    expect(screen.getByRole('navigation', { name: 'Agent teams' })).toBeTruthy();
  });

  test('renders empty list gracefully', () => {
    render(<TeamListPane teams={[]} selectedTeamId="" onSelectTeam={vi.fn(() => {})} />);
    expect(screen.getByText('Agent teams')).toBeTruthy();
  });
});
