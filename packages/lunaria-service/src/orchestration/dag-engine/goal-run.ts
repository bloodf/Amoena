import { EventEmitter } from "node:events";
import type { AgentAdapter, OutputChunk } from "../cli-adapters/types.js";
import { TaskNode } from "./task-node.js";
import { DagScheduler } from "./scheduler.js";
import { routeTask } from "./router.js";
import { createWorktree } from "./worktree.js";
import {
  InMemoryGoalRunStorage,
  saveGoalRunState,
  loadGoalRunState,
  type GoalRunStorage,
} from "./recovery.js";
import type {
  GoalSpec,
  GoalRunState,
  GoalRunStatus,
  TaskRunState,
  TaskStatus,
} from "./types.js";

const COMPLEXITY_TIMEOUT: Record<string, number> = {
  low: 600_000,
  medium: 1_200_000,
  high: 1_800_000,
};

export interface GoalRunOptions {
  storage?: GoalRunStorage;
  repoRoot?: string;
  /** Skip git worktree creation (useful for tests) */
  skipWorktree?: boolean;
}

export class GoalRun extends EventEmitter {
  readonly goalId: string;
  private readonly spec: GoalSpec;
  private state: GoalRunState;
  private readonly scheduler: DagScheduler;
  private readonly adapters: Map<string, AgentAdapter>;
  private readonly storage: GoalRunStorage;
  private readonly repoRoot: string;
  private readonly skipWorktree: boolean;
  private _cancelled = false;
  /** Live TaskNode map — holds session references */
  private readonly _nodes: Map<string, TaskNode>;

  constructor(
    spec: GoalSpec,
    adapters: Map<string, AgentAdapter>,
    opts: GoalRunOptions = {},
  ) {
    super();
    this.goalId = spec.id;
    this.spec = spec;
    this.adapters = adapters;
    this.storage = opts.storage ?? new InMemoryGoalRunStorage();
    this.repoRoot = opts.repoRoot ?? process.cwd();
    this.skipWorktree = opts.skipWorktree ?? false;

    const nodes = spec.tasks.map((t) => new TaskNode(t));
    this._nodes = new Map(nodes.map((n) => [n.spec.id, n]));
    this.scheduler = new DagScheduler(nodes, spec.maxConcurrency ?? 3);

    const taskStates: Record<string, TaskRunState> = {};
    for (const node of nodes) {
      taskStates[node.spec.id] = node.state;
    }

    this.state = {
      goalId: spec.id,
      status: "pending",
      tasks: taskStates,
      startedAt: Date.now(),
      completedAt: null,
      mergeResult: null,
    };
  }

  /** Start execution; resolves when all tasks finish or goal is cancelled */
  async run(): Promise<GoalRunState> {
    this._setGoalStatus("running");
    await this._persistState();

    const sigtermHandler = () => {
      void this._persistState().then(() => this.cancel());
    };
    process.once("SIGTERM", sigtermHandler);

    try {
      await this._runLoop();
    } finally {
      process.off("SIGTERM", sigtermHandler);
    }

    return this.state;
  }

  /** Cancel all running tasks */
  async cancel(): Promise<void> {
    this._cancelled = true;

    const cancelPromises: Promise<void>[] = [];
    for (const [taskId, node] of this._nodes) {
      const status = node.state.status;
      if (status === "running") {
        if (node.session) {
          cancelPromises.push(node.session.cancel().catch(() => {}));
        }
        this._updateTaskStatus(taskId, "cancelled");
      } else if (status === "queued") {
        this._updateTaskStatus(taskId, "cancelled");
      }
    }

    await Promise.allSettled(cancelPromises);

    // Escalate to SIGKILL for any still-running child processes after 5 seconds
    setTimeout(() => {
      for (const node of this._nodes.values()) {
        if (node.session && node.state.status === "cancelled") {
          try {
            const pid = (node.session as { pid?: number }).pid;
            if (pid != null) process.kill(pid, "SIGKILL");
          } catch {
            // process already gone
          }
        }
      }
    }, 5_000).unref();

    this._setGoalStatus("cancelled");
    await this._persistState();
    this.emit("goal:cancelled", this.state);
  }

