import type { AgentDivision, AgentSource, AgentStatus } from "./types";

export const sourceColors: Record<AgentSource, string> = {
  "built-in": "bg-green/20 text-green",
  "imported": "bg-primary/20 text-primary",
  "marketplace": "bg-purple/20 text-purple",
  "custom": "bg-warning/20 text-warning",
};

export const managedStatusConfig: Record<AgentStatus, { color: string; label: string }> = {
  created: { color: "bg-blue-500", label: "Created" },
  preparing: { color: "bg-blue-500 animate-pulse", label: "Preparing" },
  active: { color: "bg-green", label: "Active" },
  idle: { color: "bg-muted-foreground", label: "Idle" },
  running: { color: "bg-green animate-pulse", label: "Running" },
  paused: { color: "bg-warning", label: "Paused" },
  stopped: { color: "bg-warning", label: "Stopped" },
  completed: { color: "bg-green", label: "Completed" },
  failed: { color: "bg-destructive", label: "Failed" },
  cancelled: { color: "bg-destructive", label: "Cancelled" },
  thinking: { color: "bg-amber-400", label: "Thinking" },
  executing: { color: "bg-blue-500", label: "Executing" },
  blocked: { color: "bg-destructive", label: "Blocked" },
  awaiting_review: { color: "bg-violet-500", label: "Awaiting Review" },
  complete: { color: "bg-green", label: "Complete" },
  error: { color: "bg-rose-600", label: "Error" },
  delegating: { color: "bg-teal-500", label: "Delegating" },
  synthesizing: { color: "bg-indigo-500", label: "Synthesizing" },
};

export function managedStatusTone(
  status: AgentStatus,
): "success" | "warning" | "danger" | "muted" | "info" | "purple" {
  switch (status) {
    case "active":
    case "running":
    case "completed":
    case "complete":
    case "executing":
      return "success";
    case "paused":
    case "stopped":
    case "thinking":
      return "warning";
    case "failed":
    case "cancelled":
    case "blocked":
    case "error":
      return "danger";
    case "created":
    case "preparing":
    case "delegating":
    case "synthesizing":
      return "info";
    case "awaiting_review":
      return "purple";
    case "idle":
    default:
      return "muted";
  }
}

export const divisionColors: Record<AgentDivision, string> = {
  engineering: "#0891B2",
  design: "#B800B8",
  qa: "#16A34A",
  product: "#EA580C",
  security: "#DC2626",
  devops: "#7C3AED",
  ai: "#D97706",
  general: "#6B7280",
};

export const divisionLabels: Record<AgentDivision, string> = {
  engineering: "Engineering",
  design: "Design",
  qa: "QA",
  product: "Product",
  security: "Security",
  devops: "DevOps",
  ai: "AI",
  general: "General",
};
