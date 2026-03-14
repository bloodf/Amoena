import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusBar } from "./StatusBar";

const meta = {
  title: "Components/Shell/StatusBar",
  component: StatusBar,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ width: "100%", maxWidth: 1200 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NarrowViewport: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export const FullWidth: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: "100%" }}>
        <Story />
      </div>
    ),
  ],
};
