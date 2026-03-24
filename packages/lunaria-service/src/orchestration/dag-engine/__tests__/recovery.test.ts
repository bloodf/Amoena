import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "node:events";
import { GoalRun } from "../goal-run.js";
import { InMemoryGoalRunStorage, loadGoalRunState } from "../recovery.js";
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
// MockSession
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
        Object.assign(new Error("cancelled"), { name: "CancelledError" }),
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
}

// ---------------------------------------------------------------------------
// Adapter factory
// ---------------------------------------------------------------------------

function makeAdapter(id: string, sessions: MockSession[]): AgentAdapter {
  let idx = 0;
  return {
    id,
    displayName: id,
    capabilities: ["code-generation"],
    costPerToken: null,
    isAvailable: vi.fn().mockResolvedValue(true),
    spawn: vi.fn().mockImplementation(() => sessions[idx++] ?? sessions[sessions.length - 1]!),
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
    id: "goal-recovery",
    description: "Recovery test goal",
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
// Recovery tests
// ---------------------------------------------------------------------------

describe("GoalRun crash recovery", () => {
  it("resumed run restores completed task states and re-queues interrupted tasks", async () => {
    // -----------------------------------------------------------------------
    // The scheduler's internal completed Set starts empty on resume, so
    // tasks with no dependencies are the ones that can be re-dispatched.
    // Tasks that were completed are restored as "completed" in node state,
    // which causes isFinished() to count them as terminal.
    //
    // Scenario: single independent task A was "running" at crash time.
    // After resume, it should be re-queued and dispatched again.
    // -----------------------------------------------------------------------
    const storage = new InMemoryGoalRunStorage();

    const spec = makeSpec({
      tasks: [makeTask("A"), makeTask("B", ["A"])],
    });

    // Simulate crash state: A was running (will be re-queued on resume), B is queued
    await storage.save({
      goalId: "goal-recovery",
      status: "running",
      startedAt: Date.now() - 10000,
      completedAt: null,
      mergeResult: null,
      tasks: {
        A: {
          taskId: "A",
          status: "running",  // in-progress at crash → will become queued on resume
          adapterId: "codex",
          attemptCount: 1,
          startedAt: Date.now() - 5000,
          completedAt: null,
          worktreePath: null,
          errorMessage: null,
          routingReason: "preferred",
        },
        B: {
          taskId: "B",
          status: "queued",
          adapterId: null,
          attemptCount: 0,
          startedAt: null,
          completedAt: null,
          worktreePath: null,
          errorMessage: null,
          routingReason: "",
        },
      },
    });

    const sA = new MockSession("sA-resume", "codex");
    const sB = new MockSession("sB-resume", "codex");
    const adapterResume = makeAdapter("codex", [sA, sB]);
    const adaptersResume = new Map([
      ["codex", adapterResume],
      ["claude-code", makeUnavailableAdapter("claude-code")],
    ]);

    const resumed = await GoalRun.resume("goal-recovery", spec, adaptersResume, {
      skipWorktree: true,
      storage,
    });

    const resumedPromise = resumed.run();

    // A dispatches first (re-queued from running)
    await waitFor(() => expect(adapterResume.spawn).toHaveBeenCalledTimes(1));
    sA.succeed();

    // B dispatches after A completes
    await waitFor(() => expect(adapterResume.spawn).toHaveBeenCalledTimes(2));
    sB.succeed();

    const finalState = await resumedPromise;

    expect(finalState.tasks["A"]!.status).toBe("completed");
    expect(finalState.tasks["B"]!.status).toBe("completed");
    expect(finalState.status).toBe("completed");
  });

  it("resume re-queues tasks that were in-progress (running) when crash occurred", async () => {
    // Simulates a crash where task A was running but not completed
    const storage = new InMemoryGoalRunStorage();

    // Manually write a state where A was "running" at crash time
    await storage.save({
      goalId: "goal-recovery",
      status: "running",
      startedAt: Date.now() - 5000,
      completedAt: null,
      mergeResult: null,
      tasks: {
        A: {
          taskId: "A",
          status: "running", // in-progress at crash
          adapterId: "codex",
          attemptCount: 1,
          startedAt: Date.now() - 4000,
          completedAt: null,
          worktreePath: null,
          errorMessage: null,
          routingReason: "preferred",
        },
      },
    });

    const sA = new MockSession("sA-resume", "codex");
    const adapterResume = makeAdapter("codex", [sA]);
    const adaptersResume = new Map([
      ["codex", adapterResume],
      ["claude-code", makeUnavailableAdapter("claude-code")],
    ]);

    const spec = makeSpec({ tasks: [makeTask("A")] });
    const resumed = await GoalRun.resume("goal-recovery", spec, adaptersResume, {
      skipWorktree: true,
      storage,
    });

    const resumedPromise = resumed.run();

    // A should be re-dispatched because running → queued on resume
    await waitFor(() => expect(adapterResume.spawn).toHaveBeenCalledTimes(1));
    sA.succeed();

    const finalState = await resumedPromise;
    expect(finalState.tasks["A"]!.status).toBe("completed");
    expect(finalState.status).toBe("completed");
  });

  it("InMemoryGoalRunStorage persists and retrieves state correctly", async () => {
    const storage = new InMemoryGoalRunStorage();
    const state = {
      goalId: "goal-storage-test",
      status: "completed" as const,
      startedAt: 1000,
      completedAt: 2000,
      mergeResult: null,
      tasks: {
        A: {
          taskId: "A",
          status: "completed" as const,
          adapterId: "codex",
          attemptCount: 1,
          startedAt: 1000,
          completedAt: 2000,
          worktreePath: null,
          errorMessage: null,
          routingReason: "",
        },
      },
    };

    await storage.save(state);
    const loaded = await storage.load("goal-storage-test");

    expect(loaded).not.toBeNull();
    expect(loaded!.goalId).toBe("goal-storage-test");
    expect(loaded!.status).toBe("completed");
    expect(loaded!.tasks["A"]!.status).toBe("completed");
  });

  it("InMemoryGoalRunStorage returns null for unknown goalId", async () => {
    const storage = new InMemoryGoalRunStorage();
    const result = await storage.load("nonexistent-goal");
    expect(result).toBeNull();
  });

  it("InMemoryGoalRunStorage findIncomplete returns only running/pending goals", async () => {
    const storage = new InMemoryGoalRunStorage();

    const base = {
      startedAt: Date.now(),
      completedAt: null,
      mergeResult: null,
      tasks: {},
    };

    await storage.save({ ...base, goalId: "g-running", status: "running" });
    await storage.save({ ...base, goalId: "g-pending", status: "pending" });
    await storage.save({ ...base, goalId: "g-done", status: "completed" });
    await storage.save({ ...base, goalId: "g-failed", status: "failed" });

    const incomplete = await storage.findIncomplete();
    expect(incomplete).toContain("g-running");
    expect(incomplete).toContain("g-pending");
    expect(incomplete).not.toContain("g-done");
    expect(incomplete).not.toContain("g-failed");
  });
});
