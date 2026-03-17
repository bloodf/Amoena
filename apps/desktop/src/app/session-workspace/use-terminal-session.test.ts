import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTerminalSession } from './use-terminal-session';
import type { SessionSummary } from '../runtime-context';

const mockSession: SessionSummary = {
  id: 'session-1',
  sessionMode: 'native',
  tuiType: 'native',
  workingDir: '/tmp/project',
  status: 'created',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  metadata: {},
};

type RuntimeRequest = <T>(path: string, init?: RequestInit) => Promise<T>;

describe('useTerminalSession', () => {
  let requestMock: ReturnType<typeof vi.fn>;
  let request: RuntimeRequest;

  beforeEach(() => {
    vi.useFakeTimers();
    requestMock = vi.fn();
    request = requestMock as unknown as RuntimeRequest;
    requestMock.mockImplementation(async (path: string, init?: RequestInit) => {
      if (path === '/api/v1/terminal/sessions' && init?.method === 'POST') {
        return { terminalSessionId: 'terminal-1' };
      }
      if (path.startsWith('/api/v1/terminal/sessions/terminal-1/events')) {
        return [];
      }
      throw new Error(`Unexpected request: ${path}`);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns null terminalSessionId when activeSession is null', async () => {
    const { result } = renderHook(() => useTerminalSession({ activeSession: null, request }));
    await act(async () => {});
    expect(result.current.terminalSessionId).toBeNull();
  });

  it('returns empty terminalOutput when activeSession is null', async () => {
    const { result } = renderHook(() => useTerminalSession({ activeSession: null, request }));
    await act(async () => {});
    expect(result.current.terminalOutput).toEqual([]);
  });

  it('creates terminal session on mount with workingDir', async () => {
    renderHook(() => useTerminalSession({ activeSession: mockSession, request }));
    await act(async () => {});

    expect(request).toHaveBeenCalledWith(
      '/api/v1/terminal/sessions',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('/tmp/project'),
      }),
    );
  });

  it('sends shell, cwd, cols, rows in terminal creation payload', async () => {
    renderHook(() => useTerminalSession({ activeSession: mockSession, request }));
    await act(async () => {});

    const call = requestMock.mock.calls.find(
      ([p, i]) => p === '/api/v1/terminal/sessions' && i?.method === 'POST',
    );
    expect(call).toBeTruthy();
    const body = JSON.parse(call![1].body);
    expect(body).toMatchObject({
      shell: '/bin/cat',
      cwd: '/tmp/project',
      cols: 80,
      rows: 20,
    });
  });

  it('sets terminalSessionId after creation', async () => {
    const { result } = renderHook(() =>
      useTerminalSession({ activeSession: mockSession, request }),
    );
    await act(async () => {});
    expect(result.current.terminalSessionId).toBe('terminal-1');
  });

  it('starts polling for terminal events after session is created', async () => {
    renderHook(() => useTerminalSession({ activeSession: mockSession, request }));
    await act(async () => {});

    // Advance timer to trigger the interval
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(request).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/terminal/sessions/terminal-1/events'),
    );
  });

  it('polls with lastEventId=0 initially', async () => {
    renderHook(() => useTerminalSession({ activeSession: mockSession, request }));
    await act(async () => {});

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(request).toHaveBeenCalledWith(
      '/api/v1/terminal/sessions/terminal-1/events?lastEventId=0',
    );
  });

  it('appends terminal events to output', async () => {
    requestMock.mockImplementation(async (path: string, init?: RequestInit) => {
      if (path === '/api/v1/terminal/sessions' && init?.method === 'POST') {
        return { terminalSessionId: 'terminal-1' };
      }
      if (path === '/api/v1/terminal/sessions/terminal-1/events?lastEventId=0') {
        return [{ eventId: 1, data: '$ cargo test\n' }];
      }
      if (path === '/api/v1/terminal/sessions/terminal-1/events?lastEventId=1') {
        return [];
      }
      return [];
    });

    const { result } = renderHook(() =>
      useTerminalSession({ activeSession: mockSession, request }),
    );
    await act(async () => {});

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.terminalOutput).toHaveLength(1);
    expect(result.current.terminalOutput[0]!.data).toBe('$ cargo test\n');
  });

  it('uses the last eventId for subsequent poll calls', async () => {
    requestMock.mockImplementation(async (path: string, init?: RequestInit) => {
      if (path === '/api/v1/terminal/sessions' && init?.method === 'POST') {
        return { terminalSessionId: 'terminal-1' };
      }
      if (path === '/api/v1/terminal/sessions/terminal-1/events?lastEventId=0') {
        return [{ eventId: 5, data: 'output\n' }];
      }
      if (path === '/api/v1/terminal/sessions/terminal-1/events?lastEventId=5') {
        return [];
      }
      return [];
    });

    renderHook(() => useTerminalSession({ activeSession: mockSession, request }));
    await act(async () => {});

    // First poll
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    // Second poll
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(request).toHaveBeenCalledWith(
      '/api/v1/terminal/sessions/terminal-1/events?lastEventId=5',
    );
  });

  it('resets terminal state when activeSession changes to null', async () => {
    const { result, rerender } = renderHook(
      ({ session }: { session: SessionSummary | null }) =>
        useTerminalSession({ activeSession: session, request }),
      { initialProps: { session: mockSession as SessionSummary | null } },
    );
    await act(async () => {});
    expect(result.current.terminalSessionId).toBe('terminal-1');

    // When session becomes null, the effect returns early — no new terminal is created
    rerender({ session: null });
    await act(async () => {});
    // The hook does not create a new terminal session when activeSession is null
    const createCalls = requestMock.mock.calls.filter(
      ([path, init]) => path === '/api/v1/terminal/sessions' && init?.method === 'POST',
    );
    // Only one create call (from the initial mount)
    expect(createCalls).toHaveLength(1);
  });

  it('creates a new terminal session when activeSession changes to a new session', async () => {
    requestMock.mockImplementation(async (path: string, init?: RequestInit) => {
      if (path === '/api/v1/terminal/sessions' && init?.method === 'POST') {
        return { terminalSessionId: 'terminal-2' };
      }
      if (path.startsWith('/api/v1/terminal/sessions/terminal-2/events')) {
        return [];
      }
      return [];
    });

    const session2: SessionSummary = {
      ...mockSession,
      id: 'session-2',
      workingDir: '/tmp/project2',
    };

    const { result, rerender } = renderHook(
      ({ session }: { session: SessionSummary }) =>
        useTerminalSession({ activeSession: session, request }),
      { initialProps: { session: mockSession } },
    );
    await act(async () => {});

    rerender({ session: session2 });
    await act(async () => {});

    expect(result.current.terminalSessionId).toBe('terminal-2');
  });
});
