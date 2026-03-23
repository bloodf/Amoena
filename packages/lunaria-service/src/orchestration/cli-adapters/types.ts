/**
 * Core interfaces and types for CLI adapter modules.
 */

export interface AgentAdapter {
  /** Stable machine identifier, e.g. "claude-code", "codex", "gemini" */
  readonly id: string;
  /** Human label shown in the UI */
  readonly displayName: string;
  /** What task types this adapter can handle */
  readonly capabilities: readonly AgentCapability[];
  /** Cost per 1k output tokens in USD; null if unknown */
  readonly costPerToken: number | null;
  /** Spawn a new session for the given task */
  spawn(task: AdapterTask): AgentSession;
  /** Check if the CLI tool is installed and credentials are present */
  isAvailable(): Promise<boolean>;
}

export type AgentCapability =
  | "code-generation"
  | "code-review"
  | "refactoring"
  | "analysis"
  | "documentation"
  | "testing";

export interface AdapterTask {
  /** Unique task ID from the DAG engine */
  id: string;
  /** The prompt/goal to send to the CLI tool */
  prompt: string;
  /** Absolute path to the git worktree this task runs in */
  worktreePath: string;
  /** Optional timeout in milliseconds; defaults to 300_000 (5 min) */
  timeoutMs?: number;
  /** Provider-specific extra flags, e.g. --model */
  extraFlags?: string[];
}

export interface AgentSession extends NodeJS.EventEmitter {
  /** Unique session ID */
  readonly id: string;
  /** Which adapter spawned this session */
  readonly adapterId: string;
  /** Current status */
  readonly status: SessionStatus;
  /** Resolves with the session result when done; rejects on fatal error */
  readonly result: Promise<SessionResult>;
  /** Send SIGTERM, wait 5s, then SIGKILL if still alive */
  cancel(): Promise<void>;
}

export type SessionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "timed_out"
  | "cancelled";

export interface SessionResult {
  sessionId: string;
  adapterId: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  tokenUsage: TokenUsage | null;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface OutputChunk {
  sessionId: string;
  timestamp: number; // Date.now()
  text: string; // raw text content
  type: "stdout" | "stderr";
  parsed?: ParsedOutput; // provider-specific parsed fields
}

export interface ParsedOutput {
  /** Detected token counts if present in output */
  tokenUsage?: Partial<TokenUsage>;
  /** True if this line signals task completion */
  isCompletion?: boolean;
  /** Extracted cost string if present */
  costHint?: string;
}
