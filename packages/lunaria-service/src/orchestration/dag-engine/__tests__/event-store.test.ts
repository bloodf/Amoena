import { describe, it, expect } from "vitest";
import { InMemoryEventStore } from "../event-store.js";
import type { OrchestrationEvent } from "../events.js";

function makeEvent(
  type: OrchestrationEvent["type"],
  goalRunId: string,
  timestamp: number,
  extra: Record<string, unknown> = {},
): OrchestrationEvent {
  return {
    id: `evt-${Math.random().toString(36).slice(2)}`,
    goalRunId,
    timestamp,
    type,
    ...extra,
  } as unknown as OrchestrationEvent;
}

describe("InMemoryEventStore", () => {
  it("append then loadAll returns all events in insertion order", () => {
    const store = new InMemoryEventStore();
    const e1 = makeEvent("goal.created", "g1", 1000, { description: "x", taskCount: 0 });
    const e2 = makeEvent("goal.created", "g2", 2000, { description: "y", taskCount: 1 });
    store.append([e1, e2]);
    const all = store.loadAll();
    expect(all).toHaveLength(2);
    expect(all[0]!.id).toBe(e1.id);
    expect(all[1]!.id).toBe(e2.id);
  });

  it("loadByGoalRun filters by goalRunId", () => {
    const store = new InMemoryEventStore();
    const e1 = makeEvent("goal.created", "g1", 1000, { description: "x", taskCount: 0 });
    const e2 = makeEvent("goal.created", "g2", 1001, { description: "y", taskCount: 0 });
    const e3 = makeEvent("goal.cancelled", "g1", 1002);
    store.append([e1, e2, e3]);
    const g1Events = store.loadByGoalRun("g1");
    expect(g1Events).toHaveLength(2);
    expect(g1Events.every((e) => e.goalRunId === "g1")).toBe(true);
  });

  it("loadSince returns events at or after the given timestamp", () => {
    const store = new InMemoryEventStore();
    const e1 = makeEvent("goal.created", "g1", 1000, { description: "x", taskCount: 0 });
    const e2 = makeEvent("goal.created", "g2", 2000, { description: "y", taskCount: 0 });
    const e3 = makeEvent("goal.created", "g3", 3000, { description: "z", taskCount: 0 });
    store.append([e1, e2, e3]);
    const result = store.loadSince(2000);
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.goalRunId)).toEqual(["g2", "g3"]);
  });

  it("append with empty array is a no-op", () => {
    const store = new InMemoryEventStore();
    store.append([]);
    expect(store.loadAll()).toHaveLength(0);
  });

  it("loadAll returns independent copy — mutations do not affect store", () => {
    const store = new InMemoryEventStore();
    const e1 = makeEvent("goal.created", "g1", 1000, { description: "x", taskCount: 0 });
    store.append([e1]);
    const copy = store.loadAll();
    copy.pop();
    expect(store.loadAll()).toHaveLength(1);
  });

  it("multiple appends accumulate events", () => {
    const store = new InMemoryEventStore();
    store.append([makeEvent("goal.created", "g1", 1, { description: "x", taskCount: 0 })]);
    store.append([makeEvent("goal.cancelled", "g1", 2)]);
    expect(store.loadAll()).toHaveLength(2);
  });
});
