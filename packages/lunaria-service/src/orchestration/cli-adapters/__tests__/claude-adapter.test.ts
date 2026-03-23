import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PassThrough } from "node:stream";
import { EventEmitter } from "node:events";

vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
}));

import { spawn } from "node:child_process";
import { ClaudeCodeAdapter } from "../claude-adapter.js";
import type { AdapterTask } from "../types.js";

// ---------------------------------------------------------------------------
// Typed reference to the mocked spawn
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const spawnMock = spawn as any;

// ---------------------------------------------------------------------------
// MockChildProcess
// ---------------------------------------------------------------------------

class MockChildProcess extends EventEmitter {
  stdout = new PassThrough();
  stderr = new PassThrough();
  stdin = new PassThrough();
  pid = 12345;
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
// Test setup
// ---------------------------------------------------------------------------

let mockProc: MockChildProcess;

const task: AdapterTask = {
  id: "task-1",
  prompt: "Write a hello world function",
  worktreePath: "/tmp/worktree",
  timeoutMs: 300_000,
};

const setApiKey = (value: string | undefined) => {
  if (value === undefined) {
    delete process.env["ANTHROPIC_API_KEY"];
  } else {
    process.env["ANTHROPIC_API_KEY"] = value;
  }
};

let savedApiKey: string | undefined;

beforeEach(() => {
  mockProc = new MockChildProcess();
  spawnMock.mockReturnValue(mockProc);
  savedApiKey = process.env["ANTHROPIC_API_KEY"];
  setApiKey("sk-test-key");
});

afterEach(() => {
  setApiKey(savedApiKey);
  vi.useRealTimers();
  spawnMock.mockClear?.();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ClaudeCodeAdapter", () => {
  describe("isAvailable()", () => {
    it("returns true when ANTHROPIC_API_KEY is set", async () => {
      const adapter = new ClaudeCodeAdapter();
      expect(await adapter.isAvailable()).toBe(true);
    });

    it("missing ANTHROPIC_API_KEY → isAvailable() returns false", async () => {
      setApiKey(undefined);
      const adapter = new ClaudeCodeAdapter();
      expect(await adapter.isAvailable()).toBe(false);
    });

    it("empty ANTHROPIC_API_KEY → isAvailable() returns false", async () => {
      setApiKey("");
      const adapter = new ClaudeCodeAdapter();
      expect(await adapter.isAvailable()).toBe(false);
    });
  });

  describe("spawn()", () => {
    it("returns a session with status running after spawning", () => {
      const adapter = new ClaudeCodeAdapter();
      const session = adapter.spawn(task);
      expect(session).toBeDefined();
      expect(session.status).toBe("running");
      expect(session.id).toBeTruthy();
      expect(session.adapterId).toBe("claude-code");
    });

    it("throws descriptive error when ANTHROPIC_API_KEY is missing", () => {
      setApiKey(undefined);
      const adapter = new ClaudeCodeAdapter();
      expect(() => adapter.spawn(task)).toThrow("ANTHROPIC_API_KEY");
    });

    it("stdout chunks emit 'output' events with type stdout", () => {
      const adapter = new ClaudeCodeAdapter();
      const session = adapter.spawn(task);

      const chunks: { text: string; type: string }[] = [];
      session.on("output", (chunk) => chunks.push(chunk));

      mockProc.writeStdout("hello world\n");

      expect(chunks).toHaveLength(1);
      expect(chunks[0]!.type).toBe("stdout");
      expect(chunks[0]!.text).toBe("hello world");
    });

    it("process exit code 0 → status 'completed', result resolves", async () => {
      const adapter = new ClaudeCodeAdapter();
      const session = adapter.spawn(task);

      mockProc.simulateExit(0, null);

      const result = await session.result;
      expect(session.status).toBe("completed");
      expect(result.exitCode).toBe(0);
      expect(result.sessionId).toBe(session.id);
      expect(result.adapterId).toBe("claude-code");
    });

    it("process exit code non-zero → status 'failed', result resolves with exitCode", async () => {
      const adapter = new ClaudeCodeAdapter();
      const session = adapter.spawn(task);

      mockProc.simulateExit(1, null);

      const result = await session.result;
      expect(session.status).toBe("failed");
      expect(result.exitCode).toBe(1);
    });

    it("JSON output lines are parsed and tokenUsage populated", async () => {
      const adapter = new ClaudeCodeAdapter();
      const session = adapter.spawn(task);

      const resultLine = JSON.stringify({
        type: "result",
        subtype: "success",
        result: "done",
        session_id: "sess-1",
        usage: { input_tokens: 342, output_tokens: 127 },
      });
      mockProc.writeStdout(resultLine + "\n");
      mockProc.simulateExit(0, null);

      const result = await session.result;
      expect(result.tokenUsage).toEqual({
        inputTokens: 342,
        outputTokens: 127,
        totalTokens: 469,
      });
    });

    it("stdout and stderr are captured in result", async () => {
      const adapter = new ClaudeCodeAdapter();
      const session = adapter.spawn(task);
      session.on("error", () => {}); // prevent unhandled error event from stderr

      mockProc.writeStdout("some output\n");
      mockProc.writeStderr("some warning\n");
      mockProc.simulateExit(0, null);

      const result = await session.result;
      expect(result.stdout).toContain("some output");
      expect(result.stderr).toContain("some warning");
    });
  });

  describe("timeout behavior", () => {
    it("timeout fires SIGTERM then SIGKILL after 5s, status becomes 'timed_out'", async () => {
      vi.useFakeTimers();
      const adapter = new ClaudeCodeAdapter();
      const shortTask: AdapterTask = { ...task, timeoutMs: 1_000 };

      const session = adapter.spawn(shortTask);

      vi.advanceTimersByTime(1_001);

      expect(session.status).toBe("timed_out");
      expect(mockProc.killSignals).toContain("SIGTERM");

      mockProc.simulateExit(null, "SIGTERM");

      const result = await session.result;
      expect(result.exitCode).toBeNull();
      expect(session.status).toBe("timed_out");
    });

    it("sends SIGKILL if process survives 5s after SIGTERM", async () => {
      vi.useFakeTimers();
      const adapter = new ClaudeCodeAdapter();
      const shortTask: AdapterTask = { ...task, timeoutMs: 1_000 };

      const session = adapter.spawn(shortTask);

      vi.advanceTimersByTime(1_001);
      expect(mockProc.killSignals).toContain("SIGTERM");

      vi.advanceTimersByTime(5_001);
      expect(mockProc.killSignals).toContain("SIGKILL");

      mockProc.simulateExit(null, "SIGKILL");
      await session.result;
      expect(session.status).toBe("timed_out");
    });
  });

  describe("cancel()", () => {
    it("cancel() fires SIGTERM, status becomes 'cancelled'", async () => {
      const adapter = new ClaudeCodeAdapter();
      const session = adapter.spawn(task);
      session.result.catch(() => {}); // suppress unhandled rejection

      const cancelPromise = session.cancel();

      expect(mockProc.killSignals).toContain("SIGTERM");
      expect(session.status).toBe("cancelled");

      mockProc.simulateExit(null, "SIGTERM");
      await cancelPromise;
    });

    it("cancel() result promise rejects with CancelledError", async () => {
      const adapter = new ClaudeCodeAdapter();
      const session = adapter.spawn(task);

      const cancelPromise = session.cancel();
      mockProc.simulateExit(null, "SIGTERM");
      await cancelPromise;

      await expect(session.result).rejects.toThrow("cancelled");
    });

    it("cancel() sends SIGKILL after 5s if process survives", async () => {
      vi.useFakeTimers();
      const adapter = new ClaudeCodeAdapter();
      const session = adapter.spawn(task);
      session.result.catch(() => {}); // suppress unhandled rejection

      const cancelPromise = session.cancel();
      expect(mockProc.killSignals).toContain("SIGTERM");

      vi.advanceTimersByTime(5_001);
      expect(mockProc.killSignals).toContain("SIGKILL");

      mockProc.simulateExit(null, "SIGKILL");
      await cancelPromise;
    });

    it("cancel() is idempotent on completed session", async () => {
      const adapter = new ClaudeCodeAdapter();
      const session = adapter.spawn(task);
      mockProc.simulateExit(0, null);
      await session.result;

      await session.cancel();
      expect(session.status).toBe("completed");
    });
  });

  describe("fixture-based parser tests", () => {
    it("parses result line and extracts tokenUsage with costHint", async () => {
      const adapter = new ClaudeCodeAdapter();
      const session = adapter.spawn(task);

      const fixture =
        '{"type":"result","subtype":"success","result":"done","session_id":"s","usage":{"input_tokens":342,"output_tokens":127},"cost_usd":0.000073}\n';
      mockProc.writeStdout(fixture);
      mockProc.simulateExit(0, null);

      const result = await session.result;
      expect(result.tokenUsage?.inputTokens).toBe(342);
      expect(result.tokenUsage?.outputTokens).toBe(127);
      expect(result.tokenUsage?.totalTokens).toBe(469);
    });

    it("parses assistant lines without crashing", async () => {
      const adapter = new ClaudeCodeAdapter();
      const session = adapter.spawn(task);

      const chunks: unknown[] = [];
      session.on("output", (c) => chunks.push(c));

      const assistantLine = JSON.stringify({
        type: "assistant",
        message: { content: [{ type: "text", text: "Hello!" }] },
      });
      mockProc.writeStdout(assistantLine + "\n");
      mockProc.simulateExit(0, null);

      await session.result;
      expect(chunks.length).toBeGreaterThan(0);
    });
  });
});
