import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { ProviderSetupScreen } from "./ProviderSetupScreen";

const meta = {
  title: "Screens/Providers",
  render: () => (
    <RouterFrame initialPath="/providers">
      <AppShell>
        <ProviderSetupScreen />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof ProviderSetupScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
