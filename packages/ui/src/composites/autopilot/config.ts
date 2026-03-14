import type { AutopilotState } from "./types";

export const autopilotStateConfig: Record<AutopilotState, { label: string; color: string; bgColor: string }> = {
  idle: { label: "Idle", color: "text-muted-foreground", bgColor: "bg-surface-3" },
  planning: { label: "Planning", color: "text-primary", bgColor: "bg-primary/20" },
  executing: { label: "Executing", color: "text-green", bgColor: "bg-green/20" },
  waiting_approval: { label: "Waiting Approval", color: "text-warning", bgColor: "bg-warning/20" },
  blocked: { label: "Blocked", color: "text-destructive", bgColor: "bg-destructive/20" },
  complete: { label: "Complete", color: "text-green", bgColor: "bg-green/20" },
  failed: { label: "Failed", color: "text-destructive", bgColor: "bg-destructive/20" },
  paused: { label: "Paused", color: "text-warning", bgColor: "bg-warning/20" },
};
