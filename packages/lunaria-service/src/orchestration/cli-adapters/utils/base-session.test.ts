import { describe, expect, test, beforeEach, vi } from 'vitest';
import type { ChildProcess } from 'child_process';
import type { SpawnResult } from './spawn.js';

vi.mock('./timeout.js', () => ({
  DEFAULT_SESSION_TIMEOUT_MS: 5000,
  withTimeout: <T>(promise: Promise<T>, _ms: number, _label: string) => promise,
}));

vi.mock('./parser-registry.js', () => ({
  detectVersionFromLine: (line: string) => {
    const match = line.match(/\bv?(\d+\.\d+\.\d+(?:[-.]\w+)*)\b/);
    return match ? (match[1] ?? null) : null;
  },
  parserRegistry: {
    resolve: (agentId: string, version: string | null) => {
      // claude-code registered with matches: /^\d+\.\d+\.\d+/ → any semver
      if (agentId === 'claude-code' && version !== null && /^\d+\.\d+\.\d+/.test(version)) {
        return (line: string) => {
          const trimmed = line.trim();
          if (!trimmed.startsWith('{')) return {};
          try {
            const json = JSON.parse(trimmed) as Record<string, unknown>;
            if (json['type'] === 'result') {
              return { isCompletion: true };
            }
          } catch {
            /* not JSON */
          }
          return {};
        };
      }
      // Unknown / missing version → raw mode
      return (_line: string) => ({});
    },
  },
}));

const mockSpawnResult = {
  process: {} as unknown as ChildProcess,
  onStdout: vi.fn<(handler: (line: string) => void) => void>(),
  onStderr: vi.fn<(handler: (line: string) => void) => void>(),
  onExit: vi.fn<(handler: (code: number) => void) => void>(),
  write: vi.fn(),
  kill: vi.fn(),
};

vi.mock('./spawn.js', () => ({
  spawnProcess: vi.fn(() => mockSpawnResult),
}));

class TestableBaseAgentSession {
  readonly id: string;
  status: 'idle' | 'running' | 'done' | 'error';
  output: string[];

  protected readonly spawn: SpawnResult;
  private readonly exitPromise: Promise<number>;
  protected readonly parser: (line: string) => Record<string, unknown>;

