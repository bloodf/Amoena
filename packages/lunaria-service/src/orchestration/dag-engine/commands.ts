import type { TaskSpec } from "./types.js";

export type OrchestrationCommand =
  | { type: "goal.submit"; goalId: string; description: string; tasks: TaskSpec[] }
  | { type: "goal.cancel"; goalId: string }
  | { type: "task.dispatch"; goalId: string; taskId: string; adapterId: string; routingReason: string }
  | { type: "task.output"; goalId: string; taskId: string; text: string; timestamp: number }
  | { type: "task.complete"; goalId: string; taskId: string; durationMs: number; tokenCount: number; cost: number }
  | { type: "task.fail"; goalId: string; taskId: string; error: string; retryable: boolean }
  | { type: "task.retry"; goalId: string; taskId: string; newAdapterId: string; attempt: number }
  | { type: "task.timeout"; goalId: string; taskId: string }
  | { type: "task.skip"; goalId: string; taskId: string; reason: string }
  | { type: "merge.start"; goalId: string }
  | { type: "merge.conflict"; goalId: string; taskId: string; files: string[] }
  | { type: "merge.complete"; goalId: string }
  | { type: "cost.update"; goalId: string; totalUsd: number; byAgent: Record<string, number> };
