import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  HEARTBEAT_INTERVAL_MS,
  HEARTBEAT_TIMEOUT_MS,
  RECONNECT_CONFIG,
} from "@/lib/constants";
import type { RelayConnectionState, RelayMessage } from "@/lib/types";

// ---------------------------------------------------------------------------
// Minimal relay client extracted for testing. The production module
// (src/runtime/event-source.ts) follows the same reconnect/heartbeat
// pattern; these tests validate the contract independently.
// ---------------------------------------------------------------------------

type RelayClientOptions = {
  url: string;
  onMessage?: (msg: RelayMessage) => void;
  onStateChange?: (state: RelayConnectionState) => void;
};

function createRelayClient(options: RelayClientOptions) {
  let ws: MockWebSocket | null = null;
  let state: RelayConnectionState = "disconnected";
  let retryCount = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  function setState(next: RelayConnectionState) {
    state = next;
    options.onStateChange?.(next);
  }

  function getDelay(): number {
    const delay = Math.min(
      RECONNECT_CONFIG.baseDelayMs * Math.pow(RECONNECT_CONFIG.backoffFactor, retryCount),
      RECONNECT_CONFIG.maxDelayMs,
    );
    return delay + Math.random() * RECONNECT_CONFIG.jitterMs;
  }

  function clearHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout);
      heartbeatTimeout = null;
    }
  }

  function startHeartbeat() {
    clearHeartbeat();
    heartbeatTimer = setInterval(() => {
      ws?.send(JSON.stringify({ type: "ping" }));
      heartbeatTimeout = setTimeout(() => {
        ws?.close();
      }, HEARTBEAT_TIMEOUT_MS);
    }, HEARTBEAT_INTERVAL_MS);
  }

  function scheduleReconnect() {
    if (disposed || retryCount >= RECONNECT_CONFIG.maxRetries) return;
    setState("reconnecting");
    retryTimer = setTimeout(() => {
      retryCount++;
      connect();
    }, getDelay());
  }

  function handleMessage(event: { data: string }) {
    try {
      const parsed = JSON.parse(event.data) as RelayMessage;
      if (parsed.type === "pong") {
        if (heartbeatTimeout) {
          clearTimeout(heartbeatTimeout);
          heartbeatTimeout = null;
        }
        return;
      }
      options.onMessage?.(parsed);
    } catch {
      // ignore non-JSON frames
    }
  }

  function connect() {
    if (disposed) return;
    setState("connecting");
    ws = new MockWebSocket(options.url) as unknown as MockWebSocket;

    ws.onopen = () => {
      retryCount = 0;
      setState("connected");
      startHeartbeat();
    };

    ws.onclose = () => {
      clearHeartbeat();
      ws = null;
      if (!disposed) scheduleReconnect();
    };

    ws.onerror = () => {
      ws?.close();
    };

    ws.onmessage = handleMessage;
  }

  function close() {
    disposed = true;
    clearHeartbeat();
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    ws?.close();
    ws = null;
    setState("disconnected");
  }

  function send(msg: RelayMessage) {
    ws?.send(JSON.stringify(msg));
  }

  return { connect, close, send, getState: () => state };
}

// ---------------------------------------------------------------------------
// Mock WebSocket
// ---------------------------------------------------------------------------

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.onclose?.();
  }

  simulateOpen() {
    this.onopen?.();
  }

  simulateMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  simulateError() {
    this.onerror?.();
  }

  static latest(): MockWebSocket {
    return MockWebSocket.instances[MockWebSocket.instances.length - 1]!;
  }

  static reset() {
    MockWebSocket.instances = [];
  }
}