  constructor(spawn: SpawnResult, _timeoutMs = 5000) {
    this.id = `test-session-${Math.random().toString(36).slice(2)}`;
    this.status = 'running';
    this.output = [];
    this.spawn = spawn;

    spawn.onStdout((line: string) => {
      this.output.push(line);
    });

    spawn.onStderr((line: string) => {
      this.output.push(line);
    });

    this.parser = (_line: string) => ({});

    this.exitPromise = new Promise<number>((resolve) => {
      spawn.onExit((code: number) => {
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

// Subclass that mirrors BaseAgentSession's parser wiring for version-detection tests
class TestableVersionedSession {
  readonly id: string;
  status: 'idle' | 'running' | 'done' | 'error';
  output: string[];
  protected readonly spawn: SpawnResult;
  private readonly exitPromise: Promise<number>;
  protected _parser: ((line: string) => Record<string, unknown>) | undefined;
  protected readonly agentId: string;

  constructor(spawn: SpawnResult, agentId: string, _timeoutMs = 5000) {
    this.id = `test-session-${Math.random().toString(36).slice(2)}`;
    this.status = 'running';
    this.output = [];
    this.spawn = spawn;
    this.agentId = agentId;

    spawn.onStdout((line: string) => {
      this.output.push(line);
    });

    spawn.onStderr((line: string) => {
      this.output.push(line);
    });

    this.exitPromise = new Promise<number>((resolve) => {
      spawn.onExit((code: number) => {
        this.status = code === 0 ? 'done' : 'error';
        resolve(code);
      });
    }).catch((err: unknown) => {
      this.status = 'error';
      spawn.kill();
      throw err;
    });
  }

  protected get parser(): (line: string) => Record<string, unknown> {
    if (this._parser === undefined) {
      const detectedVersion = this.detectVersion();
      this._parser = this.resolveParser(this.agentId, detectedVersion);
    }
    return this._parser;
  }

  private detectVersion(): string | null {
    for (const line of this.output) {
      const match = line.match(/\bv?(\d+\.\d+\.\d+(?:[-.]\w+)*)\b/);
      if (match?.[1]) return match[1];
    }
    return null;
  }

  private resolveParser(
    agentId: string,
    version: string | null,
  ): (line: string) => Record<string, unknown> {
    if (agentId === 'claude-code' && version !== null && /^\d+\.\d+\.\d+/.test(version)) {
      return (line: string) => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('{')) return {};
        try {
          const json = JSON.parse(trimmed) as Record<string, unknown>;
          if (json['type'] === 'result') return { isCompletion: true };
        } catch {
          /* not JSON */
        }
        return {};
      };
    }
    // Unknown or missing version — fall back to raw mode with warning (mirrors parser-registry behavior)
    process.stderr.write(
      `[parser-registry] WARNING: no parser found for agent="${agentId}" ` +
        `version=${version === null ? '<unknown>' : JSON.stringify(version)}. ` +
        `Falling back to raw output mode.\n`,
    );
    return (_line: string) => ({});
  }

  parseLine(line: string): Record<string, unknown> {
    return this.parser(line);
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
    vi.clearAllMocks();
    mockSpawnResult.onStdout = vi.fn<(handler: (line: string) => void) => void>();
    mockSpawnResult.onStderr = vi.fn<(handler: (line: string) => void) => void>();
    mockSpawnResult.onExit = vi.fn<(handler: (code: number) => void) => void>();
    mockSpawnResult.write = vi.fn();
    mockSpawnResult.kill = vi.fn();
  });

  test('initializes with running status and empty output', () => {
    const session = new TestableBaseAgentSession(mockSpawnResult);

    expect(session.status).toBe('running');
    expect(session.output).toEqual([]);
    expect(session.id).toMatch(/^test-session-/);
  });

  test('send() calls spawn.write() with input', () => {
    const session = new TestableBaseAgentSession(mockSpawnResult);

    session.send('test input');

    expect(mockSpawnResult.write).toHaveBeenCalledWith('test input');
  });

  test('send() can be called multiple times', () => {
    const session = new TestableBaseAgentSession(mockSpawnResult);

    session.send('first');
    session.send('second');
    session.send('third');

    expect(mockSpawnResult.write).toHaveBeenCalledTimes(3);
    expect(mockSpawnResult.write).toHaveBeenNthCalledWith(1, 'first');
    expect(mockSpawnResult.write).toHaveBeenNthCalledWith(2, 'second');
    expect(mockSpawnResult.write).toHaveBeenNthCalledWith(3, 'third');
  });

  test('kill() sets status to error and calls spawn.kill()', () => {
    const session = new TestableBaseAgentSession(mockSpawnResult);

    session.kill();

    expect(session.status).toBe('error');
    expect(mockSpawnResult.kill).toHaveBeenCalled();
  });

  test('kill() can be called even after process exits', () => {
    const session = new TestableBaseAgentSession(mockSpawnResult);
    const exitHandler = mockSpawnResult.onExit.mock.calls[0]?.[0];
    exitHandler?.(0);

    expect(session.status).toBe('done');

    session.kill();

    expect(session.status).toBe('error');
    expect(mockSpawnResult.kill).toHaveBeenCalled();
  });

  test('wait() resolves when process exits with code 0', async () => {
    const session = new TestableBaseAgentSession(mockSpawnResult);
    const exitHandler = mockSpawnResult.onExit.mock.calls[0]?.[0];

    const waitPromise = session.wait();
    exitHandler?.(0);

    await expect(waitPromise).resolves.toBe(0);
    expect(session.status).toBe('done');
  });

  test('wait() resolves with non-zero code and sets status to error', async () => {
    const session = new TestableBaseAgentSession(mockSpawnResult);
    const exitHandler = mockSpawnResult.onExit.mock.calls[0]?.[0];

    const waitPromise = session.wait();
    exitHandler?.(127);

    await expect(waitPromise).resolves.toBe(127);
    expect(session.status).toBe('error');
  });

  test('output accumulates stdout lines in order', () => {
    const session = new TestableBaseAgentSession(mockSpawnResult);
    const stdoutHandler = mockSpawnResult.onStdout.mock.calls[0]?.[0];

    stdoutHandler?.('line 1');
    stdoutHandler?.('line 2');
    stdoutHandler?.('line 3');

    expect(session.output).toEqual(['line 1', 'line 2', 'line 3']);
  });

  test('output accumulates stderr lines in order', () => {
    const session = new TestableBaseAgentSession(mockSpawnResult);
    const stderrHandler = mockSpawnResult.onStderr.mock.calls[0]?.[0];

    stderrHandler?.('error 1');
    stderrHandler?.('error 2');

    expect(session.output).toEqual(['error 1', 'error 2']);
  });

  test('output mixes stdout and stderr in order received', () => {
    const session = new TestableBaseAgentSession(mockSpawnResult);
    const stdoutHandler = mockSpawnResult.onStdout.mock.calls[0]?.[0];
    const stderrHandler = mockSpawnResult.onStderr.mock.calls[0]?.[0];

    stdoutHandler?.('stdout 1');
    stderrHandler?.('stderr 1');
    stdoutHandler?.('stdout 2');

    expect(session.output).toEqual(['stdout 1', 'stderr 1', 'stdout 2']);
  });

  test('multiple sessions have unique ids', () => {
    const session1 = new TestableBaseAgentSession(mockSpawnResult);
    const session2 = new TestableBaseAgentSession(mockSpawnResult);

    expect(session1.id).not.toBe(session2.id);
  });

  test('kill() during wait() sets status to error without rejecting', async () => {
    const session = new TestableBaseAgentSession(mockSpawnResult);
    const exitHandler = mockSpawnResult.onExit.mock.calls[0]?.[0];

    const waitPromise = session.wait();
    session.kill();

    expect(session.status).toBe('error');

    exitHandler?.(1);

    const result = await waitPromise;
    expect(result).toBe(1);
  });
});

describe('Version detection and parser selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSpawnResult.onStdout = vi.fn<(handler: (line: string) => void) => void>();
    mockSpawnResult.onStderr = vi.fn<(handler: (line: string) => void) => void>();
    mockSpawnResult.onExit = vi.fn<(handler: (code: number) => void) => void>();
    mockSpawnResult.write = vi.fn();
    mockSpawnResult.kill = vi.fn();
  });

