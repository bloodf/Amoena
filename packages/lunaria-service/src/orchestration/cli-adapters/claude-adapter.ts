import { randomUUID } from "node:crypto";
import type { ChildProcess } from "node:child_process";
import type {
  AgentAdapter,
  AgentCapability,
  AdapterTask,
  AgentSession,
  SessionResult,
  TokenUsage,
  OutputChunk,
  ParsedOutput,
} from "./types.js";
import { spawnCliAgent } from "./utils/spawn.js";
import { handleTimeout, type TimeoutHandle } from "./utils/timeout.js";
import {
  BaseAgentSession,
  CancelledError,
} from "./utils/base-session.js";

// ---------------------------------------------------------------------------
// Claude JSON line parser
// ---------------------------------------------------------------------------

interface ClaudeResultLine {
  type: "result";
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  cost_usd?: number;
}

function parseClaudeJsonLine(json: unknown): ParsedOutput | undefined {
  if (typeof json !== "object" || json === null) return undefined;
  const obj = json as Record<string, unknown>;

  if (obj["type"] === "result") {
    const line = obj as unknown as ClaudeResultLine;
    const usage = line.usage;
    const parsed: ParsedOutput = { isCompletion: true };
    if (usage) {
      const input = usage.input_tokens ?? 0;
      const output = usage.output_tokens ?? 0;
      parsed.tokenUsage = {
        inputTokens: input,
        outputTokens: output,
        totalTokens: input + output,
      };
    }
    if (typeof line.cost_usd === "number") {
      parsed.costHint = `$${line.cost_usd.toFixed(6)}`;
    }
    return parsed;
  }

  if (obj["type"] === "assistant") {
    return {};
  }

  // "system" and other lines are ignored
  return undefined;
}

// ---------------------------------------------------------------------------
// ClaudeCodeSession
// ---------------------------------------------------------------------------

export class ClaudeCodeSession extends BaseAgentSession {
  private _process: ChildProcess | null = null;
  private _timeoutHandle: TimeoutHandle | null = null;
  private _startedAt = 0;
  private _stdoutBuf = "";
  private _stderrBuf = "";
  private _tokenUsage: TokenUsage | null = null;
  private _lineBuffer = "";

  constructor(id: string) {
    super(id, "claude-code");
  }

  /**
   * Store process and timeout references; status transitions to "running".
   * Callbacks are wired BEFORE this call via spawnCliAgent, so no listeners
   * are added here.
   */
  _attach(proc: ChildProcess, timeoutHandle: TimeoutHandle): void {
    this._process = proc;
    this._timeoutHandle = timeoutHandle;
    this._startedAt = Date.now();
    this.setStatus("running");
  }

  handleStdout(data: Buffer): void {
    const text = data.toString("utf8");
    this._stdoutBuf += text;
    this._lineBuffer += text;

    let newlineIdx: number;
    while ((newlineIdx = this._lineBuffer.indexOf("\n")) !== -1) {
      const line = this._lineBuffer.slice(0, newlineIdx);
      this._lineBuffer = this._lineBuffer.slice(newlineIdx + 1);
      this._processLine(line);
    }
  }

  private _processLine(line: string): void {
    const trimmed = line.trim();
    if (!trimmed) return;

    let parsed: ParsedOutput | undefined;
    try {
      const json: unknown = JSON.parse(trimmed);
      parsed = parseClaudeJsonLine(json);

      if (parsed?.tokenUsage) {
        const tu = parsed.tokenUsage;
        this._tokenUsage = {
          inputTokens:
            (this._tokenUsage?.inputTokens ?? 0) + (tu.inputTokens ?? 0),
          outputTokens:
            (this._tokenUsage?.outputTokens ?? 0) + (tu.outputTokens ?? 0),
          totalTokens:
            (this._tokenUsage?.totalTokens ?? 0) + (tu.totalTokens ?? 0),
        };
      }
    } catch {
      // Not JSON — plain text output
    }

    const chunk: OutputChunk = {
      sessionId: this.id,
      timestamp: Date.now(),
      text: line,
      type: "stdout",
      parsed,
    };
    this.emit("output", chunk);
  }

