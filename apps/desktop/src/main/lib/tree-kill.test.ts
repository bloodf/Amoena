import { describe, expect, it, beforeEach, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import type { ChildProcess } from 'node:child_process';

// Mutable mock implementations that can be swapped per test
const mockTreeKillDefault = vi.fn(
  (_pid: number, _signal: string, callback: (err?: Error) => void) => {
    callback();
  },
);

const mockTreeKillWithError = vi.fn(
  (_pid: number, _signal: string, callback: (err?: Error) => void) => {
    callback(new Error('Process not found'));
  },
);

const mockProcessKill = vi.fn((_pid: number, _signal: number) => {
  throw Object.assign(new Error(' ESRCH'), { code: 'ESRCH' });
});

const mockProcessKillAlive = vi.fn((_pid: number, _signal: number) => true);

// The actual mock implementation that delegates to whichever mock is currently active
const activeMock = vi.fn((_pid: number, _signal: string, callback: (err?: Error) => void) => {
  callback();
});

vi.mock('tree-kill', () => ({
  default: activeMock,
}));

// Store original process.kill
const origProcessKill = process.kill;

describe('tree-kill', () => {
  beforeEach(() => {
    // Reset to default mock
    activeMock.mockImplementation(mockTreeKillDefault);
    mockTreeKillDefault.mockClear();
    mockTreeKillWithError.mockClear();
    mockProcessKill.mockClear();
    mockProcessKillAlive.mockClear();
    // Restore original process.kill
    process.kill = origProcessKill;
  });

  describe('treeKillAsync', () => {
    it('calls treeKill with correct pid and signal', async () => {
      const { treeKillAsync } = await import('./tree-kill');
      await treeKillAsync(12345, 'SIGTERM');

      expect(activeMock).toHaveBeenCalledWith(12345, 'SIGTERM', expect.any(Function));
    });

    it('resolves even when treeKill returns an error', async () => {
      // Override mock for this specific test
      activeMock.mockImplementation(mockTreeKillWithError);
      const { treeKillAsync } = await import('./tree-kill');

      await expect(treeKillAsync(99999, 'SIGTERM')).resolves.toBeUndefined();
    });

    it('resolves successfully when no error', async () => {
      const { treeKillAsync } = await import('./tree-kill');

      await expect(treeKillAsync(12345, 'SIGTERM')).resolves.toBeUndefined();
    });
  });

  describe('treeKillWithEscalation', () => {
    it('returns success when process dies immediately', async () => {
      // Override mock for this specific test
      const quickKillMock = vi.fn((_pid: number, _signal: string, cb: (err?: Error) => void) => {
        process.kill = mockProcessKillAlive;
        cb();
      });
      activeMock.mockImplementation(quickKillMock);

      const { treeKillWithEscalation } = await import('./tree-kill');
      const result = await treeKillWithEscalation({ pid: 12345 });

      expect(result).toEqual({ success: true });
    });

    it('returns success when process not found error occurs', async () => {
      const notFoundMock = vi.fn((_pid: number, _signal: string, cb: (err?: Error) => void) => {
        cb(Object.assign(new Error('No such process'), { code: 'ESRCH' }));
      });
      activeMock.mockImplementation(notFoundMock);

      const { treeKillWithEscalation } = await import('./tree-kill');
      const result = await treeKillWithEscalation({ pid: 99999 });

      expect(result).toEqual({ success: true });
    });

    it('uses SIGTERM by default', async () => {
      const sigtermMock = vi.fn((_pid: number, signal: string, cb: (err?: Error) => void) => {
        process.kill = mockProcessKillAlive;
        cb();
      });
      activeMock.mockImplementation(sigtermMock);

      const { treeKillWithEscalation } = await import('./tree-kill');
      await treeKillWithEscalation({ pid: 12345 });

      expect(sigtermMock).toHaveBeenCalledWith(12345, 'SIGTERM', expect.any(Function));
    });

    it('uses custom signal when provided', async () => {
      const sigkillMock = vi.fn((_pid: number, signal: string, cb: (err?: Error) => void) => {
        process.kill = mockProcessKillAlive;
        cb();
      });
      activeMock.mockImplementation(sigkillMock);

      const { treeKillWithEscalation } = await import('./tree-kill');
      await treeKillWithEscalation({ pid: 12345, signal: 'SIGINT' });

      expect(sigkillMock).toHaveBeenCalledWith(12345, 'SIGINT', expect.any(Function));
    });

    it('escalates to SIGKILL after timeout if process survives', async () => {
      let callCount = 0;
      const escalationMock = vi.fn((_pid: number, signal: string, cb: (err?: Error) => void) => {
        callCount++;
        if (signal === 'SIGTERM') {
          // Process still alive
          process.kill = mockProcessKillAlive;
          cb();
        } else if (signal === 'SIGKILL') {
          // SIGKILL succeeds
          cb();
        }
      });
      activeMock.mockImplementation(escalationMock);

      const { treeKillWithEscalation } = await import('./tree-kill');
      const result = await treeKillWithEscalation({
        pid: 12345,
        escalationTimeoutMs: 50,
      });

      // Wait for potential escalation
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result).toEqual({ success: true });
    });

    it('returns error when SIGKILL fails', async () => {
      let callCount = 0;
      const failEscalationMock = vi.fn(
        (_pid: number, signal: string, cb: (err?: Error) => void) => {
          callCount++;
          if (signal === 'SIGTERM') {
            process.kill = mockProcessKillAlive;
            cb();
          } else {
            cb(new Error('Operation not permitted'));
          }
        },
      );
      activeMock.mockImplementation(failEscalationMock);

      const { treeKillWithEscalation } = await import('./tree-kill');
      const result = await treeKillWithEscalation({
        pid: 12345,
        escalationTimeoutMs: 50,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result.success).toBe(false);
      expect(result.error).toBe('Operation not permitted');
    });
  });
});
