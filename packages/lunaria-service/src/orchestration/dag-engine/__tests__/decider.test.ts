import { describe, it, expect } from "vitest";
import { decide, InvariantError } from "../decider.js";
import { createEmptyReadModel } from "../read-model.js";
import { buildReadModel } from "../projector.js";
import type { OrchestrationReadModel } from "../read-model.js";
import type { OrchestrationEvent } from "../events.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGoalCreatedEvent(goalRunId = "goal-1"): OrchestrationEvent {
  return {
    id: "evt-1",
    goalRunId,
    timestamp: 1000,
    type: "goal.created",
    description: "Test goal",
    taskCount: 1,
  };
}

function makeTaskDispatchedEvent(taskId = "task-1", goalRunId = "goal-1"): OrchestrationEvent {
  return {
    id: "evt-2",
    goalRunId,
    timestamp: 1001,
    type: "task.dispatched",
    taskId,
    adapterId: "codex",
    routingReason: "matrix:implementation/low→codex",
  };
}

function modelWithGoal(goalRunId = "goal-1"): OrchestrationReadModel {
  return buildReadModel([makeGoalCreatedEvent(goalRunId)]);
}

function modelWithRunningTask(goalRunId = "goal-1", taskId = "task-1"): OrchestrationReadModel {
  return buildReadModel([
    makeGoalCreatedEvent(goalRunId),
    makeTaskDispatchedEvent(taskId, goalRunId),
  ]);
}

// ---------------------------------------------------------------------------
// goal.submit
// ---------------------------------------------------------------------------

describe("decide: goal.submit", () => {
  it("returns goal.created event for a new goal", () => {
    const rm = createEmptyReadModel();
    const result = decide(
      { type: "goal.submit", goalId: "g1", description: "My goal", tasks: [] },
      rm,
    );
    expect(result).not.toBeInstanceOf(InvariantError);
    const events = result as OrchestrationEvent[];
    expect(events).toHaveLength(1);
    expect(events[0]!.type).toBe("goal.created");
    expect((events[0] as { description: string }).description).toBe("My goal");
  });

  it("returns InvariantError if goal already exists", () => {
    const rm = modelWithGoal("g1");
    const result = decide(
      { type: "goal.submit", goalId: "g1", description: "Duplicate", tasks: [] },
      rm,
    );
    expect(result).toBeInstanceOf(InvariantError);
    expect((result as InvariantError).message).toMatch(/already exists/);
  });
});

// ---------------------------------------------------------------------------
// goal.cancel
// ---------------------------------------------------------------------------

describe("decide: goal.cancel", () => {
  it("returns goal.cancelled for a running goal", () => {
    const rm = modelWithGoal("g1");
    const result = decide({ type: "goal.cancel", goalId: "g1" }, rm);
    expect(result).not.toBeInstanceOf(InvariantError);
    const events = result as OrchestrationEvent[];
    expect(events[0]!.type).toBe("goal.cancelled");
  });

  it("returns InvariantError if goal does not exist", () => {
    const result = decide(
      { type: "goal.cancel", goalId: "nonexistent" },
      createEmptyReadModel(),
    );
    expect(result).toBeInstanceOf(InvariantError);
    expect((result as InvariantError).message).toMatch(/does not exist/);
  });

  it("returns InvariantError if goal is already completed", () => {
    const events: OrchestrationEvent[] = [
      makeGoalCreatedEvent("g1"),
      {
        id: "evt-3",
        goalRunId: "g1",
        timestamp: 9000,
        type: "goal.completed",
        status: "completed",
        totalCost: 0,
        totalDurationMs: 0,
      },
    ];
    const rm = buildReadModel(events);
    const result = decide({ type: "goal.cancel", goalId: "g1" }, rm);
    expect(result).toBeInstanceOf(InvariantError);
    expect((result as InvariantError).message).toMatch(/not running/);
  });
});

// ---------------------------------------------------------------------------
// task.dispatch
// ---------------------------------------------------------------------------

