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
// Codex output parser (best-effort)
// ---------------------------------------------------------------------------

function parseCodexLine(line: string): ParsedOutput | undefined {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{")) return undefined;

  try {
    const json = JSON.parse(trimmed) as Record<string, unknown>;

    const parsed: ParsedOutput = {};

    // Extract token usage from "usage" field
    if (typeof json["usage"] === "object" && json["usage"] !== null) {
      const usage = json["usage"] as Record<string, unknown>;
      const input =
        typeof usage["prompt_tokens"] === "number"
          ? usage["prompt_tokens"]
          : typeof usage["input_tokens"] === "number"
            ? usage["input_tokens"]
            : undefined;
      const output =
        typeof usage["completion_tokens"] === "number"
          ? usage["completion_tokens"]
          : typeof usage["output_tokens"] === "number"
            ? usage["output_tokens"]
            : undefined;

      if (input !== undefined || output !== undefined) {
        parsed.tokenUsage = {
          inputTokens: input,
          outputTokens: output,
          totalTokens:
            input !== undefined && output !== undefined
              ? input + output
              : undefined,
        };
      }
    }

    return parsed;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// CodexSession
// ---------------------------------------------------------------------------

export class CodexSession extends BaseAgentSession {
  private _process: ChildProcess | null = null;
  private _timeoutHandle: TimeoutHandle | null = null;
  private _startedAt = 0;
  private _stdoutBuf = "";
  private _stderrBuf = "";
  private _tokenUsage: TokenUsage | null = null;

  constructor(id: string) {
    super(id, "codex");
  }

  _attach(proc: ChildProcess, timeoutHandle: TimeoutHandle): void {
    this._process = proc;
    this._timeoutHandle = timeoutHandle;
    this._startedAt = Date.now();
    this.setStatus("running");
  }

  handleStdout(data: Buffer): void {
    const text = data.toString("utf8");
    this._stdoutBuf += text;

    for (const line of text.split("\n")) {
      if (!line.trim()) continue;

      const parsed = parseCodexLine(line);

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

      const chunk: OutputChunk = {
        sessionId: this.id,
        timestamp: Date.now(),
        text: line,
        type: "stdout",
        parsed,
      };
      this.emit("output", chunk);
    }
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
        clearTimeout(killTimer);
        resolve();
      }
    });

    this.settle(new CancelledError(this.id));
  }

  _setTimedOut(): void {
    if (this._status === "running" || this._status === "pending") {
      this.setStatus("timed_out");
    }
  }
}

// ---------------------------------------------------------------------------
// CodexAdapter
// ---------------------------------------------------------------------------

export class CodexAdapter implements AgentAdapter {
  readonly id = "codex";
  readonly displayName = "OpenAI Codex";
  readonly capabilities: readonly AgentCapability[] = [
    "code-generation",
    "analysis",
    "documentation",
  ];
  readonly costPerToken = 0.000012;

  async isAvailable(): Promise<boolean> {
    return !!process.env["OPENAI_API_KEY"];
  }

  spawn(task: AdapterTask): AgentSession {
    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) {
      throw new Error(
        "CodexAdapter: OPENAI_API_KEY is not set. " +
          "Set the environment variable before spawning a session.",
      );
    }

    const session = new CodexSession(randomUUID());

    const args = ["exec", task.prompt, "-s", "full-auto", ...(task.extraFlags ?? [])];

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      OPENAI_API_KEY: apiKey,
    };

    const timeoutMs = task.timeoutMs ?? 300_000;

    const proc = spawnCliAgent({
      command: "codex",
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
