import type { ProviderData } from "./types";

export const initialProviders: ProviderData[] = [
  {
    name: "Anthropic", color: "tui-claude", status: "connected", apiKey: "sk-ant-api03-xxxxxxxxxxxxx",
    models: [
      { name: "Claude 4 Sonnet", ctx: "200k", reasoning: true, tier: "Standard", reasoningMode: "auto" },
      { name: "Claude 4 Opus", ctx: "200k", reasoning: true, tier: "Premium", reasoningMode: "auto" },
      { name: "Claude 4 Haiku", ctx: "200k", reasoning: false, tier: "Lite", reasoningMode: "off" },
    ],
  },
  {
    name: "OpenCode", color: "tui-opencode", status: "connected", apiKey: "sk-openai-xxxxxxxx",
    models: [
      { name: "GPT-4o", ctx: "128k", reasoning: false, tier: "Standard", reasoningMode: "off" },
      { name: "o3", ctx: "128k", reasoning: true, tier: "Premium", reasoningMode: "on" },
    ],
  },
  {
    name: "Codex CLI", color: "tui-codex", status: "error", apiKey: "sk-codex-expired",
    models: [
      { name: "codex-1", ctx: "192k", reasoning: true, tier: "Standard", reasoningMode: "auto" },
    ],
  },
  {
    name: "Gemini", color: "tui-gemini", status: "disconnected", apiKey: "",
    models: [
      { name: "Gemini 2.5 Pro", ctx: "1M", reasoning: true, tier: "Premium", reasoningMode: "auto" },
      { name: "Gemini 2.5 Flash", ctx: "1M", reasoning: false, tier: "Lite", reasoningMode: "off" },
    ],
  },
  {
    name: "Ollama", color: "tui-ollama", status: "connected", apiKey: "http://localhost:11434",
    models: [
      { name: "Llama 4 Scout", ctx: "128k", reasoning: false, tier: "Local", reasoningMode: "off" },
      { name: "Qwen 3", ctx: "32k", reasoning: false, tier: "Local", reasoningMode: "off" },
      { name: "DeepSeek R2", ctx: "64k", reasoning: true, tier: "Local", reasoningMode: "auto" },
    ],
  },
];
