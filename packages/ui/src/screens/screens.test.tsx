import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { HomeScreen } from "./HomeScreen";
import { MarketplaceScreen } from "./MarketplaceScreen";
import { ProviderSetupScreen } from "./ProviderSetupScreen";
import { RemoteAccessScreen } from "./RemoteAccessScreen";
import { SessionWorkspace } from "./SessionWorkspace";
import { SettingsScreen } from "./SettingsScreen";
import type { ReactElement } from "react";

function renderInRouter(path: string, element: ReactElement) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={<AppShell>{element}</AppShell>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Lunaria screens", () => {
  test("renders Home screen shell", () => {
    renderInRouter("/", <HomeScreen />);
    expect(screen.getByText("Welcome back")).not.toBeNull();
    expect(screen.getByText("Recent Sessions")).not.toBeNull();
  });

  test("renders Provider Setup", () => {
    renderInRouter("/providers", <ProviderSetupScreen />);
    expect(screen.getByRole("heading", { name: "Provider Setup" })).not.toBeNull();
    expect(screen.getAllByText("Anthropic").length).toBeGreaterThan(0);
  });

  test("renders Session Workspace", () => {
    renderInRouter("/session", <SessionWorkspace />);
    expect(screen.getByText("JWT Auth Refactor")).not.toBeNull();
    expect(screen.getByText(/Queue \(4\)/i)).not.toBeNull();
    expect(screen.getByPlaceholderText(/Ask anything\.\.\. @ files, \$ skills, \/ commands/i)).toBeTruthy();
  });

  test("renders Remote Access", () => {
    renderInRouter("/remote", <RemoteAccessScreen />);
    expect(screen.getByRole("heading", { name: "Remote Access" })).not.toBeNull();
    expect(screen.getByText("Connected Devices")).not.toBeNull();
  });

  test("renders Settings", () => {
    renderInRouter("/settings", <SettingsScreen />);
    expect(screen.getByRole("heading", { name: "General" })).not.toBeNull();
  });

  test("renders Marketplace", () => {
    renderInRouter("/marketplace", <MarketplaceScreen />);
    expect(screen.getByText("Browse")).not.toBeNull();
    expect(screen.getByText("Extensions")).not.toBeNull();
  });
});
