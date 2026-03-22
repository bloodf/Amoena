// Stub — Lunaria local database (SQLite via Drizzle)
// Will be fully implemented in Phase 2 by merging Lunaria's SQLite layer

// Re-export stubs for Electron main process imports
export const settings = {
  id: "settings" as const,
  key: "key" as const,
  value: "value" as const,
};

export const workspaces = {
  id: "id" as const,
  name: "name" as const,
  worktreeId: "worktreeId" as const,
};

export const worktrees = {
  id: "id" as const,
  path: "path" as const,
};
