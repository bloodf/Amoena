import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DesktopRouter } from "./router";

vi.mock("@lunaria/ui", () => ({
  AgentManagementScreen: () => <div>agents screen</div>,
  AppShell: ({
    children,
    onOpenCommandPalette,
  }: {
    children: React.ReactNode;
    onOpenCommandPalette: () => void;
  }) => (
    <div>
      <button type="button" onClick={onOpenCommandPalette}>
        open palette
      </button>
      {children}
    </div>
  ),
  AutopilotScreen: () => <div>autopilot screen</div>,
  CommandPalette: ({ open }: { open: boolean }) => (
    <div>{open ? "palette-open" : "palette-closed"}</div>
  ),
  HomeScreen: () => <div>home screen</div>,
  KanbanBoard: () => <div>tasks screen</div>,
  MarketplaceScreen: () => <div>marketplace screen</div>,
  MemoryBrowserScreen: () => <div>memory screen</div>,
  OpinionsScreen: () => <div>opinions screen</div>,
  SetupWizardScreen: () => <div>setup screen</div>,
  UsageScreen: () => <div>usage screen</div>,
  VisualEditorScreen: () => <div>visual editor screen</div>,
  WorkspaceManagerScreen: () => <div>workspaces screen</div>,
}));

vi.mock("./provider-setup-page", () => ({
  RuntimeProviderSetupPage: () => <div>providers screen</div>,
}));

vi.mock("./remote-access-page", () => ({
  RuntimeRemoteAccessPage: () => <div>remote screen</div>,
}));

vi.mock("./session-workspace-page", () => ({
  RuntimeSessionWorkspacePage: () => <div>session workspace screen</div>,
}));

vi.mock("./settings-page", () => ({
  RuntimeSettingsPage: () => <div>settings screen</div>,
}));

describe("DesktopRouter", () => {
  it("shows a suspense fallback for lazy routes and keeps the command palette eager", async () => {
    render(<DesktopRouter initialEntries={["/providers"]} />);

    expect(screen.getByText("Loading page...")).toBeInTheDocument();
    expect(await screen.findByText("providers screen")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "open palette" }));
    expect(screen.getByText("palette-open")).toBeInTheDocument();
  });
});
