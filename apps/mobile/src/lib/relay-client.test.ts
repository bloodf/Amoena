import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  AppState: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
    currentState: 'active',
  },
}));

class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static instances: MockWebSocket[] = [];

  url: string;
  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: ((event?: CloseEvent) => void) | null = null;
  send = vi.fn();
  close = vi.fn((code?: number) => {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code: code ?? 1000 } as CloseEvent);
  });

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  simulateMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  static reset() {
    MockWebSocket.instances = [];
  }

  static latest() {
    return MockWebSocket.instances[MockWebSocket.instances.length - 1] ?? null;
  }
}

import { createRelayClient } from './relay-client';

describe('createRelayClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockWebSocket.reset();
    (globalThis as any).WebSocket = MockWebSocket;
  });

  afterEach(() => {
    delete (globalThis as any).WebSocket;
    vi.useRealTimers();
  });

  it('connects and sets status to connected on open', () => {
    const onStatusChange = vi.fn();
    const client = createRelayClient({
      url: 'ws://localhost:8080',
      onStatusChange,
    });

    client.connect();
    const ws = MockWebSocket.latest()!;
    ws.simulateOpen();

    expect(onStatusChange).toHaveBeenCalledWith('connecting', undefined);
    expect(onStatusChange).toHaveBeenCalledWith('connected', undefined);
  });

  it('appends authToken as query parameter', () => {
    const client = createRelayClient({
      url: 'ws://localhost:8080',
      authToken: 'secret-token',
    });

    client.connect();
    const ws = MockWebSocket.latest()!;

    expect(ws.url).toContain('authToken=secret-token');
  });

  it('dispatches incoming messages to onMessage handler', () => {
    const onMessage = vi.fn();
    const client = createRelayClient({
      url: 'ws://localhost:8080',
      onMessage,
    });

    client.connect();
    const ws = MockWebSocket.latest()!;
    ws.simulateOpen();
    ws.simulateMessage({ type: 'session.updated', payload: { id: 's1' } });

    expect(onMessage).toHaveBeenCalledWith({
      type: 'session.updated',
      payload: { id: 's1' },
    });
  });

  it('ignores pong messages', () => {
    const onMessage = vi.fn();
    const client = createRelayClient({
      url: 'ws://localhost:8080',
      onMessage,
    });

    client.connect();
    const ws = MockWebSocket.latest()!;
    ws.simulateOpen();
    ws.simulateMessage({ type: 'pong' });

    expect(onMessage).not.toHaveBeenCalled();
  });

  it('sends messages when connected', () => {
    const client = createRelayClient({ url: 'ws://localhost:8080' });

    client.connect();
    const ws = MockWebSocket.latest()!;
    ws.simulateOpen();
    client.send({ type: 'subscribe', payload: { channel: 'sessions' } });

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'subscribe', payload: { channel: 'sessions' } }),
    );
  });

  it('disconnect closes socket and sets status to disconnected', () => {
    const onStatusChange = vi.fn();
    const client = createRelayClient({
      url: 'ws://localhost:8080',
      onStatusChange,
    });

    client.connect();
    const ws = MockWebSocket.latest()!;
    ws.simulateOpen();

    client.disconnect();

    expect(ws.close).toHaveBeenCalled();
    expect(onStatusChange).toHaveBeenCalledWith('disconnected', undefined);
  });

  it('getStatus returns current status', () => {
    const client = createRelayClient({ url: 'ws://localhost:8080' });

    expect(client.getStatus()).toBe('disconnected');
  });

  it('ignores malformed messages', () => {
    const onMessage = vi.fn();
    const client = createRelayClient({
      url: 'ws://localhost:8080',
      onMessage,
    });

    client.connect();
    const ws = MockWebSocket.latest()!;
    ws.simulateOpen();
    ws.onmessage?.({ data: 'not-json{' });

    expect(onMessage).not.toHaveBeenCalled();
  });

  it('sends heartbeat ping at 30s intervals when connected', () => {
    const client = createRelayClient({
      url: 'ws://localhost:8080',
    });

    client.connect();
    const ws = MockWebSocket.latest()!;
    ws.simulateOpen();

    vi.advanceTimersByTime(30_000);
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ type: 'ping' }));
  });

  it('does not send heartbeat when socket is not open', () => {
    const client = createRelayClient({
      url: 'ws://localhost:8080',
    });

    client.connect();
    const ws = MockWebSocket.latest()!;
    vi.advanceTimersByTime(60_000);
    expect(ws.send).not.toHaveBeenCalled();
  });

  it('heartbeat uses custom interval when provided', () => {
    const client = createRelayClient({
      url: 'ws://localhost:8080',
      heartbeatInterval: 5_000,
    });

    client.connect();
    const ws = MockWebSocket.latest()!;
    ws.simulateOpen();

    vi.advanceTimersByTime(3_000);
    expect(ws.send).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2_000);
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ type: 'ping' }));
  });

  it('schedules reconnect on disconnect', () => {
    const onStatusChange = vi.fn();
    const client = createRelayClient({
      url: 'ws://localhost:8080',
      onStatusChange,
    });

    client.connect();
    const ws = MockWebSocket.latest()!;
    ws.simulateOpen();

    ws.close();

    expect(onStatusChange).toHaveBeenCalledWith('disconnected', 'explicit');
  });
});
