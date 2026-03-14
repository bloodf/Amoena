import type { Meta, StoryObj } from "@storybook/react-vite";
import { SessionTimeline } from "./SessionTimeline";

const meta = {
  title: "Components/Session/SessionTimeline",
  component: SessionTimeline,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CompactHeight: Story = {
  decorators: [
    (Story) => (
      <div style={{ height: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export const WideLayout: Story = {
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", width: "100vw" }}>
        <Story />
      </div>
    ),
  ],
};
