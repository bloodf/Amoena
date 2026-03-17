import { useCallback, useEffect, useRef, useState } from "react";

import type { SessionAgent } from "@lunaria/runtime-client";

import { useClient } from "../client-context";
import { createReconnectingEventSource } from "../event-source";

export function useSessionAgents(sessionId: string) {
  const { auth, client } = useClient();
  const [data, setData] = useState<SessionAgent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const esRef = useRef<ReturnType<typeof createReconnectingEventSource> | null>(null);

  const refresh = useCallback(async () => {
    if (!client) return;
    try {
      setIsLoading(true);
      const agents = await client.listSessionAgents(sessionId);
      setData(agents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agents");
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
        eventNames: ["agent.created", "agent.updated"],
        onEvent: () => {
          void refresh();
        },
      },
    );

    return () => {
      esRef.current?.close();
    };
  }, [auth, client, sessionId, refresh]);

  return { data, error, isLoading, refresh };
}
