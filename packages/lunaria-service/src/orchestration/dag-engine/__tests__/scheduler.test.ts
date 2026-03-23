import { describe, it, expect } from "vitest";
import { TaskNode } from "../task-node.js";
import { DagScheduler, CyclicDependencyError } from "../scheduler.js";
import type { TaskSpec } from "../types.js";

function makeNode(id: string, dependsOn: string[] = []): TaskNode {
  const spec: TaskSpec = {
    id,
    description: `Task ${id}`,
    dependsOn,
    taskType: "implementation",
    complexity: "low",
  };
  return new TaskNode(spec);
}

describe("DagScheduler", () => {
  it("linear chain: A→B→C dispatches in order", () => {
    const a = makeNode("A");
    const b = makeNode("B", ["A"]);
    const c = makeNode("C", ["B"]);
    const scheduler = new DagScheduler([a, b, c]);

    // Only A should be ready initially
    let dispatchable = scheduler.getDispatchable();
    expect(dispatchable.map((n) => n.spec.id)).toEqual(["A"]);

    scheduler.markRunning("A");
    scheduler.markCompleted("A");

    // B becomes ready
    dispatchable = scheduler.getDispatchable();
    expect(dispatchable.map((n) => n.spec.id)).toEqual(["B"]);

    scheduler.markRunning("B");
    scheduler.markCompleted("B");

    // C becomes ready
    dispatchable = scheduler.getDispatchable();
    expect(dispatchable.map((n) => n.spec.id)).toEqual(["C"]);

    scheduler.markRunning("C");
    scheduler.markCompleted("C");

    expect(scheduler.isFinished()).toBe(true);
  });

  it("parallel branches: A→{B,C}→D — B and C dispatch together after A", () => {
    const a = makeNode("A");
    const b = makeNode("B", ["A"]);
    const c = makeNode("C", ["A"]);
    const d = makeNode("D", ["B", "C"]);
    const scheduler = new DagScheduler([a, b, c, d]);

    scheduler.markRunning("A");
    scheduler.markCompleted("A");

    const dispatchable = scheduler.getDispatchable();
    expect(dispatchable.map((n) => n.spec.id).sort()).toEqual(["B", "C"]);

    scheduler.markRunning("B");
    scheduler.markRunning("C");
    scheduler.markCompleted("B");
    scheduler.markCompleted("C");

    const dispatchable2 = scheduler.getDispatchable();
    expect(dispatchable2.map((n) => n.spec.id)).toEqual(["D"]);
  });

  it("concurrency cap: 10 tasks, cap 3 → never more than 3 running", () => {
    const nodes = Array.from({ length: 10 }, (_, i) => makeNode(`T${i}`));
    const scheduler = new DagScheduler(nodes, 3);

    let maxRunning = 0;
    let running = 0;

    while (!scheduler.isFinished()) {
      const dispatchable = scheduler.getDispatchable();
      for (const node of dispatchable) {
        scheduler.markRunning(node.spec.id);
        running++;
        maxRunning = Math.max(maxRunning, running);
      }

      // Complete one task
      const runningNodes = nodes.filter((n) => n.state.status === "running");
      if (runningNodes.length > 0) {
        scheduler.markCompleted(runningNodes[0]!.spec.id);
        running--;
      } else {
        break;
      }
    }

    expect(maxRunning).toBeLessThanOrEqual(3);
  });

  it("cycle detection: A→B→A throws CyclicDependencyError", () => {
    const a = makeNode("A", ["B"]);
    const b = makeNode("B", ["A"]);
    expect(() => new DagScheduler([a, b])).toThrow(CyclicDependencyError);
  });

  it("self-loop throws CyclicDependencyError", () => {
    const a = makeNode("A", ["A"]);
    expect(() => new DagScheduler([a])).toThrow(CyclicDependencyError);
  });

  it("failed task → dependents become skipped", () => {
    const a = makeNode("A");
    const b = makeNode("B", ["A"]);
    const c = makeNode("C", ["B"]);
    const scheduler = new DagScheduler([a, b, c]);

    scheduler.markRunning("A");
    scheduler.markFailed("A");

    expect(b.state.status).toBe("skipped");
    expect(c.state.status).toBe("skipped");
  });

  it("topologicalOrder returns valid ordering", () => {
    const a = makeNode("A");
    const b = makeNode("B", ["A"]);
    const c = makeNode("C", ["A"]);
    const d = makeNode("D", ["B", "C"]);
    const scheduler = new DagScheduler([a, b, c, d]);

    const order = scheduler.topologicalOrder();
    expect(order.indexOf("A")).toBeLessThan(order.indexOf("B"));
    expect(order.indexOf("A")).toBeLessThan(order.indexOf("C"));
    expect(order.indexOf("B")).toBeLessThan(order.indexOf("D"));
    expect(order.indexOf("C")).toBeLessThan(order.indexOf("D"));
  });

  it("isFinished returns false while tasks are running", () => {
    const a = makeNode("A");
    const scheduler = new DagScheduler([a]);
    expect(scheduler.isFinished()).toBe(false);
    scheduler.markRunning("A");
    expect(scheduler.isFinished()).toBe(false);
    scheduler.markCompleted("A");
    expect(scheduler.isFinished()).toBe(true);
  });
});
