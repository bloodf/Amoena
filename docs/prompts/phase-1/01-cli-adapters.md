# Phase 1 — Prompt 01: CLI Adapters

## RALPH LOOP INSTRUCTIONS

You are running in an autonomous loop. These rules are non-negotiable:

1. **Never declare done without evidence.** Every claim of completion must be backed by passing test output or a build log you actually ran. Do not say "this should work" — run it and show the output.
2. **Self-correct on failure.** If a test fails, a type error fires, or a command errors, fix the root cause and re-run. Do not move on with known failures.
3. **No scope reduction.** If something is hard, find a way. Do not silently drop acceptance criteria because they seem difficult.
4. **Iterate until green.** Keep looping — fix, verify, fix, verify — until every acceptance criterion in this document is met. Then stop.
5. **Show your work.** After each significant step, output the verification command and its result.

---

## Component Overview

Build three CLI adapter modules that wrap the Claude Code, OpenAI Codex, and Google Gemini CLI tools as spawnable child processes. These adapters form the lowest layer of the Amoena Mission Control Platform: everything above (the DAG engine, UI, reporter) depends on these producing a consistent event stream.

The module lives at:

```
packages/amoena-service/src/orchestration/cli-adapters/
```

---

## Repository Context

- Monorepo root: `/Users/heitor/Developer/github.com/Amoena/amoena`
- This package: `packages/amoena-service/`
- Credential resolvers already exist at:
  - `packages/terminal-host/src/providers/model-providers/LocalModelProvider/utils/resolveAnthropicCredential.ts`
  - `packages/terminal-host/src/providers/model-providers/LocalModelProvider/utils/resolveOpenAICredential.ts`
- Orchestration types already at: `packages/amoena-service/src/orchestration/types.ts`
- Agent spawner reference (read before writing): `apps/dashboard/src/lib/` — `claude-sessions.ts`, `codex-sessions.ts`
- TypeScript config root: `tsconfig.json` at repo root; package-level `tsconfig.json` inherits from it
- Package manager: Bun (`bun.lock` at root, use `bun` commands not `npm`)

---

## What to Build

### Directory structure to create

```
packages/amoena-service/src/orchestration/cli-adapters/
  index.ts                   # re-exports
  types.ts                   # AgentAdapter, AgentSession interfaces
  utils/
    spawn.ts                 # spawnCliAgent() shared utility
    output-parser.ts         # parseOutput(), provider-agnostic base
    timeout.ts               # handleTimeout() shared utility
  claude-adapter.ts          # ClaudeCodeAdapter
  codex-adapter.ts           # CodexAdapter
  gemini-adapter.ts          # GeminiAdapter (stub — not all criteria apply)
```

---

## Interface Contracts

### AgentAdapter (types.ts)

```typescript
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
```

### Events emitted by AgentSession

| Event | Payload type | Description |
|---|---|---|
| `output` | `OutputChunk` | A chunk of parsed output from the process |
| `status` | `SessionStatus` | Status transition |
| `error` | `Error` | Non-fatal error (e.g. stderr line) |

```typescript
export interface OutputChunk {
  sessionId: string;
  timestamp: number;   // Date.now()
  text: string;        // raw text content
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
```

---

## Shared Utilities

### utils/spawn.ts — spawnCliAgent()

```typescript
import { spawn, type ChildProcess } from "node:child_process";

export interface SpawnOptions {
  command: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  timeoutMs: number;
  onStdout: (data: Buffer) => void;
  onStderr: (data: Buffer) => void;
  onExit: (code: number | null, signal: string | null) => void;
}

export function spawnCliAgent(opts: SpawnOptions): ChildProcess {
  // spawn with stdio: ['pipe', 'pipe', 'pipe']
  // do NOT buffer — emit each chunk as it arrives
  // the process must inherit the provided env (not process.env directly)
}
```

### utils/timeout.ts — handleTimeout()

```typescript
export interface TimeoutHandle {
  clear(): void;
}

export function handleTimeout(
  process: ChildProcess,
  timeoutMs: number,
  onTimeout: () => void,
): TimeoutHandle {
  // Set a timer for timeoutMs
  // On fire: send SIGTERM, wait 5000ms, send SIGKILL if still alive, call onTimeout()
  // clear() cancels the timer (call when process exits normally)
}
```

### utils/output-parser.ts

Base interface only — each adapter implements its own parser.

```typescript
export type OutputParser = (line: string) => ParsedOutput;
```

---

## ClaudeCodeAdapter

**File:** `claude-adapter.ts`

**Auth:** Import and call `resolveAnthropicCredential` from the terminal-host utils. The function signature returns `{ apiKey: string } | { sessionToken: string } | null`. Map the result to the `ANTHROPIC_API_KEY` env var or the appropriate Claude session mechanism.

