import type { GoalRunStatus } from "./types.js";

export type OrchestrationEvent = {
  id: string; // ulid
  goalRunId: string;
  timestamp: number; // Date.now()
} & (
  | { type: "goal.created"; description: string; taskCount: number }
  | { type: "goal.cancelled" }
  | { type: "goal.completed"; status: GoalRunStatus; totalCost: number; totalDurationMs: number }
  | { type: "task.dispatched"; taskId: string; adapterId: string; routingReason: string }
  | { type: "task.output.appended"; taskId: string; text: string }
  | { type: "task.completed"; taskId: string; durationMs: number; tokenCount: number; cost: number }
  | { type: "task.failed"; taskId: string; error: string }
  | { type: "task.retrying"; taskId: string; newAdapterId: string; attempt: number }
  | { type: "task.timed_out"; taskId: string }
  | { type: "task.skipped"; taskId: string; reason: string }
  | { type: "merge.started" }
  | { type: "merge.conflicted"; taskId: string; files: string[] }
  | { type: "merge.completed" }
  | { type: "cost.updated"; totalUsd: number; byAgent: Record<string, number> }
);
