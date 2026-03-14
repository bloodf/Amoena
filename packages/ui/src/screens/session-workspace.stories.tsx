import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { SessionWorkspace } from "./SessionWorkspace";

const meta = {
  title: "Screens/Session Workspace/Full",
  parameters: { layout: "fullscreen" },
  render: () => (
    <RouterFrame initialPath="/session">
      <AppShell>
        <SessionWorkspace />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof SessionWorkspace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
