import { useCallback, useEffect, useRef, useState } from "react";

import type { SessionMessage } from "@lunaria/runtime-client";

import { useClient } from "../client-context";
import { createReconnectingEventSource } from "../event-source";

export function useSessionMessages(sessionId: string) {
  const { auth, client } = useClient();
  const [data, setData] = useState<SessionMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const esRef = useRef<ReturnType<typeof createReconnectingEventSource> | null>(null);

  const refresh = useCallback(async () => {
    if (!client) return;
    try {
      setIsLoading(true);
      const messages = await client.listSessionMessages(sessionId);
      setData(messages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [client, sessionId]);

  useEffect(() => {
    if (!client || !auth) {
      setData([]);
      setIsLoading(false);
      return;
    }

    void refresh();

    esRef.current = createReconnectingEventSource(
      client.sessionEventsUrl(sessionId, auth.accessToken),
      {
        eventNames: ["message.created", "message.updated"],
        onEvent: () => {
          void refresh();
        },
      },
    );

    return () => {
      esRef.current?.close();
    };
  }, [auth, client, sessionId, refresh]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!client) return;
      try {
        await client.createSessionMessage(sessionId, { content, taskType: "default" });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
      }
    },
    [client, sessionId],
  );

  return { data, error, isLoading, refresh, sendMessage };
}
