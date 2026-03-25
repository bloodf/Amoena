import { Bot, Cloud, Cpu, GitBranch, Monitor, Sparkles, Terminal } from "lucide-react";
import type { LabeledOption, ProviderOption, SessionOptionCard } from "./types";

export const newSessionWorkTargets: SessionOptionCard<"local" | "worktree" | "cloud">[] = [
  { id: "local", label: "Local Project", desc: "Work directly in the current project", icon: Monitor },
  { id: "worktree", label: "New Worktree", desc: "Isolated branch with separate working tree", icon: GitBranch },
  { id: "cloud", label: "Cloud", desc: "Remote cloud environment", icon: Cloud },
];

export const newSessionProviders: ProviderOption[] = [
  {
    id: "amoena",
    label: "Amoena AI",
    desc: "Built-in intelligent assistant — native to your workspace with full context awareness",
    models: ["Amoena Pro", "Amoena Fast"],
    featured: true,
    color: "primary",
    icon: Sparkles,
  },
  {
    id: "claude",
    label: "Claude Code",
    desc: "Anthropic's coding assistant — deep reasoning and precise edits",
    models: ["Claude 4 Sonnet", "Claude 4 Opus", "Claude 3.5 Sonnet"],
    featured: false,
    color: "orange",
    icon: Bot,
  },
  {
    id: "opencode",
    label: "OpenCode",
    desc: "OpenAI's agent framework — multi-agent orchestration",
    models: ["GPT-5.4", "GPT-5.3-Codex", "GPT-5.2"],
    featured: false,
    color: "emerald",
    icon: Terminal,
  },
  {
    id: "codex",
    label: "Codex CLI",
    desc: "OpenAI's dedicated coding model — fast iteration loops",
    models: ["Codex G-4.1", "Codex G-4", "Codex G-3.5"],
    featured: false,
    color: "blue",
    icon: Cpu,
  },
  {
    id: "gemini",
    label: "Gemini CLI",
    desc: "Google's AI coding assistant — broad context window",
    models: ["Gemini 2.5 Pro", "Gemini 2.5 Flash"],
    featured: false,
    color: "purple",
    icon: Sparkles,
  },
  {
    id: "ollama",
    label: "Ollama",
    desc: "Run open-source models locally — full privacy, zero API costs",
    models: ["Llama 4 Scout", "Qwen 3", "DeepSeek R2"],
    featured: false,
    color: "neutral",
    icon: Cpu,
  },
] as const;

export const newSessionReasoningDepths: LabeledOption[] = [
  { id: "low", label: "Low", desc: "Minimal" },
  { id: "medium", label: "Medium", desc: "Balanced" },
  { id: "high", label: "High", desc: "Deep" },
  { id: "extra-high", label: "Extra High", desc: "Maximum" },
];

export const newSessionPermissionPresets: LabeledOption[] = [
  { id: "default", label: "Default", desc: "Ask before risky actions" },
  { id: "full", label: "Full Access", desc: "Auto-approve everything" },
  { id: "plan-only", label: "Plan Only", desc: "Suggest, never apply" },
  { id: "read-only", label: "Read Only", desc: "Can read, no writes" },
];
