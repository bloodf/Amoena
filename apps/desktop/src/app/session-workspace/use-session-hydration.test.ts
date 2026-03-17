import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSessionHydration } from './use-session-hydration';
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

const mockMessages = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Hello',
    attachments: [],
    createdAt: '2026-01-01T00:00:00Z',
  },
];

const mockAgents = [
  {
    id: 'agent-main',
    parentAgentId: null,
    agentType: 'Navigator',
    model: 'claude-sonnet-4',
    status: 'thinking',
    division: 'engineering',
    collaborationStyle: 'directive',
    communicationPreference: 'structured',
    decisionWeight: 0.8,
  },
];

const mockFileTree = [
  {
    name: 'src',
    path: '/tmp/project/src',
    nodeType: 'folder' as const,
    children: [
      {
        name: 'main.ts',
        path: '/tmp/project/src/main.ts',
        nodeType: 'file' as const,
        children: [],
      },
    ],
  },
];

const mockMemory = {
  summary: null,
  tokenBudget: { total: 100000, l0: 50, l1: 150, l2: 500 },
  entries: [
    {
      id: 'obs-1',
      title: 'User preference',
      observationType: 'user_prompt',
      category: 'preference' as const,
      createdAt: '2026-01-01T00:00:00Z',
      l0Summary: 'Dark mode',
      l1Summary: 'Prefers dark mode',
      l2Content: '{}',
      l0Tokens: 5,
      l1Tokens: 10,
      l2Tokens: 20,
    },
  ],
};

const mockTranscript = [
  {
    version: 1,
    id: 'evt-1',
    channel: 'session.lifecycle',
    eventType: 'session.created',
    sessionId: 'session-1',
    occurredAt: '2026-01-01T00:00:00Z',
    payload: {},
  },
];

function buildSetters() {
  return {
    setMessages: vi.fn(),
    setStreamingMessage: vi.fn(),
    setAgents: vi.fn(),
    setFileTree: vi.fn(),
    setSelectedFile: vi.fn(),
    setMemory: vi.fn(),
    setTranscriptEvents: vi.fn(),
    setAutopilotPhase: vi.fn(),
  };
}

type RuntimeRequest = <T>(path: string, init?: RequestInit) => Promise<T>;

