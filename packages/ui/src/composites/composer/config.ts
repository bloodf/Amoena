import {
  Ban,
  BarChart3,
  Brain,
  ClipboardList,
  Cloud,
  Eye,
  File,
  Gauge,
  GitFork,
  Globe,
  MessageCircle,
  MessageSquare,
  Monitor as MonitorIcon,
  Plug,
  Puzzle,
  Rocket,
  Search,
  Smartphone,
  Sparkles,
  Theater,
  Trash2,
  TreePine,
  Users,
  Zap,
} from "lucide-react";
import type { ComposerOption, ComposerPermissionOption, ComposerReasoningLevel } from "./types";

export const composerFiles = [
  { name: "tokens.rs", path: "src/auth/tokens.rs", type: "file" as const },
  { name: "middleware.rs", path: "src/auth/middleware.rs", type: "file" as const },
  { name: "rate_limit.rs", path: "src/auth/rate_limit.rs", type: "file" as const },
  { name: "api.rs", path: "src/handlers/api.rs", type: "file" as const },
  { name: "websocket.rs", path: "src/handlers/websocket.rs", type: "file" as const },
  { name: "main.rs", path: "src/main.rs", type: "file" as const },
  { name: "config.rs", path: "src/config.rs", type: "file" as const },
  { name: "Cargo.toml", path: "Cargo.toml", type: "file" as const },
  { name: "src/auth", path: "src/auth", type: "folder" as const },
  { name: "src/handlers", path: "src/handlers", type: "folder" as const },
  { name: "src", path: "src", type: "folder" as const },
];

export const composerSkills = [
  { name: "Agent Browser", desc: "Browser automation CLI for AI agents", Icon: Globe, source: "project" as const },
  { name: "Ai Slop Cleaner", desc: "Run an anti-slop cleanup/refactor workflow", Icon: Trash2, source: "project" as const },
  { name: "Ask Claude", desc: "Ask Claude via local CLI and capture a reusable artifact", Icon: MessageSquare, source: "project" as const },
  { name: "Ask Gemini", desc: "Ask Gemini via local CLI and capture a reusable artifact", Icon: Sparkles, source: "project" as const },
  { name: "Autopilot", desc: "Full autonomous execution from idea to working code", Icon: Rocket, source: "project" as const },
  { name: "Brainstorming", desc: "You MUST use this before any creative work", Icon: Brain, source: "project" as const },
  { name: "Browser Use", desc: "Automates browser interactions for web testing", Icon: MonitorIcon, source: "project" as const },
  { name: "Building Native UI", desc: "Complete guide for building beautiful apps", Icon: Smartphone, source: "project" as const },
  { name: "Cancel", desc: "Cancel any active mode", Icon: Ban, source: "builtin" as const },
  { name: "Code Review", desc: "Review code for quality and best practices", Icon: Eye, source: "project" as const },
  { name: "Fast", desc: "Turn off Fast mode and return to standard speed", Icon: Zap, source: "builtin" as const },
  { name: "Feedback", desc: "Send feedback to the team", Icon: MessageCircle, source: "builtin" as const },
  { name: "IDE Context", desc: "Include selection, open files, and IDE context", Icon: Search, source: "builtin" as const },
  { name: "MCP", desc: "Show MCP server status", Icon: Plug, source: "builtin" as const },
  { name: "New Worktree", desc: "Create a new worktree for isolated work", Icon: TreePine, source: "builtin" as const },
  { name: "Personality", desc: "Configure agent personality", Icon: Theater, source: "builtin" as const },
  { name: "Plan Mode", desc: "Turn plan mode on", Icon: ClipboardList, source: "builtin" as const },
  { name: "Status", desc: "Show thread id, context usage, and rate limits", Icon: BarChart3, source: "builtin" as const },
];

export const composerBuiltinCommands = [
  { name: "edit", desc: "Edit a file with instructions", Icon: File },
  { name: "new", desc: "Create a new file", Icon: Search },
  { name: "test", desc: "Run tests for a file or module", Icon: Gauge },
  { name: "compact", desc: "Compact conversation history", Icon: Puzzle },
  { name: "clear", desc: "Clear conversation", Icon: Trash2 },
  { name: "model", desc: "Switch active model", Icon: Zap },
  { name: "memory", desc: "Search or add memory", Icon: Brain },
  { name: "undo", desc: "Undo last agent action", Icon: BarChart3 },
  { name: "help", desc: "Show available commands", Icon: MessageCircle },
  { name: "agents", desc: "Switch agent variant", Icon: Users },
  { name: "fork", desc: "Fork this thread into local or a new worktree", Icon: GitFork },
];

