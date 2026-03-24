import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

const launchContext = {
  apiBaseUrl: 'http://127.0.0.1:42100',
  bootstrapPath: '/api/v1/bootstrap/auth',
  bootstrapToken: 'launch-token',
  expiresAtUnixMs: 42,
  instanceId: 'instance-123',
};

const bootstrapSession = {
  apiBaseUrl: launchContext.apiBaseUrl,
  authToken: 'session-token',
  instanceId: launchContext.instanceId,
  sseBaseUrl: `${launchContext.apiBaseUrl}/api/v1/events`,
  tokenType: 'Bearer',
};

vi.mock('./bootstrap/runtime-bootstrap', () => ({
  resolveLaunchContext: vi.fn(async () => launchContext),
  authenticateLaunchContext: vi.fn(async () => bootstrapSession),
}));

class EventSourceStub {
  public readonly url: string;
  private readonly listeners = new Map<string, Set<EventListener>>();
  static instances: EventSourceStub[] = [];

  constructor(url: string) {
    this.url = url;
    EventSourceStub.instances.push(this);
  }

  addEventListener(type: string, listener: EventListener) {
    const listeners = this.listeners.get(type) ?? new Set<EventListener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: EventListener) {
    this.listeners.get(type)?.delete(listener);
  }

  close() {}

  dispatch(type: string, data: unknown) {
    const event = {
      data: JSON.stringify(data),
    } as MessageEvent<string>;
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
  }

  static find(urlFragment: string) {
    return EventSourceStub.instances.find((instance) => instance.url.includes(urlFragment));
  }

  static reset() {
    EventSourceStub.instances = [];
  }
}

const fetchMock = vi.fn();