  handleStderr(data: Buffer): void {
    const text = data.toString("utf8");
    this._stderrBuf += text;

    const chunk: OutputChunk = {
      sessionId: this.id,
      timestamp: Date.now(),
      text,
      type: "stderr",
    };
    this.emit("output", chunk);
    this.emit("error", new Error(text));
  }

  handleExit(code: number | null, _signal: string | null): void {
    this._timeoutHandle?.clear();

    // cancel() manages its own settle
    if (this._status === "cancelled") return;

    const durationMs = Date.now() - this._startedAt;
    const result: SessionResult = {
      sessionId: this.id,
      adapterId: this.adapterId,
      exitCode: code,
      stdout: this._stdoutBuf,
      stderr: this._stderrBuf,
      durationMs,
      tokenUsage: this._tokenUsage,
    };

    if (this._status === "timed_out") {
      // Status already set by timeout callback; resolve with partial result
      this.settle(result);
      return;
    }

    if (code === 0) {
      this.setStatus("completed");
    } else {
      this.setStatus("failed");
    }
    this.settle(result);
  }

  async cancel(): Promise<void> {
    if (
      this._status === "cancelled" ||
      this._status === "completed" ||
      this._status === "failed" ||
      this._status === "timed_out"
    ) {
      return;
    }

    this._timeoutHandle?.clear();
    this.setStatus("cancelled");

    const proc = this._process;
    if (!proc) {
      this.settle(new CancelledError(this.id));
      return;
    }

    await new Promise<void>((resolve) => {
      const killTimer = setTimeout(() => {
        try {
          proc.kill("SIGKILL");
        } catch {
          // Already dead
        }
      }, 5_000);

      proc.once("exit", () => {
        clearTimeout(killTimer);
        resolve();
      });

      try {
        proc.kill("SIGTERM");
      } catch {
        // Already dead
        clearTimeout(killTimer);
        resolve();
      }
    });

    this.settle(new CancelledError(this.id));
  }

  /** Expose setStatus for the timeout callback. */
  _setTimedOut(): void {
    if (this._status === "running" || this._status === "pending") {
      this.setStatus("timed_out");
    }
  }
}

// ---------------------------------------------------------------------------
// ClaudeCodeAdapter
// ---------------------------------------------------------------------------

export class ClaudeCodeAdapter implements AgentAdapter {
  readonly id = "claude-code";
  readonly displayName = "Claude Code";
  readonly capabilities: readonly AgentCapability[] = [
    "code-generation",
    "code-review",
    "refactoring",
    "analysis",
    "testing",
  ];
  readonly costPerToken = 0.000015;

  async isAvailable(): Promise<boolean> {
    return !!process.env["ANTHROPIC_API_KEY"];
  }

  spawn(task: AdapterTask): AgentSession {
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) {
      throw new Error(
        "ClaudeCodeAdapter: ANTHROPIC_API_KEY is not set. " +
          "Set the environment variable before spawning a session.",
      );
    }

    const session = new ClaudeCodeSession(randomUUID());

    const args = [
      "--dangerously-skip-permissions",
      "-p",
      task.prompt,
      "--output-format",
      "stream-json",
      "--verbose",
      ...(task.extraFlags ?? []),
    ];

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      ANTHROPIC_API_KEY: apiKey,
    };

    const timeoutMs = task.timeoutMs ?? 300_000;

    // Wire up callbacks before spawning so no events are missed
    const proc = spawnCliAgent({
      command: "claude",
      args,
      cwd: task.worktreePath,
      env,
      onStdout: (data) => session.handleStdout(data),
      onStderr: (data) => session.handleStderr(data),
      onExit: (code, signal) => session.handleExit(code, signal),
    });

    const timeoutHandle = handleTimeout(proc, timeoutMs, () => {
      session._setTimedOut();
    });

    session._attach(proc, timeoutHandle);

    return session;
  }
}
