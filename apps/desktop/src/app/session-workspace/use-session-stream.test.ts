import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSessionStream } from "./use-session-stream";
import type { SessionSummary } from "../runtime-context";

const mockSession: SessionSummary = {
  id: "session-1",
  sessionMode: "native",
  tuiType: "native",
  workingDir: "/tmp/project",
  status: "created",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  metadata: {},
};

const mockRuntimeSession = {
  apiBaseUrl: "http://127.0.0.1:42100",
  authToken: "test-auth-token",
  instanceId: "test-instance",
  sseBaseUrl: "http://127.0.0.1:42100/api/v1/events",
  tokenType: "Bearer" as const,
};

const mockLaunchContext = {
  apiBaseUrl: "http://127.0.0.1:42100",
  bootstrapPath: "/api/v1/bootstrap/auth",
  bootstrapToken: "bootstrap-token",
  expiresAtUnixMs: Date.now() + 60000,
  instanceId: "test-instance",
};

class EventSourceStub {
  static instances: EventSourceStub[] = [];
  readonly url: string;
  readonly listeners = new Map<string, Array<(event: MessageEvent<string>) => void>>();
  closeCalled = false;

  constructor(url: string) {
    this.url = url;
    EventSourceStub.instances.push(this);
  }

  addEventListener(type: string, callback: EventListenerOrEventListenerObject) {
    const bucket = this.listeners.get(type) ?? [];
    bucket.push(callback as (event: MessageEvent<string>) => void);
    this.listeners.set(type, bucket);
  }

  removeEventListener(type: string, callback: EventListenerOrEventListenerObject) {
    const bucket = this.listeners.get(type) ?? [];
    const idx = bucket.indexOf(callback as (event: MessageEvent<string>) => void);
    if (idx !== -1) bucket.splice(idx, 1);
    this.listeners.set(type, bucket);
  }

  close() {
    this.closeCalled = true;
  }

  emit(type: string, payload: unknown) {
    const event = { data: JSON.stringify(payload) } as MessageEvent<string>;
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
  }

  static reset() {
    EventSourceStub.instances = [];
  }

  static latest() {
    return EventSourceStub.instances.at(-1);
  }
}

function buildProps(overrides = {}) {
  return {
    activeSession: mockSession,
    runtimeSession: mockRuntimeSession,
    launchContext: mockLaunchContext,
    request: vi.fn(),
    setTranscriptEvents: vi.fn(),
    setMessages: vi.fn(),
    setStreamingMessage: vi.fn(),
    setAgents: vi.fn(),
    setMemory: vi.fn(),
    setAutopilotPhase: vi.fn(),
    ...overrides,
  };
}

