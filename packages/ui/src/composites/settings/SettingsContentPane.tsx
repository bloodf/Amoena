import type { ReactNode } from "react";
import { ProviderSetupScreen } from '../../screens/ProviderSetupScreen.tsx';
import { RemoteAccessScreen } from '../../screens/RemoteAccessScreen.tsx';
import { OpinionsScreen } from '../../screens/OpinionsScreen.tsx';
import {
  AdvancedSettingsSection,
  EditorSettingsSection,
  GeneralSettingsSection,
  KeybindingsSettingsSection,
  MemorySettingsSection,
  NotificationsSettingsSection,
  PermissionsSettingsSection,
  PluginsSettingsSection,
  PrivacySettingsSection,
  SessionSettingsSection,
  TerminalSettingsSection,
  ThemesSettingsSection,
  WorkspaceSettingsSection,
} from "./sections";
import { settingsSections } from "./data";

const settingsContentMap: Record<string, { embedded?: boolean; render: () => ReactNode }> = {
  general: { render: () => <GeneralSettingsSection /> },
  editor: { render: () => <EditorSettingsSection /> },
  terminal: { render: () => <TerminalSettingsSection /> },
  "session-settings": { render: () => <SessionSettingsSection /> },
  privacy: { render: () => <PrivacySettingsSection /> },
  advanced: { render: () => <AdvancedSettingsSection /> },
  providers: { embedded: true, render: () => <ProviderSetupScreen /> },
  remote: { embedded: true, render: () => <RemoteAccessScreen /> },
  opinions: { embedded: true, render: () => <OpinionsScreen /> },
  memory: { render: () => <MemorySettingsSection /> },
  permissions: { render: () => <PermissionsSettingsSection /> },
  plugins: { render: () => <PluginsSettingsSection /> },
  themes: { render: () => <ThemesSettingsSection /> },
  keybindings: { render: () => <KeybindingsSettingsSection /> },
  notifications: { render: () => <NotificationsSettingsSection /> },
  workspace: { render: () => <WorkspaceSettingsSection /> },
};

export function SettingsContentPane({ activeSection }: { activeSection: string }) {
  const content = settingsContentMap[activeSection];
  if (content) return content.render();

  return (
    <div className="text-[13px] text-muted-foreground">
      Settings for {settingsSections.find((section) => section.id === activeSection)?.label} will appear here.
    </div>
  );
}

export function isEmbeddedSettingsSection(activeSection: string) {
  return Boolean(settingsContentMap[activeSection]?.embedded);
}
