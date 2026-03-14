import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { TerminalPanel } from "./TerminalPanel";

const meta = {
  title: "Components/Session/TerminalPanel",
  component: TerminalPanel,
  parameters: { layout: "fullscreen" },
  args: {
    onClose: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: 300 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TerminalPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ShortHeight: Story = {
  decorators: [
    (Story) => (
      <div style={{ height: 150 }}>
        <Story />
      </div>
    ),
  ],
};

export const TallHeight: Story = {
  decorators: [
    (Story) => (
      <div style={{ height: 500 }}>
        <Story />
      </div>
    ),
  ],
};