describe("useSessionStream", () => {
  beforeEach(() => {
    EventSourceStub.reset();
    vi.stubGlobal("EventSource", EventSourceStub as unknown as typeof EventSource);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("creates EventSource with correct URL containing session id and auth token", () => {
    renderHook(() => useSessionStream(buildProps()));

    expect(EventSourceStub.instances).toHaveLength(1);
    const url = EventSourceStub.latest()!.url;
    expect(url).toContain("/api/v1/sessions/session-1/stream");
    expect(url).toContain("authToken=test-auth-token");
  });

  it("uses launchContext.apiBaseUrl as base", () => {
    renderHook(() => useSessionStream(buildProps()));

    const url = EventSourceStub.latest()!.url;
    expect(url).toContain("http://127.0.0.1:42100");
  });

  it("does not create EventSource when activeSession is null", () => {
    renderHook(() => useSessionStream(buildProps({ activeSession: null })));
    expect(EventSourceStub.instances).toHaveLength(0);
  });

  it("does not create EventSource when runtimeSession is null", () => {
    renderHook(() => useSessionStream(buildProps({ runtimeSession: null })));
    expect(EventSourceStub.instances).toHaveLength(0);
  });

  it("does not create EventSource when launchContext is null", () => {
    renderHook(() => useSessionStream(buildProps({ launchContext: null })));
    expect(EventSourceStub.instances).toHaveLength(0);
  });

  it("closes EventSource on unmount", () => {
    const { unmount } = renderHook(() => useSessionStream(buildProps()));
    const stub = EventSourceStub.latest()!;
    unmount();
    expect(stub.closeCalled).toBe(true);
  });

  it("appends transcript event on any event", () => {
    const setTranscriptEvents = vi.fn();
    renderHook(() => useSessionStream(buildProps({ setTranscriptEvents })));

    const es = EventSourceStub.latest()!;
    act(() => {
      es.emit("message.created", {
        id: "evt-1",
        eventType: "message.created",
        occurredAt: "2026-01-01T00:00:00Z",
        payload: { id: "msg-1", role: "assistant", content: "Hello", attachments: [], createdAt: "" },
      });
    });

    expect(setTranscriptEvents).toHaveBeenCalled();
    const updaterFn = setTranscriptEvents.mock.calls[0]![0];
    expect(typeof updaterFn).toBe("function");
    const result = updaterFn([]);
    expect(result).toHaveLength(1);
  });

  it("appends new message on message.created event", () => {
    const setMessages = vi.fn();
    renderHook(() => useSessionStream(buildProps({ setMessages })));

    const es = EventSourceStub.latest()!;
    act(() => {
      es.emit("message.created", {
        id: "evt-1",
        eventType: "message.created",
        occurredAt: "2026-01-01T00:00:00Z",
        payload: {
          id: "msg-new",
          role: "assistant",
          content: "Stream response",
          attachments: [],
          createdAt: "2026-01-01T00:00:01Z",
        },
      });
    });

    const updaterFn = setMessages.mock.calls.at(-1)![0];
    const result = updaterFn([]);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("Stream response");
  });

  it("does not duplicate message if same id already present", () => {
    const setMessages = vi.fn();
    renderHook(() => useSessionStream(buildProps({ setMessages })));

    const existing = [
      { id: "msg-new", role: "assistant", content: "Stream response", attachments: [], createdAt: "" },
    ];

    const es = EventSourceStub.latest()!;
    act(() => {
      es.emit("message.created", {
        id: "evt-1",
        eventType: "message.created",
        occurredAt: "2026-01-01T00:00:00Z",
        payload: {
          id: "msg-new",
          role: "assistant",
          content: "Stream response",
          attachments: [],
          createdAt: "",
        },
      });
    });

    const updaterFn = setMessages.mock.calls.at(-1)![0];
    const result = updaterFn(existing);
    expect(result).toHaveLength(1);
  });

  it("appends delta text on message.delta event", () => {
    const setStreamingMessage = vi.fn();
    renderHook(() => useSessionStream(buildProps({ setStreamingMessage })));

    const es = EventSourceStub.latest()!;
    act(() => {
      es.emit("message.delta", {
        id: "evt-2",
        eventType: "message.delta",
        occurredAt: "2026-01-01T00:00:00Z",
        payload: { text: " World" },
      });
    });

    const updaterFn = setStreamingMessage.mock.calls.at(-1)![0];
    expect(updaterFn("Hello")).toBe("Hello World");
  });

  it("clears streaming message on message.complete", () => {
    const setStreamingMessage = vi.fn();
    renderHook(() => useSessionStream(buildProps({ setStreamingMessage })));

    const es = EventSourceStub.latest()!;
    act(() => {
      es.emit("message.complete", {
        id: "evt-3",
        eventType: "message.complete",
        occurredAt: "2026-01-01T00:00:00Z",
        payload: { messageId: "msg-complete", content: "Final content" },
      });
    });

    const lastCall = setStreamingMessage.mock.calls.at(-1)![0];
    expect(lastCall).toBe("");
  });

  it("refetches agents on agent.status event", async () => {
    const request = vi.fn().mockResolvedValue([]);
    const setAgents = vi.fn();
    renderHook(() => useSessionStream(buildProps({ request, setAgents })));

    const es = EventSourceStub.latest()!;
    act(() => {
      es.emit("agent.status", {
        id: "evt-4",
        eventType: "agent.status",
        occurredAt: "2026-01-01T00:00:00Z",
        payload: {},
      });
    });

    await act(async () => {});
    expect(request).toHaveBeenCalledWith("/api/v1/sessions/session-1/agents/list");
  });

  it("refetches agents on agent.spawned event", async () => {
    const request = vi.fn().mockResolvedValue([]);
    renderHook(() => useSessionStream(buildProps({ request })));

    const es = EventSourceStub.latest()!;
    act(() => {
      es.emit("agent.spawned", {
        id: "evt-5",
        eventType: "agent.spawned",
        occurredAt: "2026-01-01T00:00:00Z",
        payload: {},
      });
    });

    await act(async () => {});
    expect(request).toHaveBeenCalledWith("/api/v1/sessions/session-1/agents/list");
  });

  it("updates autopilot phase on autopilot.phase event", () => {
    const setAutopilotPhase = vi.fn();
    renderHook(() => useSessionStream(buildProps({ setAutopilotPhase })));

    const es = EventSourceStub.latest()!;
    act(() => {
      es.emit("autopilot.phase", {
        id: "evt-6",
        eventType: "autopilot.phase",
        occurredAt: "2026-01-01T00:00:00Z",
        payload: { currentPhase: "verification" },
      });
    });

    expect(setAutopilotPhase).toHaveBeenCalledWith("verification");
  });

  it("does not update autopilot phase when currentPhase is not a string", () => {
    const setAutopilotPhase = vi.fn();
    renderHook(() => useSessionStream(buildProps({ setAutopilotPhase })));

    const es = EventSourceStub.latest()!;
    act(() => {
      es.emit("autopilot.phase", {
        id: "evt-7",
        eventType: "autopilot.phase",
        occurredAt: "2026-01-01T00:00:00Z",
        payload: { currentPhase: null },
      });
    });

    expect(setAutopilotPhase).not.toHaveBeenCalled();
  });

  it("increments agent mailbox count on agent.mailbox event", () => {
    const setAgents = vi.fn();
    renderHook(() => useSessionStream(buildProps({ setAgents })));

    const existing = [
      {
        name: "Navigator",
        type: "Main" as const,
        source: "built-in" as const,
        provider: "runtime" as const,
        model: "claude",
        status: "idle" as const,
        lastActive: "just now",
        role: "Primary agent",
        tools: [],
        permission: "default",
        mailbox: { count: 0 },
        children: [
          {
            name: "agent-sub",
            type: "Sub" as const,
            source: "built-in" as const,
            provider: "runtime" as const,
            model: "gpt-5",
            status: "idle" as const,
            lastActive: "just now",
            role: "Sub-agent",
            tools: [],
            permission: "default",
            mailbox: { count: 0 },
          },
        ],
      },
    ];

    const es = EventSourceStub.latest()!;
    act(() => {
      es.emit("agent.mailbox", {
        id: "evt-8",
        eventType: "agent.mailbox",
        occurredAt: "2026-01-01T00:00:00Z",
        payload: { fromAgentId: "agent-sub", message: "Task done" },
      });
    });

    const updaterFn = setAgents.mock.calls.at(-1)![0];
    const result = updaterFn(existing);
    expect(result[0].children![0].mailbox.count).toBe(1);
    expect(result[0].children![0].mailbox.lastMessage).toBe("Task done");
  });

  it("updates memory budget on message.complete when memoryBudgetUsed is present", () => {
    const setMemory = vi.fn();
    renderHook(() => useSessionStream(buildProps({ setMemory })));

    const existingMemory = {
      summary: null,
      tokenBudget: { total: 100000, l0: 50, l1: 150, l2: 500 },
      entries: [],
    };

    const es = EventSourceStub.latest()!;
    act(() => {
      es.emit("message.complete", {
        id: "evt-9",
        eventType: "message.complete",
        occurredAt: "2026-01-01T00:00:00Z",
        payload: { messageId: "msg-x", content: "Done", memoryBudgetUsed: 200 },
      });
    });

    const updaterFn = setMemory.mock.calls.find(([fn]) => typeof fn === "function")?.[0];
    if (updaterFn) {
      const result = updaterFn(existingMemory);
      expect(result.tokenBudget.l0).toBe(200);
    }
  });

  it("registers listeners for all expected event types", () => {
    renderHook(() => useSessionStream(buildProps()));

    const es = EventSourceStub.latest()!;
    const expectedTypes = [
      "message.created",
      "message.delta",
      "message.complete",
      "agent.status",
      "agent.spawned",
      "agent.mailbox",
      "tool.start",
      "tool.result",
      "permission.requested",
      "permission.resolved",
      "usage",
      "autopilot.phase",
    ];

    for (const type of expectedTypes) {
      expect(es.listeners.has(type)).toBe(true);
    }
  });

  it("removes all event listeners on cleanup", () => {
    const { unmount } = renderHook(() => useSessionStream(buildProps()));

    const es = EventSourceStub.latest()!;
    unmount();

    for (const [, listeners] of es.listeners) {
      expect(listeners).toHaveLength(0);
    }
  });
});
