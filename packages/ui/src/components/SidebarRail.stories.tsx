import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { RouterFrame } from "@/stories/router-frame";
import { SidebarRail } from "./SidebarRail";

const meta = {
  title: "Components/Shell/SidebarRail",
  component: SidebarRail,
  parameters: { layout: "fullscreen" },
  args: {
    onOpenCommandPalette: fn(),
    onNavigate: fn(),
  },
  decorators: [
    (Story, context) => (
      <RouterFrame initialPath={(context.args as { _initialPath?: string })._initialPath ?? "/"}>
        <div style={{ height: "100vh" }}>
          <Story />
        </div>
      </RouterFrame>
    ),
  ],
} satisfies Meta<typeof SidebarRail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActiveRoute: Story = {
  args: { _initialPath: "/session" } as any,
};

export const WithSettingsActive: Story = {
  args: { _initialPath: "/settings" } as any,
};

export const WithMemoryActive: Story = {
  args: { _initialPath: "/memory" } as any,
};
