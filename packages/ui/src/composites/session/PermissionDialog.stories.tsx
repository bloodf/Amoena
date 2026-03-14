import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { PermissionDialog } from "./PermissionDialog";

const meta = {
  title: "Composites/Session/PermissionDialog",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <PermissionDialog
      request={{
        requestId: "req-1",
        toolName: "file_write",
        input: { path: "/src/app.ts", content: "console.log('hello')" },
        sessionId: "session-1",
      }}
      onApprove={fn()}
      onDeny={fn()}
    />
  ),
};

export const NoRequest: Story = {
  render: () => (
    <PermissionDialog
      request={null}
      onApprove={fn()}
      onDeny={fn()}
    />
  ),
};

export const BashCommand: Story = {
  render: () => (
    <PermissionDialog
      request={{
        requestId: "req-2",
        toolName: "bash",
        input: { command: "rm -rf /tmp/cache", timeout: 30000 },
        sessionId: "session-1",
      }}
      onApprove={fn()}
      onDeny={fn()}
    />
  ),
};
