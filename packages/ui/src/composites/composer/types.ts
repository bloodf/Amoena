import type { LucideIcon } from "lucide-react";

export interface ComposerAttachment {
  type: "file" | "folder";
  name: string;
  path: string;
  itemCount?: number;
  inferredTypes?: string[];
  truncated?: boolean;
}

export interface ComposerReasoningLevel {
  id: string;
  label: string;
  desc: string;
}

export interface ComposerOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface ComposerPermissionOption {
  id: string;
  label: string;
  desc: string;
}

export type PaletteCategory = "commands" | "skills" | "agents" | "files";

export interface PaletteItem {
  category: PaletteCategory;
  id: string;
  name: string;
  desc: string;
  Icon: LucideIcon;
  source?: string;
  meta?: string;
}

export interface PaletteGroup {
  category: PaletteCategory;
  label: string;
  items: PaletteItem[];
}
