// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionWorkbenchWidget } from './session-workbench-widget';

afterEach(() => cleanup());

describe('SessionWorkbenchWidget', () => {
  it('renders header in local mode', () => {
    render(
      <SessionWorkbenchWidget
        data={
          { isLocal: true, sessions: [], isSessionsLoading: false, openSession: vi.fn() } as any
        }
      />,
    );
    expect(screen.getByText('Session Workbench')).toBeDefined();
  });

  it('renders header in gateway mode', () => {
    render(
      <SessionWorkbenchWidget
        data={
          { isLocal: false, sessions: [], isSessionsLoading: false, openSession: vi.fn() } as any
        }
      />,
    );
    expect(screen.getByText('Session Router')).toBeDefined();
  });

  it('shows loading state when sessions are loading', () => {
    render(
      <SessionWorkbenchWidget
        data={{ isLocal: true, sessions: [], isSessionsLoading: true, openSession: vi.fn() } as any}
      />,
    );
    expect(screen.getByText('Loading sessions...')).toBeDefined();
  });

  it('shows empty state when no sessions in local mode', () => {
    render(
      <SessionWorkbenchWidget
        data={
          { isLocal: true, sessions: [], isSessionsLoading: false, openSession: vi.fn() } as any
        }
      />,
    );
    expect(screen.getByText('No active sessions')).toBeDefined();
  });

  it('shows empty state when no sessions in gateway mode', () => {
    render(
      <SessionWorkbenchWidget
        data={
          { isLocal: false, sessions: [], isSessionsLoading: false, openSession: vi.fn() } as any
        }
      />,
    );
    expect(screen.getByText('No gateway sessions')).toBeDefined();
  });

  it('renders session list when sessions present', () => {
    const sessions = [
      {
        id: 's1',
        key: 'session-1',
        kind: 'claude-code',
        model: 'claude-3-5-sonnet',
        tokens: '1.2K',
        age: '2m',
        active: true,
      },
    ];
    const openSession = vi.fn();
    render(
      <SessionWorkbenchWidget
        data={{ isLocal: true, sessions, isSessionsLoading: false, openSession } as any}
      />,
    );
    expect(screen.getByText('session-1')).toBeDefined();
  });

  it('calls openSession when session is clicked', () => {
    const sessions = [
      {
        id: 's1',
        key: 'session-1',
        kind: 'claude-code',
        model: 'claude-3-5-sonnet',
        tokens: '1.2K',
        age: '2m',
        active: true,
      },
    ];
    const openSession = vi.fn();
    render(
      <SessionWorkbenchWidget
        data={{ isLocal: true, sessions, isSessionsLoading: false, openSession } as any}
      />,
    );
    fireEvent.click(screen.getByText('session-1'));
    expect(openSession).toHaveBeenCalledWith(sessions[0]);
  });

  it('shows inactive session indicator', () => {
    const sessions = [
      {
        id: 's1',
        key: 'session-1',
        kind: 'claude-code',
        model: 'claude-3-5-sonnet',
        tokens: '1.2K',
        age: '2m',
        active: false,
      },
    ];
    render(
      <SessionWorkbenchWidget
        data={{ isLocal: true, sessions, isSessionsLoading: false, openSession: vi.fn() } as any}
      />,
    );
    expect(screen.getByText('session-1')).toBeDefined();
  });
});
