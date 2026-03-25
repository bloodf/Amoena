import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { installMockEventSource, MockEventSource, uninstallMockEventSource } from "@/test/mock-event-source";
import { createReconnectingEventSource } from "./event-source";

const mockRemove = vi.fn();

vi.mock("react-native", () => ({
  AppState: {
    addEventListener: vi.fn(() => ({ remove: mockRemove })),
  },
}));

describe("createReconnectingEventSource", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installMockEventSource();
    vi.clearAllMocks();
  });

  afterEach(() => {
    uninstallMockEventSource();
    vi.useRealTimers();
  });

  it("creates an EventSource with the provided URL", () => {
    createReconnectingEventSource("http://localhost/events");
    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toBe("http://localhost/events");
  });

  it("invokes onOpen callback when connection opens", async () => {
    const onOpen = vi.fn();
    createReconnectingEventSource("http://localhost/events", { onOpen });
    await vi.advanceTimersByTimeAsync(0);
    expect(onOpen).toHaveBeenCalled();
  });

  it("parses JSON data from events and calls onEvent", () => {
    const onEvent = vi.fn();
    createReconnectingEventSource("http://localhost/events", {
      eventNames: ["data"],
      onEvent,
    });
    MockEventSource.latest()!.emit("data", { count: 42 });
    expect(onEvent).toHaveBeenCalledWith("data", { count: 42 });
  });

  it("calls onError when EventSource errors", () => {
    const onError = vi.fn();
    createReconnectingEventSource("http://localhost/events", { onError });
    const es = MockEventSource.latest()!;
    const errorEvent = new Event("error");
    es.onerror?.(errorEvent);
    expect(onError).toHaveBeenCalledWith(errorEvent);
  });

  it("closes the EventSource when close is called", () => {
    const source = createReconnectingEventSource("http://localhost/events");
    const es = MockEventSource.latest()!;
    source.close();
    expect(es.readyState).toBe(2);
  });

  it("does not reconnect after close is called", () => {
    const source = createReconnectingEventSource("http://localhost/events");
    source.close();
    const countBefore = MockEventSource.instances.length;
    vi.advanceTimersByTime(60_000);
    expect(MockEventSource.instances).toHaveLength(countBefore);
  });

  it("schedules reconnect on error when not disposed", () => {
    createReconnectingEventSource("http://localhost/events");
    const es = MockEventSource.latest()!;
    es.onerror?.(new Event("error"));
    const countBefore = MockEventSource.instances.length;
    vi.advanceTimersByTime(5000);
    expect(MockEventSource.instances.length).toBeGreaterThanOrEqual(countBefore);
  });

  it("removes app state subscription on close", () => {
    const source = createReconnectingEventSource("http://localhost/events");
    source.close();
    expect(mockRemove).toHaveBeenCalled();
  });

  it("handles multiple event names", () => {
    const onEvent = vi.fn();
    createReconnectingEventSource("http://localhost/events", {
      eventNames: ["session:update", "agent:status"],
      onEvent,
    });
    const es = MockEventSource.latest()!;
    es.emit("session:update", { id: "s1" });
    es.emit("agent:status", { status: "running" });
    expect(onEvent).toHaveBeenCalledTimes(2);
    expect(onEvent).toHaveBeenCalledWith("session:update", { id: "s1" });
    expect(onEvent).toHaveBeenCalledWith("agent:status", { status: "running" });
  });
});
