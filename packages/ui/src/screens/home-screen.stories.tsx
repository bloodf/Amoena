import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { HomeScreen } from "./HomeScreen";

const meta = {
  title: "Screens/Home",
  render: () => (
    <RouterFrame initialPath="/">
      <AppShell>
        <HomeScreen />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof HomeScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
