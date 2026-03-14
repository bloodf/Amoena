import type { Meta, StoryObj } from "@storybook/react-vite";
import { TitleBar } from "./TitleBar";

const meta = {
  title: "Components/Shell/TitleBar",
  component: TitleBar,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ width: "100%", maxWidth: 960 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TitleBar>;

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

export const WideViewport: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 1440 }}>
        <Story />
      </div>
    ),
  ],
};
