import type { LucideIcon } from "lucide-react";

export interface SessionOptionCard<T extends string> {
  id: T;
  label: string;
  desc: string;
  icon: LucideIcon;
}

export interface ProviderOption {
  id: string;
  label: string;
  desc: string;
  models: string[];
  color: string;
  icon: LucideIcon;
  featured?: boolean;
}

export interface LabeledOption {
  id: string;
  label: string;
  desc: string;
}
