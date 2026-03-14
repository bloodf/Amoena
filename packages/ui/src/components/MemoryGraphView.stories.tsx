import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { MemoryGraphView } from "./MemoryGraphView";

const meta: Meta<typeof MemoryGraphView> = {
  title: "Components/Screens/MemoryGraphView",
  component: MemoryGraphView,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof MemoryGraphView>;

export const Default: Story = {
  args: {
    onSelectNode: fn(),
  },
};

export const WithoutCallback: Story = {
  args: {},
};