**CLI command verification:** Before hardcoding any CLI flags, run `claude --help` and `claude -p --help` in the adapter's `isAvailable()` and document which flags you actually confirmed. The correct invocation for non-interactive use is:

```
claude -p "<prompt>" --output-format stream-json --verbose
```

Verify `--output-format stream-json` is a real flag before using it. If not available, use `--output-format json` or fall back to plain text output.

**Output parsing:** Claude Code emits JSON lines when `--output-format json` or `stream-json` is used. Each line is a JSON object with a `type` field. Parse:
- `type: "assistant"` → content blocks with text → emit as `output` event
- `type: "result"` → final result with `usage` → extract token counts
- `type: "system"` → ignore or log at debug level

**Capabilities:** `["code-generation", "code-review", "refactoring", "analysis", "testing"]`

**costPerToken:** `0.000015` (approximate for Sonnet; update to use the model routing once available)

---

## CodexAdapter

**File:** `codex-adapter.ts`

**Auth:** Import and call `resolveOpenAICredential` from the terminal-host utils. Map to `OPENAI_API_KEY` env var.

**CLI command verification:** Run `codex --help` to verify the exact invocation. The expected form is:

```
codex --quiet "<prompt>"
```

Confirm `--quiet` flag exists. Confirm whether `--model` flag exists. Document flags found.

**Output parsing:** Codex CLI typically emits plain text or structured JSON depending on version. Implement a best-effort line parser:
- If line starts with `{` → attempt JSON parse → look for `usage` or `content` fields
- Otherwise → treat as plain text output chunk

**Capabilities:** `["code-generation", "analysis", "documentation"]`

**costPerToken:** `0.000012` (approximate for GPT-4o)

---

## GeminiAdapter (stub)

**File:** `gemini-adapter.ts`

This is a stub. The full implementation is deferred, but the interface must be satisfied.

**Auth:** Read `GOOGLE_API_KEY` from `process.env`. If absent, `isAvailable()` returns false.

**CLI command:** Use `gemini` CLI if installed. `isAvailable()` checks both the env var and `which gemini`.

**spawn():** Return a session that immediately emits `status: "failed"` with an error `"Gemini adapter not yet implemented"`. This is intentional — the stub satisfies the interface and allows the router to skip Gemini gracefully.

**Capabilities:** `["code-generation", "analysis"]`

**costPerToken:** `null` (unknown)

---

## AgentSession Base Implementation

All three adapters should share a common `BaseAgentSession` class in `utils/base-session.ts`:

```typescript
import { EventEmitter } from "node:events";
import type { AgentSession, SessionStatus, SessionResult } from "../types";

export abstract class BaseAgentSession extends EventEmitter implements AgentSession {
  readonly id: string;
  readonly adapterId: string;
  protected _status: SessionStatus = "pending";
  readonly result: Promise<SessionResult>;
  protected _resolveResult!: (r: SessionResult) => void;
  protected _rejectResult!: (e: Error) => void;

  constructor(id: string, adapterId: string) {
    super();
    this.id = id;
    this.adapterId = adapterId;
    this.result = new Promise((resolve, reject) => {
      this._resolveResult = resolve;
      this._rejectResult = reject;
    });
  }

  get status(): SessionStatus { return this._status; }

  protected setStatus(s: SessionStatus): void {
    this._status = s;
    this.emit("status", s);
  }

  abstract cancel(): Promise<void>;
}
```

---

## Acceptance Criteria

All of the following must be true before this component is considered done:

1. **Interface compliance:** `ClaudeCodeAdapter`, `CodexAdapter`, and `GeminiAdapter` all implement `AgentAdapter` with no TypeScript errors.
2. **Session events:** Spawning an adapter emits at minimum `status: "running"` then either `status: "completed"` or `status: "failed"`. The `result` promise resolves/rejects consistently with the final status.
3. **Timeout behavior:** If a spawned process runs longer than `timeoutMs`, it receives SIGTERM. After 5 seconds, if still alive, it receives SIGKILL. The session status becomes `"timed_out"`.
4. **Cancel behavior:** Calling `session.cancel()` sends SIGTERM, waits 5s, sends SIGKILL. Status becomes `"cancelled"`. The `result` promise rejects with a `CancelledError`.
5. **Auth wiring:** `ClaudeCodeAdapter.spawn()` correctly injects the credential into the child process environment. If no credential is found, `isAvailable()` returns false and `spawn()` throws a descriptive error before forking.
6. **Output streaming:** Each chunk from stdout is emitted as an `output` event immediately (no buffering until process exit).
7. **Claude JSON parsing:** When using `--output-format json`, Claude JSON lines are parsed and token counts are extracted into `SessionResult.tokenUsage`.
8. **Gemini stub:** `GeminiAdapter.spawn()` returns a session that emits `status: "failed"` without attempting to fork a process.
9. **isAvailable() is safe:** All three `isAvailable()` implementations catch errors and return false rather than throwing.
10. **No process leaks:** When cancel or timeout fires, the child process is confirmed dead (check `process.killed`) before resolving.

