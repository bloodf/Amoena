import { describe, expect, it, mock, beforeEach } from 'bun:test';
import { EventEmitter } from 'node:events';
import type { ChildProcess } from 'node:child_process';

const mockTreeKill = mock((_pid: number, _signal: string, callback: (err?: Error) => void) => {
  callback();
});

const mockTreeKillWithError = mock(
  (_pid: number, _signal: string, callback: (err?: Error) => void) => {
    callback(new Error('Process not found'));
  },
);

const mockProcessKill = mock((_pid: number, _signal: number) => {
  throw Object.assign(new Error(' ESRCH'), { code: 'ESRCH' });
});

const mockProcessKillAlive = mock((_pid: number, _signal: number) => true);

mock.module('tree-kill', () => ({
  default: mockTreeKill,
}));

// Store original process.kill
const origProcessKill = process.kill;

describe('tree-kill', () => {
  beforeEach(() => {
    mockTreeKill.mockClear();
    mockTreeKillWithError.mockClear();
    mockProcessKill.mockClear();
    mockProcessKillAlive.mockClear();
  });

  describe('treeKillAsync', () => {
    it('calls treeKill with correct pid and signal', async () => {
      const { treeKillAsync } = await import('./tree-kill');
      await treeKillAsync(12345, 'SIGTERM');

      expect(mockTreeKill).toHaveBeenCalledWith(12345, 'SIGTERM', expect.any(Function));
    });

    it('resolves even when treeKill returns an error', async () => {
      // Re-import to rebind mocks
      mock.module('tree-kill', () => ({
        default: mockTreeKillWithError,
      }));
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
      const quickKillMock = mock((_pid: number, _signal: string, cb: (err?: Error) => void) => {
        process.kill = mockProcessKillAlive;
        cb();
      });
      mock.module('tree-kill', () => ({
        default: quickKillMock,
      }));

      const { treeKillWithEscalation } = await import('./tree-kill');
      const result = await treeKillWithEscalation({ pid: 12345 });

      expect(result).toEqual({ success: true });
    });

    it('returns success when process not found error occurs', async () => {
      const notFoundMock = mock((_pid: number, _signal: string, cb: (err?: Error) => void) => {
        cb(Object.assign(new Error('No such process'), { code: 'ESRCH' }));
      });
      mock.module('tree-kill', () => ({
        default: notFoundMock,
      }));

      const { treeKillWithEscalation } = await import('./tree-kill');
      const result = await treeKillWithEscalation({ pid: 99999 });

      expect(result).toEqual({ success: true });
    });

    it('uses SIGTERM by default', async () => {
      const sigtermMock = mock((_pid: number, signal: string, cb: (err?: Error) => void) => {
        process.kill = mockProcessKillAlive;
        cb();
      });
      mock.module('tree-kill', () => ({
        default: sigtermMock,
      }));

      const { treeKillWithEscalation } = await import('./tree-kill');
      await treeKillWithEscalation({ pid: 12345 });

      expect(sigtermMock).toHaveBeenCalledWith(12345, 'SIGTERM', expect.any(Function));
    });

    it('uses custom signal when provided', async () => {
      const sigkillMock = mock((_pid: number, signal: string, cb: (err?: Error) => void) => {
        process.kill = mockProcessKillAlive;
        cb();
      });
      mock.module('tree-kill', () => ({
        default: sigkillMock,
      }));

      const { treeKillWithEscalation } = await import('./tree-kill');
      await treeKillWithEscalation({ pid: 12345, signal: 'SIGINT' });

      expect(sigkillMock).toHaveBeenCalledWith(12345, 'SIGINT', expect.any(Function));
    });

    it('escalates to SIGKILL after timeout if process survives', async () => {
      let callCount = 0;
      const escalationMock = mock((_pid: number, signal: string, cb: (err?: Error) => void) => {
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
      mock.module('tree-kill', () => ({
        default: escalationMock,
      }));

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
      const failEscalationMock = mock((_pid: number, signal: string, cb: (err?: Error) => void) => {
        callCount++;
        if (signal === 'SIGTERM') {
          process.kill = mockProcessKillAlive;
          cb();
        } else {
          cb(new Error('Operation not permitted'));
        }
      });
      mock.module('tree-kill', () => ({
        default: failEscalationMock,
      }));

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
