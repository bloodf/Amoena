// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EventStreamWidget } from './event-stream-widget';

vi.mock('../widget-primitives', async () => {
  const actual = await vi.importActual('../widget-primitives');
  return {
    ...actual,
    LogRow: ({ log }: any) => <div data-testid={`log-${log.id}`}>{log.message}</div>,
  };
});

afterEach(() => cleanup());

describe('EventStreamWidget', () => {
  it('renders header', () => {
    render(
      <EventStreamWidget
        data={
          {
            isLocal: false,
            mergedRecentLogs: [],
            recentErrorLogs: 0,
            isSessionsLoading: false,
          } as any
        }
      />,
    );
    expect(screen.getByText(/Event Stream|Incident Stream/)).toBeDefined();
  });

  it('shows loading state when sessions are loading', () => {
    render(
      <EventStreamWidget
        data={
          {
            isLocal: true,
            mergedRecentLogs: [],
            recentErrorLogs: 0,
            isSessionsLoading: true,
          } as any
        }
      />,
    );
    expect(screen.getByText('Loading logs...')).toBeDefined();
  });

  it('shows empty state when no logs', () => {
    render(
      <EventStreamWidget
        data={
          {
            isLocal: true,
            mergedRecentLogs: [],
            recentErrorLogs: 0,
            isSessionsLoading: false,
          } as any
        }
      />,
    );
    expect(screen.getByText('No logs yet')).toBeDefined();
  });

  it('renders logs when present', () => {
    const logs = [
      {
        id: '1',
        timestamp: Date.now(),
        level: 'info' as const,
        source: 'test',
        message: 'First log',
      },
      {
        id: '2',
        timestamp: Date.now(),
        level: 'error' as const,
        source: 'api',
        message: 'Second log',
      },
    ];
    render(
      <EventStreamWidget
        data={
          {
            isLocal: true,
            mergedRecentLogs: logs,
            recentErrorLogs: 0,
            isSessionsLoading: false,
          } as any
        }
      />,
    );
    expect(screen.getByTestId('log-1')).toBeDefined();
    expect(screen.getByTestId('log-2')).toBeDefined();
  });

  it('shows error count in non-local mode', () => {
    render(
      <EventStreamWidget
        data={
          {
            isLocal: false,
            mergedRecentLogs: [],
            recentErrorLogs: 5,
            isSessionsLoading: false,
          } as any
        }
      />,
    );
    expect(screen.getByText('5 errors')).toBeDefined();
  });
});
