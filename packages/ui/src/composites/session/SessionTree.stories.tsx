import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { SessionTree } from "./SessionTree";

const meta = {
  title: "Composites/Session/SessionTree",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <SessionTree
        tree={{
          session: { id: "root-session", sessionMode: "native", tuiType: "native", workingDir: "/home/user/project", status: "running", createdAt: "2026-01-01T00:00:00Z" },
          children: [
            {
              session: { id: "child-1", sessionMode: "native", tuiType: "native", workingDir: "/home/user/project", status: "running", createdAt: "2026-01-01T00:01:00Z" },
              children: [],
            },
            {
              session: { id: "child-2", sessionMode: "wrapper", tuiType: "native", workingDir: "/home/user/project", status: "idle", createdAt: "2026-01-01T00:02:00Z" },
              children: [
                {
                  session: { id: "grandchild-1", sessionMode: "native", tuiType: "native", workingDir: "/home/user/project", status: "idle", createdAt: "2026-01-01T00:03:00Z" },
                  children: [],
                },
              ],
            },
          ],
        }}
        activeSessionId="child-1"
        onSelectSession={fn()}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <SessionTree
        tree={null}
        onSelectSession={fn()}
      />
    </div>
  ),
};

export const SingleNode: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <SessionTree
        tree={{
          session: { id: "only-session", sessionMode: "native", tuiType: "native", workingDir: "/home/user/project", status: "running", createdAt: "2026-01-01T00:00:00Z" },
          children: [],
        }}
        activeSessionId="only-session"
        onSelectSession={fn()}
      />
    </div>
  ),
};
