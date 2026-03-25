/**
 * Hook for managing WebSocket connection to the relay server.
 *
 * Provides automatic reconnection with exponential backoff (500ms -> 8s),
 * heartbeat, and app state awareness (disconnect on background).
 */

import { useCallback, useEffect, useRef, useState } from "react";

import {
  createRelayClient,
  type RelayClient,
  type RelayConnectionStatus,
  type RelayIncomingMessage,
  type RelayOutgoingMessage,
} from "@/lib/relay-client";

export type UseRelayConnectionOptions = {
  /** WebSocket URL of the relay server. */
  readonly url: string | null;
  /** Auth token for the relay connection. */
  readonly authToken?: string;
  /** Called when a message is received from the relay. */
  readonly onMessage?: (message: RelayIncomingMessage) => void;
  /** Whether to auto-connect on mount. Defaults to true. */
  readonly autoConnect?: boolean;
};

export type UseRelayConnectionResult = {
  readonly status: RelayConnectionStatus;
  readonly isConnected: boolean;
  readonly connect: () => void;
  readonly disconnect: () => void;
  readonly send: (message: RelayOutgoingMessage) => void;
};

export function useRelayConnection(
  options: UseRelayConnectionOptions,
): UseRelayConnectionResult {
  const { url, authToken, onMessage, autoConnect = true } = options;

  const [status, setStatus] = useState<RelayConnectionStatus>("disconnected");
  const clientRef = useRef<RelayClient | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!url) {
      setStatus("disconnected");
      return;
    }

    const client = createRelayClient({
      url,
      authToken,
      minReconnectDelay: 500,
      maxReconnectDelay: 8000,
      heartbeatInterval: 15_000,
      onMessage: (msg) => onMessageRef.current?.(msg),
      onStatusChange: setStatus,
    });

    clientRef.current = client;

    if (autoConnect) {
      client.connect();
    }

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [url, authToken, autoConnect]);

  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const send = useCallback((message: RelayOutgoingMessage) => {
    clientRef.current?.send(message);
  }, []);

  return {
    status,
    isConnected: status === "connected",
    connect,
    disconnect,
    send,
  };
}
