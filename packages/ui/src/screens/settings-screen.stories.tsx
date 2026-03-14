import type { Meta, StoryObj } from "@storybook/react-vite";
import { RouterFrame } from "@/stories/router-frame";
import { AppShell } from "@/components/AppShell";
import { SettingsScreen } from "./SettingsScreen";

function SettingsAt({ path }: { path: string }) {
  return (
    <RouterFrame initialPath={path}>
      <AppShell>
        <SettingsScreen />
      </AppShell>
    </RouterFrame>
  );
}

const meta = {
  title: "Screens/Settings",
  component: SettingsScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SettingsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default – General tab */
export const Default: Story = {
  render: () => <SettingsAt path="/settings" />,
};

/** Editor settings tab */
export const EditorTab: Story = {
  name: "Editor Tab",
  render: () => <SettingsAt path="/settings/editor" />,
};

/** Terminal settings tab */
export const TerminalTab: Story = {
  name: "Terminal Tab",
  render: () => <SettingsAt path="/settings/terminal" />,
};

/** Session defaults tab */
export const SessionTab: Story = {
  name: "Session Tab",
  render: () => <SettingsAt path="/settings/session-settings" />,
};

/** Memory settings tab */
export const MemoryTab: Story = {
  name: "Memory Tab",
  render: () => <SettingsAt path="/settings/memory" />,
};

/** Permissions tab */
export const PermissionsTab: Story = {
  name: "Permissions Tab",
  render: () => <SettingsAt path="/settings/permissions" />,
};

/** Privacy tab (includes warning banner) */
export const PrivacyTab: Story = {
  name: "Privacy Tab",
  render: () => <SettingsAt path="/settings/privacy" />,
};

/** Advanced tab (includes warning banner) */
export const AdvancedTab: Story = {
  name: "Advanced Tab",
  render: () => <SettingsAt path="/settings/advanced" />,
};

/** Plugins tab (list with toggles and marketplace button) */
export const PluginsTab: Story = {
  name: "Plugins Tab",
  render: () => <SettingsAt path="/settings/plugins" />,
};

/** Themes tab */
export const ThemesTab: Story = {
  name: "Themes Tab",
  render: () => <SettingsAt path="/settings/themes" />,
};

/** Keybindings tab (shortcuts table) */
export const KeybindingsTab: Story = {
  name: "Keybindings Tab",
  render: () => <SettingsAt path="/settings/keybindings" />,
};

/** Notifications tab */
export const NotificationsTab: Story = {
  name: "Notifications Tab",
  render: () => <SettingsAt path="/settings/notifications" />,
};

/** Workspace / Git tab */
export const WorkspaceTab: Story = {
  name: "Workspace / Git Tab",
  render: () => <SettingsAt path="/settings/workspace" />,
};

/** Providers – embedded full-screen section */
export const ProvidersTab: Story = {
  name: "Providers Tab (Embedded)",
  render: () => <SettingsAt path="/settings/providers" />,
};

/** Remote Access – embedded full-screen section */
export const RemoteAccessTab: Story = {
  name: "Remote Access Tab (Embedded)",
  render: () => <SettingsAt path="/settings/remote" />,
};

/** Opinions – embedded full-screen section */
export const OpinionsTab: Story = {
  name: "Opinions Tab (Embedded)",
  render: () => <SettingsAt path="/settings/opinions" />,
};
