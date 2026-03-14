import { Gauge, Radio, Wifi, WifiOff } from "lucide-react";

export interface ProviderRate {
  name: string;
  color: string;
  used: number;
  limit: number;
  model: string;
  resetsIn: string;
}

export const providerRates: ProviderRate[] = [
  { name: "Anthropic", color: "var(--tui-claude)", used: 142, limit: 1000, model: "Claude 4 Sonnet", resetsIn: "47m" },
  { name: "OpenAI", color: "var(--tui-opencode)", used: 38, limit: 500, model: "GPT-5.4", resetsIn: "2h 12m" },
  { name: "Google", color: "var(--tui-gemini)", used: 7, limit: 300, model: "Gemini 2.5 Pro", resetsIn: "4h 31m" },
];

export type RuntimeLocation = "local" | "relay" | "offline" | "degraded";

export const runtimeConfig: Record<RuntimeLocation, { icon: typeof Wifi; label: string; className: string }> = {
  local: { icon: Wifi, label: "Local", className: "text-green" },
  relay: { icon: Radio, label: "Relay", className: "text-warning" },
  offline: { icon: WifiOff, label: "Offline", className: "text-destructive" },
  degraded: { icon: WifiOff, label: "Degraded", className: "text-warning" },
};

export const contextUsage = {
  used: 24800,
  limit: 128000,
  icon: Gauge,
};

export function getSeverity(percent: number): { label: string; className: string } {
  if (percent >= 95) return { label: "Exhausted", className: "text-destructive" };
  if (percent >= 80) return { label: "Warning", className: "text-destructive" };
  if (percent >= 50) return { label: "Caution", className: "text-warning" };
  return { label: "Safe", className: "text-green" };
}
