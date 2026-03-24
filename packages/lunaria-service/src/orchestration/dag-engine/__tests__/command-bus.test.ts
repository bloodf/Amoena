import { describe, it, expect, vi } from "vitest";
import { CommandBus, InvariantError } from "../command-bus.js";
import { InMemoryEventStore } from "../event-store.js";
import { OrchestrationPubSub } from "../pubsub.js";

function makeBus(): { bus: CommandBus; store: InMemoryEventStore; pubSub: OrchestrationPubSub } {
  const store = new InMemoryEventStore();
  const pubSub = new OrchestrationPubSub();
  const bus = new CommandBus(store, pubSub);
  return { bus, store, pubSub };
}

describe("CommandBus", () => {
  it("dispatching goal.submit persists goal.created event and updates read model", async () => {
    const { bus, store } = makeBus();
    const events = await bus.dispatch({
      type: "goal.submit",
      goalId: "g1",
      description: "Test goal",
      tasks: [],
    });
    expect(events).toHaveLength(1);
    expect(events[0]!.type).toBe("goal.created");
    // Event is persisted
    expect(store.loadByGoalRun("g1")).toHaveLength(1);
    // Read model is updated
    expect(bus.getReadModel().goalRuns.has("g1")).toBe(true);
  });

  it("rejects InvariantError for duplicate goal.submit", async () => {
    const { bus } = makeBus();
    await bus.dispatch({ type: "goal.submit", goalId: "g1", description: "x", tasks: [] });
    await expect(
      bus.dispatch({ type: "goal.submit", goalId: "g1", description: "duplicate", tasks: [] }),
    ).rejects.toBeInstanceOf(InvariantError);
  });

  it("serializes concurrent commands — second command sees first's state", async () => {
    const { bus } = makeBus();
    // Fire both concurrently
    const [r1, r2] = await Promise.all([
      bus.dispatch({ type: "goal.submit", goalId: "g1", description: "first", tasks: [] }),
      bus.dispatch({ type: "goal.submit", goalId: "g2", description: "second", tasks: [] }),
    ]);
    expect(r1[0]!.type).toBe("goal.created");
    expect(r2[0]!.type).toBe("goal.created");
    expect(bus.getReadModel().goalRuns.size).toBe(2);
  });

  it("publishes events to PubSub subscribers", async () => {
    const { bus, pubSub } = makeBus();
    const received: string[] = [];
    pubSub.subscribe((evt) => received.push(evt.type));
    await bus.dispatch({ type: "goal.submit", goalId: "g1", description: "x", tasks: [] });
    expect(received).toContain("goal.created");
  });

  it("hydrate restores read model from persisted events", async () => {
    const store = new InMemoryEventStore();
    const pubSub = new OrchestrationPubSub();
    // Write an event directly to the store
    store.append([
      {
        id: "e1",
        goalRunId: "g-persisted",
        timestamp: 1000,
        type: "goal.created",
        description: "Persisted goal",
        taskCount: 0,
      },
    ]);
    // New bus — starts empty
    const bus2 = new CommandBus(store, pubSub);
    expect(bus2.getReadModel().goalRuns.has("g-persisted")).toBe(false);
    // After hydrate, it should see the persisted goal
    bus2.hydrate();
    expect(bus2.getReadModel().goalRuns.has("g-persisted")).toBe(true);
  });

  it("failed command does not persist events", async () => {
    const { bus, store } = makeBus();
    // Try to cancel a non-existent goal
    await expect(
      bus.dispatch({ type: "goal.cancel", goalId: "ghost" }),
    ).rejects.toBeInstanceOf(InvariantError);
    expect(store.loadAll()).toHaveLength(0);
  });

  it("PubSub subscribeToGoal only receives events for that goal", async () => {
    const { bus, pubSub } = makeBus();
    const g1Events: string[] = [];
    pubSub.subscribeToGoal("g1", (evt) => g1Events.push(evt.type));

    await bus.dispatch({ type: "goal.submit", goalId: "g1", description: "x", tasks: [] });
    await bus.dispatch({ type: "goal.submit", goalId: "g2", description: "y", tasks: [] });

    expect(g1Events).toHaveLength(1);
    expect(g1Events[0]).toBe("goal.created");
  });
});
