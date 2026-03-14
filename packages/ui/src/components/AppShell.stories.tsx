import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "./AppShell";

const meta = {
  title: "Components/Shell/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
  args: {
    onOpenCommandPalette: fn(),
  },
  decorators: [
    (Story, context) => (
      <RouterFrame initialPath={(context.args as { _initialPath?: string })._initialPath ?? "/"}>
        <Story />
      </RouterFrame>
    ),
  ],
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <span className="text-sm">Main content area</span>
      </div>
    ),
  },
};

export const WithContent: Story = {
  args: {
    children: (
      <div className="flex h-full flex-col gap-4 p-6">
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex h-32 items-center justify-center rounded-lg border border-border bg-surface-0 text-sm text-muted-foreground"
            >
              Card {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

export const EmptyState: Story = {
  args: {
    children: (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <div className="text-4xl">🌙</div>
        <h2 className="text-base font-medium text-foreground">No sessions yet</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Start a new conversation to begin working with your AI agents.
        </p>
      </div>
    ),
  },
};

export const OnSessionRoute: Story = {
  args: {
    ...(Default.args ?? {}),
    _initialPath: "/session",
    children: (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Session workspace content
      </div>
    ),
  } as any,
};
