import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { AgentTeamsScreen } from "./AgentTeamsScreen";

const meta = {
  title: "Screens/Agent Teams",
  render: () => (
    <RouterFrame initialPath="/agents/teams">
      <AppShell>
        <AgentTeamsScreen />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof AgentTeamsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
