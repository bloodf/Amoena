import type { Meta, StoryObj } from "@storybook/react-vite";
import { MessageQueue } from "./MessageQueue";

const meta = {
  title: "Components/Session/MessageQueue",
  component: MessageQueue,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 600 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MessageQueue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NarrowWidth: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export const WideWidth: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 900 }}>
        <Story />
      </div>
    ),
  ],
};
