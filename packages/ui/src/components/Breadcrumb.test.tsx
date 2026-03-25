import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { MemoryRouter } from "react-router-dom";

import { Breadcrumb } from "./Breadcrumb";

function renderBreadcrumb(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Breadcrumb />
    </MemoryRouter>,
  );
}

describe("Breadcrumb", () => {
  test("renders home icon on root path", () => {
    renderBreadcrumb("/");
    // Home icon link should be present
    const homeLink = screen.getByRole("link");
    expect(homeLink).toBeTruthy();
  });

  test("does not render chevrons on root path", () => {
    const { container } = renderBreadcrumb("/");
    // No segments means no chevron separators
    expect(container.textContent).not.toContain("›");
  });

  test("renders session breadcrumb with known label", () => {
    renderBreadcrumb("/session");
    expect(screen.getByText("Session")).toBeTruthy();
  });

  test("renders agents breadcrumb", () => {
    renderBreadcrumb("/agents");
    expect(screen.getByText("Agents")).toBeTruthy();
  });

  test("renders settings breadcrumb", () => {
    renderBreadcrumb("/settings");
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  test("renders memory breadcrumb", () => {
    renderBreadcrumb("/memory");
    expect(screen.getByText("Memory")).toBeTruthy();
  });

  test("renders marketplace breadcrumb", () => {
    renderBreadcrumb("/marketplace");
    expect(screen.getByText("Marketplace")).toBeTruthy();
  });

  test("renders nested path with multiple segments", () => {
    renderBreadcrumb("/settings/general");
    expect(screen.getByText("Settings")).toBeTruthy();
    expect(screen.getByText("General")).toBeTruthy();
  });

  test("last segment is not a link", () => {
    renderBreadcrumb("/settings/general");
    // "General" should be a span, not a link
    const generalEl = screen.getByText("General");
    expect(generalEl.tagName).toBe("SPAN");
  });

  test("intermediate segments are links", () => {
    renderBreadcrumb("/settings/general");
    const settingsLink = screen.getByText("Settings");
    expect(settingsLink.tagName).toBe("A");
  });

  test("capitalizes unknown segment names", () => {
    renderBreadcrumb("/custom-page");
    expect(screen.getByText("Custom page")).toBeTruthy();
  });

  test("renders visual editor with correct label", () => {
    renderBreadcrumb("/visual-editor");
    expect(screen.getByText("Visual Editor")).toBeTruthy();
  });

  test("renders usage breadcrumb", () => {
    renderBreadcrumb("/usage");
    expect(screen.getByText("Usage & Tokens")).toBeTruthy();
  });

  test("renders home link that points to /", () => {
    renderBreadcrumb("/settings");
    const links = screen.getAllByRole("link");
    const homeLink = links.find((l) => l.getAttribute("href") === "/");
    expect(homeLink).toBeTruthy();
  });

  test("renders deeply nested path", () => {
    renderBreadcrumb("/settings/privacy/advanced");
    expect(screen.getByText("Settings")).toBeTruthy();
    expect(screen.getByText("Privacy")).toBeTruthy();
    expect(screen.getByText("Advanced")).toBeTruthy();
  });
});
