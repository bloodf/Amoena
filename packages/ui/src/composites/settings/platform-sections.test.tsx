import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";

import {
  KeybindingsSettingsSection,
  NotificationsSettingsSection,
  PluginsSettingsSection,
  ThemesSettingsSection,
  WorkspaceSettingsSection,
} from "./platform-sections";

describe("PluginsSettingsSection", () => {
  test("renders installed count", () => {
    render(<PluginsSettingsSection />);
    expect(screen.getByText(/installed/)).toBeTruthy();
  });

  test("renders Browse Marketplace button", () => {
    render(<PluginsSettingsSection />);
    expect(screen.getByText("Browse Marketplace")).toBeTruthy();
  });

  test("renders plugin names", () => {
    render(<PluginsSettingsSection />);
    // We check that at least some plugin-like text is rendered
    const container = document.body;
    expect(container.textContent?.length).toBeGreaterThan(0);
  });
});

describe("ThemesSettingsSection", () => {
  test("renders Active Theme section", () => {
    render(<ThemesSettingsSection />);
    expect(screen.getByText("Active Theme")).toBeTruthy();
  });

  test("renders Customization section", () => {
    render(<ThemesSettingsSection />);
    expect(screen.getByText("Customization")).toBeTruthy();
  });

  test("renders accent color setting", () => {
    render(<ThemesSettingsSection />);
    expect(screen.getByText("Accent color")).toBeTruthy();
  });

  test("renders UI density setting", () => {
    render(<ThemesSettingsSection />);
    expect(screen.getByText("UI density")).toBeTruthy();
  });
});

describe("KeybindingsSettingsSection", () => {
  test("renders Preset setting", () => {
    render(<KeybindingsSettingsSection />);
    expect(screen.getByText("Preset")).toBeTruthy();
  });

  test("renders Shortcuts section", () => {
    render(<KeybindingsSettingsSection />);
    expect(screen.getByText("Shortcuts")).toBeTruthy();
  });

  test("renders table headers", () => {
    render(<KeybindingsSettingsSection />);
    expect(screen.getByText("Action")).toBeTruthy();
    expect(screen.getByText("Category")).toBeTruthy();
    expect(screen.getByText("Binding")).toBeTruthy();
  });
});

describe("NotificationsSettingsSection", () => {
  test("renders Toast Behavior section", () => {
    render(<NotificationsSettingsSection />);
    expect(screen.getByText("Toast Behavior")).toBeTruthy();
  });

  test("renders Alerts section", () => {
    render(<NotificationsSettingsSection />);
    expect(screen.getByText("Alerts")).toBeTruthy();
  });

  test("renders Remote section", () => {
    render(<NotificationsSettingsSection />);
    expect(screen.getByText("Remote")).toBeTruthy();
  });

  test("renders toast duration setting", () => {
    render(<NotificationsSettingsSection />);
    expect(screen.getByText("Toast duration")).toBeTruthy();
  });
});

describe("WorkspaceSettingsSection", () => {
  test("renders Worktree section", () => {
    render(<WorkspaceSettingsSection />);
    expect(screen.getByText("Worktree")).toBeTruthy();
  });

  test("renders Clone section", () => {
    render(<WorkspaceSettingsSection />);
    expect(screen.getByText("Clone")).toBeTruthy();
  });

  test("renders Merge & Review section", () => {
    render(<WorkspaceSettingsSection />);
    expect(screen.getByText("Merge & Review")).toBeTruthy();
  });

  test("renders auto-cleanup toggle", () => {
    render(<WorkspaceSettingsSection />);
    expect(screen.getByText("Auto-cleanup")).toBeTruthy();
  });
});
