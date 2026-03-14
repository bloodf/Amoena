import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";

import {
  GeneralSettingsSection,
  EditorSettingsSection,
  TerminalSettingsSection,
} from "./appearance-sections";
import {
  SessionSettingsSection,
  MemorySettingsSection,
  PermissionsSettingsSection,
} from "./session-sections";
import { PrivacySettingsSection, AdvancedSettingsSection } from "./safety-sections";
import {
  PluginsSettingsSection,
  ThemesSettingsSection,
  KeybindingsSettingsSection,
  NotificationsSettingsSection,
  WorkspaceSettingsSection,
} from "./platform-sections";
import { SettingsSidebar } from "./SettingsSidebar";
import { SettingsContentPane } from "./SettingsContentPane";

// ---------------------------------------------------------------------------
// Meta – all settings sub-component stories live under one Storybook node
// ---------------------------------------------------------------------------
const meta = {
  title: "Composites/Settings",
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[520px] p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ═══════════════════════════════════════════════════════════════════════════
// Appearance – General / Editor / Terminal
// ═══════════════════════════════════════════════════════════════════════════

export const GeneralSettings: Story = {
  name: "General Settings",
  render: () => <GeneralSettingsSection />,
};

export const EditorSettings: Story = {
  name: "Editor Settings",
  render: () => <EditorSettingsSection />,
};

export const TerminalSettings: Story = {
  name: "Terminal Settings",
  render: () => <TerminalSettingsSection />,
};

// ═══════════════════════════════════════════════════════════════════════════
// Session – Session / Memory / Permissions
// ═══════════════════════════════════════════════════════════════════════════

export const SessionSettings: Story = {
  name: "Session Settings",
  render: () => <SessionSettingsSection />,
};

export const MemorySettings: Story = {
  name: "Memory Settings",
  render: () => <MemorySettingsSection />,
};

export const PermissionsSettings: Story = {
  name: "Permissions Settings",
  render: () => <PermissionsSettingsSection />,
};

// ═══════════════════════════════════════════════════════════════════════════
// Safety – Privacy / Advanced
// ═══════════════════════════════════════════════════════════════════════════

export const PrivacySettings: Story = {
  name: "Privacy Settings",
  render: () => <PrivacySettingsSection />,
};

export const AdvancedSettings: Story = {
  name: "Advanced Settings",
  render: () => <AdvancedSettingsSection />,
};

// ═══════════════════════════════════════════════════════════════════════════
// Platform – Plugins / Themes / Keybindings / Notifications / Workspace
// ═══════════════════════════════════════════════════════════════════════════

export const PluginsSettings: Story = {
  name: "Plugins Settings",
  render: () => <PluginsSettingsSection />,
};

export const ThemesSettings: Story = {
  name: "Themes Settings",
  render: () => <ThemesSettingsSection />,
};

export const KeybindingsSettings: Story = {
  name: "Keybindings Settings",
  render: () => <KeybindingsSettingsSection />,
};

export const NotificationsSettings: Story = {
  name: "Notifications Settings",
  render: () => <NotificationsSettingsSection />,
};

export const WorkspaceSettings: Story = {
  name: "Workspace / Git Settings",
  render: () => <WorkspaceSettingsSection />,
};

// ═══════════════════════════════════════════════════════════════════════════
// Sidebar
// ═══════════════════════════════════════════════════════════════════════════

export const SidebarGeneralActive: Story = {
  name: "Sidebar – General Active",
  decorators: [
    (Story) => (
      <div className="w-56 py-4">
        <Story />
      </div>
    ),
  ],
  render: () => <SettingsSidebar activeSection="general" onSelect={fn()} />,
};

export const SidebarPrivacyActive: Story = {
  name: "Sidebar – Privacy Active",
  decorators: [
    (Story) => (
      <div className="w-56 py-4">
        <Story />
      </div>
    ),
  ],
  render: () => <SettingsSidebar activeSection="privacy" onSelect={fn()} />,
};

export const SidebarPluginsActive: Story = {
  name: "Sidebar – Plugins Active",
  decorators: [
    (Story) => (
      <div className="w-56 py-4">
        <Story />
      </div>
    ),
  ],
  render: () => <SettingsSidebar activeSection="plugins" onSelect={fn()} />,
};

// ═══════════════════════════════════════════════════════════════════════════
// Content Pane – renders the correct section by id
// ═══════════════════════════════════════════════════════════════════════════

export const ContentPaneGeneral: Story = {
  name: "Content Pane – General",
  render: () => <SettingsContentPane activeSection="general" />,
};

export const ContentPaneEditor: Story = {
  name: "Content Pane – Editor",
  render: () => <SettingsContentPane activeSection="editor" />,
};

export const ContentPanePlugins: Story = {
  name: "Content Pane – Plugins",
  render: () => <SettingsContentPane activeSection="plugins" />,
};

export const ContentPaneKeybindings: Story = {
  name: "Content Pane – Keybindings",
  render: () => <SettingsContentPane activeSection="keybindings" />,
};

export const ContentPaneUnknownSection: Story = {
  name: "Content Pane – Unknown Section",
  render: () => <SettingsContentPane activeSection="nonexistent" />,
};
