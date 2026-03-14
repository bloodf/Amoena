import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { RemoteAccessScreen } from "./RemoteAccessScreen";

const meta = {
  title: "Screens/Remote Access",
  render: () => (
    <RouterFrame initialPath="/remote">
      <AppShell>
        <RemoteAccessScreen />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof RemoteAccessScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
