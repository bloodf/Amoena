import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { UsageScreen } from "./UsageScreen";

const meta = {
  title: "Screens/Usage",
  parameters: { layout: "fullscreen" },
  render: () => (
    <RouterFrame initialPath="/usage">
      <AppShell>
        <UsageScreen />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof UsageScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