describe('App shell', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('EventSource', EventSourceStub);

    let sessionSummaries: any[] = [];
    let sessionMessages = [
      {
        id: 'msg-1',
        role: 'assistant',
        content: 'Workspace ready',
        attachments: [],
        createdAt: '2026-03-13T00:00:00Z',
      },
    ];
    let sessionAgents: any[] = [];
    let sessionTranscript: any[] = [];
    const fileTree = [
      {
        name: 'src',
        path: '/tmp/project/src',
        nodeType: 'folder',
        children: [
          {
            name: 'main.ts',
            path: '/tmp/project/src/main.ts',
            nodeType: 'file',
            children: [],
          },
        ],
      },
    ];

    fetchMock.mockImplementation(async (input: string, init?: RequestInit) => {
      if (input.endsWith('/api/v1/health')) {
        return {
          ok: true,
          json: async () => ({
            appName: 'Lunaria',
            appVersion: '0.0.1',
            instanceId: launchContext.instanceId,
            status: 'ok',
          }),
        };
      }

      if (input.endsWith('/api/v1/sessions')) {
        return {
          ok: true,
          json: async () => sessionSummaries,
        };
      }

      if (input.includes('/api/v1/sessions/session-1/messages')) {
        return {
          ok: true,
          json: async () => sessionMessages,
        };
      }

      if (input.includes('/api/v1/sessions/session-1/agents/list')) {
        return {
          ok: true,
          json: async () => sessionAgents,
        };
      }

      if (input.includes('/api/v1/files/tree')) {
        return {
          ok: true,
          json: async () => fileTree,
        };
      }

      if (input.includes('/api/v1/files/content')) {
        return {
          ok: true,
          json: async () => ({
            path: '/tmp/project/src/main.ts',
            content: "console.log('workspace file');",
          }),
        };
      }

      if (input.endsWith('/api/v1/files/content') && init?.method === 'POST') {
        return {
          ok: true,
          status: 204,
          json: async () => ({}),
        };
      }

      if (input.includes('/api/v1/sessions/session-1/memory')) {
        return {
          ok: true,
          json: async () => ({
            summary: null,
            tokenBudget: {
              total: 1200,
              l0: 200,
              l1: 400,
              l2: 300,
            },
            entries: [
              {
                id: 'mem-1',
                title: 'Recent runtime memory',
                observationType: 'summary',
                category: 'pattern',
                createdAt: '2026-03-13T00:00:00Z',
                l0Summary: 'Session memory summary',
                l1Summary: 'Expanded session memory summary',
                l2Content: 'Full session memory summary',
                l0Tokens: 30,
                l1Tokens: 60,
                l2Tokens: 90,
              },
            ],
          }),
        };
      }

      if (input.includes('/api/v1/sessions/session-1/transcript')) {
        return {
          ok: true,
          json: async () => sessionTranscript,
        };
      }

      if (input.endsWith('/api/v1/terminal/sessions')) {
        return {
          ok: true,
          json: async () => ({
            terminalSessionId: 'terminal-1',
          }),
        };
      }

      if (input.includes('/api/v1/sessions/session-1/messages') && init?.method === 'POST') {
        sessionMessages = [
          ...sessionMessages,
          {
            id: `msg-${sessionMessages.length + 1}`,
            role: 'user',
            content: JSON.parse(String(init.body ?? '{}')).content,
            attachments: JSON.parse(String(init.body ?? '{}')).attachments ?? [],
            createdAt: '2026-03-13T00:01:00Z',
          },
        ];
        return {
          ok: true,
          status: 201,
          json: async () => sessionMessages.at(-1),
        };
      }

      if (input.includes('/api/v1/terminal/sessions/terminal-1/events')) {
        return {
          ok: true,
          json: async () => [],
        };
      }

      if (input.endsWith('/api/v1/providers')) {
        return {
          ok: true,
          json: async () => [
            {
              id: 'anthropic',
              name: 'Anthropic',
              authStatus: 'connected',
              modelCount: 1,
              providerType: 'cloud',
              baseUrl: null,
            },
          ],
        };
      }

      if (input.includes('/api/v1/providers/anthropic/models')) {
        return {
          ok: true,
          json: async () => [
            {
              displayName: 'Claude 4 Sonnet',
              contextWindow: 200000,
              supportsReasoning: true,
              reasoningModes: ['auto', 'on', 'off'],
            },
          ],
        };
      }

      if (input.endsWith('/api/v1/settings')) {
        return {
          ok: true,
          json: async () => ({
            remoteAccess: {
              enabled: false,
              lanEnabled: false,
              relayEnabled: false,
              relayEndpoint: 'relay.lunaria.app',
            },
            settings: {},
          }),
        };
      }

      if (input.endsWith('/api/v1/plugins')) {
        return {
          ok: true,
          json: async () => [
            {
              id: 'git-integration-pro',
              name: 'Git Integration Pro',
              version: '2.1.0',
              enabled: true,
              healthStatus: 'healthy',
              capabilities: ['git', 'file_read'],
            },
          ],
        };
      }

      if (input.endsWith('/api/v1/plugins/install-review')) {
        return {
          ok: true,
          json: async () => ({
            id: 'my-plugin',
            source: 'registry',
            trusted: false,
            warnings: ['unsigned_plugin'],
            manifestUrl: 'https://example.com/manifest.json',
            title: 'My Plugin',
          }),
        };
      }

      if (input.endsWith('/api/v1/providers/anthropic/auth')) {
        return {
          ok: true,
          status: 204,
          json: async () => ({}),
        };
      }

      if (
        input.endsWith('/api/v1/settings') &&
        typeof init?.method === 'string' &&
        init.method === 'POST'
      ) {
        return {
          ok: true,
          status: 204,
          json: async () => ({}),
        };
      }

      throw new Error(`Unexpected fetch call: ${input}`);
    });

    (globalThis as any).__lunariaTestState = {
      setSessions(nextSessions: any[]) {
        sessionSummaries = nextSessions;
      },
      setMessages(nextMessages: any[]) {
        sessionMessages = nextMessages;
      },
      setAgents(nextAgents: any[]) {
        sessionAgents = nextAgents;
      },
      setTranscript(nextTranscript: any[]) {
        sessionTranscript = nextTranscript;
      },
    };
  });

  afterEach(() => {
    cleanup();
    EventSourceStub.reset();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    delete (globalThis as any).__lunariaTestState;
  });

  it('hydrates the runtime and renders the routed shell', async () => {
    render(<App />);

    await screen.findByText('Welcome back');

    expect(screen.getByText('0 sessions')).toBeInTheDocument();
    expect(screen.getByText('1 providers')).toBeInTheDocument();
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('navigates to settings from the sidebar shell', async () => {
    render(<App />);
    await screen.findByText('Welcome back');

    await userEvent.click(screen.getAllByText('Settings')[0]!);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'General',
        }),
      ).toBeInTheDocument();
    });
  });

  it('opens provider setup from the home quick actions', async () => {
    render(<App />);
    await screen.findByText('Welcome back');

    await userEvent.click(screen.getAllByText('Provider Setup')[0]!);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Provider Setup',
        }),
      ).toBeInTheDocument();
    });
  });

  it('renders plugin install review inside settings', async () => {
    render(<App />);
    await screen.findAllByText('Welcome back');

    await userEvent.click(screen.getAllByText('Settings')[0]!);
    await userEvent.click(screen.getByText('Plugins / Extensions'));

    await screen.findByText('Git Integration Pro');

    await userEvent.type(
      screen.getByPlaceholderText(/lunaria:\/\/plugin\/install/i),
      'lunaria://plugin/install?id=my-plugin&source=registry',
    );
    await userEvent.click(screen.getByText('Review Deeplink'));

    await waitFor(() => {
      expect(screen.getByText('My Plugin')).toBeInTheDocument();
      expect(screen.getByText('unsigned_plugin')).toBeInTheDocument();
    });
  });

  it('opens a runtime-backed session workspace and file preview', async () => {
    (globalThis as any).__lunariaTestState.setSessions([
      {
        id: 'session-1',
        sessionMode: 'native',
        tuiType: 'native',
        workingDir: '/tmp/project',
        status: 'created',
        createdAt: '2026-03-13T00:00:00Z',
        updatedAt: '2026-03-13T00:00:00Z',
      },
    ]);

    render(<App />);
    await screen.findByText('Welcome back');

    await userEvent.click(screen.getByText('Continue Session'));

    await waitFor(() => {
      expect(screen.getByText('Workspace ready')).toBeInTheDocument();
      expect(screen.getByText('Terminal')).toBeInTheDocument();
    });
  });

  it('persists general remote settings through the runtime API', async () => {
    render(<App />);
    await screen.findAllByText('Welcome back');

    await userEvent.click(screen.getAllByText('Settings')[0]!);
    await screen.findByRole('heading', { name: 'General' });

    await userEvent.click(
      screen
        .getAllByRole('button')
        .find((button) => button.className.includes('relative h-5 w-10 rounded-full'))!,
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://127.0.0.1:42100/api/v1/settings',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });

  it('updates the workspace from session stream events and renders active subagents', async () => {
    (globalThis as any).__lunariaTestState.setSessions([
      {
        id: 'session-1',
        sessionMode: 'native',
        tuiType: 'native',
        workingDir: '/tmp/project',
        status: 'created',
        createdAt: '2026-03-13T00:00:00Z',
        updatedAt: '2026-03-13T00:00:00Z',
      },
    ]);
    (globalThis as any).__lunariaTestState.setAgents([
      {
        id: 'agent-main',
        agentType: 'Primary Engineer',
        model: 'claude-4-sonnet',
        status: 'thinking',
      },
      {
        id: 'agent-sub-1',
        parentAgentId: 'agent-main',
        agentType: 'Builder One',
        model: 'claude-4-sonnet',
        status: 'executing',
        division: 'engineering',
        collaborationStyle: 'directive',
        communicationPreference: 'structured',
        decisionWeight: 0.9,
      },
      {
        id: 'agent-sub-2',
        parentAgentId: 'agent-main',
        agentType: 'Reviewer Two',
        model: 'gpt-5.4',
        status: 'awaiting_review',
        division: 'qa',
        collaborationStyle: 'advisory',
        communicationPreference: 'detailed',
        decisionWeight: 0.6,
      },
    ]);

    render(<App />);
    await screen.findByText('Welcome back');
    await userEvent.click(screen.getByText('Continue Session'));

    await screen.findByText('Workspace ready');
    await userEvent.click(screen.getByRole('button', { name: /agents/i }));

    const sessionStream = EventSourceStub.find('/api/v1/sessions/session-1/stream');
    expect(sessionStream).toBeTruthy();

    sessionStream!.dispatch('message.created', {
      version: 1,
      id: 'evt-1',
      channel: 'session.stream',
      eventType: 'message.created',
      sessionId: 'session-1',
      occurredAt: '2026-03-13T00:02:00Z',
      payload: {
        id: 'msg-live',
        role: 'assistant',
        content: 'Streaming update from runtime',
        attachments: [],
        createdAt: '2026-03-13T00:02:00Z',
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Streaming update from runtime')).toBeInTheDocument();
      expect(screen.getByText('Builder One')).toBeInTheDocument();
      expect(screen.getByText('Reviewer Two')).toBeInTheDocument();
    });
  });

  it('sends structured folder_ref attachments from the workspace composer', async () => {
    (globalThis as any).__lunariaTestState.setSessions([
      {
        id: 'session-1',
        sessionMode: 'native',
        tuiType: 'native',
        workingDir: '/tmp/project',
        status: 'created',
        createdAt: '2026-03-13T00:00:00Z',
        updatedAt: '2026-03-13T00:00:00Z',
      },
    ]);

    render(<App />);
    await screen.findByText('Welcome back');
    await userEvent.click(screen.getByText('Continue Session'));
    await screen.findByText('Workspace ready');

    const composer = screen.getByPlaceholderText(/ask anything/i);
    await userEvent.type(composer, 'Use this folder as context');

    const payload = {
      type: 'folder',
      name: 'src',
      path: '/tmp/project/src',
      itemCount: 1,
    };

    const dataTransfer = {
      getData: (format: string) => (format === 'lunaria/file' ? JSON.stringify(payload) : ''),
      files: [],
      items: [],
      types: ['lunaria/file'],
    };

    await userEvent.click(screen.getByRole('button', { name: /files/i }));
    fireEvent.drop(composer, { dataTransfer });
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      const messageCall = fetchMock.mock.calls.find(
        ([input, init]) =>
          String(input).includes('/api/v1/sessions/session-1/messages') && init?.method === 'POST',
      );
      expect(messageCall).toBeTruthy();
      const body = JSON.parse(String(messageCall?.[1]?.body ?? '{}'));
      expect(body.attachments).toEqual([
        expect.objectContaining({
          type: 'folder_ref',
          name: 'src',
          path: '/tmp/project/src',
          itemCount: 1,
        }),
      ]);
    });
  });
});
