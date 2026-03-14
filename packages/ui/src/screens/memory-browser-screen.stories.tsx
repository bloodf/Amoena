import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { MemoryBrowserScreen } from "./MemoryBrowserScreen";

const meta = {
  title: "Screens/Memory",
  render: () => (
    <RouterFrame initialPath="/memory">
      <AppShell>
        <MemoryBrowserScreen />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof MemoryBrowserScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
