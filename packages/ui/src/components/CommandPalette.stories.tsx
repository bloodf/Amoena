import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { RouterFrame } from "@/stories/router-frame";
import { CommandPalette } from "./CommandPalette";

const meta = {
  title: "Components/Shell/CommandPalette",
  component: CommandPalette,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    onClose: fn(),
  },
  decorators: [
    (Story) => (
      <RouterFrame initialPath="/">
        <div style={{ height: "100vh", position: "relative" }}>
          <Story />
        </div>
      </RouterFrame>
    ),
  ],
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Closed: Story = {
  args: {
    open: false,
  },
};

export const WithBackdrop: Story = {
  args: {
    open: true,
  },
  render: (args) => (
    <div style={{ height: "100vh", position: "relative" }}>
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <span className="text-sm">Background content visible behind overlay</span>
      </div>
      <CommandPalette {...args} />
    </div>
  ),
};
