import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PassThrough } from "node:stream";
import { EventEmitter } from "node:events";

vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
}));

import { spawn } from "node:child_process";
import { CodexAdapter } from "../codex-adapter.js";
import type { AdapterTask } from "../types.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const spawnMock = spawn as any;

// ---------------------------------------------------------------------------
// MockChildProcess
// ---------------------------------------------------------------------------

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
// Test setup
// ---------------------------------------------------------------------------

let mockProc: MockChildProcess;

const task: AdapterTask = {
  id: "task-codex-1",
  prompt: "Generate a sort function",
  worktreePath: "/tmp/codex-worktree",
  timeoutMs: 300_000,
};

const setApiKey = (value: string | undefined) => {
  if (value === undefined) {
    delete process.env["OPENAI_API_KEY"];
  } else {
    process.env["OPENAI_API_KEY"] = value;
  }
};

let savedApiKey: string | undefined;

beforeEach(() => {
  mockProc = new MockChildProcess();
  spawnMock.mockReturnValue(mockProc);
  savedApiKey = process.env["OPENAI_API_KEY"];
  setApiKey("sk-openai-test");
});

afterEach(() => {
  setApiKey(savedApiKey);
  vi.useRealTimers();
  spawnMock.mockClear?.();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CodexAdapter", () => {
  describe("isAvailable()", () => {
    it("returns true when OPENAI_API_KEY is set", async () => {
      const adapter = new CodexAdapter();
      expect(await adapter.isAvailable()).toBe(true);
    });

    it("missing OPENAI_API_KEY → isAvailable() returns false", async () => {
      setApiKey(undefined);
      const adapter = new CodexAdapter();
      expect(await adapter.isAvailable()).toBe(false);
    });

    it("empty OPENAI_API_KEY → isAvailable() returns false", async () => {
      setApiKey("");
      const adapter = new CodexAdapter();
      expect(await adapter.isAvailable()).toBe(false);
    });
  });

  describe("spawn()", () => {
    it("returns a session with status running after spawning", () => {
      const adapter = new CodexAdapter();
      const session = adapter.spawn(task);
      expect(session).toBeDefined();
      expect(session.status).toBe("running");
      expect(session.adapterId).toBe("codex");
    });

    it("throws descriptive error when OPENAI_API_KEY is missing", () => {
      setApiKey(undefined);
      const adapter = new CodexAdapter();
      expect(() => adapter.spawn(task)).toThrow("OPENAI_API_KEY");
    });

    it("process exit code 0 → status 'completed', result resolves", async () => {
      const adapter = new CodexAdapter();
      const session = adapter.spawn(task);

      mockProc.simulateExit(0, null);

      const result = await session.result;
      expect(session.status).toBe("completed");
      expect(result.exitCode).toBe(0);
      expect(result.adapterId).toBe("codex");
    });

    it("process exit code non-zero → status 'failed', result resolves with exitCode", async () => {
      const adapter = new CodexAdapter();
      const session = adapter.spawn(task);

      mockProc.simulateExit(2, null);

      const result = await session.result;
      expect(session.status).toBe("failed");
      expect(result.exitCode).toBe(2);
    });

    it("stdout chunks emit 'output' events with type stdout", () => {
      const adapter = new CodexAdapter();
      const session = adapter.spawn(task);

      const chunks: { type: string; text: string }[] = [];
      session.on("output", (chunk) => chunks.push(chunk));

      mockProc.writeStdout("function sort() {}\n");

      expect(chunks).toHaveLength(1);
      expect(chunks[0]!.type).toBe("stdout");
    });

    it("JSON output lines with usage field are parsed for token counts", async () => {
      const adapter = new CodexAdapter();
      const session = adapter.spawn(task);

      const usageLine = JSON.stringify({
        usage: { prompt_tokens: 80, completion_tokens: 40 },
      });
      mockProc.writeStdout(usageLine + "\n");
      mockProc.simulateExit(0, null);

      const result = await session.result;
      expect(result.tokenUsage?.inputTokens).toBe(80);
      expect(result.tokenUsage?.outputTokens).toBe(40);
      expect(result.tokenUsage?.totalTokens).toBe(120);
    });

    it("plain text stdout lines are emitted as output chunks without crash", async () => {
      const adapter = new CodexAdapter();
      const session = adapter.spawn(task);

      const chunks: unknown[] = [];
      session.on("output", (c) => chunks.push(c));

      mockProc.writeStdout("This is plain text output\n");
      mockProc.writeStdout("More plain text\n");
      mockProc.simulateExit(0, null);

      await session.result;
      expect(chunks.length).toBe(2);
    });

    it("captures stdout and stderr in result", async () => {
      const adapter = new CodexAdapter();
      const session = adapter.spawn(task);
      session.on("error", () => {}); // prevent unhandled error event from stderr

      mockProc.writeStdout("output line\n");
      mockProc.writeStderr("warning message\n");
      mockProc.simulateExit(0, null);

      const result = await session.result;
      expect(result.stdout).toContain("output line");
      expect(result.stderr).toContain("warning message");
    });
  });

  describe("cancel()", () => {
    it("cancel() sends SIGTERM and status becomes 'cancelled'", async () => {
      const adapter = new CodexAdapter();
      const session = adapter.spawn(task);
      session.result.catch(() => {}); // suppress unhandled rejection

      const cancelPromise = session.cancel();
      expect(mockProc.killSignals).toContain("SIGTERM");
      expect(session.status).toBe("cancelled");

      mockProc.simulateExit(null, "SIGTERM");
      await cancelPromise;
    });

    it("cancel() result promise rejects with CancelledError", async () => {
      const adapter = new CodexAdapter();
      const session = adapter.spawn(task);

      const cancelPromise = session.cancel();
      mockProc.simulateExit(null, "SIGTERM");
      await cancelPromise;

      await expect(session.result).rejects.toThrow("cancelled");
    });
  });
});