describe("decide: task.dispatch", () => {
  it("returns InvariantError if goal does not exist", () => {
    const result = decide(
      { type: "task.dispatch", goalId: "g1", taskId: "t1", adapterId: "codex", routingReason: "" },
      createEmptyReadModel(),
    );
    expect(result).toBeInstanceOf(InvariantError);
  });

  it("returns InvariantError if task does not exist", () => {
    const rm = modelWithGoal("g1");
    const result = decide(
      { type: "task.dispatch", goalId: "g1", taskId: "t-missing", adapterId: "codex", routingReason: "" },
      rm,
    );
    expect(result).toBeInstanceOf(InvariantError);
    expect((result as InvariantError).message).toMatch(/does not exist/);
  });

  it("returns InvariantError if task is not queued", () => {
    const rm = modelWithRunningTask("g1", "t1");
    const result = decide(
      { type: "task.dispatch", goalId: "g1", taskId: "t1", adapterId: "codex", routingReason: "" },
      rm,
    );
    expect(result).toBeInstanceOf(InvariantError);
    expect((result as InvariantError).message).toMatch(/not queued/);
  });
});

// ---------------------------------------------------------------------------
// task.complete
// ---------------------------------------------------------------------------

describe("decide: task.complete", () => {
  it("returns task.completed for a running task", () => {
    const rm = modelWithRunningTask("g1", "t1");
    const result = decide(
      { type: "task.complete", goalId: "g1", taskId: "t1", durationMs: 500, tokenCount: 100, cost: 0.01 },
      rm,
    );
    expect(result).not.toBeInstanceOf(InvariantError);
    const events = result as OrchestrationEvent[];
    expect(events[0]!.type).toBe("task.completed");
  });

  it("returns InvariantError if task is not running", () => {
    const rm = modelWithGoal("g1");
    // Task not yet dispatched (not in read model tasks map)
    const result = decide(
      { type: "task.complete", goalId: "g1", taskId: "t-not-running", durationMs: 0, tokenCount: 0, cost: 0 },
      rm,
    );
    expect(result).toBeInstanceOf(InvariantError);
  });
});

// ---------------------------------------------------------------------------
// task.fail
// ---------------------------------------------------------------------------

describe("decide: task.fail", () => {
  it("returns task.failed for a running task", () => {
    const rm = modelWithRunningTask("g1", "t1");
    const result = decide(
      { type: "task.fail", goalId: "g1", taskId: "t1", error: "boom", retryable: true },
      rm,
    );
    expect(result).not.toBeInstanceOf(InvariantError);
    const events = result as OrchestrationEvent[];
    expect(events[0]!.type).toBe("task.failed");
  });

  it("returns InvariantError if task not running", () => {
    const rm = modelWithGoal("g1");
    const result = decide(
      { type: "task.fail", goalId: "g1", taskId: "missing", error: "x", retryable: false },
      rm,
    );
    expect(result).toBeInstanceOf(InvariantError);
  });
});

// ---------------------------------------------------------------------------
// task.timeout
// ---------------------------------------------------------------------------

describe("decide: task.timeout", () => {
  it("returns task.timed_out for running task", () => {
    const rm = modelWithRunningTask("g1", "t1");
    const result = decide({ type: "task.timeout", goalId: "g1", taskId: "t1" }, rm);
    expect(result).not.toBeInstanceOf(InvariantError);
    const events = result as OrchestrationEvent[];
    expect(events[0]!.type).toBe("task.timed_out");
  });

  it("returns InvariantError if task is not running", () => {
    const rm = modelWithGoal("g1");
    const result = decide({ type: "task.timeout", goalId: "g1", taskId: "missing" }, rm);
    expect(result).toBeInstanceOf(InvariantError);
  });
});

// ---------------------------------------------------------------------------
// task.retry
// ---------------------------------------------------------------------------

