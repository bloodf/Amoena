import { describe, it, expect } from "vitest";
import { project, buildReadModel } from "../projector.js";
import { createEmptyReadModel } from "../read-model.js";
import type { OrchestrationEvent } from "../events.js";

function evt<T extends Omit<OrchestrationEvent, "id" | "goalRunId" | "timestamp">>(
  type: T,
  goalRunId = "g1",
): OrchestrationEvent {
  return { id: "e-" + Math.random(), goalRunId, timestamp: Date.now(), ...type } as OrchestrationEvent;
}

describe("projector: project", () => {
  it("goal.created initialises GoalRunView with pending status", () => {
    const rm = project(createEmptyReadModel(), {
      id: "e1",
      goalRunId: "g1",
      timestamp: 1000,
      type: "goal.created",
      description: "My goal",
      taskCount: 3,
    });
    const goal = rm.goalRuns.get("g1");
    expect(goal).toBeDefined();
    expect(goal!.status).toBe("pending");
    expect(goal!.taskCount).toBe(3);
    expect(goal!.description).toBe("My goal");
    expect(goal!.totalCost).toBe(0);
  });

  it("goal.cancelled sets status to cancelled", () => {
    const base = project(createEmptyReadModel(), {
      id: "e1", goalRunId: "g1", timestamp: 1000,
      type: "goal.created", description: "x", taskCount: 1,
    });
    const rm = project(base, { id: "e2", goalRunId: "g1", timestamp: 2000, type: "goal.cancelled" });
    expect(rm.goalRuns.get("g1")!.status).toBe("cancelled");
    expect(rm.goalRuns.get("g1")!.completedAt).toBe(2000);
  });

  it("goal.completed sets status, totalCost, totalDurationMs", () => {
    const base = project(createEmptyReadModel(), {
      id: "e1", goalRunId: "g1", timestamp: 1000,
      type: "goal.created", description: "x", taskCount: 1,
    });
    const rm = project(base, {
      id: "e2", goalRunId: "g1", timestamp: 5000,
      type: "goal.completed", status: "completed", totalCost: 0.12, totalDurationMs: 4000,
    });
    const goal = rm.goalRuns.get("g1")!;
    expect(goal.status).toBe("completed");
    expect(goal.totalCost).toBe(0.12);
    expect(goal.totalDurationMs).toBe(4000);
  });

  it("task.dispatched creates TaskView with running status and increments attemptCount", () => {
    const base = project(createEmptyReadModel(), {
      id: "e1", goalRunId: "g1", timestamp: 1000,
      type: "goal.created", description: "x", taskCount: 1,
    });
    const rm = project(base, {
      id: "e2", goalRunId: "g1", timestamp: 1100,
      type: "task.dispatched", taskId: "t1", adapterId: "codex", routingReason: "matrix",
    });
    const task = rm.tasks.get("t1")!;
    expect(task.status).toBe("running");
    expect(task.adapterId).toBe("codex");
    expect(task.attemptCount).toBe(1);
    // taskId registered in goal
    expect(rm.goalRuns.get("g1")!.taskIds).toContain("t1");
  });

  it("task.dispatched is idempotent for taskIds list", () => {
    const base = buildReadModel([
      { id: "e1", goalRunId: "g1", timestamp: 1000, type: "goal.created", description: "x", taskCount: 1 },
      { id: "e2", goalRunId: "g1", timestamp: 1100, type: "task.dispatched", taskId: "t1", adapterId: "codex", routingReason: "m" },
    ]);
    // Dispatch same task again (e.g. retry)
    const rm = project(base, {
      id: "e3", goalRunId: "g1", timestamp: 2000,
      type: "task.dispatched", taskId: "t1", adapterId: "claude-code", routingReason: "retry",
    });
    expect(rm.goalRuns.get("g1")!.taskIds.filter((id) => id === "t1")).toHaveLength(1);
  });

  it("task.output.appended appends text to outputChunks", () => {
    const base = buildReadModel([
      { id: "e1", goalRunId: "g1", timestamp: 1000, type: "goal.created", description: "x", taskCount: 1 },
      { id: "e2", goalRunId: "g1", timestamp: 1100, type: "task.dispatched", taskId: "t1", adapterId: "codex", routingReason: "m" },
    ]);
    const rm1 = project(base, { id: "e3", goalRunId: "g1", timestamp: 1200, type: "task.output.appended", taskId: "t1", text: "hello" });
    const rm2 = project(rm1, { id: "e4", goalRunId: "g1", timestamp: 1300, type: "task.output.appended", taskId: "t1", text: " world" });
    expect(rm2.tasks.get("t1")!.outputChunks).toEqual(["hello", " world"]);
  });

  it("task.completed sets status, durationMs, updates agent performance", () => {
    const base = buildReadModel([
      { id: "e1", goalRunId: "g1", timestamp: 1000, type: "goal.created", description: "x", taskCount: 1 },
      { id: "e2", goalRunId: "g1", timestamp: 1100, type: "task.dispatched", taskId: "t1", adapterId: "codex", routingReason: "m" },
    ]);
    const rm = project(base, {
      id: "e3", goalRunId: "g1", timestamp: 2000,
      type: "task.completed", taskId: "t1", durationMs: 900, tokenCount: 500, cost: 0.005,
    });
    const task = rm.tasks.get("t1")!;
    expect(task.status).toBe("completed");
    expect(task.durationMs).toBe(900);
    expect(task.cost).toBe(0.005);
    const perf = rm.agentPerformance.get("codex")!;
    expect(perf.tasksCompleted).toBe(1);
    expect(perf.totalCost).toBe(0.005);
  });

  it("task.failed sets status, error, updates agent failure count", () => {
    const base = buildReadModel([
      { id: "e1", goalRunId: "g1", timestamp: 1000, type: "goal.created", description: "x", taskCount: 1 },
      { id: "e2", goalRunId: "g1", timestamp: 1100, type: "task.dispatched", taskId: "t1", adapterId: "codex", routingReason: "m" },
    ]);
    const rm = project(base, {
      id: "e3", goalRunId: "g1", timestamp: 2000,
      type: "task.failed", taskId: "t1", error: "exit 1",
    });
    const task = rm.tasks.get("t1")!;
    expect(task.status).toBe("failed");
    expect(task.error).toBe("exit 1");
    expect(rm.agentPerformance.get("codex")!.tasksFailed).toBe(1);
  });

  it("task.retrying resets task to queued with new adapterId", () => {
    const base = buildReadModel([
      { id: "e1", goalRunId: "g1", timestamp: 1000, type: "goal.created", description: "x", taskCount: 1 },
      { id: "e2", goalRunId: "g1", timestamp: 1100, type: "task.dispatched", taskId: "t1", adapterId: "codex", routingReason: "m" },
      { id: "e3", goalRunId: "g1", timestamp: 2000, type: "task.failed", taskId: "t1", error: "x" },
    ]);
    const rm = project(base, {
      id: "e4", goalRunId: "g1", timestamp: 2100,
      type: "task.retrying", taskId: "t1", newAdapterId: "claude-code", attempt: 2,
    });
    const task = rm.tasks.get("t1")!;
    expect(task.status).toBe("queued");
    expect(task.adapterId).toBe("claude-code");
    expect(task.error).toBeNull();
  });

  it("task.timed_out marks task timed_out and increments failures", () => {
    const base = buildReadModel([
      { id: "e1", goalRunId: "g1", timestamp: 1000, type: "goal.created", description: "x", taskCount: 1 },
      { id: "e2", goalRunId: "g1", timestamp: 1100, type: "task.dispatched", taskId: "t1", adapterId: "codex", routingReason: "m" },
    ]);
    const rm = project(base, {
      id: "e3", goalRunId: "g1", timestamp: 3000, type: "task.timed_out", taskId: "t1",
    });
    expect(rm.tasks.get("t1")!.status).toBe("timed_out");
    expect(rm.agentPerformance.get("codex")!.tasksFailed).toBe(1);
  });

  it("task.skipped marks task skipped with reason in error field", () => {
    const base = buildReadModel([
      { id: "e1", goalRunId: "g1", timestamp: 1000, type: "goal.created", description: "x", taskCount: 1 },
      { id: "e2", goalRunId: "g1", timestamp: 1100, type: "task.dispatched", taskId: "t1", adapterId: "codex", routingReason: "m" },
      { id: "e3", goalRunId: "g1", timestamp: 1200, type: "task.retrying", taskId: "t1", newAdapterId: "codex", attempt: 2 },
    ]);
    const rm = project(base, {
      id: "e4", goalRunId: "g1", timestamp: 1300,
      type: "task.skipped", taskId: "t1", reason: "dep failed",
    });
    expect(rm.tasks.get("t1")!.status).toBe("skipped");
    expect(rm.tasks.get("t1")!.error).toBe("dep failed");
  });

  it("cost.updated sets totalCost on goal", () => {
    const base = buildReadModel([
      { id: "e1", goalRunId: "g1", timestamp: 1000, type: "goal.created", description: "x", taskCount: 1 },
    ]);
    const rm = project(base, {
      id: "e2", goalRunId: "g1", timestamp: 2000,
      type: "cost.updated", totalUsd: 0.42, byAgent: { codex: 0.42 },
    });
    expect(rm.goalRuns.get("g1")!.totalCost).toBe(0.42);
  });

  it("merge events do not mutate the read model", () => {
    const base = buildReadModel([
      { id: "e1", goalRunId: "g1", timestamp: 1000, type: "goal.created", description: "x", taskCount: 1 },
    ]);
    const rm1 = project(base, { id: "e2", goalRunId: "g1", timestamp: 2000, type: "merge.started" });
    const rm2 = project(rm1, { id: "e3", goalRunId: "g1", timestamp: 2100, type: "merge.conflicted", taskId: "t1", files: ["a.ts"] });
    const rm3 = project(rm2, { id: "e4", goalRunId: "g1", timestamp: 2200, type: "merge.completed" });
    // Goal should be unchanged (merge events are informational)
    expect(rm3.goalRuns.get("g1")!.status).toBe("pending");
  });
});

