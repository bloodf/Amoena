import type { HomeProviderHealth, HomeQuickTip, HomeSessionItem, HomeWorkspaceItem } from "./types";

export const homeRecentSessions: HomeSessionItem[] = [
  { title: "Auth module refactor", model: "Claude 4 Sonnet", tuiColor: "tui-claude", time: "2 min ago", tokens: "12.4k", branch: "feature/jwt-auth" },
  { title: "API rate limiting", model: "OpenCode", tuiColor: "tui-opencode", time: "1 hour ago", tokens: "8.2k", branch: "feature/rate-limit" },
  { title: "WebSocket handler redesign", model: "Codex CLI", tuiColor: "tui-codex", time: "3 hours ago", tokens: "22.1k", branch: "feature/ws-v2" },
  { title: "Config migration", model: "Gemini CLI", tuiColor: "tui-gemini", time: "Yesterday", tokens: "3.8k", branch: "main" },
  { title: "Database schema optimization", model: "Claude 4 Sonnet", tuiColor: "tui-claude", time: "Yesterday", tokens: "15.6k", branch: "perf/db-indexes" },
];

export const homeWorkspaces: HomeWorkspaceItem[] = [
  { name: "amoena-frontend", branch: "feature/redesign", disk: "2.4 GB", pending: true },
  { name: "amoena-runtime", branch: "main", disk: "1.8 GB", pending: false },
  { name: "amoena-mobile", branch: "feature/remote-v2", disk: "890 MB", pending: false },
];

export const homeProviders: HomeProviderHealth[] = [
  { name: "Anthropic", status: "connected", color: "tui-claude" },
  { name: "OpenCode", status: "connected", color: "tui-opencode" },
  { name: "Codex", status: "error", color: "tui-codex" },
  { name: "Gemini", status: "disconnected", color: "tui-gemini" },
];

export const homeQuickTips: HomeQuickTip[] = [
  { tip: "Use @ to mention files in the composer", shortcut: "@" },
  { tip: "Use $ to invoke skills like Autopilot", shortcut: "$" },
  { tip: "Use / for slash commands", shortcut: "/" },
  { tip: "Press ⌘K to open command palette", shortcut: "⌘K" },
];
