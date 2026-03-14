import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { KanbanBoard } from "./KanbanBoard";

const meta = {
  title: "Screens/Task Board",
  render: () => (
    <RouterFrame initialPath="/tasks">
      <AppShell>
        <KanbanBoard />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof KanbanBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
