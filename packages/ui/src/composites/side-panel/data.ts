import { Brain, FileText, GitCommit, Users, type LucideIcon } from "lucide-react";

export type SidePanelTabId = "files" | "agents" | "memory" | "timeline";

export interface SidePanelTabDef {
  id: SidePanelTabId;
  icon: LucideIcon;
  label: string;
}

export const defaultSidePanelTabs: SidePanelTabDef[] = [
  { id: "files", icon: FileText, label: "Files" },
  { id: "agents", icon: Users, label: "Agents" },
  { id: "memory", icon: Brain, label: "Memory" },
  { id: "timeline", icon: GitCommit, label: "Timeline" },
];
