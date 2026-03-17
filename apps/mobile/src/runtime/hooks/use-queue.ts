import { useCallback, useEffect, useRef, useState } from "react";

import type { QueueMessage } from "@lunaria/runtime-client";

import { useClient } from "../client-context";
import { createReconnectingEventSource } from "../event-source";

export function useQueue(sessionId: string) {
  const { auth, client } = useClient();
  const [data, setData] = useState<QueueMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const esRef = useRef<ReturnType<typeof createReconnectingEventSource> | null>(null);

  const refresh = useCallback(async () => {
    if (!client) return;
    try {
      setIsLoading(true);
      const messages = await client.listQueueMessages(sessionId);
      setData(messages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load queue");
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
        eventNames: ["queue.updated"],
        onEvent: () => {
          void refresh();
        },
      },
    );

    return () => {
      esRef.current?.close();
    };
  }, [auth, client, sessionId, refresh]);

  const enqueue = useCallback(
    async (content: string) => {
      if (!client) return;
      try {
        await client.enqueueMessage(sessionId, { content });
        void refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to enqueue message");
      }
    },
    [client, sessionId, refresh],
  );

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!client) return;
      try {
        await client.editQueueMessage(sessionId, messageId, { content });
        void refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to edit message");
      }
    },
    [client, sessionId, refresh],
  );

  const removeMessage = useCallback(
    async (messageId: string) => {
      if (!client) return;
      try {
        await client.removeQueueMessage(sessionId, messageId);
        void refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove message");
      }
    },
    [client, sessionId, refresh],
  );

  const flush = useCallback(async () => {
    if (!client) return;
    try {
      await client.flushQueue(sessionId);
      setData([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to flush queue");
    }
  }, [client, sessionId]);

  return { data, error, isLoading, refresh, enqueue, editMessage, removeMessage, flush };
}
