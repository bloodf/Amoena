import type { WorkspaceHealth, WorkspaceRecord } from "./types";

export const workspaceHealthConfig: Record<WorkspaceHealth, { label: string; color: string; bgColor: string }> = {
  healthy: { label: "Healthy", color: "text-green", bgColor: "bg-green/20" },
  conflicts: { label: "Conflicts", color: "text-destructive", bgColor: "bg-destructive/20" },
  orphaned: { label: "Orphaned", color: "text-warning", bgColor: "bg-warning/20" },
  stale: { label: "Stale", color: "text-muted-foreground", bgColor: "bg-surface-3" },
};

export const initialWorkspaceRecords: WorkspaceRecord[] = [
  {
    name: "amoena-frontend",
    branch: "feature/redesign",
    source: "main",
    disk: "2.4 GB",
    created: "Mar 8, 2026",
    pending: true,
    conflicts: false,
    health: "healthy",
    linkedSessions: ["JWT Auth Refactor", "UI Polish"],
    files: [
      { name: "src/components/Sidebar.tsx", added: 142, removed: 38 },
      { name: "src/pages/Session.tsx", added: 289, removed: 12 },
      { name: "src/styles/tokens.css", added: 67, removed: 45 },
      { name: "src/hooks/useAgent.ts", added: 55, removed: 0 },
    ],
  },
  {
    name: "amoena-runtime",
    branch: "main",
    source: "main",
    disk: "1.8 GB",
    created: "Mar 1, 2026",
    pending: false,
    conflicts: false,
    health: "healthy",
    linkedSessions: [],
    files: [],
  },
  {
    name: "amoena-auth-exp",
    branch: "experiment/jwt",
    source: "feature/auth",
    disk: "890 MB",
    created: "Mar 6, 2026",
    pending: true,
    conflicts: true,
    health: "conflicts",
    linkedSessions: ["JWT Auth Refactor"],
    files: [
      { name: "src/auth/tokens.rs", added: 42, removed: 8 },
      { name: "src/auth/middleware.rs", added: 18, removed: 22 },
    ],
  },
  {
    name: "amoena-old-experiment",
    branch: "experiment/old",
    source: "main",
    disk: "1.2 GB",
    created: "Feb 15, 2026",
    pending: false,
    conflicts: false,
    health: "orphaned",
    linkedSessions: [],
    files: [],
  },
];
