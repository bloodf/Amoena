import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { HomeQuickActions } from "./HomeQuickActions";

function makeProps(overrides: Partial<Parameters<typeof HomeQuickActions>[0]> = {}) {
  return {
    onContinueSession: mock(() => {}),
    onOpenWorkspace: mock(() => {}),
    onStartAutopilot: mock(() => {}),
    onProviderSetup: mock(() => {}),
    onSetupWizard: mock(() => {}),
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
    const onContinueSession = mock(() => {});
    render(<HomeQuickActions {...makeProps({ onContinueSession })} />);
    fireEvent.click(screen.getByText("Continue Session"));
    expect(onContinueSession).toHaveBeenCalled();
  });

  test("calls onOpenWorkspace when clicked", () => {
    const onOpenWorkspace = mock(() => {});
    render(<HomeQuickActions {...makeProps({ onOpenWorkspace })} />);
    fireEvent.click(screen.getByText("Open Workspace"));
    expect(onOpenWorkspace).toHaveBeenCalled();
  });

  test("calls onStartAutopilot when clicked", () => {
    const onStartAutopilot = mock(() => {});
    render(<HomeQuickActions {...makeProps({ onStartAutopilot })} />);
    fireEvent.click(screen.getByText("Start Autopilot"));
    expect(onStartAutopilot).toHaveBeenCalled();
  });

  test("calls onProviderSetup when clicked", () => {
    const onProviderSetup = mock(() => {});
    render(<HomeQuickActions {...makeProps({ onProviderSetup })} />);
    fireEvent.click(screen.getByText("Provider Setup"));
    expect(onProviderSetup).toHaveBeenCalled();
  });

  test("calls onSetupWizard when clicked", () => {
    const onSetupWizard = mock(() => {});
    render(<HomeQuickActions {...makeProps({ onSetupWizard })} />);
    fireEvent.click(screen.getByText("Setup Wizard"));
    expect(onSetupWizard).toHaveBeenCalled();
  });
});
