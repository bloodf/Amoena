import { TaskNode } from "./task-node.js";

export class CyclicDependencyError extends Error {
  constructor(cycle: string[]) {
    super(`Cyclic dependency detected: ${cycle.join(" → ")}`);
    this.name = "CyclicDependencyError";
  }
}

export class DagScheduler {
  private readonly nodes: Map<string, TaskNode>;
  private readonly maxConcurrency: number;
  private readonly completed = new Set<string>();
  private readonly failed = new Set<string>();
  private running = 0;

  constructor(nodes: TaskNode[], maxConcurrency = 3) {
    this.nodes = new Map(nodes.map((n) => [n.spec.id, n]));
    this.maxConcurrency = maxConcurrency;
    this._validateNoCycles();
  }

  /** Returns tasks that are ready to dispatch within concurrency limit */
  getDispatchable(): TaskNode[] {
    if (this.running >= this.maxConcurrency) return [];

    const result: TaskNode[] = [];
    for (const node of this.nodes.values()) {
      if (this.running + result.length >= this.maxConcurrency) break;
      if (
        node.state.status === "queued" &&
        node.isReady(this.completed)
      ) {
        result.push(node);
      }
    }
    return result;
  }

  /** Mark a task as running (increments concurrency counter) */
  markRunning(taskId: string): void {
    const node = this.nodes.get(taskId);
    if (node) {
      node.state = { ...node.state, status: "running" };
      this.running++;
    }
  }

  /** Mark a task completed; may unblock dependents */
  markCompleted(taskId: string): void {
    const node = this.nodes.get(taskId);
    if (node) {
      node.state = { ...node.state, status: "completed", completedAt: Date.now() };
      this.completed.add(taskId);
      this.running = Math.max(0, this.running - 1);
    }
  }

  /** Mark a task failed; dependents become skipped */
  markFailed(taskId: string): void {
    this.failed.add(taskId);
    this.running = Math.max(0, this.running - 1);
    this._skipDependents(taskId);
  }

  /** Mark a task as timed out (counts as failed for scheduling purposes) */
  markTimedOut(taskId: string): void {
    this.failed.add(taskId);
    this.running = Math.max(0, this.running - 1);
    this._skipDependents(taskId);
  }

  /** True when all tasks are in a terminal state */
  isFinished(): boolean {
    for (const node of this.nodes.values()) {
      const s = node.state.status;
      if (s === "queued" || s === "running") return false;
    }
    return true;
  }

  /** Compute topological order using Kahn's algorithm */
  topologicalOrder(): string[] {
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    for (const node of this.nodes.values()) {
      inDegree.set(node.spec.id, 0);
      adjList.set(node.spec.id, []);
    }

    for (const node of this.nodes.values()) {
      for (const dep of node.spec.dependsOn) {
        adjList.get(dep)!.push(node.spec.id);
        inDegree.set(node.spec.id, (inDegree.get(node.spec.id) ?? 0) + 1);
      }
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id);
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const id = queue.shift()!;
      order.push(id);
      for (const neighbor of adjList.get(id) ?? []) {
        const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
        inDegree.set(neighbor, newDeg);
        if (newDeg === 0) queue.push(neighbor);
      }
    }

    return order;
  }

  /** Kahn's algorithm cycle detection — throws if a cycle is found */
  private _validateNoCycles(): void {
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    for (const node of this.nodes.values()) {
      inDegree.set(node.spec.id, 0);
      adjList.set(node.spec.id, []);
    }

    for (const node of this.nodes.values()) {
      for (const dep of node.spec.dependsOn) {
        if (!this.nodes.has(dep)) {
          throw new Error(
            `Task "${node.spec.id}" depends on unknown task "${dep}"`,
          );
        }
        adjList.get(dep)!.push(node.spec.id);
        inDegree.set(node.spec.id, (inDegree.get(node.spec.id) ?? 0) + 1);
      }
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id);
    }

    let visited = 0;
    while (queue.length > 0) {
      const id = queue.shift()!;
      visited++;
      for (const neighbor of adjList.get(id) ?? []) {
        const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
        inDegree.set(neighbor, newDeg);
        if (newDeg === 0) queue.push(neighbor);
      }
    }

    if (visited < this.nodes.size) {
      // Find a node in the cycle for reporting
      const cycleNodes = [...inDegree.entries()]
        .filter(([, deg]) => deg > 0)
        .map(([id]) => id);
      throw new CyclicDependencyError(cycleNodes);
    }
  }

  private _skipDependents(failedId: string): void {
    for (const node of this.nodes.values()) {
      if (
        node.state.status === "queued" &&
        this._hasFailedAncestor(node.spec.id, new Set<string>())
      ) {
        node.state = { ...node.state, status: "skipped" };
      }
    }
  }

  private _hasFailedAncestor(taskId: string, visited: Set<string> = new Set()): boolean {
    if (visited.has(taskId)) return false;
    visited.add(taskId);
    const node = this.nodes.get(taskId);
    if (!node) return false;
    for (const dep of node.spec.dependsOn) {
      if (this.failed.has(dep)) return true;
      if (this._hasFailedAncestor(dep, visited)) return true;
    }
    return false;
  }
}
