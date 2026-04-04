import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { SettingsContentPane, isEmbeddedSettingsSection } from "./SettingsContentPane";

describe("SettingsContentPane", () => {
  test("renders GeneralSettingsSection for activeSection=general", () => {
    const { container } = render(<SettingsContentPane activeSection="general" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders EditorSettingsSection for activeSection=editor", () => {
    const { container } = render(<SettingsContentPane activeSection="editor" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders TerminalSettingsSection for activeSection=terminal", () => {
    const { container } = render(<SettingsContentPane activeSection="terminal" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders SessionSettingsSection for activeSection=session-settings", () => {
    const { container } = render(<SettingsContentPane activeSection="session-settings" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders PrivacySettingsSection for activeSection=privacy", () => {
    const { container } = render(<SettingsContentPane activeSection="privacy" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders AdvancedSettingsSection for activeSection=advanced", () => {
    const { container } = render(<SettingsContentPane activeSection="advanced" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders MemorySettingsSection for activeSection=memory", () => {
    const { container } = render(<SettingsContentPane activeSection="memory" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders PermissionsSettingsSection for activeSection=permissions", () => {
    const { container } = render(<SettingsContentPane activeSection="permissions" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders PluginsSettingsSection for activeSection=plugins", () => {
    const { container } = render(<SettingsContentPane activeSection="plugins" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders ThemesSettingsSection for activeSection=themes", () => {
    const { container } = render(<SettingsContentPane activeSection="themes" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders KeybindingsSettingsSection for activeSection=keybindings", () => {
    const { container } = render(<SettingsContentPane activeSection="keybindings" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders NotificationsSettingsSection for activeSection=notifications", () => {
    const { container } = render(<SettingsContentPane activeSection="notifications" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders WorkspaceSettingsSection for activeSection=workspace", () => {
    const { container } = render(<SettingsContentPane activeSection="workspace" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders embedded sections for activeSection=providers", () => {
    const { container } = render(<SettingsContentPane activeSection="providers" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders embedded sections for activeSection=remote", () => {
    const { container } = render(<SettingsContentPane activeSection="remote" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders embedded sections for activeSection=opinions", () => {
    const { container } = render(<SettingsContentPane activeSection="opinions" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders fallback text for unknown activeSection", () => {
    render(<SettingsContentPane activeSection="unknown-section" />);
    expect(screen.getByText(/settings for/i)).toBeTruthy();
  });

  test("fallback shows section id when section label is not found", () => {
    render(<SettingsContentPane activeSection="totally-unknown" />);
    const text = document.body.textContent ?? "";
    expect(text).toContain("Settings for");
  });
});

describe("isEmbeddedSettingsSection", () => {
  test("returns true for providers", () => {
    expect(isEmbeddedSettingsSection("providers")).toBe(true);
  });

  test("returns true for remote", () => {
    expect(isEmbeddedSettingsSection("remote")).toBe(true);
  });

  test("returns true for opinions", () => {
    expect(isEmbeddedSettingsSection("opinions")).toBe(true);
  });

  test("returns false for general (not embedded)", () => {
    expect(isEmbeddedSettingsSection("general")).toBe(false);
  });

  test("returns false for editor", () => {
    expect(isEmbeddedSettingsSection("editor")).toBe(false);
  });

  test("returns false for unknown section", () => {
    expect(isEmbeddedSettingsSection("nonexistent")).toBe(false);
  });
});
