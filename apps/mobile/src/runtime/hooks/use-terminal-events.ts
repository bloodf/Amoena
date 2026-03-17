import { useCallback, useEffect, useRef, useState } from "react";

import type { TerminalEvent } from "@lunaria/runtime-client";

import { useClient } from "../client-context";

export function useTerminalEvents(terminalSessionId: string) {
  const { client } = useClient();
  const [data, setData] = useState<TerminalEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastEventIdRef = useRef(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    if (!client) return;
    try {
      setIsLoading(true);
      const events = await client.listTerminalEvents(terminalSessionId, lastEventIdRef.current);
      if (events.length > 0) {
        lastEventIdRef.current = events[events.length - 1].eventId;
        setData((prev) => [...prev, ...events]);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load terminal events");
    } finally {
      setIsLoading(false);
    }
  }, [client, terminalSessionId]);

  useEffect(() => {
    if (!client) {
      setData([]);
      setIsLoading(false);
      return;
    }

    lastEventIdRef.current = 0;
    setData([]);
    void refresh();

    // Terminal events use polling since there's no SSE endpoint per terminal
    pollingRef.current = setInterval(() => {
      void refresh();
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [client, terminalSessionId, refresh]);

  return { data, error, isLoading, refresh };
}
