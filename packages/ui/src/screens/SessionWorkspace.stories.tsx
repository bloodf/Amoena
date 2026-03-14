import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { RouterFrame } from "@/stories/router-frame";
import { SessionWorkspace } from "./SessionWorkspace";

const meta = {
  title: "Screens/Session Workspace/Components",
  component: SessionWorkspace,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SessionWorkspace>;

export default meta;
type Story = StoryObj<typeof meta>;

function withRouter(path: string, style?: React.CSSProperties) {
  return (Story: React.ComponentType) => (
    <RouterFrame initialPath={path}>
      <div style={style ?? { height: "100vh" }}>
        <Story />
      </div>
    </RouterFrame>
  );
}

export const Default: Story = {
  decorators: [withRouter("/session/1")],
};

export const FromNewSession: Story = {
  decorators: [withRouter("/session/new")],
};

export const CompactView: Story = {
  decorators: [withRouter("/session/1", { height: 500, width: 800 })],
};
