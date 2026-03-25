import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";

import {
  EditorSettingsSection,
  GeneralSettingsSection,
  TerminalSettingsSection,
} from "./appearance-sections";

describe("GeneralSettingsSection", () => {
  test("renders Appearance section title", () => {
    render(<GeneralSettingsSection />);
    expect(screen.getByText("Appearance")).toBeTruthy();
  });

  test("renders Theme setting", () => {
    render(<GeneralSettingsSection />);
    expect(screen.getByText("Theme")).toBeTruthy();
  });

  test("renders Language setting", () => {
    render(<GeneralSettingsSection />);
    expect(screen.getByText("Language")).toBeTruthy();
  });

  test("renders Behavior section", () => {
    render(<GeneralSettingsSection />);
    expect(screen.getByText("Behavior")).toBeTruthy();
  });

  test("renders startup behavior setting", () => {
    render(<GeneralSettingsSection />);
    expect(screen.getByText("Startup behavior")).toBeTruthy();
  });

  test("renders confirm before close toggle", () => {
    render(<GeneralSettingsSection />);
    expect(screen.getByText("Confirm before close")).toBeTruthy();
  });

  test("renders auto-save sessions toggle", () => {
    render(<GeneralSettingsSection />);
    expect(screen.getByText("Auto-save sessions")).toBeTruthy();
  });
});

describe("EditorSettingsSection", () => {
  test("renders Font section", () => {
    render(<EditorSettingsSection />);
    expect(screen.getByText("Font")).toBeTruthy();
  });

  test("renders font size setting", () => {
    render(<EditorSettingsSection />);
    expect(screen.getByText("Font size")).toBeTruthy();
  });

  test("renders Layout section", () => {
    render(<EditorSettingsSection />);
    expect(screen.getByText("Layout")).toBeTruthy();
  });

  test("renders word wrap toggle", () => {
    render(<EditorSettingsSection />);
    expect(screen.getByText("Word wrap")).toBeTruthy();
  });

  test("renders Diff section", () => {
    render(<EditorSettingsSection />);
    expect(screen.getByText("Diff")).toBeTruthy();
  });

  test("renders diff view setting", () => {
    render(<EditorSettingsSection />);
    expect(screen.getByText("Diff view")).toBeTruthy();
  });
});

describe("TerminalSettingsSection", () => {
  test("renders Shell section", () => {
    render(<TerminalSettingsSection />);
    expect(screen.getByText("Shell")).toBeTruthy();
  });

  test("renders default shell setting", () => {
    render(<TerminalSettingsSection />);
    expect(screen.getByText("Default shell")).toBeTruthy();
  });

  test("renders Behavior section", () => {
    render(<TerminalSettingsSection />);
    expect(screen.getByText("Behavior")).toBeTruthy();
  });

  test("renders scrollback lines setting", () => {
    render(<TerminalSettingsSection />);
    expect(screen.getByText("Scrollback lines")).toBeTruthy();
  });

  test("renders cursor style setting", () => {
    render(<TerminalSettingsSection />);
    expect(screen.getByText("Cursor style")).toBeTruthy();
  });
});