describe("decide: task.retry", () => {
  it("returns task.retrying for a failed task with attempts < 3", () => {
    // Build a model with a failed task (dispatched then failed)
    const rm = buildReadModel([
      makeGoalCreatedEvent("g1"),
      makeTaskDispatchedEvent("t1", "g1"),
      { id: "evt-3", goalRunId: "g1", timestamp: 2000, type: "task.failed", taskId: "t1", error: "boom" },
    ]);
    const result = decide(
      { type: "task.retry", goalId: "g1", taskId: "t1", newAdapterId: "claude-code", attempt: 2 },
      rm,
    );
    expect(result).not.toBeInstanceOf(InvariantError);
    const events = result as OrchestrationEvent[];
    expect(events[0]!.type).toBe("task.retrying");
  });

  it("returns InvariantError if attempts >= 3", () => {
    // Simulate 3 dispatch/fail cycles to hit the limit
    const evts: OrchestrationEvent[] = [makeGoalCreatedEvent("g1")];
    for (let i = 0; i < 3; i++) {
      evts.push({ ...makeTaskDispatchedEvent("t1", "g1"), id: `d-${i}`, timestamp: 1000 + i });
      evts.push({ id: `f-${i}`, goalRunId: "g1", timestamp: 2000 + i, type: "task.failed", taskId: "t1", error: "x" });
    }
    const rm = buildReadModel(evts);
    const result = decide(
      { type: "task.retry", goalId: "g1", taskId: "t1", newAdapterId: "claude-code", attempt: 4 },
      rm,
    );
    expect(result).toBeInstanceOf(InvariantError);
    expect((result as InvariantError).message).toMatch(/maximum retry/);
  });

  it("returns InvariantError if task is not failed/timed_out", () => {
    const rm = modelWithRunningTask("g1", "t1");
    const result = decide(
      { type: "task.retry", goalId: "g1", taskId: "t1", newAdapterId: "codex", attempt: 2 },
      rm,
    );
    expect(result).toBeInstanceOf(InvariantError);
    expect((result as InvariantError).message).toMatch(/must be failed or timed_out/);
  });
});

// ---------------------------------------------------------------------------
// task.skip
// ---------------------------------------------------------------------------

describe("decide: task.skip", () => {
  it("returns InvariantError for non-queued task", () => {
    const rm = modelWithRunningTask("g1", "t1");
    const result = decide(
      { type: "task.skip", goalId: "g1", taskId: "t1", reason: "dep failed" },
      rm,
    );
    expect(result).toBeInstanceOf(InvariantError);
    expect((result as InvariantError).message).toMatch(/must be queued/);
  });

  it("returns InvariantError if task does not exist", () => {
    const rm = modelWithGoal("g1");
    const result = decide(
      { type: "task.skip", goalId: "g1", taskId: "ghost", reason: "gone" },
      rm,
    );
    expect(result).toBeInstanceOf(InvariantError);
  });
});

// ---------------------------------------------------------------------------
// merge.*
// ---------------------------------------------------------------------------

describe("decide: merge.*", () => {
  it("merge.start returns merge.started for existing goal", () => {
    const rm = modelWithGoal("g1");
    const result = decide({ type: "merge.start", goalId: "g1" }, rm);
    expect(result).not.toBeInstanceOf(InvariantError);
    const events = result as OrchestrationEvent[];
    expect(events[0]!.type).toBe("merge.started");
  });

  it("merge.start returns InvariantError if goal does not exist", () => {
    const result = decide({ type: "merge.start", goalId: "nope" }, createEmptyReadModel());
    expect(result).toBeInstanceOf(InvariantError);
  });

  it("merge.conflict returns merge.conflicted", () => {
    const rm = modelWithGoal("g1");
    const result = decide({ type: "merge.conflict", goalId: "g1", taskId: "t1", files: ["a.ts"] }, rm);
    expect(result).not.toBeInstanceOf(InvariantError);
    const events = result as OrchestrationEvent[];
    expect(events[0]!.type).toBe("merge.conflicted");
  });

  it("merge.complete returns merge.completed", () => {
    const rm = modelWithGoal("g1");
    const result = decide({ type: "merge.complete", goalId: "g1" }, rm);
    expect(result).not.toBeInstanceOf(InvariantError);
    const events = result as OrchestrationEvent[];
    expect(events[0]!.type).toBe("merge.completed");
  });
});

// ---------------------------------------------------------------------------
// cost.update
// ---------------------------------------------------------------------------

describe("decide: cost.update", () => {
  it("returns cost.updated for existing goal", () => {
    const rm = modelWithGoal("g1");
    const result = decide(
      { type: "cost.update", goalId: "g1", totalUsd: 0.05, byAgent: { codex: 0.03, "claude-code": 0.02 } },
      rm,
    );
    expect(result).not.toBeInstanceOf(InvariantError);
    const events = result as OrchestrationEvent[];
    expect(events[0]!.type).toBe("cost.updated");
    expect((events[0] as { totalUsd: number }).totalUsd).toBe(0.05);
  });

  it("returns InvariantError if goal does not exist", () => {
    const result = decide(
      { type: "cost.update", goalId: "ghost", totalUsd: 0, byAgent: {} },
      createEmptyReadModel(),
    );
    expect(result).toBeInstanceOf(InvariantError);
  });
});
