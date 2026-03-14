import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { AgentManagementScreen } from "./AgentManagementScreen";

const meta = {
  title: "Screens/Agents",
  render: () => (
    <RouterFrame initialPath="/agents">
      <AppShell>
        <AgentManagementScreen />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof AgentManagementScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
