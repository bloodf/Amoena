import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { EmptySessionState } from "./EmptySessionState";

const meta = {
  title: "Components/Session/EmptySessionState",
  component: EmptySessionState,
  parameters: { layout: "fullscreen" },
  args: {
    provider: "claude",
    model: "Claude 4 Sonnet",
    sessionName: "JWT Auth Refactor",
    onSuggestionClick: fn(),
  },
} satisfies Meta<typeof EmptySessionState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ClaudeProvider: Story = {
  args: {
    provider: "claude",
    model: "Claude 4 Sonnet",
    sessionName: "Code Review Session",
  },
};

export const OpenCodeProvider: Story = {
  args: {
    provider: "opencode",
    model: "GPT-5.4",
    sessionName: "Rate Limiter Design",
  },
};

export const GeminiProvider: Story = {
  args: {
    provider: "gemini",
    model: "Gemini 2.5 Pro",
    sessionName: "API Architecture",
  },
};

export const CodexProvider: Story = {
  args: {
    provider: "codex",
    model: "Codex Ultra",
    sessionName: "Bug Fix Sprint",
  },
};

export const AmoenaProvider: Story = {
  args: {
    provider: "amoena",
    model: "Amoena Pro",
    sessionName: "New Feature Development",
  },
};

export const OllamaProvider: Story = {
  args: {
    provider: "ollama",
    model: "Llama 4 Scout",
    sessionName: "Local Development",
  },
};

export const UnknownProvider: Story = {
  args: {
    provider: "unknown-provider",
    model: "Custom Model",
    sessionName: "Experimental Session",
  },
};
