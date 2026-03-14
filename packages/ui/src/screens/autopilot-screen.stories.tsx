import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { AutopilotScreen } from "./AutopilotScreen";

const meta = {
  title: "Screens/Autopilot",
  render: () => (
    <RouterFrame initialPath="/autopilot">
      <AppShell>
        <AutopilotScreen />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof AutopilotScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