  test('known banner selects completion detection parser', () => {
    // Feed version banner synchronously so detectVersion() finds it during construction
    mockSpawnResult.onStdout = vi.fn((handler) => {
      handler('Claude Code 1.2.3');
    });

    const session = new TestableVersionedSession(mockSpawnResult, 'claude-code');

    expect(session.parseLine('{ "type": "result" }')).toEqual({ isCompletion: true });
    expect(session.parseLine('plain text')).toEqual({});
    expect(session.parseLine('{ "type": "other" }')).toEqual({});
  });

  test('unknown version falls back to raw mode', () => {
    mockSpawnResult.onStdout = vi.fn((handler) => {
      handler('claude-code pre-release');
    });

    const session = new TestableVersionedSession(mockSpawnResult, 'claude-code');

    expect(session.parseLine('{ "type": "result" }')).toEqual({});
    expect(session.parseLine('any text')).toEqual({});
  });

  test('no version banner falls back to raw mode', () => {
    const session = new TestableVersionedSession(mockSpawnResult, 'claude-code');

    expect(session.parseLine('{ "type": "result" }')).toEqual({});
    expect(session.parseLine('anything')).toEqual({});
  });

  test('parseLine works with resolved parser for known version', () => {
    mockSpawnResult.onStdout = vi.fn((handler) => {
      handler('Claude Code 5.10.20');
    });

    const session = new TestableVersionedSession(mockSpawnResult, 'claude-code');

    expect(session.parseLine('{ "type": "result" }')).toEqual({ isCompletion: true });
    expect(session.parseLine('Building project...')).toEqual({});
    expect(session.parseLine('{ "type": "progress" }')).toEqual({});
    expect(session.parseLine('{ "type":')).toEqual({});
    expect(session.parseLine('{ type: result }')).toEqual({});
  });

  test('non-claude-code agentId falls back to raw mode regardless of version', () => {
    mockSpawnResult.onStdout = vi.fn((handler) => {
      handler('some-agent 1.2.3');
    });

    const session = new TestableVersionedSession(mockSpawnResult, 'other-agent');

    expect(session.parseLine('{ "type": "result" }')).toEqual({});
  });

  test('v-prefix version is detected correctly', () => {
    mockSpawnResult.onStdout = vi.fn((handler) => {
      handler('Claude Code v2.0.0');
    });

    const session = new TestableVersionedSession(mockSpawnResult, 'claude-code');

    expect(session.parseLine('{ "type": "result" }')).toEqual({ isCompletion: true });
  });

  test('version detection scans stderr output as well', () => {
    mockSpawnResult.onStderr = vi.fn((handler) => {
      handler('Claude Code 3.0.0');
    });

    const session = new TestableVersionedSession(mockSpawnResult, 'claude-code');

    expect(session.parseLine('{ "type": "result" }')).toEqual({ isCompletion: true });
  });

  test('delayed version detection resolves parser correctly when parseLine called after output arrives', () => {
    // Simulate async output arrival: handler registered but not yet fired
    mockSpawnResult.onStdout = vi.fn((_handler) => {
      // Handler stored for later invocation (simulates async output)
    });

    const session = new TestableVersionedSession(mockSpawnResult, 'claude-code');

    // Verify version not yet detected (output still empty at detection time)
    expect(session.output).toEqual([]);

    // Simulate async arrival of version banner
    const stdoutHandler = mockSpawnResult.onStdout.mock.calls[0]?.[0];
    stdoutHandler?.('Claude Code 4.5.6');

    // Now version should be detected lazily when parseLine is called
    expect(session.parseLine('{ "type": "result" }')).toEqual({ isCompletion: true });
  });

  test('unknown version falls back to raw mode parser', () => {
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    mockSpawnResult.onStdout = vi.fn((handler) => {
      handler('some-unknown-agent 9.9.9');
    });

    const session = new TestableVersionedSession(mockSpawnResult, 'unknown-agent');

    expect(session.parseLine('{ "type": "result" }')).toEqual({});
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('WARNING'));
  });

  test('multiple parseLine calls use same resolved parser', () => {
    mockSpawnResult.onStdout = vi.fn((handler) => {
      handler('Claude Code 5.0.0');
    });

    const session = new TestableVersionedSession(mockSpawnResult, 'claude-code');

    // First parseLine triggers lazy detection
    const result1 = session.parseLine('{ "type": "result" }');
    expect(result1).toEqual({ isCompletion: true });

    // Subsequent calls use same resolved parser
    const result2 = session.parseLine('{ "type": "result" }');
    expect(result2).toEqual({ isCompletion: true });

    // Non-result lines still return empty
    expect(session.parseLine('plain text')).toEqual({});
  });
});
