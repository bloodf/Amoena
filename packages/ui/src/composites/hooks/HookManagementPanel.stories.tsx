import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { HookManagementPanel } from "./HookManagementPanel";

const meta = {
  title: "Composites/Hooks/HookManagementPanel",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHooks: Story = {
  render: () => (
    <div style={{ width: 600 }}>
      <HookManagementPanel
        hooks={[
          { id: "h1", eventName: "SessionStart", handlerType: "command", handlerConfig: { command: "echo session started" }, enabled: true, priority: 100, timeoutMs: 30000 },
          { id: "h2", eventName: "PreToolUse", handlerType: "http", handlerConfig: { url: "https://hooks.example.com/pre" }, enabled: true, priority: 50, timeoutMs: 10000 },
          { id: "h3", eventName: "ErrorUnhandled", handlerType: "prompt", handlerConfig: { text: "An error occurred" }, enabled: false, priority: 200, timeoutMs: 5000 },
        ]}
        onDelete={fn()}
        onFire={fn()}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ width: 600 }}>
      <HookManagementPanel
        hooks={[]}
        onDelete={fn()}
        onFire={fn()}
      />
    </div>
  ),
};

export const AgentHandler: Story = {
  render: () => (
    <div style={{ width: 600 }}>
      <HookManagementPanel
        hooks={[
          { id: "h1", eventName: "SubagentStart", handlerType: "agent", handlerConfig: { agentType: "verifier" }, enabled: true, priority: 100, timeoutMs: 60000 },
          { id: "h2", eventName: "PostToolUse", handlerType: "command", handlerConfig: { command: "bun run lint" }, enabled: true, priority: 75, timeoutMs: 15000 },
        ]}
        onDelete={fn()}
        onFire={fn()}
      />
    </div>
  ),
};
