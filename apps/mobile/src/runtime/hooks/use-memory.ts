import { useCallback, useEffect, useState } from "react";

import type { SessionMemoryResponse } from "@lunaria/runtime-client";

import { useClient } from "../client-context";

export function useSessionMemory(sessionId: string) {
  const { client } = useClient();
  const [data, setData] = useState<SessionMemoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!client) return;
    try {
      setIsLoading(true);
      const memory = await client.getSessionMemory(sessionId);
      setData(memory);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load memory");
    } finally {
      setIsLoading(false);
    }
  }, [client, sessionId]);

  useEffect(() => {
    if (!client) {
      setData(null);
      setIsLoading(false);
      return;
    }
    void refresh();
  }, [client, sessionId, refresh]);

  return { data, error, isLoading, refresh };
}
