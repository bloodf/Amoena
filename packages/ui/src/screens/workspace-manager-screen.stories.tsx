import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { WorkspaceManagerScreen } from "./WorkspaceManagerScreen";

const meta = {
  title: "Screens/Workspaces",
  render: () => (
    <RouterFrame initialPath="/workspaces">
      <AppShell>
        <WorkspaceManagerScreen />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof WorkspaceManagerScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
