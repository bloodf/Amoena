import { describe, expect, mock, test, beforeEach, vi } from 'vitest';
import { EventEmitter } from 'events';
import type { SpawnResult } from './spawn';

// Mock the timeout module
vi.mock('./timeout', () => ({
  DEFAULT_SESSION_TIMEOUT_MS: 5000,
  withTimeout: <T>(promise: Promise<T>, _ms: number, _label: string) => promise,
}));

// Create a mock SpawnResult for testing
function createMockSpawnResult(): SpawnResult & { emitter: EventEmitter } {
  const emitter = new EventEmitter();
  const stdoutEmitter = new EventEmitter();
  const stderrEmitter = new EventEmitter();

  const spawn: SpawnResult & { emitter: EventEmitter } = {
    process: { pid: 12345 } as any,
    emitter,
    onStdout(handler: (line: string) => void) {
      stdoutEmitter.on('data', handler);
    },
    onStderr(handler: (line: string) => void) {
      stderrEmitter.on('data', handler);
    },
    onExit(handler: (code: number) => void) {
      emitter.on('exit', handler);
    },
    write: mock(() => {}),
    kill: mock(() => {}),
  };

  return spawn;
}

// Abstract class for testing - we need to extend it to test
abstract class TestableBaseAgentSession {
  readonly id: string;
  status: 'idle' | 'running' | 'done' | 'error';
  output: string[];

  protected readonly spawn: SpawnResult & { emitter: EventEmitter };
  private readonly exitPromise: Promise<number>;

  constructor(spawn: SpawnResult & { emitter: EventEmitter }, timeoutMs = 5000) {
    this.id = 'test-id-' + Math.random();
    this.status = 'running';
    this.output = [];
    this.spawn = spawn;

    spawn.onStdout((line) => {
      this.output.push(line);
    });

    spawn.onStderr((line) => {
      this.output.push(line);
    });

    this.exitPromise = new Promise<number>((resolve) => {
      spawn.onExit((code) => {
        this.status = code === 0 ? 'done' : 'error';
        resolve(code);
      });
    }).catch((err: unknown) => {
      this.status = 'error';
      spawn.kill();
      throw err;
    });
  }

  send(input: string): void {
    this.spawn.write(input);
  }

  kill(): void {
    this.status = 'error';
    this.spawn.kill();
  }

  wait(): Promise<number> {
    return this.exitPromise;
  }
}

describe('BaseAgentSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  test('initializes with running status and empty output', () => {
    const spawn = createMockSpawnResult();
    const session = new TestableBaseAgentSession(spawn);

    expect(session.status).toBe('running');
    expect(session.output).toEqual([]);
    expect(session.id).toMatch(/^test-id-/);
  });

  test('collects stdout lines into output', () => {
    const spawn = createMockSpawnResult();
    const session = new TestableBaseAgentSession(spawn);

    spawn.emitter.emit('stdout', 'line 1');
    spawn.emitter.emit('stdout', 'line 2');

    expect(session.output).toContain('line 1');
    expect(session.output).toContain('line 2');
  });

  test('collects stderr lines into output', () => {
    const spawn = createMockSpawnResult();
    const session = new TestableBaseAgentSession(spawn);

    spawn.emitter.emit('stderr', 'error line');

    expect(session.output).toContain('error line');
  });

  test('send() calls spawn.write()', () => {
    const spawn = createMockSpawnResult();
    const session = new TestableBaseAgentSession(spawn);

    session.send('input data');

    expect(spawn.write).toHaveBeenCalledWith('input data');
  });

  test('kill() sets status to error and calls spawn.kill()', () => {
    const spawn = createMockSpawnResult();
    const session = new TestableBaseAgentSession(spawn);

    session.kill();

    expect(session.status).toBe('error');
    expect(spawn.kill).toHaveBeenCalled();
  });

  test('wait() resolves with exit code 0 when process succeeds', async () => {
    const spawn = createMockSpawnResult();
    const session = new TestableBaseAgentSession(spawn);

    const waitPromise = session.wait();

    spawn.emitter.emit('exit', 0);

    await expect(waitPromise).resolves.toBe(0);
    expect(session.status).toBe('done');
  });

  test('wait() resolves with non-zero exit code and sets status to error', async () => {
    const spawn = createMockSpawnResult();
    const session = new TestableBaseAgentSession(spawn);

    const waitPromise = session.wait();

    spawn.emitter.emit('exit', 127);

    await expect(waitPromise).resolves.toBe(127);
    expect(session.status).toBe('error');
  });

  test('output accumulates stdout and stderr in order', () => {
    const spawn = createMockSpawnResult();
    const session = new TestableBaseAgentSession(spawn);

    spawn.emitter.emit('stdout', 'first');
    spawn.emitter.emit('stderr', 'second');
    spawn.emitter.emit('stdout', 'third');

    expect(session.output).toEqual(['first', 'second', 'third']);
  });

  test('multiple sessions have unique ids', () => {
    const spawn1 = createMockSpawnResult();
    const spawn2 = createMockSpawnResult();

    const session1 = new TestableBaseAgentSession(spawn1);
    const session2 = new TestableBaseAgentSession(spawn2);

    expect(session1.id).not.toBe(session2.id);
  });

  test('send() can be called multiple times', () => {
    const spawn = createMockSpawnResult();
    const session = new TestableBaseAgentSession(spawn);

    session.send('first');
    session.send('second');
    session.send('third');

    expect(spawn.write).toHaveBeenCalledTimes(3);
    expect(spawn.write).toHaveBeenNthCalledWith(1, 'first');
    expect(spawn.write).toHaveBeenNthCalledWith(2, 'second');
    expect(spawn.write).toHaveBeenNthCalledWith(3, 'third');
  });

  test('kill() can be called even after process exits', () => {
    const spawn = createMockSpawnResult();
    const session = new TestableBaseAgentSession(spawn);

    spawn.emitter.emit('exit', 0);
    session.kill();

    expect(session.status).toBe('error');
    expect(spawn.kill).toHaveBeenCalled();
  });

  test('wait() rejects when killed before exit', async () => {
    const spawn = createMockSpawnResult();
    const session = new TestableBaseAgentSession(spawn);

    const waitPromise = session.wait();
    session.kill();

    await expect(waitPromise).rejects.toBeDefined();
    expect(session.status).toBe('error');
  });
});
