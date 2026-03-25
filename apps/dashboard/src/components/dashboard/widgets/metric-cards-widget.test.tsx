// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MetricCardsWidget } from './metric-cards-widget';

afterEach(() => cleanup());

describe('MetricCardsWidget', () => {
  it('renders local mode metric cards', () => {
    render(
      <MetricCardsWidget
        data={
          {
            isLocal: true,
            isClaudeLoading: false,
            isSessionsLoading: false,
            isSystemLoading: false,
            claudeActive: 2,
            codexActive: 1,
            hermesActive: 0,
            claudeStats: {
              total_sessions: 10,
              active_sessions: 2,
              total_input_tokens: 1000,
              total_output_tokens: 2000,
              total_estimated_cost: 0.5,
              unique_projects: 3,
            },
            claudeLocalSessions: [],
            codexLocalSessions: [],
            hermesLocalSessions: [],
            hermesCronJobCount: 0,
            systemLoad: 45,
            memPct: 60,
            diskPct: 40,
            connection: { isConnected: false },
            activeSessions: 0,
            sessions: [],
            onlineAgents: 0,
            dbStats: null,
            agents: [],
            backlogCount: 0,
            runningTasks: 0,
            errorCount: 0,
            subscriptionLabel: null,
            subscriptionPrice: null,
          } as any
        }
      />,
    );
    expect(screen.getByText('Claude')).toBeDefined();
    expect(screen.getByText('Codex')).toBeDefined();
    expect(screen.getByText('Hermes')).toBeDefined();
    expect(screen.getByText('System Load')).toBeDefined();
  });

  it('renders gateway mode metric cards', () => {
    render(
      <MetricCardsWidget
        data={
          {
            isLocal: false,
            isClaudeLoading: false,
            isSessionsLoading: false,
            isSystemLoading: false,
            claudeActive: 0,
            codexActive: 0,
            hermesActive: 0,
            claudeStats: null,
            claudeLocalSessions: [],
            codexLocalSessions: [],
            hermesLocalSessions: [],
            hermesCronJobCount: 0,
            systemLoad: 45,
            memPct: null,
            diskPct: null,
            connection: { isConnected: true },
            activeSessions: 5,
            sessions: [{ id: '1' }],
            onlineAgents: 3,
            dbStats: { agents: { total: 5 } },
            agents: [],
            backlogCount: 2,
            runningTasks: 1,
            errorCount: 0,
            subscriptionLabel: null,
            subscriptionPrice: null,
          } as any
        }
      />,
    );
    expect(screen.getByText('Gateway')).toBeDefined();
    expect(screen.getByText('Sessions')).toBeDefined();
    expect(screen.getByText('Agent Capacity')).toBeDefined();
    expect(screen.getByText('Queue')).toBeDefined();
  });

  it('shows loading placeholders when loading', () => {
    render(
      <MetricCardsWidget
        data={
          {
            isLocal: true,
            isClaudeLoading: true,
            isSessionsLoading: true,
            isSystemLoading: true,
            claudeActive: 0,
            codexActive: 0,
            hermesActive: 0,
            claudeStats: null,
            claudeLocalSessions: [],
            codexLocalSessions: [],
            hermesLocalSessions: [],
            hermesCronJobCount: 0,
            systemLoad: 0,
            memPct: null,
            diskPct: null,
            connection: { isConnected: false },
            activeSessions: 0,
            sessions: [],
            onlineAgents: 0,
            dbStats: null,
            agents: [],
            backlogCount: 0,
            runningTasks: 0,
            errorCount: 0,
            subscriptionLabel: null,
            subscriptionPrice: null,
          } as any
        }
      />,
    );
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
  });
});
