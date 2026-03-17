import { useCallback, useEffect, useState } from 'react';

import { lunariaToast, WorkspaceManagerScreen } from '@lunaria/ui';
import type { WorkspaceSummary } from '@lunaria/runtime-client';

import { useRuntimeApi } from './runtime-api';

type WorkspaceHealth = 'healthy' | 'conflicts' | 'orphaned' | 'stale';

type WorkspaceRecord = {
  name: string;
  branch: string;
  source: string;
  disk: string;
  created: string;
  pending: boolean;
  conflicts: boolean;
  health: WorkspaceHealth;
  linkedSessions: string[];
  files: { name: string; added: number; removed: number }[];
};

function mapSummaryToRecord(summary: WorkspaceSummary): WorkspaceRecord {
  const status = summary.status.toLowerCase();
  let health: WorkspaceHealth;
  if (status === 'conflicts') {
    health = 'conflicts';
  } else if (status === 'orphaned') {
    health = 'orphaned';
  } else if (status === 'stale') {
    health = 'stale';
  } else {
    health = 'healthy';
  }

  const ext = summary as Record<string, unknown>;

  return {
    name: summary.name,
    branch: summary.branchName ?? 'main',
    source: (ext.source as string) ?? summary.branchName ?? 'main',
    disk: (ext.diskSize as string) ?? '—',
    created: new Date(summary.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    pending: status === 'pending',
    conflicts: health === 'conflicts',
    health,
    linkedSessions: (ext.linkedSessions as string[]) ?? [],
    files: [],
  };
}

export function RuntimeWorkspaceManagerPage() {
  const api = useRuntimeApi();

  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      const summaries = await api.listWorkspaces();
      setWorkspaces(summaries.map(mapSummaryToRecord));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleDelete = useCallback(
    async (name: string) => {
      try {
        await api.destroyWorkspace(name);
        await fetchWorkspaces();
        lunariaToast({ title: `Deleted workspace "${name}"` });
      } catch (err) {
        lunariaToast({
          title: `Failed to delete workspace "${name}"`,
          description: err instanceof Error ? err.message : String(err),
          variant: 'destructive',
        });
      }
    },
    [api, fetchWorkspaces],
  );

  const handleArchive = useCallback(
    async (name: string) => {
      try {
        await api.archiveWorkspace(name);
        await fetchWorkspaces();
        lunariaToast({ title: `Archived workspace "${name}"` });
      } catch (err) {
        lunariaToast({
          title: `Failed to archive workspace "${name}"`,
          description: err instanceof Error ? err.message : String(err),
          variant: 'destructive',
        });
      }
    },
    [api, fetchWorkspaces],
  );

  const handleReview = useCallback(
    async (name: string) => {
      try {
        await api.reviewWorkspace(name);
        await fetchWorkspaces();
      } catch (err) {
        lunariaToast({
          title: `Failed to review workspace "${name}"`,
          description: err instanceof Error ? err.message : String(err),
          variant: 'destructive',
        });
      }
    },
    [api, fetchWorkspaces],
  );

  if (loading && workspaces.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading workspaces...
      </div>
    );
  }

  if (error && workspaces.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-destructive">
        Failed to load workspaces: {error}
      </div>
    );
  }

  return (
    <WorkspaceManagerScreen
      workspaces={workspaces}
      onDelete={handleDelete}
      onArchive={handleArchive}
      onReview={handleReview}
    />
  );
}
