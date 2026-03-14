import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { ExtensionPanel } from "./ExtensionPanel";

const meta = {
  title: "Composites/Extensions/ExtensionPanel",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithExtensions: Story = {
  render: () => (
    <div style={{ width: 560 }}>
      <ExtensionPanel
        extensions={[
          { id: "ext-1", name: "Git Helper", version: "1.0.0", publisher: "Lunaria", description: "Advanced git integration", enabled: true, permissions: ["fs.read", "fs.write"] },
          { id: "ext-2", name: "Code Formatter", version: "0.5.0", description: "Auto-format code on save", enabled: false, permissions: ["fs.write"] },
        ]}
        onToggle={fn()}
        onUninstall={fn()}
        onInstall={fn()}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ width: 560 }}>
      <ExtensionPanel
        extensions={[]}
        onToggle={fn()}
        onUninstall={fn()}
        onInstall={fn()}
      />
    </div>
  ),
};

export const ManyExtensions: Story = {
  render: () => (
    <div style={{ width: 560 }}>
      <ExtensionPanel
        extensions={[
          { id: "ext-1", name: "Git Helper", version: "1.0.0", publisher: "Lunaria", description: "Advanced git integration for seamless version control", enabled: true, permissions: ["fs.read", "fs.write"] },
          { id: "ext-2", name: "Code Formatter", version: "0.5.0", publisher: "Community", description: "Auto-format code on save using prettier", enabled: false, permissions: ["fs.write"] },
          { id: "ext-3", name: "Linter Pro", version: "2.1.3", description: "ESLint integration with real-time diagnostics", enabled: true, permissions: ["fs.read"] },
          { id: "ext-4", name: "Theme Studio", version: "1.2.0", publisher: "Lunaria", description: "Create and manage custom themes", enabled: true, permissions: [] },
        ]}
        onToggle={fn()}
        onUninstall={fn()}
        onInstall={fn()}
      />
    </div>
  ),
};