---

## Test Requirements

Location: `packages/amoena-service/src/orchestration/cli-adapters/__tests__/`

### Unit tests (mock child_process)

Use `vi.mock("node:child_process")` or equivalent. Create a `MockChildProcess` helper that:
- Has `.stdout`, `.stderr` as `PassThrough` streams
- Has `.kill(signal)` method that records calls
- Has `.pid` set to a test value

**Test cases:**

```
ClaudeCodeAdapter
  ✓ spawn() returns a session with status "pending" then "running"
  ✓ stdout chunks emit "output" events with correct type
  ✓ process exit code 0 → status "completed", result resolves
  ✓ process exit code non-zero → status "failed", result resolves with exitCode
  ✓ timeout fires SIGTERM then SIGKILL after 5s, status becomes "timed_out"
  ✓ cancel() fires SIGTERM then SIGKILL, status becomes "cancelled"
  ✓ missing ANTHROPIC_API_KEY → isAvailable() returns false
  ✓ JSON output lines are parsed and tokenUsage populated

CodexAdapter
  ✓ spawn() returns a session with status "pending" then "running"
  ✓ process exit code 0 → status "completed"
  ✓ missing OPENAI_API_KEY → isAvailable() returns false

GeminiAdapter
  ✓ spawn() emits status "failed" without spawning a process
  ✓ missing GOOGLE_API_KEY → isAvailable() returns false
  ✓ isAvailable() returns false even if env var present (stub not ready)
```

### Integration tests (fixture-based)

Create `__tests__/fixtures/` with pre-recorded session outputs:
- `claude-session-success.jsonl` — 10-15 lines of real Claude JSON output (you can synthesize realistic data)
- `claude-session-token-counts.jsonl` — includes a `result` line with token usage

Use these to test the parser in isolation without spawning a real process.

---

## Dependencies on Other Components

- **Receives from:** Nothing yet — this is the bottom of the stack.
- **Auth utils:** Must be able to import from `packages/terminal-host/src/providers/model-providers/LocalModelProvider/utils/`. If the import path causes circular dependency issues, copy the minimal types (not the implementations) into a local `types/credentials.ts`.

---

## What This Provides to Other Components

- `02-dag-engine.md` imports `AgentAdapter`, `AgentSession`, `AdapterTask` from this module.
- The DAG engine calls `adapter.spawn(task)` and listens to `session` events.
- `03-telemetry.md` receives `SessionResult` from resolved session promises and writes it to SQLite.
- `05-mission-control-ui.md` receives `OutputChunk` events forwarded over WebSocket.

---

## Files to Create

| Path | Purpose |
|---|---|
| `packages/amoena-service/src/orchestration/cli-adapters/types.ts` | All interfaces and types |
| `packages/amoena-service/src/orchestration/cli-adapters/utils/spawn.ts` | spawnCliAgent() |
| `packages/amoena-service/src/orchestration/cli-adapters/utils/timeout.ts` | handleTimeout() |
| `packages/amoena-service/src/orchestration/cli-adapters/utils/output-parser.ts` | OutputParser base |
| `packages/amoena-service/src/orchestration/cli-adapters/utils/base-session.ts` | BaseAgentSession |
| `packages/amoena-service/src/orchestration/cli-adapters/claude-adapter.ts` | ClaudeCodeAdapter |
| `packages/amoena-service/src/orchestration/cli-adapters/codex-adapter.ts` | CodexAdapter |
| `packages/amoena-service/src/orchestration/cli-adapters/gemini-adapter.ts` | GeminiAdapter stub |
| `packages/amoena-service/src/orchestration/cli-adapters/index.ts` | Re-exports |
| `packages/amoena-service/src/orchestration/cli-adapters/__tests__/claude-adapter.test.ts` | Unit tests |
| `packages/amoena-service/src/orchestration/cli-adapters/__tests__/codex-adapter.test.ts` | Unit tests |
| `packages/amoena-service/src/orchestration/cli-adapters/__tests__/gemini-adapter.test.ts` | Unit tests |
| `packages/amoena-service/src/orchestration/cli-adapters/__tests__/fixtures/claude-session-success.jsonl` | Test fixture |
| `packages/amoena-service/src/orchestration/cli-adapters/__tests__/fixtures/claude-session-token-counts.jsonl` | Test fixture |

---

## Verification Commands

After implementation, run these and show the output:

```bash
# Type check
cd packages/amoena-service && bun tsc --noEmit

# Unit tests
bun test src/orchestration/cli-adapters/__tests__

# Check for process.env usage without injection (should be 0 results in adapter files)
grep -n "process\.env\." src/orchestration/cli-adapters/claude-adapter.ts
```
