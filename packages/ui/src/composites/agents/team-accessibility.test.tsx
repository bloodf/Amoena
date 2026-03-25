import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'bun:test';
import { TeamListPane } from './TeamListPane';
import type { AgentTeam } from './types';

const sampleTeams: AgentTeam[] = [
  {
    id: 'team-1',
    name: 'Alpha',
    description: 'Primary team',
    status: 'active',
    agents: [],
    totalTokens: '12k',
    completedTasks: 3,
    totalTasks: 5,
  },
  {
    id: 'team-2',
    name: 'Beta',
    description: 'Secondary team',
    status: 'paused',
    agents: [],
    totalTokens: '8k',
    completedTasks: 1,
    totalTasks: 4,
  },
];

const noop = () => {};

describe('TeamListPane accessibility', () => {
  test('renders as a nav element with aria-label', () => {
    const { container } = render(
      <TeamListPane teams={sampleTeams} selectedTeamId="team-1" onSelectTeam={noop} />,
    );
    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(nav?.getAttribute('aria-label')).toBe('Agent teams');
  });

  test('team list has role=listbox', () => {
    render(<TeamListPane teams={sampleTeams} selectedTeamId="team-1" onSelectTeam={noop} />);
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeTruthy();
  });

  test('team items have role=option with aria-selected', () => {
    render(<TeamListPane teams={sampleTeams} selectedTeamId="team-1" onSelectTeam={noop} />);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    expect(options[1].getAttribute('aria-selected')).toBe('false');
  });

  test('new team button has aria-label', () => {
    render(<TeamListPane teams={sampleTeams} selectedTeamId="team-1" onSelectTeam={noop} />);
    expect(screen.getByLabelText('Create new team')).toBeTruthy();
  });

  test('new team button has focus-visible ring and min touch target', () => {
    render(<TeamListPane teams={sampleTeams} selectedTeamId="team-1" onSelectTeam={noop} />);
    const btn = screen.getByLabelText('Create new team');
    expect(btn.className).toContain('focus-visible:ring-2');
    expect(btn.className).toContain('min-h-[44px]');
  });
});