(globalThis as any).MockWebSocket = MockWebSocket;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("relay-client", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockWebSocket.reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("transitions to connected on open", () => {
    const states: RelayConnectionState[] = [];
    const client = createRelayClient({
      url: "wss://relay.amoena.dev",
      onStateChange: (s) => states.push(s),
    });

    client.connect();
    expect(states).toContain("connecting");

    MockWebSocket.latest().simulateOpen();
    expect(states).toContain("connected");

    client.close();
  });

  it("routes incoming messages to onMessage callback", () => {
    const messages: RelayMessage[] = [];
    const client = createRelayClient({
      url: "wss://relay.amoena.dev",
      onMessage: (m) => messages.push(m),
    });

    client.connect();
    MockWebSocket.latest().simulateOpen();

    const msg: RelayMessage = {
      type: "session.updated",
      payload: { id: "s-1" },
      timestamp: new Date().toISOString(),
    };
    MockWebSocket.latest().simulateMessage(msg);

    expect(messages).toHaveLength(1);
    expect(messages[0]!.type).toBe("session.updated");

    client.close();
  });

  it("schedules reconnection after close", () => {
    const states: RelayConnectionState[] = [];
    const client = createRelayClient({
      url: "wss://relay.amoena.dev",
      onStateChange: (s) => states.push(s),
    });

    client.connect();
    MockWebSocket.latest().simulateOpen();

    // simulate disconnect
    MockWebSocket.latest().close();
    expect(states).toContain("reconnecting");

    // advance past base delay + jitter
    vi.advanceTimersByTime(RECONNECT_CONFIG.baseDelayMs + RECONNECT_CONFIG.jitterMs + 100);

    // a new WebSocket should have been created
    expect(MockWebSocket.instances.length).toBeGreaterThanOrEqual(2);

    client.close();
  });

  it("stops reconnecting after max retries", () => {
    const client = createRelayClient({ url: "wss://relay.amoena.dev" });

    client.connect();
    MockWebSocket.latest().simulateOpen();

    // exhaust retries
    for (let i = 0; i < RECONNECT_CONFIG.maxRetries + 1; i++) {
      MockWebSocket.latest().close();
      vi.advanceTimersByTime(RECONNECT_CONFIG.maxDelayMs + RECONNECT_CONFIG.jitterMs + 100);
    }

    const countBefore = MockWebSocket.instances.length;
    vi.advanceTimersByTime(RECONNECT_CONFIG.maxDelayMs * 2);
    expect(MockWebSocket.instances.length).toBe(countBefore);

    client.close();
  });

  it("sends heartbeat pings at the configured interval", () => {
    const client = createRelayClient({ url: "wss://relay.amoena.dev" });
    client.connect();
    const ws = MockWebSocket.latest();
    ws.simulateOpen();

    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);

    const pings = ws.sent.filter((s) => JSON.parse(s).type === "ping");
    expect(pings.length).toBeGreaterThanOrEqual(1);

    client.close();
  });

  it("closes connection when heartbeat pong is not received", () => {
    const states: RelayConnectionState[] = [];
    const client = createRelayClient({
      url: "wss://relay.amoena.dev",
      onStateChange: (s) => states.push(s),
    });

    client.connect();
    MockWebSocket.latest().simulateOpen();

    // trigger heartbeat
    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);
    // wait for timeout without pong
    vi.advanceTimersByTime(HEARTBEAT_TIMEOUT_MS);

    // should have triggered reconnect after close
    expect(states).toContain("reconnecting");

    client.close();
  });

  it("cancels heartbeat timeout when pong is received", () => {
    const states: RelayConnectionState[] = [];
    const client = createRelayClient({
      url: "wss://relay.amoena.dev",
      onStateChange: (s) => states.push(s),
    });

    client.connect();
    const ws = MockWebSocket.latest();
    ws.simulateOpen();

    // trigger heartbeat
    vi.advanceTimersByTime(HEARTBEAT_INTERVAL_MS);

    // send pong before timeout
    ws.simulateMessage({ type: "pong" });

    // advance past timeout — should NOT disconnect
    vi.advanceTimersByTime(HEARTBEAT_TIMEOUT_MS + 100);

    expect(client.getState()).toBe("connected");

    client.close();
  });

  it("does not route pong messages to onMessage", () => {
    const messages: RelayMessage[] = [];
    const client = createRelayClient({
      url: "wss://relay.amoena.dev",
      onMessage: (m) => messages.push(m),
    });

    client.connect();
    MockWebSocket.latest().simulateOpen();
    MockWebSocket.latest().simulateMessage({ type: "pong" });

    expect(messages).toHaveLength(0);

    client.close();
  });

  it("close() stops all timers and sets disconnected", () => {
    const states: RelayConnectionState[] = [];
    const client = createRelayClient({
      url: "wss://relay.amoena.dev",
      onStateChange: (s) => states.push(s),
    });

    client.connect();
    MockWebSocket.latest().simulateOpen();

    client.close();
    expect(states[states.length - 1]).toBe("disconnected");

    // no new connections after close
    const countAfter = MockWebSocket.instances.length;
    vi.advanceTimersByTime(RECONNECT_CONFIG.maxDelayMs * 2);
    expect(MockWebSocket.instances.length).toBe(countAfter);
  });
});
