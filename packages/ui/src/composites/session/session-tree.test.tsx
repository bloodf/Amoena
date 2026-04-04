import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { SessionTree } from "./SessionTree";

const tree = {
  session: { id: "root-session", sessionMode: "native", tuiType: "native", workingDir: "/project", status: "running", createdAt: "2026-01-01T00:00:00Z" },
  children: [
    {
      session: { id: "child-abc123", sessionMode: "native", tuiType: "native", workingDir: "/project", status: "running", createdAt: "2026-01-01T00:01:00Z" },
      children: [],
    },
    {
      session: { id: "child-xyz789", sessionMode: "wrapper", tuiType: "native", workingDir: "/project", status: "idle", createdAt: "2026-01-01T00:02:00Z" },
      children: [
        {
          session: { id: "grand-111222", sessionMode: "native", tuiType: "native", workingDir: "/project", status: "idle", createdAt: "2026-01-01T00:03:00Z" },
          children: [],
        },
      ],
    },
  ],
};

describe("SessionTree", () => {
  test("shows empty state when tree is null", () => {
    render(<SessionTree tree={null} onSelectSession={vi.fn(() => {})} />);
    // Component renders a paragraph with translation key sessionTree.empty
    const paras = document.querySelectorAll("p");
    expect(paras.length).toBeGreaterThan(0);
  });

  test("renders root node with children", () => {
    render(<SessionTree tree={tree} onSelectSession={vi.fn(() => {})} />);
    // Node IDs are sliced to first 8 chars
    expect(screen.getByText("root-ses")).toBeTruthy();
    expect(screen.getByText("child-ab")).toBeTruthy();
    expect(screen.getByText("child-xy")).toBeTruthy();
  });

  test("highlights active session", () => {
    const { container } = render(
      <SessionTree tree={tree} activeSessionId="child-abc123" onSelectSession={vi.fn(() => {})} />,
    );
    const activeEl = container.querySelector(".bg-accent");
    expect(activeEl).toBeTruthy();
    expect(activeEl?.textContent).toContain("child-ab");
  });

  test("calls onSelectSession when node clicked", () => {
    const onSelectSession = vi.fn(() => {});
    render(<SessionTree tree={tree} onSelectSession={onSelectSession} />);
    fireEvent.click(screen.getByText("root-ses").closest("div[class]")!);
    expect(onSelectSession).toHaveBeenCalledWith("root-session");
  });

  test("toggles children expand/collapse", () => {
    render(<SessionTree tree={tree} onSelectSession={vi.fn(() => {})} />);
    // child-xyz789 has children; find its collapse button (▾ symbol)
    const toggleButtons = screen.getAllByRole("button").filter(
      (b) => b.textContent === "▾" || b.textContent === "▸",
    );
    expect(toggleButtons.length).toBeGreaterThan(0);
    // grand-111222 visible initially (expanded by default)
    expect(screen.getByText("grand-11")).toBeTruthy();
    // Click collapse button for child-xyz789's subtree
    fireEvent.click(toggleButtons[toggleButtons.length - 1]);
    expect(screen.queryByText("grand-11")).toBeNull();
  });
});
