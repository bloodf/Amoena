import { useCallback, useEffect, useState } from "react";

import type { WorkspaceInspection, WorkspaceSummary } from "@lunaria/runtime-client";

import { useClient } from "../client-context";

export function useWorkspaces() {
  const { client } = useClient();
  const [data, setData] = useState<WorkspaceSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!client) return;
    try {
      setIsLoading(true);
      const workspaces = await client.listWorkspaces();
      setData(workspaces);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workspaces");
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

  const inspect = useCallback(
    async (workspaceId: string): Promise<WorkspaceInspection | null> => {
      if (!client) return null;
      try {
        return await client.inspectWorkspace(workspaceId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to inspect workspace");
        return null;
      }
    },
    [client],
  );

  const archive = useCallback(
    async (workspaceId: string) => {
      if (!client) return;
      try {
        await client.archiveWorkspace(workspaceId);
        void refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to archive workspace");
      }
    },
    [client, refresh],
  );

  const destroy = useCallback(
    async (workspaceId: string) => {
      if (!client) return;
      try {
        await client.destroyWorkspace(workspaceId);
        void refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to destroy workspace");
      }
    },
    [client, refresh],
  );

  return { data, error, isLoading, refresh, inspect, archive, destroy };
}
