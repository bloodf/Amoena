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
  /** The resolved parser for this session, based on detected version. Lazily resolved on first use. */
  protected _parser: OutputParser | undefined;
  /** The agent ID used for parser resolution. Stored in constructor (not abstract) to keep adapters constructible. */
  private readonly agentId: string;

  constructor(spawn: SpawnResult, agentId: string, timeoutMs = DEFAULT_SESSION_TIMEOUT_MS) {
    this.id = randomUUID();
    this.status = 'running';
    this.output = [];
    this.spawn = spawn;
    this.agentId = agentId;

    spawn.onStdout((line) => {
      this.output.push(line);
    });

    spawn.onStderr((line) => {
      this.output.push(line);
    });

    // NOTE: Version detection is intentionally deferred to first parseLine() call.
    // At construction time output[] is empty because the spawn callbacks haven't
    // fired yet. The lazy getter ensures detection runs after startup output arrives.

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
   * Lazy getter that resolves the parser on first use.
   * Version detection is deferred until here because parseLine() is called
   * only after startup output has arrived (containing the version banner).
   */
  protected get parser(): OutputParser {
    if (this._parser === undefined) {
      const version = this.detectVersion();
      this._parser = parserRegistry.resolve(this.agentId, version);
    }
    return this._parser;
  }

  /**
   * Scans captured output lines to detect the CLI version.
   * Returns `null` if no version was detected.
   */
  private detectVersion(): string | null {
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