describe('useSessionHydration', () => {
  let requestMock: ReturnType<typeof vi.fn>;
  let request: RuntimeRequest;

  beforeEach(() => {
    requestMock = vi.fn();
    request = requestMock as unknown as RuntimeRequest;
    requestMock.mockImplementation(async (path: string) => {
      if (path === '/api/v1/sessions/session-1/messages') return mockMessages;
      if (path === '/api/v1/sessions/session-1/agents/list') return mockAgents;
      if (path.startsWith('/api/v1/files/tree')) return mockFileTree;
      if (path === '/api/v1/sessions/session-1/memory') return mockMemory;
      if (path === '/api/v1/sessions/session-1/transcript') return mockTranscript;
      throw new Error(`Unexpected request: ${path}`);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when activeSession is null', async () => {
    const setters = buildSetters();
    renderHook(() => useSessionHydration({ activeSession: null, request, ...setters }));
    await act(async () => {});
    expect(request).not.toHaveBeenCalled();
  });

  it('fetches all data sources when activeSession is provided', async () => {
    const setters = buildSetters();
    renderHook(() => useSessionHydration({ activeSession: mockSession, request, ...setters }));
    await act(async () => {});

    expect(request).toHaveBeenCalledWith('/api/v1/sessions/session-1/messages');
    expect(request).toHaveBeenCalledWith('/api/v1/sessions/session-1/agents/list');
    expect(request).toHaveBeenCalledWith(expect.stringContaining('/api/v1/files/tree'));
    expect(request).toHaveBeenCalledWith('/api/v1/sessions/session-1/memory');
    expect(request).toHaveBeenCalledWith('/api/v1/sessions/session-1/transcript');
  });

  it('encodes workingDir in the file tree URL', async () => {
    const setters = buildSetters();
    renderHook(() => useSessionHydration({ activeSession: mockSession, request, ...setters }));
    await act(async () => {});

    expect(request).toHaveBeenCalledWith('/api/v1/files/tree?root=%2Ftmp%2Fproject');
  });

  it('calls setMessages with fetched messages', async () => {
    const setters = buildSetters();
    renderHook(() => useSessionHydration({ activeSession: mockSession, request, ...setters }));
    await act(async () => {});
    expect(setters.setMessages).toHaveBeenCalledWith(mockMessages);
  });

  it('calls setStreamingMessage with empty string to reset', async () => {
    const setters = buildSetters();
    renderHook(() => useSessionHydration({ activeSession: mockSession, request, ...setters }));
    await act(async () => {});
    expect(setters.setStreamingMessage).toHaveBeenCalledWith('');
  });

  it('calls setAgents with transformed ManagedAgent array', async () => {
    const setters = buildSetters();
    renderHook(() => useSessionHydration({ activeSession: mockSession, request, ...setters }));
    await act(async () => {});

    expect(setters.setAgents).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'Navigator', type: 'Main' })]),
    );
  });

  it('calls setFileTree with file tree data', async () => {
    const setters = buildSetters();
    renderHook(() => useSessionHydration({ activeSession: mockSession, request, ...setters }));
    await act(async () => {});
    expect(setters.setFileTree).toHaveBeenCalledWith(mockFileTree);
  });

  it('calls setMemory with memory response', async () => {
    const setters = buildSetters();
    renderHook(() => useSessionHydration({ activeSession: mockSession, request, ...setters }));
    await act(async () => {});
    expect(setters.setMemory).toHaveBeenCalledWith(mockMemory);
  });

  it('calls setTranscriptEvents with transcript data', async () => {
    const setters = buildSetters();
    renderHook(() => useSessionHydration({ activeSession: mockSession, request, ...setters }));
    await act(async () => {});
    expect(setters.setTranscriptEvents).toHaveBeenCalledWith(mockTranscript);
  });

  it('calls setSelectedFile with null to reset', async () => {
    const setters = buildSetters();
    renderHook(() => useSessionHydration({ activeSession: mockSession, request, ...setters }));
    await act(async () => {});
    expect(setters.setSelectedFile).toHaveBeenCalledWith(null);
  });

  it('sets autopilot phase to null when metadata.autopilot is falsy', async () => {
    const setters = buildSetters();
    const session = { ...mockSession, metadata: {} };
    renderHook(() => useSessionHydration({ activeSession: session, request, ...setters }));
    await act(async () => {});
    expect(setters.setAutopilotPhase).toHaveBeenCalledWith(null);
  });

  it('sets autopilot phase to goal_analysis when metadata.autopilot is true', async () => {
    const setters = buildSetters();
    const session = { ...mockSession, metadata: { autopilot: true } };
    renderHook(() => useSessionHydration({ activeSession: session, request, ...setters }));
    await act(async () => {});
    expect(setters.setAutopilotPhase).toHaveBeenCalledWith('goal_analysis');
  });

  it('handles empty API responses gracefully', async () => {
    const setters = buildSetters();
    requestMock.mockImplementation(async (path: string) => {
      if (path === '/api/v1/sessions/session-1/messages') return [];
      if (path === '/api/v1/sessions/session-1/agents/list') return [];
      if (path.startsWith('/api/v1/files/tree')) return [];
      if (path === '/api/v1/sessions/session-1/memory') {
        return { summary: null, tokenBudget: { total: 0, l0: 0, l1: 0, l2: 0 }, entries: [] };
      }
      if (path === '/api/v1/sessions/session-1/transcript') return [];
      throw new Error(`Unexpected: ${path}`);
    });

    renderHook(() => useSessionHydration({ activeSession: mockSession, request, ...setters }));
    await act(async () => {});

    expect(setters.setMessages).toHaveBeenCalledWith([]);
    expect(setters.setAgents).toHaveBeenCalledWith([]);
    expect(setters.setFileTree).toHaveBeenCalledWith([]);
    expect(setters.setTranscriptEvents).toHaveBeenCalledWith([]);
  });

  it('re-fetches when activeSession changes', async () => {
    const setters = buildSetters();
    const { rerender } = renderHook(
      ({ session }: { session: SessionSummary }) =>
        useSessionHydration({ activeSession: session, request, ...setters }),
      { initialProps: { session: mockSession } },
    );
    await act(async () => {});

    const session2 = { ...mockSession, id: 'session-2' };
    requestMock.mockImplementation(async (path: string) => {
      if (path === '/api/v1/sessions/session-2/messages') return [];
      if (path === '/api/v1/sessions/session-2/agents/list') return [];
      if (path.startsWith('/api/v1/files/tree')) return [];
      if (path === '/api/v1/sessions/session-2/memory') {
        return { summary: null, tokenBudget: { total: 0, l0: 0, l1: 0, l2: 0 }, entries: [] };
      }
      if (path === '/api/v1/sessions/session-2/transcript') return [];
      throw new Error(`Unexpected: ${path}`);
    });

    rerender({ session: session2 });
    await act(async () => {});

    expect(requestMock).toHaveBeenCalledWith('/api/v1/sessions/session-2/messages');
  });
});
