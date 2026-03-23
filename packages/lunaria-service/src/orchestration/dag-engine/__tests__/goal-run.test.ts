import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "node:events";

async function waitFor(fn: () => void, timeoutMs = 2000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (true) {
    try { fn(); return; } catch {}
    if (Date.now() >= deadline) throw new Error("waitFor timeout");
    await new Promise((r) => setTimeout(r, 20));
  }
}
import { GoalRun } from "../goal-run.js";
import { InMemoryGoalRunStorage, loadGoalRunState } from "../recovery.js";
import type { AgentAdapter, AgentSession, SessionResult } from "../../cli-adapters/types.js";
import type { GoalSpec, TaskSpec } from "../types.js";

// ---------------------------------------------------------------------------
// Mock session helper
// ---------------------------------------------------------------------------

class MockSession extends EventEmitter implements AgentSession {
  readonly id: string;
  readonly adapterId: string;
  private _status: AgentSession["status"] = "running";
  private _resolve!: (r: SessionResult) => void;
  private _reject!: (e: Error) => void;
  readonly result: Promise<SessionResult>;
  readonly cancel = vi.fn().mockImplementation(() => {
    if (this._status === "running") {
      this._status = "cancelled";
      this._reject(Object.assign(new Error(`Session ${this.id} was cancelled.`), { name: "CancelledError" }));
    }
    return Promise.resolve();
  });

  constructor(id: string, adapterId: string) {
    super();
    this.id = id;
    this.adapterId = adapterId;
    this.result = new Promise((res, rej) => {
      this._resolve = res;
      this._reject = rej;
    });
  }

  get status() {
    return this._status;
  }

  succeed(): void {
    this._status = "completed";
    this._resolve({
      sessionId: this.id,
      adapterId: this.adapterId,
      exitCode: 0,
      stdout: "",
      stderr: "",
      durationMs: 10,
      tokenUsage: null,
    });
  }

  fail(exitCode = 1): void {
    this._status = "failed";
    this._resolve({
      sessionId: this.id,
      adapterId: this.adapterId,
      exitCode,
      stdout: "",
      stderr: "error",
      durationMs: 10,
      tokenUsage: null,
    });
  }

  failWithError(err: Error): void {
    this._status = "failed";
    this._reject(err);
  }
}

// ---------------------------------------------------------------------------
// Mock adapter factory
// ---------------------------------------------------------------------------

function makeAdapter(
  id: string,
  sessions: MockSession[],
): AgentAdapter {
  let callIndex = 0;
  return {
    id,
    displayName: id,
    capabilities: ["code-generation"],
    costPerToken: null,
    isAvailable: vi.fn().mockResolvedValue(true),
    spawn: vi.fn().mockImplementation(() => {
      return sessions[callIndex++] ?? sessions[sessions.length - 1]!;
    }),
  };
}

