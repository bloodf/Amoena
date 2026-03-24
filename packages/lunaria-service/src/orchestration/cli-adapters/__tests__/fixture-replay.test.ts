import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PassThrough } from "node:stream";
import { EventEmitter } from "node:events";

vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
}));

import { spawn } from "node:child_process";
import { ClaudeCodeAdapter } from "../claude-adapter.js";
import { CodexAdapter } from "../codex-adapter.js";
import type { AdapterTask, OutputChunk } from "../types.js";

// ---------------------------------------------------------------------------
// Typed mock
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const spawnMock = spawn as any;

class MockChildProcess extends EventEmitter {
  stdout = new PassThrough();
  stderr = new PassThrough();
  stdin = new PassThrough();
  pid = 99999;
  killed = false;
  exitCode: number | null = null;
  signalCode: string | null = null;
  readonly killSignals: string[] = [];

  kill(signal: NodeJS.Signals | number = "SIGTERM"): boolean {
    this.killSignals.push(String(signal));
    this.killed = true;
    return true;
  }

  simulateExit(code: number | null, signal: string | null = null): void {
    this.exitCode = code;
    this.signalCode = signal;
    this.emit("exit", code, signal);
  }

  writeStdout(data: string): void {
    this.stdout.push(Buffer.from(data));
  }

