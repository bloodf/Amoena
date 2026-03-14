import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { MarketplaceScreen } from "./MarketplaceScreen";

const meta = {
  title: "Screens/Marketplace",
  render: () => (
    <RouterFrame initialPath="/marketplace">
      <AppShell>
        <MarketplaceScreen />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof MarketplaceScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
