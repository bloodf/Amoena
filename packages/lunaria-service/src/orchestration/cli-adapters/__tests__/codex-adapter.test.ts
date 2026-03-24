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

const { codexAdapter } = await import('../codex-adapter');

describe('codex adapter', () => {
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
      delete process.env['OPENAI_API_KEY'];
    });

    test('returns true when OPENAI_API_KEY is set', () => {
      process.env['OPENAI_API_KEY'] = 'sk-openai-key';
      expect(codexAdapter.isAvailable()).toBe(true);
    });

    test('returns false when OPENAI_API_KEY is not set', () => {
      delete process.env['OPENAI_API_KEY'];
      expect(codexAdapter.isAvailable()).toBe(false);
    });
  });

  describe('createSession', () => {
    test('spawns codex cli with -p flag and task', () => {
      codexAdapter.createSession({ task: 'refactor module' });
      expect(mockSpawnProcess).toHaveBeenCalledWith(
        'codex',
        ['-p', 'refactor module'],
        expect.any(Object),
      );
    });

    test('session provider is codex', () => {
      expect(codexAdapter.provider).toBe('codex');
    });

    test('session starts in running status', () => {
      const session = codexAdapter.createSession({ task: 'task' });
      expect(session.status).toBe('running');
    });
  });
});
