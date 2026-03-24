import { describe, expect, mock, test, beforeEach, afterEach } from 'bun:test';
import type { ChildProcess } from 'child_process';

const mockSpawnProcess = mock(() => mockSpawnResult);
const mockSpawnResult = {
  process: {} as unknown as ChildProcess,
  onStdout: mock((_handler: (line: string) => void) => {}),
  onStderr: mock((_handler: (line: string) => void) => {}),
  onExit: mock((_handler: (code: number) => void) => {}),
  write: mock((_data: string) => {}),
  kill: mock(() => {}),
};

mock.module('../utils/spawn', () => ({
  spawnProcess: mockSpawnProcess,
}));

const { claudeAdapter } = await import('../claude-adapter');

describe('claude adapter', () => {
  beforeEach(() => {
    mockSpawnProcess.mockClear();
    mockSpawnResult.onStdout.mockClear();
    mockSpawnResult.onStderr.mockClear();
    mockSpawnResult.onExit.mockClear();
    mockSpawnResult.write.mockClear();
    mockSpawnResult.kill.mockClear();
  });

  describe('isAvailable', () => {
    afterEach(() => {
      delete process.env['ANTHROPIC_API_KEY'];
      delete process.env['CLAUDE_API_KEY'];
    });

    test('returns true when ANTHROPIC_API_KEY is set', () => {
      process.env['ANTHROPIC_API_KEY'] = 'sk-ant-key';
      expect(claudeAdapter.isAvailable()).toBe(true);
    });

    test('returns true when CLAUDE_API_KEY is set', () => {
      process.env['CLAUDE_API_KEY'] = 'claude-key';
      expect(claudeAdapter.isAvailable()).toBe(true);
    });

    test('returns false when neither key is set', () => {
      delete process.env['ANTHROPIC_API_KEY'];
      delete process.env['CLAUDE_API_KEY'];
      expect(claudeAdapter.isAvailable()).toBe(false);
    });
  });

  describe('createSession', () => {
    test('spawns claude cli with -p flag and task', () => {
      claudeAdapter.createSession({ task: 'implement feature' });
      expect(mockSpawnProcess).toHaveBeenCalledWith(
        'claude',
        ['-p', 'implement feature'],
        expect.any(Object),
      );
    });

    test('session provider is claude', () => {
      expect(claudeAdapter.provider).toBe('claude');
    });

    test('session starts in running status', () => {
      const session = claudeAdapter.createSession({ task: 'task' });
      expect(session.status).toBe('running');
    });

    test('session collects stdout lines', () => {
      const session = claudeAdapter.createSession({ task: 'task' });
      const stdoutHandler = mockSpawnResult.onStdout.mock.calls[0]?.[0] as
        | ((line: string) => void)
        | undefined;
      stdoutHandler?.('output line');
      expect(session.output).toContain('output line');
    });
  });
});
