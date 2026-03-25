import { describe, it, expect, vi } from "vitest";
import { OrchestrationPubSub } from "../pubsub.js";
import type { OrchestrationEvent } from "../events.js";

function makeEvent(overrides: Partial<OrchestrationEvent> & { type: string } = { type: "goal.created" }): OrchestrationEvent {
  return {
    id: "evt-1",
    goalRunId: "g1",
    timestamp: Date.now(),
    description: "test",
    taskCount: 1,
    ...overrides,
  } as OrchestrationEvent;
}

describe("OrchestrationPubSub", () => {
  describe("subscribe / publish", () => {
    it("delivers published events to subscribers", () => {
      const bus = new OrchestrationPubSub();
      const received: OrchestrationEvent[] = [];
      bus.subscribe((e) => received.push(e));

      const event = makeEvent();
      bus.publish([event]);

      expect(received).toHaveLength(1);
      expect(received[0]).toBe(event);
    });

    it("delivers multiple events in order", () => {
      const bus = new OrchestrationPubSub();
      const received: OrchestrationEvent[] = [];
      bus.subscribe((e) => received.push(e));

      const e1 = makeEvent({ id: "e1" });
      const e2 = makeEvent({ id: "e2" });
      bus.publish([e1, e2]);

      expect(received).toHaveLength(2);
      expect(received[0]!.id).toBe("e1");
      expect(received[1]!.id).toBe("e2");
    });

    it("delivers to multiple subscribers", () => {
      const bus = new OrchestrationPubSub();
      const r1: OrchestrationEvent[] = [];
      const r2: OrchestrationEvent[] = [];
      bus.subscribe((e) => r1.push(e));
      bus.subscribe((e) => r2.push(e));

      bus.publish([makeEvent()]);

      expect(r1).toHaveLength(1);
      expect(r2).toHaveLength(1);
    });
  });

  describe("unsubscribe", () => {
    it("stops receiving events after unsubscribe", () => {
      const bus = new OrchestrationPubSub();
      const received: OrchestrationEvent[] = [];
      const unsub = bus.subscribe((e) => received.push(e));

      bus.publish([makeEvent({ id: "before" })]);
      unsub();
      bus.publish([makeEvent({ id: "after" })]);

      expect(received).toHaveLength(1);
      expect(received[0]!.id).toBe("before");
    });
  });

  describe("subscribeToGoal", () => {
    it("only receives events for the specified goalRunId", () => {
      const bus = new OrchestrationPubSub();
      const received: OrchestrationEvent[] = [];
      bus.subscribeToGoal("g1", (e) => received.push(e));

      bus.publish([
        makeEvent({ id: "e1", goalRunId: "g1" }),
        makeEvent({ id: "e2", goalRunId: "g2" }),
        makeEvent({ id: "e3", goalRunId: "g1" }),
      ]);

      expect(received).toHaveLength(2);
      expect(received[0]!.id).toBe("e1");
      expect(received[1]!.id).toBe("e3");
    });

    it("unsubscribe stops goal-filtered subscription", () => {
      const bus = new OrchestrationPubSub();
      const received: OrchestrationEvent[] = [];
      const unsub = bus.subscribeToGoal("g1", (e) => received.push(e));

      bus.publish([makeEvent({ id: "e1", goalRunId: "g1" })]);
      unsub();
      bus.publish([makeEvent({ id: "e2", goalRunId: "g1" })]);

      expect(received).toHaveLength(1);
    });
  });

  describe("dispose", () => {
    it("removes all listeners", () => {
      const bus = new OrchestrationPubSub();
      const received: OrchestrationEvent[] = [];
      bus.subscribe((e) => received.push(e));
      bus.subscribeToGoal("g1", (e) => received.push(e));

      bus.dispose();
      bus.publish([makeEvent()]);

      expect(received).toHaveLength(0);
    });
  });

  describe("empty publish", () => {
    it("does not invoke handler when publishing empty array", () => {
      const bus = new OrchestrationPubSub();
      const handler = vi.fn();
      bus.subscribe(handler);

      bus.publish([]);
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