  /** Serialize current state */
  async persistState(): Promise<void> {
    await this._persistState();
  }

  /** Resume from persisted state */
  static async resume(
    goalId: string,
    spec: GoalSpec,
    adapters: Map<string, AgentAdapter>,
    opts: GoalRunOptions = {},
  ): Promise<GoalRun> {
    const storage = opts.storage ?? new InMemoryGoalRunStorage();
    const stored = await loadGoalRunState(storage, goalId);

    const run = new GoalRun(spec, adapters, { ...opts, storage });

    if (stored) {
      for (const [taskId, taskState] of Object.entries(stored.tasks)) {
        const restoredStatus: TaskStatus =
          taskState.status === "running" ? "queued" : taskState.status;

        const node = run._nodes.get(taskId);
        if (node) {
          node.state = { ...taskState, status: restoredStatus };
          run.state.tasks[taskId] = node.state;
        }
      }
      run.state.startedAt = stored.startedAt;
    }

    return run;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private _runningTaskPromises = new Map<string, Promise<void>>();

  private async _runLoop(): Promise<void> {
    while (!this.scheduler.isFinished() && !this._cancelled) {
      const dispatchable = this.scheduler.getDispatchable();

      if (dispatchable.length === 0) {
        if (this._runningTaskPromises.size === 0) {
          // Nothing running and nothing dispatchable — deadlock guard
          break;
        }
        await this._waitForAnyRunningTask();
        continue;
      }

      // Kick off all dispatchable tasks concurrently (they register themselves
      // in _runningTaskPromises before any await, so the map is populated)
      const dispatched = dispatchable.map((node) => this._dispatchTask(node));

      // Wait for at least one to settle so we can loop and dispatch newly-ready tasks
      await Promise.race(dispatched.map((p) => p.catch(() => {})));
    }

    if (this._cancelled) return;

    // Determine final goal status
    const allTasks = Object.values(this.state.tasks);
    const hasFailed = allTasks.some(
      (t) => t.status === "failed" || t.status === "timed_out",
    );
    const hasCompleted = allTasks.some((t) => t.status === "completed");

    let finalStatus: GoalRunStatus;
    if (hasFailed && hasCompleted) {
      finalStatus = "partial_failure";
    } else if (hasFailed) {
      finalStatus = "failed";
    } else {
      finalStatus = "completed";
    }

    this._setGoalStatus(finalStatus);
    this.state.completedAt = Date.now();
    await this._persistState();
    this.emit("goal:completed", this.state);
  }

  private async _waitForAnyRunningTask(): Promise<void> {
    const running = [...this._runningTaskPromises.values()];
    if (running.length === 0) return;
    await Promise.race(running.map((p) => p.catch(() => {})));
  }

  private async _dispatchTask(node: TaskNode): Promise<void> {
    let routing;
    try {
      routing = await routeTask(node.spec, this.adapters);
    } catch (err) {
      this._updateTaskStatus(node.spec.id, "failed", {
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      this.scheduler.markFailed(node.spec.id);
      this.emit("task:failed", node.state);
      await this._persistState();
      return;
    }

    this.scheduler.markRunning(node.spec.id);
    node.state.adapterId = routing.adapter.id;
    node.state.routingReason = routing.reason;
    node.state.startedAt = Date.now();
    node.state.attemptCount++;
    this._updateTaskStatus(node.spec.id, "running");

    this.emit("task:dispatched", {
      taskId: node.spec.id,
      adapterId: routing.adapter.id,
      routingReason: routing.reason,
    });

    const taskPromise = this._runTask(node, routing.adapter);
    this._runningTaskPromises.set(node.spec.id, taskPromise);

    try {
      await taskPromise;
    } finally {
      this._runningTaskPromises.delete(node.spec.id);
    }
  }

  private async _runTask(node: TaskNode, adapter: AgentAdapter): Promise<void> {
    let worktreePath = node.state.worktreePath ?? `/tmp/lunaria/${node.spec.id}`;
    if (!this.skipWorktree) {
      try {
        const wt = await createWorktree(
          this.repoRoot,
          this.goalId,
          node.spec.id,
          this.spec.baseRef,
        );
        worktreePath = wt.path;
      } catch (err) {
        this.emit("task:error", { taskId: node.spec.id, error: err instanceof Error ? err.message : String(err) });
      }
    }
    node.state.worktreePath = worktreePath;
    this._syncTaskState(node);

    const timeoutMs =
      node.spec.complexity != null
        ? COMPLEXITY_TIMEOUT[node.spec.complexity]
        : this.spec.timeoutMs;

    const session = adapter.spawn({
      id: node.spec.id,
      prompt: node.spec.description,
      worktreePath,
      timeoutMs,
    });

    node.session = session;

    session.on("output", (chunk: OutputChunk) => {
      this.emit("task:output", chunk);
    });

    try {
      const result = await session.result;

      if (this._cancelled) {
        node.session = null;
        return;
      }

      const succeeded = result.exitCode === 0 && session.status === "completed";

      if (succeeded) {
        this._updateTaskStatus(node.spec.id, "completed");
        this.scheduler.markCompleted(node.spec.id);
        this.emit("task:completed", node.state);
        await this._persistState();
        node.session = null;
        return;
      }

      const timedOut = session.status === "timed_out";
      const failStatus: TaskStatus = timedOut ? "timed_out" : "failed";
      this._updateTaskStatus(node.spec.id, failStatus, {
        errorMessage: `Exit code: ${result.exitCode ?? "null"}`,
      });

      node.session = null;
      await this._handleFailedTask(node, adapter);
    } catch {
      node.session = null;
      if (!this._cancelled) {
        this._updateTaskStatus(node.spec.id, "failed");
        await this._handleFailedTask(node, adapter);
      }
    }
  }

  private async _handleFailedTask(
    node: TaskNode,
    currentAdapter: AgentAdapter,
  ): Promise<void> {
    // Allow up to 3 total attempts: attempts 1 & 2 use same adapter, attempt 3 uses fallback
    if (node.state.attemptCount >= 3) {
      this.scheduler.markFailed(node.spec.id);
      this.emit("task:failed", node.state);
      await this._persistState();
      return;
    }

    const isFirstRetry = node.state.attemptCount === 1;
    const retryAdapter = isFirstRetry
      ? currentAdapter
      : await this._getFallbackAdapter(node, currentAdapter);

    if (!retryAdapter) {
      this.scheduler.markFailed(node.spec.id);
      this.emit("task:failed", node.state);
      await this._persistState();
      return;
    }

    this.emit("task:retrying", {
      taskId: node.spec.id,
      attempt: node.state.attemptCount + 1,
      fallback: !isFirstRetry,
    });

    this._updateTaskStatus(node.spec.id, "running");
    node.state.startedAt = Date.now();
    node.state.attemptCount++;
    node.state.errorMessage = null;
    this._syncTaskState(node);

    await this._runTask(node, retryAdapter);
  }

  private async _getFallbackAdapter(
    node: TaskNode,
    currentAdapter: AgentAdapter,
  ): Promise<AgentAdapter | null> {
    // Mark the current adapter unavailable so routeTask falls through to the
    // configured matrix fallback.
    const tempAdapters = new Map(this.adapters);
    tempAdapters.set(currentAdapter.id, {
      ...currentAdapter,
      isAvailable: async () => false as boolean,
    });
    try {
      const decision = await routeTask(node.spec, tempAdapters);
      if (decision.adapter.id !== currentAdapter.id) {
        return decision.adapter;
      }
    } catch {
      // No fallback available
    }
    return null;
  }

  private _syncTaskState(node: TaskNode): void {
    this.state.tasks[node.spec.id] = node.state;
  }

  private _updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    extra?: Partial<TaskRunState>,
  ): void {
    const node = this._nodes.get(taskId);
    if (node) {
      node.state = { ...node.state, status, ...extra };
      this.state.tasks[taskId] = node.state;
    }
  }

  private _setGoalStatus(status: GoalRunStatus): void {
    this.state = { ...this.state, status };
  }

  private async _persistState(): Promise<void> {
    await saveGoalRunState(this.storage, this.state);
  }
}
