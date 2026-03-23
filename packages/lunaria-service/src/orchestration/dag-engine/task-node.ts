import type { AgentSession } from "../cli-adapters/types.js";
import type { TaskSpec, TaskRunState } from "./types.js";

export class TaskNode {
  readonly spec: TaskSpec;
  state: TaskRunState;
  session: AgentSession | null = null;

  constructor(spec: TaskSpec) {
    this.spec = spec;
    this.state = {
      taskId: spec.id,
      status: "queued",
      adapterId: null,
      attemptCount: 0,
      startedAt: null,
      completedAt: null,
      worktreePath: null,
      errorMessage: null,
      routingReason: "",
    };
  }

  /** True when all dependsOn task IDs are in the completed set */
  isReady(completedIds: Set<string>): boolean {
    return this.spec.dependsOn.every((dep) => completedIds.has(dep));
  }

  /** True when another retry attempt is allowed (max 2 retries = 3 total attempts) */
  canRetry(): boolean {
    return this.state.attemptCount < 3;
  }
}