describe("buildReadModel", () => {
  it("returns empty model for empty event list", () => {
    const rm = buildReadModel([]);
    expect(rm.goalRuns.size).toBe(0);
    expect(rm.tasks.size).toBe(0);
  });

  it("folds all events into correct final state", () => {
    const events: OrchestrationEvent[] = [
      { id: "e1", goalRunId: "g1", timestamp: 1000, type: "goal.created", description: "My goal", taskCount: 2 },
      { id: "e2", goalRunId: "g1", timestamp: 1100, type: "task.dispatched", taskId: "t1", adapterId: "codex", routingReason: "m" },
      { id: "e3", goalRunId: "g1", timestamp: 1200, type: "task.dispatched", taskId: "t2", adapterId: "claude-code", routingReason: "m" },
      { id: "e4", goalRunId: "g1", timestamp: 2000, type: "task.completed", taskId: "t1", durationMs: 900, tokenCount: 100, cost: 0.01 },
      { id: "e5", goalRunId: "g1", timestamp: 2100, type: "task.failed", taskId: "t2", error: "boom" },
      { id: "e6", goalRunId: "g1", timestamp: 3000, type: "goal.completed", status: "partial_failure", totalCost: 0.01, totalDurationMs: 2000 },
    ];
    const rm = buildReadModel(events);
    expect(rm.goalRuns.get("g1")!.status).toBe("partial_failure");
    expect(rm.tasks.get("t1")!.status).toBe("completed");
    expect(rm.tasks.get("t2")!.status).toBe("failed");
    expect(rm.agentPerformance.get("codex")!.tasksCompleted).toBe(1);
    expect(rm.agentPerformance.get("claude-code")!.tasksFailed).toBe(1);
  });

  it("project is immutable — does not mutate input read model", () => {
    const rm0 = createEmptyReadModel();
    const rm1 = project(rm0, {
      id: "e1", goalRunId: "g1", timestamp: 1000,
      type: "goal.created", description: "x", taskCount: 0,
    });
    // rm0 must remain unchanged
    expect(rm0.goalRuns.size).toBe(0);
    expect(rm1.goalRuns.size).toBe(1);
  });
});