  writeStderr(data: string): void {
    this.stderr.push(Buffer.from(data));
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FIXTURES_DIR = join(
  import.meta.dirname ?? __dirname,
  "fixtures",
);

function readFixtureLines(filename: string): string[] {
  const content = readFileSync(join(FIXTURES_DIR, filename), "utf8");
  return content.split("\n").filter((l) => l.trim().length > 0);
}

const baseTask: AdapterTask = {
  id: "fixture-task",
  prompt: "Replay fixture",
  worktreePath: "/tmp/worktree",
  timeoutMs: 30_000,
};

let mockProc: MockChildProcess;

beforeEach(() => {
  mockProc = new MockChildProcess();
  spawnMock.mockReturnValue(mockProc);
  process.env["ANTHROPIC_API_KEY"] = "sk-test-fixture";
  process.env["OPENAI_API_KEY"] = "sk-codex-fixture";
});

// ---------------------------------------------------------------------------
// Task 1: Fixture replay — success session
// ---------------------------------------------------------------------------

describe("fixture replay: claude-session-success.jsonl", () => {
  it("emits output events for every non-empty JSONL line", async () => {
    const adapter = new ClaudeCodeAdapter();
    const session = adapter.spawn(baseTask);
    session.on("error", () => {}); // suppress stderr-driven error events

    const chunks: OutputChunk[] = [];
    session.on("output", (c: OutputChunk) => chunks.push(c));

    const lines = readFixtureLines("claude-session-success.jsonl");
    for (const line of lines) {
      mockProc.writeStdout(line + "\n");
    }
    mockProc.simulateExit(0, null);

    await session.result;
    // Every line written produced an output event
    expect(chunks.length).toBeGreaterThanOrEqual(lines.length);
  });

  it("result line is parsed as completion with isCompletion=true", async () => {
    const adapter = new ClaudeCodeAdapter();
    const session = adapter.spawn(baseTask);
    session.on("error", () => {});

    const completions: OutputChunk[] = [];
    session.on("output", (c: OutputChunk) => {
      if (c.parsed?.isCompletion) completions.push(c);
    });

    const lines = readFixtureLines("claude-session-success.jsonl");
    for (const line of lines) {
      mockProc.writeStdout(line + "\n");
    }
    mockProc.simulateExit(0, null);
    await session.result;

    // The result line should have been flagged as a completion
    expect(completions.length).toBeGreaterThanOrEqual(1);
  });

  it("session completes with exitCode 0 after fixture replay", async () => {
    const adapter = new ClaudeCodeAdapter();
    const session = adapter.spawn(baseTask);
    session.on("error", () => {});

    const lines = readFixtureLines("claude-session-success.jsonl");
    for (const line of lines) {
      mockProc.writeStdout(line + "\n");
    }
    mockProc.simulateExit(0, null);

    const result = await session.result;
    expect(result.exitCode).toBe(0);
    expect(session.status).toBe("completed");
  });
});

// ---------------------------------------------------------------------------
// Task 1: Fixture replay — token counts session
// ---------------------------------------------------------------------------

describe("fixture replay: claude-session-token-counts.jsonl", () => {
  it("extracts input_tokens=342 and output_tokens=127 from result line", async () => {
    const adapter = new ClaudeCodeAdapter();
    const session = adapter.spawn(baseTask);
    session.on("error", () => {});

    const lines = readFixtureLines("claude-session-token-counts.jsonl");
    for (const line of lines) {
      mockProc.writeStdout(line + "\n");
    }
    mockProc.simulateExit(0, null);

    const result = await session.result;
    expect(result.tokenUsage).not.toBeNull();
    expect(result.tokenUsage!.inputTokens).toBe(342);
    expect(result.tokenUsage!.outputTokens).toBe(127);
  });

  it("totalTokens equals inputTokens + outputTokens", async () => {
    const adapter = new ClaudeCodeAdapter();
    const session = adapter.spawn(baseTask);
    session.on("error", () => {});

    const lines = readFixtureLines("claude-session-token-counts.jsonl");
    for (const line of lines) {
      mockProc.writeStdout(line + "\n");
    }
    mockProc.simulateExit(0, null);

    const result = await session.result;
    expect(result.tokenUsage!.totalTokens).toBe(469);
  });
});

// ---------------------------------------------------------------------------
// Task 2: Error scenario fixtures
// ---------------------------------------------------------------------------

describe("fixture replay: claude-session-timeout.jsonl", () => {
  it("partial output produces no completion chunk", async () => {
    const adapter = new ClaudeCodeAdapter();
    const session = adapter.spawn(baseTask);
    session.on("error", () => {});

    const completions: OutputChunk[] = [];
    session.on("output", (c: OutputChunk) => {
      if (c.parsed?.isCompletion) completions.push(c);
    });

    const lines = readFixtureLines("claude-session-timeout.jsonl");
    for (const line of lines) {
      mockProc.writeStdout(line + "\n");
    }
    // Simulate SIGTERM (timeout/kill) — non-zero exit
    mockProc.simulateExit(null, "SIGTERM");

    await session.result;
    expect(completions).toHaveLength(0);
  });

  it("session exits with null exitCode when killed by signal", async () => {
    const adapter = new ClaudeCodeAdapter();
    const session = adapter.spawn(baseTask);
    session.on("error", () => {});

    const lines = readFixtureLines("claude-session-timeout.jsonl");
    for (const line of lines) {
      mockProc.writeStdout(line + "\n");
    }
    mockProc.simulateExit(null, "SIGTERM");

    const result = await session.result;
    expect(result.exitCode).toBeNull();
  });
});

describe("fixture replay: claude-session-auth-failure.jsonl", () => {
  it("auth error line is captured in session output", async () => {
    const adapter = new ClaudeCodeAdapter();
    const session = adapter.spawn(baseTask);
    session.on("error", () => {});

    const chunks: OutputChunk[] = [];
    session.on("output", (c: OutputChunk) => chunks.push(c));

    const lines = readFixtureLines("claude-session-auth-failure.jsonl");
    for (const line of lines) {
      mockProc.writeStdout(line + "\n");
    }
    mockProc.simulateExit(1, null);

    const result = await session.result;
    expect(result.exitCode).toBe(1);
    expect(session.status).toBe("failed");
    // Output should have been received
    expect(chunks.length).toBeGreaterThan(0);
  });

  it("tokenUsage is null when no result line is present", async () => {
    const adapter = new ClaudeCodeAdapter();
    const session = adapter.spawn(baseTask);
    session.on("error", () => {});

    const lines = readFixtureLines("claude-session-auth-failure.jsonl");
    for (const line of lines) {
      mockProc.writeStdout(line + "\n");
    }
    mockProc.simulateExit(1, null);

    const result = await session.result;
    expect(result.tokenUsage).toBeNull();
  });
});

describe("fixture replay: claude-session-malformed.jsonl", () => {
  it("skips malformed JSON lines without throwing", async () => {
    const adapter = new ClaudeCodeAdapter();
    const session = adapter.spawn(baseTask);
    session.on("error", () => {});

    const chunks: OutputChunk[] = [];
    session.on("output", (c: OutputChunk) => chunks.push(c));

    const lines = readFixtureLines("claude-session-malformed.jsonl");
    // Feed all lines including malformed ones — should not throw
    let threw = false;
    try {
      for (const line of lines) {
        mockProc.writeStdout(line + "\n");
      }
    } catch {
      threw = true;
    }
    mockProc.simulateExit(0, null);
    await session.result;

    expect(threw).toBe(false);
    // Valid lines still produce output events
    expect(chunks.length).toBeGreaterThan(0);
  });

  it("valid result line is still parsed after malformed lines", async () => {
    const adapter = new ClaudeCodeAdapter();
    const session = adapter.spawn(baseTask);
    session.on("error", () => {});

    const lines = readFixtureLines("claude-session-malformed.jsonl");
    for (const line of lines) {
      mockProc.writeStdout(line + "\n");
    }
    mockProc.simulateExit(0, null);

    const result = await session.result;
    // The result line at the end has usage data
    expect(result.tokenUsage).not.toBeNull();
    expect(result.tokenUsage!.inputTokens).toBe(50);
    expect(result.tokenUsage!.outputTokens).toBe(20);
  });
});

describe("fixture replay: codex-session-success.jsonl", () => {
  it("extracts prompt_tokens and completion_tokens from done line", async () => {
    const adapter = new CodexAdapter();
    const session = adapter.spawn(baseTask);
    session.on("error", () => {});

    const lines = readFixtureLines("codex-session-success.jsonl");
    for (const line of lines) {
      mockProc.writeStdout(line + "\n");
    }
    mockProc.simulateExit(0, null);

    const result = await session.result;
    expect(result.tokenUsage).not.toBeNull();
    expect(result.tokenUsage!.inputTokens).toBe(120);
    expect(result.tokenUsage!.outputTokens).toBe(85);
    expect(result.tokenUsage!.totalTokens).toBe(205);
  });

  it("session status is completed after exit code 0", async () => {
    const adapter = new CodexAdapter();
    const session = adapter.spawn(baseTask);
    session.on("error", () => {});

    const lines = readFixtureLines("codex-session-success.jsonl");
    for (const line of lines) {
      mockProc.writeStdout(line + "\n");
    }
    mockProc.simulateExit(0, null);

    await session.result;
    expect(session.status).toBe("completed");
  });
});
