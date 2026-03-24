export type AgentSessionStatus = 'idle' | 'running' | 'done' | 'error';

export type AgentSessionEvent =
  | { type: 'stdout'; line: string }
  | { type: 'stderr'; line: string }
  | { type: 'done'; exitCode: number }
  | { type: 'error'; error: Error };

export type AgentSessionOptions = {
  task: string;
  timeout?: number;
  env?: Record<string, string>;
};

export type AgentSession = {
  id: string;
  status: AgentSessionStatus;
  output: string[];
  send(input: string): void;
  kill(): void;
  wait(): Promise<number>;
};

export type CliAdapter = {
  readonly provider: string;
  isAvailable(): boolean;
  createSession(options: AgentSessionOptions): AgentSession;
};
