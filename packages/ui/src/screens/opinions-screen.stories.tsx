import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { OpinionsScreen } from "./OpinionsScreen";

const meta = {
  title: "Screens/Opinions",
  render: () => (
    <RouterFrame initialPath="/opinions">
      <AppShell>
        <OpinionsScreen />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof OpinionsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
