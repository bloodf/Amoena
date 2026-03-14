import { Bot, Brain, Clock, FileText, GitBranch, Globe, MessageSquare, PlayCircle, Settings, Smartphone, Terminal, Zap, type LucideIcon } from "lucide-react";

export interface CommandPaletteItem {
  type: "command" | "file" | "agent" | "history" | "navigation";
  icon: LucideIcon;
  label: string;
  description?: string;
  shortcut?: string;
  action?: () => void;
}

export const commandPaletteTypeLabels: Record<CommandPaletteItem["type"], string> = {
  command: "Commands",
  navigation: "Navigation",
  file: "Files",
  agent: "Agents",
  history: "Chat History",
};

export function buildCommandPaletteItems(navigate: (path: string) => void): CommandPaletteItem[] {
  return [
    { type: "command", icon: MessageSquare, label: "New Session", shortcut: "⌘N", action: () => navigate("/session") },
    { type: "command", icon: Terminal, label: "Toggle Terminal", shortcut: "⌘`" },
    { type: "command", icon: Zap, label: "Quick Prompt", shortcut: "⌘J", action: () => navigate("/session") },
    { type: "command", icon: PlayCircle, label: "Start Autopilot", action: () => navigate("/autopilot") },
    { type: "navigation", icon: Settings, label: "Settings", action: () => navigate("/settings") },
    { type: "navigation", icon: Brain, label: "Memory Browser", action: () => navigate("/memory") },
    { type: "navigation", icon: Bot, label: "Agent Management", action: () => navigate("/agents") },
    { type: "navigation", icon: GitBranch, label: "Workspaces", action: () => navigate("/workspaces") },
    { type: "navigation", icon: Globe, label: "Marketplace", action: () => navigate("/marketplace") },
    { type: "navigation", icon: Smartphone, label: "Remote Access", action: () => navigate("/remote") },
    { type: "file", icon: FileText, label: "src/auth/tokens.rs", description: "JWT token handling" },
    { type: "file", icon: FileText, label: "src/main.rs", description: "Entry point" },
    { type: "file", icon: FileText, label: "src/api/routes.rs", description: "API route definitions" },
    { type: "file", icon: FileText, label: "src/auth/middleware.rs", description: "Auth middleware" },
    { type: "file", icon: FileText, label: "src/config.rs", description: "Configuration" },
    { type: "agent", icon: Bot, label: "Claude 4 Sonnet", description: "JWT Auth Refactor session", action: () => navigate("/session") },
    { type: "agent", icon: Bot, label: "Gemini 2.5 Pro", description: "Rate Limiter Design session", action: () => navigate("/session") },
    { type: "agent", icon: Bot, label: "GPT-5.4", description: "API Routes session", action: () => navigate("/session") },
    { type: "history", icon: Clock, label: "How to implement JWT refresh tokens?", description: "Claude 4 Sonnet · 2 min ago", action: () => navigate("/session") },
    { type: "history", icon: Clock, label: "Design a rate limiter with sliding window", description: "Gemini 2.5 Pro · 1 hour ago", action: () => navigate("/session") },
    { type: "history", icon: Clock, label: "Optimize database connection pooling", description: "Claude 4 Sonnet · 3 hours ago", action: () => navigate("/session") },
    { type: "history", icon: Clock, label: "WebSocket reconnection strategy", description: "GPT-5.4 · Yesterday", action: () => navigate("/session") },
  ];
}
