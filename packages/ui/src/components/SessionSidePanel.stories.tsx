import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { SessionSidePanel } from "./SessionSidePanel";

const meta = {
  title: "Components/Session/SessionSidePanel",
  component: SessionSidePanel,
  parameters: { layout: "fullscreen" },
  args: {
    onOpenFile: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320, height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionSidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NarrowPanel: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 240, height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export const WidePanel: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 480, height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};
