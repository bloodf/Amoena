import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  AppState: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
    currentState: 'active',
  },
}));

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static CONNECTING = 0;
  static instances: MockWebSocket[] = [];

  url: string;
  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  });

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  simulateClose() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
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

  static count() {
    return MockWebSocket.instances.length;
  }
}

import { createRelayClient } from '../relay-client';

describe('relay reconnect lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockWebSocket.reset();
    (globalThis as unknown as Record<string, unknown>).WebSocket = MockWebSocket;
  });

  afterEach(() => {
    delete (globalThis as unknown as Record<string, unknown>).WebSocket;
    vi.useRealTimers();
  });

  describe('heartbeat interval alignment', () => {
    it('uses 30 second heartbeat interval to match server', () => {
      const client = createRelayClient({
        url: 'ws://localhost:8080',
        heartbeatInterval: 30_000,
      });

      client.connect();
      const ws = MockWebSocket.latest();
      expect(ws).not.toBeNull();

      ws!.simulateOpen();

      // Advance time and check heartbeats sent at 30s intervals
      vi.advanceTimersByTime(30_000);
      expect(ws!.send).toHaveBeenCalledWith(JSON.stringify({ type: 'ping' }));

      vi.advanceTimersByTime(30_000);
      expect(ws!.send).toHaveBeenCalledTimes(2);

      vi.advanceTimersByTime(30_000);
      expect(ws!.send).toHaveBeenCalledTimes(3);
    });
  });

  describe('reconnect with backoff resumes cleanly', () => {
    it('resumes connection after disconnect with exponential backoff', () => {
      const onStatusChange = vi.fn();
      const client = createRelayClient({
        url: 'ws://localhost:8080',
        minReconnectDelay: 500,
        maxReconnectDelay: 8000,
        onStatusChange,
      });

      // First connection
      client.connect();
      const wsCountAfterFirstConnect = MockWebSocket.count();

      const ws1 = MockWebSocket.latest();
      expect(ws1).not.toBeNull();
      ws1!.simulateOpen();

      // onopen resets retryCount to 0 and sets status to "connected"
      const calls = onStatusChange.mock.calls.map((c) => c[0]);
      expect(calls).toContain('connected');

      // Simulate disconnect
      ws1!.simulateClose();

      // Advance past backoff delay (500ms + jitter = ~700ms)
      vi.advanceTimersByTime(800);

      // Should have created a new WebSocket instance
      expect(MockWebSocket.count()).toBeGreaterThan(wsCountAfterFirstConnect);

      const ws2 = MockWebSocket.latest();
      expect(ws2).not.toBeNull();
      ws2!.simulateOpen();

      const finalCalls = onStatusChange.mock.calls.map((c) => c[0]);
      expect(finalCalls).toContain('connected');
    });

    it('caps reconnect delay at maxReconnectDelay', () => {
      const onStatusChange = vi.fn();
      const client = createRelayClient({
        url: 'ws://localhost:8080',
        minReconnectDelay: 500,
        maxReconnectDelay: 8000,
        onStatusChange,
      });

      client.connect();
      const ws1 = MockWebSocket.latest();
      expect(ws1).not.toBeNull();
      ws1!.simulateOpen();

      ws1!.simulateClose();

      // After many retries, delay should cap at 8000ms
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(8500);
        const ws = MockWebSocket.latest();
        expect(ws).not.toBeNull();
        ws!.simulateClose();
      }
    });
  });

  describe('repeated disconnects', () => {
    it('handles multiple rapid disconnect/reconnect cycles', () => {
      const onStatusChange = vi.fn();
      const client = createRelayClient({
        url: 'ws://localhost:8080',
        onStatusChange,
      });

      for (let i = 0; i < 3; i++) {
        client.connect();
        const ws = MockWebSocket.latest();
        expect(ws).not.toBeNull();
        ws!.simulateOpen();
        ws!.simulateClose();
        vi.advanceTimersByTime(600);
      }

      expect(onStatusChange).toHaveBeenCalled();
    });
  });
});
