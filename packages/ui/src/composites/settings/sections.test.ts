import { describe, expect, test } from "bun:test";

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

describe("settings sections barrel", () => {
  test("re-exports all section components", () => {
    expect(GeneralSettingsSection).toBeTruthy();
    expect(EditorSettingsSection).toBeTruthy();
    expect(TerminalSettingsSection).toBeTruthy();
    expect(SessionSettingsSection).toBeTruthy();
    expect(MemorySettingsSection).toBeTruthy();
    expect(PermissionsSettingsSection).toBeTruthy();
    expect(PrivacySettingsSection).toBeTruthy();
    expect(AdvancedSettingsSection).toBeTruthy();
    expect(PluginsSettingsSection).toBeTruthy();
    expect(ThemesSettingsSection).toBeTruthy();
    expect(KeybindingsSettingsSection).toBeTruthy();
    expect(NotificationsSettingsSection).toBeTruthy();
    expect(WorkspaceSettingsSection).toBeTruthy();
  });

  test("all exports are functions (React components)", () => {
    const components = [
      GeneralSettingsSection,
      EditorSettingsSection,
      TerminalSettingsSection,
      SessionSettingsSection,
      MemorySettingsSection,
      PermissionsSettingsSection,
      PrivacySettingsSection,
      AdvancedSettingsSection,
      PluginsSettingsSection,
      ThemesSettingsSection,
      KeybindingsSettingsSection,
      NotificationsSettingsSection,
      WorkspaceSettingsSection,
    ];
    for (const c of components) {
      expect(typeof c).toBe("function");
    }
  });

  test("exports are distinct (no duplicate references)", () => {
    const components = [
      GeneralSettingsSection,
      EditorSettingsSection,
      TerminalSettingsSection,
      SessionSettingsSection,
      MemorySettingsSection,
      PermissionsSettingsSection,
      PrivacySettingsSection,
      AdvancedSettingsSection,
      PluginsSettingsSection,
      ThemesSettingsSection,
      KeybindingsSettingsSection,
      NotificationsSettingsSection,
      WorkspaceSettingsSection,
    ];
    const unique = new Set(components);
    expect(unique.size).toBe(components.length);
  });
});
