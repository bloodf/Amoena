import { describe, expect, mock, test, beforeEach, afterEach } from 'bun:test';
import type { ChildProcess } from 'child_process';

// We mock the spawn module before importing the adapter
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

// Import after mock is set up
const { geminiAdapter } = await import('../gemini-adapter');

describe('gemini adapter', () => {
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
      delete process.env['GOOGLE_API_KEY'];
      delete process.env['GEMINI_API_KEY'];
    });

    test('returns true when GOOGLE_API_KEY is set', () => {
      process.env['GOOGLE_API_KEY'] = 'gapi-key';
      expect(geminiAdapter.isAvailable()).toBe(true);
    });

    test('returns true when GEMINI_API_KEY is set', () => {
      process.env['GEMINI_API_KEY'] = 'gemini-key';
      expect(geminiAdapter.isAvailable()).toBe(true);
    });

    test('returns false when neither key is set', () => {
      delete process.env['GOOGLE_API_KEY'];
      delete process.env['GEMINI_API_KEY'];
      expect(geminiAdapter.isAvailable()).toBe(false);
    });
  });

  describe('createSession', () => {
    test('spawns gemini cli with -p flag and task', () => {
      geminiAdapter.createSession({ task: 'write tests' });

      expect(mockSpawnProcess).toHaveBeenCalledWith(
        'gemini',
        ['-p', 'write tests'],
        expect.any(Object),
      );
    });

    test('session provider is gemini', () => {
      expect(geminiAdapter.provider).toBe('gemini');
    });

    test('session starts in running status', () => {
      const session = geminiAdapter.createSession({ task: 'do something' });
      expect(session.status).toBe('running');
    });

    test('session collects stdout lines into output', () => {
      const session = geminiAdapter.createSession({ task: 'generate code' });

      // Grab the stdout handler registered during construction
      const stdoutHandler = mockSpawnResult.onStdout.mock.calls[0]?.[0] as
        | ((line: string) => void)
        | undefined;
      expect(stdoutHandler).toBeDefined();
      stdoutHandler?.('line one');
      stdoutHandler?.('line two');

      expect(session.output).toContain('line one');
      expect(session.output).toContain('line two');
    });

    test('session.kill() terminates the process', () => {
      const session = geminiAdapter.createSession({ task: 'task' });
      session.kill();
      expect(mockSpawnResult.kill).toHaveBeenCalled();
      expect(session.status).toBe('error');
    });

    test('session.send() writes to stdin', () => {
      const session = geminiAdapter.createSession({ task: 'task' });
      session.send('user input\n');
      expect(mockSpawnResult.write).toHaveBeenCalledWith('user input\n');
    });

    test('session.wait() resolves with exit code on success', async () => {
      const session = geminiAdapter.createSession({ task: 'task' });

      const exitHandler = mockSpawnResult.onExit.mock.calls[0]?.[0] as
        | ((code: number) => void)
        | undefined;
      expect(exitHandler).toBeDefined();

      const waitPromise = session.wait();
      exitHandler?.(0);

      const code = await waitPromise;
      expect(code).toBe(0);
      expect(session.status).toBe('done');
    });

    test('session.wait() resolves with non-zero exit code on failure', async () => {
      const session = geminiAdapter.createSession({ task: 'task' });

      const exitHandler = mockSpawnResult.onExit.mock.calls[0]?.[0] as
        | ((code: number) => void)
        | undefined;

      const waitPromise = session.wait();
      exitHandler?.(1);

      const code = await waitPromise;
      expect(code).toBe(1);
      expect(session.status).toBe('error');
    });
  });
});
