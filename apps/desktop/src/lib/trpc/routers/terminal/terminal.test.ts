import { describe, expect, it, vi } from 'vitest';
import { EventEmitter } from 'node:events';

const mockTerminal = Object.assign(new EventEmitter(), {
  createOrAttach: vi.fn(() =>
    Promise.resolve({
      isNew: true,
      scrollback: '',
      wasRecovered: false,
      isColdRestore: false,
      previousCwd: null,
      snapshot: null,
    }),
  ),
  cancelCreateOrAttach: vi.fn(() => {}),
  write: vi.fn(() => {}),
  resize: vi.fn(() => {}),
  signal: vi.fn(() => {}),
  kill: vi.fn(() => Promise.resolve()),
  detach: vi.fn(() => {}),
  clearScrollback: vi.fn(() => Promise.resolve()),
  ackColdRestore: vi.fn(() => {}),
  getSession: vi.fn(() => Promise.resolve(null)),
  capabilities: { daemon: true },
  management: {
    listSessions: vi.fn(() => Promise.resolve({ sessions: [] })),
    resetHistoryPersistence: vi.fn(() => Promise.resolve()),
  },
});

vi.mock('main/lib/workspace-runtime', () => ({
  getWorkspaceRuntimeRegistry: () => ({
    getDefault: () => ({ terminal: mockTerminal }),
  }),
}));

vi.mock('main/lib/app-state', () => ({
  appState: { data: { themeState: null } },
}));

vi.mock('main/lib/terminal', () => ({
  restartDaemon: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock('main/lib/terminal/errors', () => ({
  isTerminalAttachCanceledError: () => false,
  TERMINAL_ATTACH_CANCELED_MESSAGE: 'Attach canceled',
  TERMINAL_SESSION_KILLED_MESSAGE: 'Session killed',
  TerminalKilledError: class extends Error {},
}));

vi.mock('main/lib/terminal-host/client', () => ({
  getTerminalHostClient: () => ({
    listSessions: vi.fn(() => Promise.resolve({ sessions: [] })),
  }),
}));

vi.mock('./theme-type', () => ({
  resolveTerminalThemeType: vi.fn(() => 'dark'),
}));

vi.mock('./utils', () => ({
  getWorkspaceTerminalContext: vi.fn(() => ({
    workspace: { name: 'test-ws', type: 'worktree' },
    workspacePath: '/repo',
    rootPath: '/repo',
  })),
  resolveCwd: vi.fn((_override: string | undefined, path: string) => path),
}));

vi.mock('../workspaces/utils/usability', () => ({
  assertWorkspaceUsable: vi.fn(() => {}),
}));

const { createTerminalRouter } = await import('./terminal');

describe('terminal router', () => {
  it('creates a router with expected shape', () => {
    const router = createTerminalRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe('object');
  });
});
