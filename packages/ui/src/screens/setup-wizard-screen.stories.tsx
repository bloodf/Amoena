import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { SetupWizardScreen } from "./SetupWizardScreen";

const meta = {
  title: "Screens/Setup Wizard",
  render: () => (
    <RouterFrame initialPath="/setup">
      <AppShell>
        <SetupWizardScreen />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof SetupWizardScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
