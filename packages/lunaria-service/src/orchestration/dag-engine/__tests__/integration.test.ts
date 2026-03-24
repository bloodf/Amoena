import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "node:events";
import { GoalRun } from "../goal-run.js";
import { InMemoryGoalRunStorage } from "../recovery.js";
import type { AgentAdapter, AgentSession, SessionResult } from "../../cli-adapters/types.js";
import type { GoalSpec, TaskSpec } from "../types.js";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

async function waitFor(fn: () => void, timeoutMs = 3000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (true) {
    try {
      fn();
      return;
    } catch {}
    if (Date.now() >= deadline) throw new Error("waitFor timeout");
    await new Promise((r) => setTimeout(r, 20));
  }
}

// ---------------------------------------------------------------------------
// MockSession — resolves after a configurable delay to simulate real timing
// ---------------------------------------------------------------------------

class MockSession extends EventEmitter implements AgentSession {
  readonly id: string;
  readonly adapterId: string;
  private _status: AgentSession["status"] = "running";
  private _resolve!: (r: SessionResult) => void;
  private _reject!: (e: Error) => void;
  readonly result: Promise<SessionResult>;
  readonly cancel = vi.fn().mockImplementation(async () => {
    if (this._status === "running") {
      this._status = "cancelled";
      this._reject(
        Object.assign(new Error(`Session ${this.id} cancelled.`), {
          name: "CancelledError",
        }),
      );
    }
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

  /** Succeed after a small delay to simulate real timing */
  succeedAfter(delayMs: number): void {
    setTimeout(() => {
      if (this._status !== "running") return;
      this._status = "completed";
      this._resolve({
        sessionId: this.id,
        adapterId: this.adapterId,
        exitCode: 0,
        stdout: "",
        stderr: "",
        durationMs: delayMs,
        tokenUsage: null,
      });
    }, delayMs);
  }

  /** Fail immediately */
  fail(exitCode = 1): void {
    this._status = "failed";
    this._resolve({
      sessionId: this.id,
      adapterId: this.adapterId,
      exitCode,
      stdout: "",
      stderr: "error",
      durationMs: 5,
      tokenUsage: null,
    });
  }

  succeed(): void {
    if (this._status !== "running") return;
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
}

// ---------------------------------------------------------------------------
// MockAdapter factory
// ---------------------------------------------------------------------------

function makeAdapter(id: string, sessions: MockSession[]): AgentAdapter {
  let idx = 0;
  return {
    id,
    displayName: id,
    capabilities: ["code-generation"],
    costPerToken: null,
    isAvailable: vi.fn().mockResolvedValue(true),
    spawn: vi.fn().mockImplementation(() => {
      return sessions[idx++] ?? sessions[sessions.length - 1]!;
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
    id: "goal-integ",
    description: "Integration test goal",
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
// Integration tests
// ---------------------------------------------------------------------------

describe("GoalRun integration", () => {
  it("runs 3-task DAG (A→B, A→C): B and C execute concurrently after A", async () => {
    const sA = new MockSession("sA", "codex");
    const sB = new MockSession("sB", "codex");
    const sC = new MockSession("sC", "codex");

    const adapter = makeAdapter("codex", [sA, sB, sC]);
    const adapters = new Map([
      ["codex", adapter],
      ["claude-code", makeUnavailableAdapter("claude-code")],
    ]);

    const spec = makeSpec({
      tasks: [makeTask("A"), makeTask("B", ["A"]), makeTask("C", ["A"])],
    });

    const run = new GoalRun(spec, adapters, { skipWorktree: true });
    const runPromise = run.run();

    // A dispatches first
    await waitFor(() => expect(adapter.spawn).toHaveBeenCalledTimes(1));
    sA.succeed();

    // B and C dispatch concurrently after A completes
    await waitFor(() => expect(adapter.spawn).toHaveBeenCalledTimes(3));

    sB.succeed();
    sC.succeed();

    const state = await runPromise;

    expect(state.status).toBe("completed");
    expect(state.tasks["A"]!.status).toBe("completed");
    expect(state.tasks["B"]!.status).toBe("completed");
    expect(state.tasks["C"]!.status).toBe("completed");
  });

  it("respects task ordering: B does not dispatch before A completes", async () => {
    const sA = new MockSession("sA", "codex");
    const sB = new MockSession("sB", "codex");

    const spawnOrder: string[] = [];
    const adapter: AgentAdapter = {
      id: "codex",
      displayName: "codex",
      capabilities: ["code-generation"],
      costPerToken: null,
      isAvailable: vi.fn().mockResolvedValue(true),
      spawn: vi.fn().mockImplementation((task) => {
        spawnOrder.push(task.id as string);
        return task.id === "A" ? sA : sB;
      }),
    };
    const adapters = new Map([
      ["codex", adapter],
      ["claude-code", makeUnavailableAdapter("claude-code")],
    ]);

    const spec = makeSpec({
      tasks: [makeTask("A"), makeTask("B", ["A"])],
    });

    const run = new GoalRun(spec, adapters, { skipWorktree: true });
    const runPromise = run.run();

    await waitFor(() => expect(spawnOrder).toContain("A"));
    // B should not have been dispatched yet
    expect(spawnOrder).not.toContain("B");

    sA.succeed();

    await waitFor(() => expect(spawnOrder).toContain("B"));
    sB.succeed();

    await runPromise;
    expect(spawnOrder).toEqual(["A", "B"]);
  });

  it("emits task:dispatched telemetry for each task with adapterId", async () => {
    const sA = new MockSession("sA", "codex");
    const sB = new MockSession("sB", "codex");
    const sC = new MockSession("sC", "codex");

    const adapter = makeAdapter("codex", [sA, sB, sC]);
    const adapters = new Map([
      ["codex", adapter],
      ["claude-code", makeUnavailableAdapter("claude-code")],
    ]);

    const spec = makeSpec({
      tasks: [makeTask("A"), makeTask("B", ["A"]), makeTask("C", ["A"])],
    });

    const run = new GoalRun(spec, adapters, { skipWorktree: true });
    const dispatchedEvents: { taskId: string; adapterId: string }[] = [];
    run.on("task:dispatched", (e) => dispatchedEvents.push(e as { taskId: string; adapterId: string }));

    const runPromise = run.run();

    await waitFor(() => expect(adapter.spawn).toHaveBeenCalledTimes(1));
    sA.succeed();

    await waitFor(() => expect(adapter.spawn).toHaveBeenCalledTimes(3));
    sB.succeed();
    sC.succeed();

    await runPromise;

    expect(dispatchedEvents).toHaveLength(3);
    const taskIds = dispatchedEvents.map((e) => e.taskId).sort();
    expect(taskIds).toEqual(["A", "B", "C"]);
    for (const e of dispatchedEvents) {
      expect(e.adapterId).toBe("codex");
    }
  });

  it("cancel mid-run: active session is cancelled, goal status becomes cancelled", async () => {
    const sA = new MockSession("sA", "codex");
    const sB = new MockSession("sB", "codex");
    const sC = new MockSession("sC", "codex");

    const adapter = makeAdapter("codex", [sA, sB, sC]);
    const adapters = new Map([
      ["codex", adapter],
      ["claude-code", makeUnavailableAdapter("claude-code")],
    ]);

    const spec = makeSpec({
      tasks: [makeTask("A"), makeTask("B", ["A"]), makeTask("C", ["A"])],
    });

    const run = new GoalRun(spec, adapters, { skipWorktree: true });
    const runPromise = run.run();

    // Wait for A to dispatch, then cancel before it completes
    await waitFor(() => expect(adapter.spawn).toHaveBeenCalledTimes(1));

    await run.cancel();

    const state = await runPromise;
    expect(state.status).toBe("cancelled");
  });

  it("retry with fallback adapter: fails twice with primary, third attempt uses fallback and succeeds", async () => {
    const codexSession1 = new MockSession("cx1", "codex");
    const codexSession2 = new MockSession("cx2", "codex");
    const claudeSession = new MockSession("cl1", "claude-code");

    const codexAdapter = makeAdapter("codex", [codexSession1, codexSession2]);
    const claudeAdapter = makeAdapter("claude-code", [claudeSession]);

    const adapters = new Map([
      ["codex", codexAdapter],
      ["claude-code", claudeAdapter],
    ]);

    const spec = makeSpec({ tasks: [makeTask("A")] });
    const run = new GoalRun(spec, adapters, { skipWorktree: true });
    const runPromise = run.run();

    // Fail attempt 1
    await waitFor(() => expect(codexAdapter.spawn).toHaveBeenCalledTimes(1));
    codexSession1.fail();

    // Fail attempt 2 (same adapter retry)
    await waitFor(() => expect(codexAdapter.spawn).toHaveBeenCalledTimes(2));
    codexSession2.fail();

    // Succeed attempt 3 with fallback adapter
    await waitFor(() => expect(claudeAdapter.spawn).toHaveBeenCalledTimes(1));
    claudeSession.succeed();

    const state = await runPromise;
    expect(state.status).toBe("completed");
    expect(state.tasks["A"]!.status).toBe("completed");
    expect(state.tasks["A"]!.attemptCount).toBe(3);
  });
});
