import { describe, expect, it, mock } from 'bun:test';
import { EventEmitter } from 'node:events';
import { workspaces } from '@lunaria/local-db';

// Mock localDb
const mockLocalDb = {
  select: () => ({
    from: () => ({
      where: () => ({
        get: () => ({
          id: 'ws-1',
          name: 'Test Workspace',
          path: '/Users/test/repo',
        }),
      }),
    }),
  }),
};

// Mock portManager
const mockPortManager = Object.assign(new EventEmitter(), {
  getAllPorts: mock(() => [
    { workspaceId: 'ws-1', port: 3000, pid: 1234 },
    { workspaceId: 'ws-1', port: 8080, pid: 5678 },
  ]),
  killPort: mock(() => Promise.resolve({ success: true })),
});

mock.module('main/lib/local-db', () => ({
  localDb: mockLocalDb,
}));

mock.module('main/lib/terminal/port-manager', () => ({
  portManager: mockPortManager,
}));

mock.module('main/lib/static-ports', () => ({
  loadStaticPorts: () => ({
    exists: true,
    ports: [
      { port: 3000, label: 'Development Server' },
      { port: 8080, label: 'API Server' },
    ],
  }),
}));

mock.module('@lunaria/local-db', () => ({
  workspaces: {},
}));

mock.module('../workspaces/utils/worktree', () => ({
  getWorkspacePath: () => '/Users/test/repo',
}));

const { createPortsRouter } = await import('./ports');

describe('ports router', () => {
  it('creates a router with expected shape', () => {
    const router = createPortsRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe('object');
  });

  describe('getAll query', () => {
    it('returns all detected ports with labels', async () => {
      const router = createPortsRouter();
      const caller = router.createCaller({});

      const result = await caller.query('ports.getAll');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('port');
      expect(result[0]).toHaveProperty('workspaceId');
    });
  });

  describe('kill mutation', () => {
    it('kills a port successfully', async () => {
      const router = createPortsRouter();
      const caller = router.createCaller({});

      const result = await caller.mutation('ports.kill', {
        paneId: 'pane-1',
        port: 3000,
      });

      expect(result).toHaveProperty('success');
    });

    it('validates port is positive integer', async () => {
      const router = createPortsRouter();
      const caller = router.createCaller({});

      await expect(
        caller.mutation('ports.kill', {
          paneId: 'pane-1',
          port: -1,
        }),
      ).rejects.toThrow();
    });
  });

  describe('subscribe subscription', () => {
    it('subscribes to port events', async () => {
      const router = createPortsRouter();
      const caller = router.createCaller({});

      const subscription = caller.subscription('ports.subscribe', {});

      expect(subscription).toBeDefined();
    });
  });
});
