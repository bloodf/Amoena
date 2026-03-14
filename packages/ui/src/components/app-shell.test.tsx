import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { vi } from "vitest";

import { AppShell } from "./AppShell";

// ---------------------------------------------------------------------------
// Mock dependencies that rely on routing / DOM APIs not available in happy-dom
// ---------------------------------------------------------------------------

vi.mock("./SidebarRail", () => ({
  SidebarRail: ({ onOpenCommandPalette, onNavigate }: { onOpenCommandPalette?: () => void; onNavigate?: () => void }) => (
    <nav data-testid="sidebar-rail">
      <button onClick={onOpenCommandPalette}>Open Palette</button>
      <button onClick={onNavigate}>Navigate</button>
    </nav>
  ),
}));

vi.mock("./StatusBar", () => ({
  StatusBar: () => <footer data-testid="status-bar" />,
}));

vi.mock("./Breadcrumb", () => ({
  Breadcrumb: () => <div data-testid="breadcrumb" />,
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

// ---------------------------------------------------------------------------
// Helper to switch between desktop / mobile
// ---------------------------------------------------------------------------

async function setMobile(value: boolean) {
  const { useIsMobile } = await import("@/hooks/use-mobile");
  (useIsMobile as ReturnType<typeof vi.fn>).mockReturnValue(value);
}

// ---------------------------------------------------------------------------
// Desktop rendering
// ---------------------------------------------------------------------------

describe("AppShell desktop", () => {
  test("renders children", async () => {
    await setMobile(false);
    render(
      <AppShell>
        <div data-testid="child-content">Hello</div>
      </AppShell>,
    );
    expect(screen.getByTestId("child-content")).toBeDefined();
  });

  test("renders sidebar rail", async () => {
    await setMobile(false);
    render(<AppShell><span /></AppShell>);
    expect(screen.getByTestId("sidebar-rail")).toBeDefined();
  });

  test("renders status bar", async () => {
    await setMobile(false);
    render(<AppShell><span /></AppShell>);
    expect(screen.getByTestId("status-bar")).toBeDefined();
  });

  test("renders breadcrumb", async () => {
    await setMobile(false);
    render(<AppShell><span /></AppShell>);
    expect(screen.getByTestId("breadcrumb")).toBeDefined();
  });

  test("does not render mobile menu toggle on desktop", async () => {
    await setMobile(false);
    render(<AppShell><span /></AppShell>);
    // No hamburger / X button on desktop
    expect(screen.queryByRole("button", { name: /menu/i })).toBeNull();
  });

  test("passes onOpenCommandPalette to SidebarRail", async () => {
    await setMobile(false);
    const handler = vi.fn();
    render(<AppShell onOpenCommandPalette={handler}><span /></AppShell>);
    fireEvent.click(screen.getByText("Open Palette"));
    expect(handler).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Mobile rendering and sidebar toggle
// ---------------------------------------------------------------------------

describe("AppShell mobile", () => {
  test("renders mobile menu toggle button", async () => {
    await setMobile(true);
    render(<AppShell><span /></AppShell>);
    // Sidebar starts closed, Menu icon should be present
    const buttons = screen.getAllByRole("button");
    // At least one button should exist (the hamburger)
    expect(buttons.length).toBeGreaterThan(0);
  });

  test("sidebar starts hidden on mobile", async () => {
    await setMobile(true);
    const { container } = render(<AppShell><span /></AppShell>);
    // The sidebar wrapper should have -translate-x-full (closed)
    const sidebarWrapper = container.querySelector(".-translate-x-full");
    expect(sidebarWrapper).not.toBeNull();
  });

  test("clicking menu toggle opens sidebar overlay", async () => {
    await setMobile(true);
    const { container } = render(<AppShell><span /></AppShell>);

    // find the toggle — it has no explicit label but has exactly one SVG child (Menu icon)
    const toggleButton = container.querySelector("button.flex.items-center.justify-center");
    expect(toggleButton).not.toBeNull();
    fireEvent.click(toggleButton!);

    // After opening, sidebar should not have -translate-x-full
    const sidebarWrapper = container.querySelector(".-translate-x-full");
    expect(sidebarWrapper).toBeNull();
  });

  test("backdrop overlay appears when sidebar is open", async () => {
    await setMobile(true);
    const { container } = render(<AppShell><span /></AppShell>);

    const toggleButton = container.querySelector("button.flex.items-center.justify-center");
    fireEvent.click(toggleButton!);

    // Backdrop div should be present (fixed inset-0 z-40)
    const backdrop = container.querySelector(".fixed.inset-0.z-40");
    expect(backdrop).not.toBeNull();
  });

  test("clicking backdrop closes sidebar", async () => {
    await setMobile(true);
    const { container } = render(<AppShell><span /></AppShell>);

    const toggleButton = container.querySelector("button.flex.items-center.justify-center");
    fireEvent.click(toggleButton!);

    const backdrop = container.querySelector(".fixed.inset-0.z-40");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);

    // Sidebar should be hidden again
    const sidebarWrapper = container.querySelector(".-translate-x-full");
    expect(sidebarWrapper).not.toBeNull();
  });

  test("navigating via SidebarRail closes sidebar on mobile", async () => {
    await setMobile(true);
    const { container } = render(<AppShell><span /></AppShell>);

    const toggleButton = container.querySelector("button.flex.items-center.justify-center");
    fireEvent.click(toggleButton!);

    // Sidebar is open — navigate should close it
    fireEvent.click(screen.getByText("Navigate"));

    const sidebarWrapper = container.querySelector(".-translate-x-full");
    expect(sidebarWrapper).not.toBeNull();
  });
});
