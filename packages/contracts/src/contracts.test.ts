import { describe, it, expect } from "vitest";
import {
  buildMcWsUrl,
  MC_WS_DEFAULT_PORT,
} from "./protocol.js";
import type {
  TaskStatus,
  GoalRunStatus,
  TaskRunRow,
  GoalRunRow,
  AgentPerformanceRow,
  RunReport,
  RoutingDecision,
  MCServerEvent,
  MCClientEvent,
  GoalOptions,
  AdapterCapabilities,
  SubscribeHandshake,
} from "./index.js";

// ---------------------------------------------------------------------------
// protocol helpers
// ---------------------------------------------------------------------------

describe("buildMcWsUrl", () => {
  it("uses defaults when called with no arguments", () => {
    expect(buildMcWsUrl()).toBe(`ws://localhost:${MC_WS_DEFAULT_PORT}/mc`);
  });

  it("accepts a custom host and port", () => {
    expect(buildMcWsUrl("192.168.1.5", 8080)).toBe("ws://192.168.1.5:8080/mc");
  });

  it("accepts only a host override", () => {
    expect(buildMcWsUrl("myhost")).toBe(
      `ws://myhost:${MC_WS_DEFAULT_PORT}/mc`,
    );
  });
});

// ---------------------------------------------------------------------------
// TaskStatus exhaustiveness check (compile-time via type assignment)
// ---------------------------------------------------------------------------

describe("TaskStatus values", () => {
  it("covers all expected variants", () => {
    const values: TaskStatus[] = [
      "queued",
      "running",
      "completed",
      "failed",
      "timed_out",
      "cancelled",
      "skipped",
    ];
    expect(values).toHaveLength(7);
  });
});

// ---------------------------------------------------------------------------
// GoalRunStatus exhaustiveness check
// ---------------------------------------------------------------------------

describe("GoalRunStatus values", () => {
  it("covers all expected variants", () => {
    const values: GoalRunStatus[] = [
      "running",
      "completed",
      "partial_failure",
      "failed",
      "cancelled",
    ];
    expect(values).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// Model construction (shape validation)
// ---------------------------------------------------------------------------

describe("TaskRunRow", () => {
  it("accepts a minimal valid row", () => {
    const row: TaskRunRow = {
      taskId: "t1",
      goalId: "g1",
      adapterId: "claude-code",
      description: "Fix the bug",
      taskType: "implementation",
      status: "completed",
    };
    expect(row.taskId).toBe("t1");
    expect(row.costUsd).toBeUndefined();
  });

  it("accepts a fully populated row", () => {
    const row: TaskRunRow = {
      taskId: "t2",
      goalId: "g1",
      adapterId: "codex",
      description: "Write tests",
      taskType: "testing",
      complexity: "medium",
      status: "failed",
      startedAt: 1000,
      completedAt: 2000,
      durationMs: 1000,
      costUsd: 0.005,
      attempts: 2,
      dependsOn: ["t1"],
      routingReason: "complexity:medium",
      couldImprove: true,
    };
    expect(row.costUsd).toBe(0.005);
  });
});

describe("GoalRunRow", () => {
  it("requires startedAt", () => {
    const row: GoalRunRow = {
      goalId: "g1",
      description: "My goal",
      status: "running",
      startedAt: Date.now(),
    };
    expect(row.goalId).toBe("g1");
  });
});

describe("AgentPerformanceRow", () => {
  it("accepts a minimal row", () => {
    const row: AgentPerformanceRow = {
      adapterId: "gemini",
      assigned: 5,
      completed: 4,
      failed: 1,
    };
    expect(row.successRate).toBeUndefined();
  });
});

describe("RunReport", () => {
  it("contains required arrays", () => {
    const report: RunReport = {
      goalId: "g1",
      description: "Test",
      status: "completed",
      startedAt: 0,
      tasks: [],
      agents: [],
      routing: [],
    };
    expect(report.tasks).toHaveLength(0);
  });
});

describe("RoutingDecision", () => {
  it("accepts a valid decision", () => {
    const d: RoutingDecision = {
      taskId: "t1",
      adapterId: "claude-code",
      reason: "best for code-generation",
      couldImprove: false,
    };
    expect(d.couldImprove).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Event discriminated unions
// ---------------------------------------------------------------------------

describe("MCServerEvent", () => {
  it("can represent all variant types", () => {
    const dispatched: MCServerEvent = {
      type: "task:dispatched",
      taskId: "t1",
      adapterId: "claude-code",
      routingReason: "default",
    };
    expect(dispatched.type).toBe("task:dispatched");

    const retrying: MCServerEvent = {
      type: "task:retrying",
      taskId: "t1",
      attempt: 2,
      reason: "exit 1",
    };
    expect(retrying.type).toBe("task:retrying");

    const error: MCServerEvent = {
      type: "task:error",
      taskId: "t1",
      message: "out of memory",
      fatal: true,
    };
    expect(error.type).toBe("task:error");
  });
});

describe("MCClientEvent", () => {
  it("can represent subscribe variant", () => {
    const sub: MCClientEvent = { type: "subscribe", goalId: "g1" };
    expect(sub.type).toBe("subscribe");
  });

  it("can represent goal:submit variant", () => {
    const submit: MCClientEvent = {
      type: "goal:submit",
      description: "do the thing",
    };
    expect(submit.type).toBe("goal:submit");
  });
});

// ---------------------------------------------------------------------------
// Options and capabilities
// ---------------------------------------------------------------------------

describe("GoalOptions", () => {
  it("all fields are optional", () => {
    const opts: GoalOptions = {};
    expect(opts.maxConcurrency).toBeUndefined();
    expect(opts.timeoutMs).toBeUndefined();
  });
});

describe("AdapterCapabilities", () => {
  it("accepts all defined values", () => {
    const caps: AdapterCapabilities[] = [
      "code-generation",
      "code-review",
      "refactoring",
      "analysis",
      "documentation",
      "testing",
    ];
    expect(caps).toHaveLength(6);
  });
});

describe("SubscribeHandshake", () => {
  it("accepts version 1", () => {
    const hs: SubscribeHandshake = { version: "1", goalId: "g1" };
    expect(hs.version).toBe("1");
  });
});
