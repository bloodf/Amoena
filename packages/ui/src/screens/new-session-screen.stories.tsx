import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { NewSessionScreen } from "./NewSessionScreen";

const meta = {
  title: "Screens/New Session",
  parameters: { layout: "fullscreen" },
  render: () => (
    <RouterFrame initialPath="/session/new">
      <AppShell>
        <NewSessionScreen />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof NewSessionScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

