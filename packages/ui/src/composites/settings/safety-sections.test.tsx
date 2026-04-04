import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { AdvancedSettingsSection, PrivacySettingsSection } from "./safety-sections";

describe("PrivacySettingsSection", () => {
  test("renders warning banner", () => {
    render(<PrivacySettingsSection />);
    expect(screen.getByText(/Changes to privacy settings take effect immediately/)).toBeTruthy();
  });

  test("renders Telemetry section", () => {
    render(<PrivacySettingsSection />);
    expect(screen.getByText("Telemetry")).toBeTruthy();
  });

  test("renders usage analytics toggle", () => {
    render(<PrivacySettingsSection />);
    expect(screen.getByText("Usage analytics")).toBeTruthy();
  });

  test("renders crash reporting toggle", () => {
    render(<PrivacySettingsSection />);
    expect(screen.getByText("Crash reporting")).toBeTruthy();
  });

  test("renders Data Handling section", () => {
    render(<PrivacySettingsSection />);
    expect(screen.getByText("Data Handling")).toBeTruthy();
  });

  test("renders auto-redact secrets toggle", () => {
    render(<PrivacySettingsSection />);
    expect(screen.getByText("Auto-redact secrets")).toBeTruthy();
  });

  test("renders Cleanup section with clear button", () => {
    render(<PrivacySettingsSection />);
    expect(screen.getByText("Cleanup")).toBeTruthy();
    expect(screen.getByText("Clear")).toBeTruthy();
  });

  test("renders data retention setting", () => {
    render(<PrivacySettingsSection />);
    expect(screen.getByText("Data retention")).toBeTruthy();
  });
});

describe("AdvancedSettingsSection", () => {
  test("renders warning banner", () => {
    render(<AdvancedSettingsSection />);
    expect(screen.getByText(/Advanced settings can affect stability/)).toBeTruthy();
  });

  test("renders Developer section", () => {
    render(<AdvancedSettingsSection />);
    expect(screen.getByText("Developer")).toBeTruthy();
  });

  test("renders developer mode toggle", () => {
    render(<AdvancedSettingsSection />);
    expect(screen.getByText("Developer mode")).toBeTruthy();
  });

  test("renders Experimental section", () => {
    render(<AdvancedSettingsSection />);
    expect(screen.getByText("Experimental")).toBeTruthy();
  });

  test("renders experimental features toggle", () => {
    render(<AdvancedSettingsSection />);
    expect(screen.getByText("Experimental features")).toBeTruthy();
  });

  test("renders Backend section", () => {
    render(<AdvancedSettingsSection />);
    expect(screen.getByText("Backend")).toBeTruthy();
  });

  test("renders runtime port setting", () => {
    render(<AdvancedSettingsSection />);
    expect(screen.getByText("Axum runtime port")).toBeTruthy();
  });

  test("renders max concurrent agents setting", () => {
    render(<AdvancedSettingsSection />);
    expect(screen.getByText("Max concurrent agents")).toBeTruthy();
  });
});
