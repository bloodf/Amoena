import { randomUUID } from 'crypto';
import type { AgentSession, AgentSessionStatus } from '../types';
import type { SpawnResult } from './spawn';
import { DEFAULT_SESSION_TIMEOUT_MS, withTimeout } from './timeout';

export abstract class BaseAgentSession implements AgentSession {
  readonly id: string;
  status: AgentSessionStatus;
  output: string[];

  protected readonly spawn: SpawnResult;
  private readonly exitPromise: Promise<number>;

  constructor(spawn: SpawnResult, timeoutMs = DEFAULT_SESSION_TIMEOUT_MS) {
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