function makeUnavailableAdapter(id: string): AgentAdapter {
  return {
    id,
    displayName: id,
    capabilities: ["code-generation"],
    costPerToken: null,
    isAvailable: vi.fn().mockResolvedValue(false),
    spawn: vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// Spec helpers
// ---------------------------------------------------------------------------

function makeSpec(overrides: Partial<GoalSpec> = {}): GoalSpec {
  return {
    id: "goal-1",
    description: "Test goal",
    baseRef: "main",
    tasks: [],
    ...overrides,
  };
}

function makeTask(id: string, dependsOn: string[] = []): TaskSpec {
  return {
    id,
    description: `Task ${id}`,
    dependsOn,
    taskType: "implementation",
    complexity: "low",
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GoalRun", () => {
  it("successful run: all tasks complete, goal status 'completed'", async () => {
    const sessionA = new MockSession("s-A", "codex");
    const sessionB = new MockSession("s-B", "codex");

    const adapter = makeAdapter("codex", [sessionA, sessionB]);
    const adapters = new Map([["codex", adapter], ["claude-code", makeUnavailableAdapter("claude-code")]]);

    const spec = makeSpec({
      tasks: [makeTask("A"), makeTask("B", ["A"])],
    });

    const run = new GoalRun(spec, adapters, { skipWorktree: true });
    const runPromise = run.run();

    // Let A dispatch and succeed
    await waitFor(() => expect(adapter.spawn).toHaveBeenCalledTimes(1));
    sessionA.succeed();

    // Let B dispatch and succeed
    await waitFor(() => expect(adapter.spawn).toHaveBeenCalledTimes(2));
    sessionB.succeed();

    const state = await runPromise;
    expect(state.status).toBe("completed");
    expect(state.tasks["A"]!.status).toBe("completed");
    expect(state.tasks["B"]!.status).toBe("completed");
  });

  it("partial failure: one task fails, dependents skipped, status 'partial_failure'", async () => {
    const sessionA = new MockSession("s-A", "codex");
    // A will fail 3 times (all retry attempts) — provide 3 sessions
    const sessionA2 = new MockSession("s-A2", "codex");
    const sessionA3 = new MockSession("s-A3", "codex");
    const sessionB = new MockSession("s-B", "codex");

    const claudeSession1 = new MockSession("s-claude-1", "claude-code");
    const claudeSession2 = new MockSession("s-claude-2", "claude-code");

    const codexAdapter = makeAdapter("codex", [sessionA, sessionA2, sessionB]);
    const claudeAdapter = makeAdapter("claude-code", [claudeSession1, claudeSession2]);
    const adapters = new Map([
      ["codex", codexAdapter],
      ["claude-code", claudeAdapter],
    ]);

    const spec = makeSpec({
      tasks: [makeTask("A"), makeTask("B", ["A"])],
    });

    const run = new GoalRun(spec, adapters, { skipWorktree: true });
    const runPromise = run.run();

    // A fails on first attempt
    await waitFor(() => expect(codexAdapter.spawn).toHaveBeenCalled());
    sessionA.fail();

    // A retries (same adapter) and fails again
    await waitFor(() => expect(codexAdapter.spawn).toHaveBeenCalledTimes(2));
    sessionA2.fail();

    // A tries fallback (claude-code) and fails
    await waitFor(() => expect(claudeAdapter.spawn).toHaveBeenCalled());
    claudeSession1.fail();

    const state = await runPromise;
    expect(["partial_failure", "failed"]).toContain(state.status);
    expect(state.tasks["B"]!.status).toBe("skipped");
  });

  it("cancel mid-run: sessions receive cancel(), goal status 'cancelled'", async () => {
    const sessionA = new MockSession("s-A", "codex");

    const adapter = makeAdapter("codex", [sessionA]);
    const adapters = new Map([
      ["codex", adapter],
      ["claude-code", makeUnavailableAdapter("claude-code")],
    ]);

    const spec = makeSpec({
      tasks: [makeTask("A")],
    });

    const run = new GoalRun(spec, adapters, { skipWorktree: true });
    const runPromise = run.run();

    // Wait for A to be dispatched
    await waitFor(() => expect(adapter.spawn).toHaveBeenCalled());

    // Cancel the run
    await run.cancel();

    const state = await runPromise;
    expect(state.status).toBe("cancelled");
  });

  it("retry: task fails once, retries with same adapter, succeeds", async () => {
    const session1 = new MockSession("s1", "codex");
    const session2 = new MockSession("s2", "codex");

    const adapter = makeAdapter("codex", [session1, session2]);
    const adapters = new Map([
      ["codex", adapter],
      ["claude-code", makeUnavailableAdapter("claude-code")],
    ]);

    const spec = makeSpec({ tasks: [makeTask("A")] });
    const run = new GoalRun(spec, adapters, { skipWorktree: true });
    const runPromise = run.run();

    // First attempt fails
    await waitFor(() => expect(adapter.spawn).toHaveBeenCalledTimes(1));
    session1.fail();

    // Second attempt (retry with same) succeeds
    await waitFor(() => expect(adapter.spawn).toHaveBeenCalledTimes(2));
    session2.succeed();

    const state = await runPromise;
    expect(state.status).toBe("completed");
    expect(state.tasks["A"]!.status).toBe("completed");
    expect(state.tasks["A"]!.attemptCount).toBe(2);
  });

  it("fallback retry: task fails twice, third attempt uses fallback adapter", async () => {
    const codexSession1 = new MockSession("cs1", "codex");
    const codexSession2 = new MockSession("cs2", "codex");
    const claudeSession = new MockSession("cl1", "claude-code");

    // implementation/low: preferred=codex, fallback=claude-code
    const codexAdapter = makeAdapter("codex", [codexSession1, codexSession2]);
    const claudeAdapter = makeAdapter("claude-code", [claudeSession]);
    const adapters = new Map([
      ["codex", codexAdapter],
      ["claude-code", claudeAdapter],
    ]);

    const spec = makeSpec({ tasks: [makeTask("A")] });
    const run = new GoalRun(spec, adapters, { skipWorktree: true });
    const runPromise = run.run();

    // First attempt with codex fails
    await waitFor(() => expect(codexAdapter.spawn).toHaveBeenCalledTimes(1));
    codexSession1.fail();

    // Second attempt with codex (retry) fails
    await waitFor(() => expect(codexAdapter.spawn).toHaveBeenCalledTimes(2));
    codexSession2.fail();

    // Third attempt with claude-code (fallback) succeeds
    await waitFor(() => expect(claudeAdapter.spawn).toHaveBeenCalled());
    claudeSession.succeed();

    const state = await runPromise;
    expect(state.status).toBe("completed");
    expect(state.tasks["A"]!.status).toBe("completed");
    expect(state.tasks["A"]!.attemptCount).toBe(3);
  });

  it("persistState → loadGoalRunState round-trips correctly", async () => {
    const sessionA = new MockSession("s-A", "codex");
    const adapter = makeAdapter("codex", [sessionA]);
    const adapters = new Map([
      ["codex", adapter],
      ["claude-code", makeUnavailableAdapter("claude-code")],
    ]);

    const storage = new InMemoryGoalRunStorage();
    const spec = makeSpec({ tasks: [makeTask("A")] });
    const run = new GoalRun(spec, adapters, { skipWorktree: true, storage });
    const runPromise = run.run();

    await waitFor(() => expect(adapter.spawn).toHaveBeenCalled());
    sessionA.succeed();

    await runPromise;

    // Verify state was persisted
    const loaded = await loadGoalRunState(storage, "goal-1");
    expect(loaded).not.toBeNull();
    expect(loaded!.goalId).toBe("goal-1");
    expect(loaded!.status).toBe("completed");
    expect(loaded!.tasks["A"]!.status).toBe("completed");
  });

  it("emits task:dispatched event with routing info", async () => {
    const session = new MockSession("s1", "codex");
    const adapter = makeAdapter("codex", [session]);
    const adapters = new Map([
      ["codex", adapter],
      ["claude-code", makeUnavailableAdapter("claude-code")],
    ]);

    const spec = makeSpec({ tasks: [makeTask("A")] });
    const run = new GoalRun(spec, adapters, { skipWorktree: true });

    const dispatched: unknown[] = [];
    run.on("task:dispatched", (e) => dispatched.push(e));

    const runPromise = run.run();
    await waitFor(() => expect(dispatched).toHaveLength(1));
    session.succeed();
    await runPromise;

    expect((dispatched[0] as { taskId: string }).taskId).toBe("A");
    expect((dispatched[0] as { adapterId: string }).adapterId).toBe("codex");
  });
});
