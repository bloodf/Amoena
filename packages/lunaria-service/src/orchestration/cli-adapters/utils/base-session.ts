import { randomUUID } from 'crypto';
import type { AgentSession, AgentSessionStatus } from '../types';
import type { SpawnResult } from './spawn';
import { DEFAULT_SESSION_TIMEOUT_MS, withTimeout } from './timeout';
import { detectVersionFromLine, parserRegistry, type OutputParser } from './parser-registry';

export abstract class BaseAgentSession implements AgentSession {
  readonly id: string;
  status: AgentSessionStatus;
  output: string[];

  protected readonly spawn: SpawnResult;
  private readonly exitPromise: Promise<number>;
  /** The resolved parser for this session, based on detected version. */
  protected readonly parser: OutputParser;

  constructor(spawn: SpawnResult, agentId: string, timeoutMs = DEFAULT_SESSION_TIMEOUT_MS) {
    this.id = randomUUID();
    this.status = 'running';
    this.output = [];
    this.spawn = spawn;

    spawn.onStdout((line) => {
      this.output.push(line);
    });

    spawn.onStderr((line) => {
      this.output.push(line);
    });

    // Detect version from captured output lines
    const detectedVersion = this.detectVersion(agentId);
    this.parser = parserRegistry.resolve(agentId, detectedVersion);

    this.exitPromise = withTimeout(
      new Promise<number>((resolve) => {
        spawn.onExit((code) => {
          this.status = code === 0 ? 'done' : 'error';
          resolve(code);
        });
      }),
      timeoutMs,
      'agent session',
    ).catch((err: unknown) => {
      this.status = 'error';
      spawn.kill();
      throw err;
    });
  }

  /**
   * Scans captured output lines to detect the CLI version.
   * Returns `null` if no version was detected.
   */
  private detectVersion(_agentId: string): string | null {
    for (const line of this.output) {
      const version = detectVersionFromLine(line);
      if (version !== null) {
        return version;
      }
    }
    return null;
  }

  /**
   * Parses a result line using the session's resolved parser.
   */
  parseLine(line: string) {
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
