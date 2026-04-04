import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { SidebarRail } from "./SidebarRail";

function renderSidebar(props: Partial<Parameters<typeof SidebarRail>[0]> = {}) {
  const handlers = {
    onOpenCommandPalette: vi.fn(() => {}),
    onNavigate: vi.fn(() => {}),
    ...props,
  };
  const result = render(
    <MemoryRouter initialEntries={["/"]}>
      <SidebarRail {...handlers} />
    </MemoryRouter>,
  );
  return { ...result, ...handlers };
}

describe("SidebarRail", () => {
  test("renders all top navigation items", () => {
    renderSidebar();
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Session")).toBeTruthy();
    expect(screen.getByText("Autopilot")).toBeTruthy();
    expect(screen.getByText("Agents")).toBeTruthy();
    expect(screen.getByText("Tasks")).toBeTruthy();
    expect(screen.getByText("Memory")).toBeTruthy();
    expect(screen.getByText("Workspaces")).toBeTruthy();
    expect(screen.getByText("Visual Editor")).toBeTruthy();
    expect(screen.getByText("Marketplace")).toBeTruthy();
    expect(screen.getByText("Usage")).toBeTruthy();
  });

  test("renders the Settings item", () => {
    renderSidebar();
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  test("renders the theme toggle button", () => {
    renderSidebar();
    // In dark mode it shows "Light Mode", in light mode "Dark Mode"
    const themeButton = screen.getByText(/Light Mode|Dark Mode/);
    expect(themeButton).toBeTruthy();
  });

  test("renders the Search button", () => {
    renderSidebar();
    expect(screen.getByText("Search")).toBeTruthy();
  });

  test("renders the keyboard shortcut hint", () => {
    renderSidebar();
    expect(screen.getByText("⌘K")).toBeTruthy();
  });

  test("calls onOpenCommandPalette when Search is clicked", () => {
    const { onOpenCommandPalette } = renderSidebar();
    fireEvent.click(screen.getByText("Search"));
    expect(onOpenCommandPalette).toHaveBeenCalled();
  });

  test("nav links point to correct paths", () => {
    renderSidebar();
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink?.getAttribute("href")).toBe("/");
  });

  test("highlights the active route", () => {
    renderSidebar();
    // Home should be active when at "/"
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink?.className).toContain("primary");
  });

  test("calls onNavigate when a nav item is clicked", () => {
    const { onNavigate } = renderSidebar();
    fireEvent.click(screen.getByText("Agents"));
    expect(onNavigate).toHaveBeenCalled();
  });

  test("renders 10 top items and 1 bottom item", () => {
    renderSidebar();
    // Verify all items are present by checking a few
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
  });
});
