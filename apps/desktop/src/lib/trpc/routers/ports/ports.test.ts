import { describe, expect, it, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { workspaces } from '@lunaria/local-db';

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

const mockPortManager = Object.assign(new EventEmitter(), {
  getAllPorts: vi.fn(() => [
    { workspaceId: 'ws-1', port: 3000, pid: 1234 },
    { workspaceId: 'ws-1', port: 8080, pid: 5678 },
  ]),
  killPort: vi.fn(() => Promise.resolve({ success: true })),
});

vi.mock('main/lib/local-db', () => ({
  localDb: mockLocalDb,
}));

vi.mock('main/lib/terminal/port-manager', () => ({
  portManager: mockPortManager,
}));

vi.mock('main/lib/static-ports', () => ({
  loadStaticPorts: () => ({
    exists: true,
    ports: [
      { port: 3000, label: 'Development Server' },
      { port: 8080, label: 'API Server' },
    ],
  }),
}));

vi.mock('@lunaria/local-db', () => ({
  workspaces: {},
}));

vi.mock('../workspaces/utils/worktree', () => ({
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
