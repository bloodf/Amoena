import { useCallback, useEffect, useRef, useState } from "react";

import type { SessionSummary } from "@lunaria/runtime-client";

import { useClient } from "../client-context";
import { createReconnectingEventSource } from "../event-source";

export function useSessions() {
  const { auth, client } = useClient();
  const [data, setData] = useState<SessionSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const esRef = useRef<ReturnType<typeof createReconnectingEventSource> | null>(null);

  const refresh = useCallback(async () => {
    if (!client) return;
    try {
      setIsLoading(true);
      const sessions = await client.listSessions();
      setData(sessions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (!client || !auth) {
      setData([]);
      setIsLoading(false);
      return;
    }

    void refresh();

    esRef.current = createReconnectingEventSource(
      client.globalEventsUrl(auth.accessToken),
      {
        eventNames: ["session.created", "session.updated", "session.deleted"],
        onEvent: () => {
          void refresh();
        },
      },
    );

    return () => {
      esRef.current?.close();
    };
  }, [auth, client, refresh]);

  return { data, error, isLoading, refresh };
}
