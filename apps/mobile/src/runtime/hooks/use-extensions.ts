import { useCallback, useEffect, useState } from "react";

import type { ExtensionSummary } from "@lunaria/runtime-client";

import { useClient } from "../client-context";

export function useExtensions() {
  const { client } = useClient();
  const [data, setData] = useState<ExtensionSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!client) return;
    try {
      setIsLoading(true);
      const extensions = await client.listExtensions();
      setData(extensions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load extensions");
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (!client) {
      setData([]);
      setIsLoading(false);
      return;
    }
    void refresh();
  }, [client, refresh]);

  const toggle = useCallback(
    async (extensionId: string, enabled: boolean) => {
      if (!client) return;
      try {
        await client.toggleExtension(extensionId, enabled);
        void refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to toggle extension");
      }
    },
    [client, refresh],
  );

  const uninstall = useCallback(
    async (extensionId: string) => {
      if (!client) return;
      try {
        await client.uninstallExtension(extensionId);
        void refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to uninstall extension");
      }
    },
    [client, refresh],
  );

  return { data, error, isLoading, refresh, toggle, uninstall };
}
