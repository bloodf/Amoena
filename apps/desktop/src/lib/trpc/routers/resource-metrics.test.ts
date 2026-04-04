import { describe, expect, it, vi } from 'vitest';

const mockCollectResourceMetrics = vi.hoisted(() =>
  vi.fn(() =>
    Promise.resolve({
      cpu: {
        usage: 45.5,
        cores: 8,
        speed: 3.5,
      },
      memory: {
        total: 16384,
        used: 8192,
        free: 8192,
        usedPercent: 50,
      },
      process: {
        memory: 512,
        cpu: 12.5,
      },
    }),
  ),
);

vi.mock('main/lib/resource-metrics', () => ({
  collectResourceMetrics: mockCollectResourceMetrics,
}));

const { createResourceMetricsRouter } = await import('./resource-metrics');

describe('resource-metrics router', () => {
  it('creates a router with expected shape', () => {
    const router = createResourceMetricsRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe('object');
  });

  describe('getSnapshot query', () => {
    it('returns resource metrics snapshot', async () => {
      const router = createResourceMetricsRouter();
      const caller = router.createCaller({});

      const result = await caller.query('resource-metrics.getSnapshot');

      expect(result).toHaveProperty('cpu');
      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('process');
      expect(result.cpu).toHaveProperty('usage');
      expect(result.memory).toHaveProperty('total');
    });

    it('accepts optional mode parameter', async () => {
      const router = createResourceMetricsRouter();
      const caller = router.createCaller({});

      const result = await caller.query('resource-metrics.getSnapshot', {
        mode: 'interactive',
      });

      expect(result).toHaveProperty('cpu');
      expect(result).toHaveProperty('memory');
    });

    it('accepts idle mode', async () => {
      const router = createResourceMetricsRouter();
      const caller = router.createCaller({});

      const result = await caller.query('resource-metrics.getSnapshot', {
        mode: 'idle',
      });

      expect(result).toHaveProperty('cpu');
    });

    it('accepts force parameter', async () => {
      const router = createResourceMetricsRouter();
      const caller = router.createCaller({});

      const result = await caller.query('resource-metrics.getSnapshot', {
        force: true,
      });

      expect(result).toHaveProperty('cpu');
    });

    it('accepts combined parameters', async () => {
      const router = createResourceMetricsRouter();
      const caller = router.createCaller({});

      const result = await caller.query('resource-metrics.getSnapshot', {
        mode: 'interactive',
        force: true,
      });

      expect(result).toHaveProperty('cpu');
    });

    it('accepts undefined input', async () => {
      const router = createResourceMetricsRouter();
      const caller = router.createCaller({});

      const result = await caller.query('resource-metrics.getSnapshot', undefined);

      expect(result).toHaveProperty('cpu');
    });
  });
});
