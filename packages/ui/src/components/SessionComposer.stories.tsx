import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { SessionComposer } from "./SessionComposer";

const meta = {
  title: "Components/Session/SessionComposer",
  component: SessionComposer,
  parameters: { layout: "fullscreen" },
  args: {
    provider: "opencode",
    session: {
      provider: "opencode",
      permission: "default",
      continueIn: "local" as const,
      branch: "main",
    },
    onUpdateSession: fn(),
    externalMessage: "",
    onExternalMessageConsumed: fn(),
  },
  decorators: [
    (Story) => (
      <div className="flex flex-col justify-end" style={{ height: 300 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ClaudeProvider: Story = {
  args: {
    provider: "claude",
    session: {
      provider: "claude",
      permission: "full",
      continueIn: "local" as const,
      branch: "feature/jwt-auth",
    },
  },
};

export const GeminiProvider: Story = {
  args: {
    provider: "gemini",
    session: {
      provider: "gemini",
      permission: "plan-only",
      continueIn: "cloud" as const,
      branch: "experiment/ws-v2",
    },
  },
};

export const WorktreeMode: Story = {
  args: {
    provider: "codex",
    session: {
      provider: "codex",
      permission: "default",
      continueIn: "worktree" as const,
      branch: "codex/desktop-gui-prompt-1",
    },
  },
};

export const WithExternalMessage: Story = {
  args: {
    provider: "claude",
    externalMessage: "Refactor the authentication module to use JWT tokens",
    session: {
      provider: "claude",
      permission: "default",
      continueIn: "local" as const,
      branch: "main",
    },
  },
};

export const NoSession: Story = {
  args: {
    provider: "opencode",
    session: undefined,
  },
};

export const FullAccessPermission: Story = {
  args: {
    provider: "opencode",
    session: {
      provider: "opencode",
      permission: "full",
      continueIn: "local" as const,
      branch: "main",
    },
  },
};