export type ComposerProvider = "lunaria" | "claude" | "opencode" | "codex" | "gemini" | "ollama";

export interface ComposerAgentVariant {
  id: string;
  name: string;
  role: string;
  color: string;
}

export const composerProviderModels: Record<ComposerProvider, { name: string; models: { id: string; label: string }[] }> = {
  lunaria: { name: "Lunaria AI", models: [{ id: "lunaria-pro", label: "Lunaria Pro" }, { id: "lunaria-fast", label: "Lunaria Fast" }] },
  claude: { name: "Claude Code", models: [{ id: "claude-4-sonnet", label: "Claude 4 Sonnet" }, { id: "claude-4-opus", label: "Claude 4 Opus" }, { id: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" }] },
  opencode: { name: "OpenCode", models: [{ id: "gpt-5.4", label: "GPT-5.4" }, { id: "gpt-5.3-codex", label: "GPT-5.3 Codex" }, { id: "gpt-5.2", label: "GPT-5.2" }] },
  codex: { name: "Codex CLI", models: [{ id: "codex-ultra", label: "Codex Ultra" }, { id: "codex-pro", label: "Codex Pro" }] },
  gemini: { name: "Gemini CLI", models: [{ id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" }, { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" }] },
  ollama: { name: "Ollama", models: [{ id: "llama-4-scout", label: "Llama 4 Scout" }, { id: "qwen-3", label: "Qwen 3" }, { id: "deepseek-r2", label: "DeepSeek R2" }] },
};

export const composerProviderAgents: Record<ComposerProvider, ComposerAgentVariant[]> = {
  lunaria: [
    { id: "lunaria-default", name: "Lunaria", role: "Default Agent", color: "text-primary" },
    { id: "lunaria-architect", name: "Architect", role: "System Designer", color: "text-primary" },
    { id: "lunaria-reviewer", name: "Reviewer", role: "Code Reviewer", color: "text-warning" },
  ],
  opencode: [
    { id: "sisyphus", name: "Sisyphus", role: "Ultraworker", color: "text-tui-opencode" },
    { id: "hephaestus", name: "Hephaestus", role: "Deep Agent", color: "text-tui-codex" },
    { id: "prometheus", name: "Prometheus", role: "Plan Builder", color: "text-tui-gemini" },
    { id: "atlas", name: "Atlas", role: "Plan Executor", color: "text-green" },
  ],
  claude: [
    { id: "default", name: "Claude", role: "Default Agent", color: "text-tui-claude" },
    { id: "architect", name: "Architect", role: "System Designer", color: "text-tui-claude" },
    { id: "reviewer", name: "Critic", role: "Code Reviewer", color: "text-warning" },
  ],
  codex: [
    { id: "codex-default", name: "Codex", role: "Default Agent", color: "text-tui-codex" },
    { id: "codex-planner", name: "Planner", role: "Task Planner", color: "text-tui-gemini" },
  ],
  gemini: [
    { id: "gemini-default", name: "Gemini", role: "Default Agent", color: "text-tui-gemini" },
    { id: "gemini-deep", name: "Deep Think", role: "Deep Reasoning", color: "text-primary" },
  ],
  ollama: [{ id: "ollama-default", name: "Ollama", role: "Default Agent", color: "text-foreground" }],
};

export const composerReasoningLevels: ComposerReasoningLevel[] = [
  { id: "low", label: "Low", desc: "Minimal reasoning" },
  { id: "medium", label: "Medium", desc: "Balanced" },
  { id: "high", label: "High", desc: "Deep analysis" },
  { id: "extra-high", label: "Extra High", desc: "Maximum depth" },
];

export const composerContinueInOptions: ComposerOption[] = [
  { id: "local", label: "Local project", icon: MonitorIcon },
  { id: "worktree", label: "New worktree", icon: TreePine },
  { id: "cloud", label: "Cloud", icon: Cloud },
];

export const composerPermissionOptions: ComposerPermissionOption[] = [
  { id: "default", label: "Default", desc: "Ask before risky" },
  { id: "full", label: "Full access", desc: "Auto-approve all" },
  { id: "plan-only", label: "Plan only", desc: "Suggest only" },
  { id: "read-only", label: "Read only", desc: "No writes" },
];

export const composerBranches = ["main", "feature/jwt-auth", "feature/rate-limit", "codex/desktop-gui-prompt-1", "experiment/ws-v2"];
