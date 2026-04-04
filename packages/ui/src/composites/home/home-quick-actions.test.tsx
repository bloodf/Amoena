import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { HomeQuickActions } from "./HomeQuickActions";

function makeProps(overrides: Partial<Parameters<typeof HomeQuickActions>[0]> = {}) {
  return {
    onContinueSession: vi.fn(() => {}),
    onOpenWorkspace: vi.fn(() => {}),
    onStartAutopilot: vi.fn(() => {}),
    onProviderSetup: vi.fn(() => {}),
    onSetupWizard: vi.fn(() => {}),
    ...overrides,
  };
}

describe("HomeQuickActions", () => {
  test("renders all action buttons", () => {
    render(<HomeQuickActions {...makeProps()} />);
    expect(screen.getByText("Continue Session")).toBeTruthy();
    expect(screen.getByText("Open Workspace")).toBeTruthy();
    expect(screen.getByText("Start Autopilot")).toBeTruthy();
    expect(screen.getByText("Provider Setup")).toBeTruthy();
    expect(screen.getByText("Setup Wizard")).toBeTruthy();
  });

  test("calls onContinueSession when clicked", () => {
    const onContinueSession = vi.fn(() => {});
    render(<HomeQuickActions {...makeProps({ onContinueSession })} />);
    fireEvent.click(screen.getByText("Continue Session"));
    expect(onContinueSession).toHaveBeenCalled();
  });

  test("calls onOpenWorkspace when clicked", () => {
    const onOpenWorkspace = vi.fn(() => {});
    render(<HomeQuickActions {...makeProps({ onOpenWorkspace })} />);
    fireEvent.click(screen.getByText("Open Workspace"));
    expect(onOpenWorkspace).toHaveBeenCalled();
  });

  test("calls onStartAutopilot when clicked", () => {
    const onStartAutopilot = vi.fn(() => {});
    render(<HomeQuickActions {...makeProps({ onStartAutopilot })} />);
    fireEvent.click(screen.getByText("Start Autopilot"));
    expect(onStartAutopilot).toHaveBeenCalled();
  });

  test("calls onProviderSetup when clicked", () => {
    const onProviderSetup = vi.fn(() => {});
    render(<HomeQuickActions {...makeProps({ onProviderSetup })} />);
    fireEvent.click(screen.getByText("Provider Setup"));
    expect(onProviderSetup).toHaveBeenCalled();
  });

  test("calls onSetupWizard when clicked", () => {
    const onSetupWizard = vi.fn(() => {});
    render(<HomeQuickActions {...makeProps({ onSetupWizard })} />);
    fireEvent.click(screen.getByText("Setup Wizard"));
    expect(onSetupWizard).toHaveBeenCalled();
  });
});
