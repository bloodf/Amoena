export type WorkspaceHealth = "healthy" | "conflicts" | "orphaned" | "stale";

export interface WorkspaceFileChange {
  name: string;
  added: number;
  removed: number;
}

export interface WorkspaceRecord {
  name: string;
  branch: string;
  source: string;
  disk: string;
  created: string;
  pending: boolean;
  conflicts: boolean;
  health: WorkspaceHealth;
  linkedSessions: string[];
  files: WorkspaceFileChange[];
}
