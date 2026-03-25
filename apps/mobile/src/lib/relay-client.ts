/**
 * WebSocket relay client for connecting the mobile app to the desktop
 * Amoena instance via the relay server.
 *
 * Handles connect, send, receive, and heartbeat with automatic reconnection.
 */

import { AppState, type AppStateStatus } from "react-native";

export type RelayMessageHandler = (message: RelayIncomingMessage) => void;
export type RelayStatusHandler = (status: RelayConnectionStatus) => void;

export type RelayConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

export type RelayIncomingMessage = {
  readonly type: string;
  readonly from?: string;
  readonly payload?: unknown;
};

export type RelayOutgoingMessage = {
  readonly type: string;
  readonly to?: string;
  readonly payload?: unknown;
};

export type RelayClientOptions = {
  /** WebSocket URL of the relay server. */
  readonly url: string;
  /** Auth token for the relay connection. */
  readonly authToken?: string;
  /** Minimum reconnect delay in ms. Defaults to 500. */
  readonly minReconnectDelay?: number;
  /** Maximum reconnect delay in ms. Defaults to 8000. */
  readonly maxReconnectDelay?: number;
  /** Heartbeat interval in ms. Defaults to 15000. */
  readonly heartbeatInterval?: number;
  /** Called when a message is received. */
  readonly onMessage?: RelayMessageHandler;
  /** Called when connection status changes. */
  readonly onStatusChange?: RelayStatusHandler;
};

export type RelayClient = {
  readonly connect: () => void;
  readonly disconnect: () => void;
  readonly send: (message: RelayOutgoingMessage) => void;
  readonly getStatus: () => RelayConnectionStatus;
};

export function createRelayClient(options: RelayClientOptions): RelayClient {
  const {
    url,
    authToken,
    minReconnectDelay = 500,
    maxReconnectDelay = 8000,
    heartbeatInterval = 15_000,
    onMessage,
    onStatusChange,
  } = options;

  let ws: WebSocket | null = null;
  let status: RelayConnectionStatus = "disconnected";
  let retryCount = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let disposed = false;
  let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null =
    null;

  function setStatus(next: RelayConnectionStatus) {
    if (status !== next) {
      status = next;
      onStatusChange?.(next);
    }
  }

  function getDelay(): number {
    const delay = Math.min(
      minReconnectDelay * Math.pow(2, retryCount),
      maxReconnectDelay,
    );
    return delay + Math.random() * 200;
  }

  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, heartbeatInterval);
  }

  function stopHeartbeat() {
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function connect() {
    if (disposed) return;
    if (ws?.readyState === WebSocket.OPEN) return;

    closeSocket();

    const wsUrl = authToken
      ? `${url}?authToken=${encodeURIComponent(authToken)}`
      : url;

    setStatus(retryCount > 0 ? "reconnecting" : "connecting");

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      retryCount = 0;
      setStatus("connected");
      startHeartbeat();
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(event.data) as RelayIncomingMessage;
        if (parsed.type === "pong") return;
        onMessage?.(parsed);
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onerror = () => {
      // onerror is always followed by onclose in RN
    };

    ws.onclose = () => {
      stopHeartbeat();
      ws = null;
      if (!disposed) {
        setStatus("disconnected");
        scheduleReconnect();
      }
    };
  }

  function closeSocket() {
    stopHeartbeat();
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      ws.close();
      ws = null;
    }
  }

  function scheduleReconnect() {
    if (disposed) return;
    if (retryTimer !== null) return;

    retryTimer = setTimeout(() => {
      retryTimer = null;
      retryCount++;
      connect();
    }, getDelay());
  }

  function cancelRetry() {
    if (retryTimer !== null) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  }

  function handleAppState(nextState: AppStateStatus) {
    if (nextState === "active") {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        connect();
      }
    } else {
      cancelRetry();
      closeSocket();
      setStatus("disconnected");
    }
  }

  function disconnect() {
    disposed = true;
    cancelRetry();
    closeSocket();
    setStatus("disconnected");
    appStateSubscription?.remove();
    appStateSubscription = null;
  }

  function send(message: RelayOutgoingMessage) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Start listening for app state changes
  appStateSubscription = AppState.addEventListener("change", handleAppState);

  return {
    connect,
    disconnect,
    send,
    getStatus: () => status,
  };
}
