export type MemoryType = "summary" | "code_pattern" | "architecture" | "auto" | "manual";

export interface MemoryEntry {
  key: string;
  source: "auto" | "manual" | "agent";
  scope: "workspace" | "global";
  value: string;
  timestamp: string;
  size: string;
  type: MemoryType;
  pinned: boolean;
  session?: string;
  agent?: string;
}

export const memoryTypeConfig: Record<MemoryType, { label: string; className: string }> = {
  summary: { label: "Summary", className: "bg-primary/20 text-primary" },
  code_pattern: { label: "Code Pattern", className: "bg-purple/20 text-purple" },
  architecture: { label: "Architecture", className: "bg-tui-gemini/20 text-tui-gemini" },
  auto: { label: "Auto", className: "bg-surface-3 text-muted-foreground" },
  manual: { label: "Manual", className: "bg-green/20 text-green" },
};
