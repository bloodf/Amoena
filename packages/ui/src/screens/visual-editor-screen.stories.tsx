import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { VisualEditorScreen } from "./VisualEditorScreen";

const meta = {
  title: "Screens/Visual Editor",
  render: () => (
    <RouterFrame initialPath="/visual-editor">
      <AppShell>
        <VisualEditorScreen />
      </AppShell>
    </RouterFrame>
  ),
} satisfies Meta<typeof VisualEditorScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
