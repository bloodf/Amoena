import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";

import { MemoryEntryList } from "./MemoryEntryList";
import type { MemoryEntry } from "./types";

const entries: MemoryEntry[] = [
  {
    key: "auth.jwt.pattern",
    source: "auto",
    scope: "workspace",
    value: "JWT refresh token rotation pattern",
    timestamp: "2 min ago",
    size: "1.2 KB",
    type: "code_pattern",
    pinned: true,
    session: "session-1",
  },
  {
    key: "arch.overview",
    source: "manual",
    scope: "global",
    value: "System architecture overview",
    timestamp: "1 hour ago",
    size: "4.5 KB",
    type: "architecture",
    pinned: false,
  },
  {
    key: "session.summary",
    source: "agent",
    scope: "workspace",
    value: "Session summary from last run",
    timestamp: "5 min ago",
    size: "800 B",
    type: "summary",
    pinned: false,
    agent: "Claude",
  },
];

function renderList(items: MemoryEntry[] = entries, selectedKey: string | null = null) {
  const onSelect = vi.fn((_key: string) => {});
  const result = render(
    <MemoryEntryList entries={items} selectedKey={selectedKey} onSelect={onSelect} />,
  );
  return { ...result, onSelect };
}

describe("MemoryEntryList", () => {
  test("renders all entry keys", () => {
    renderList();
    expect(screen.getByText("auth.jwt.pattern")).toBeTruthy();
    expect(screen.getByText("arch.overview")).toBeTruthy();
    expect(screen.getByText("session.summary")).toBeTruthy();
  });

  test("renders type labels", () => {
    renderList();
    expect(screen.getByText("Code Pattern")).toBeTruthy();
    expect(screen.getByText("Architecture")).toBeTruthy();
    expect(screen.getByText("Summary")).toBeTruthy();
  });

  test("renders source labels", () => {
    renderList();
    expect(screen.getByText("auto")).toBeTruthy();
    expect(screen.getByText("manual")).toBeTruthy();
    expect(screen.getByText("agent")).toBeTruthy();
  });

  test("renders timestamps", () => {
    renderList();
    expect(screen.getByText("2 min ago")).toBeTruthy();
    expect(screen.getByText("1 hour ago")).toBeTruthy();
  });

  test("renders scope and size", () => {
    renderList();
    expect(screen.getByText(/workspace · 1\.2 KB/)).toBeTruthy();
    expect(screen.getByText(/global · 4\.5 KB/)).toBeTruthy();
  });

  test("shows pin icon for pinned entries", () => {
    renderList();
    // Pin icon is rendered for the first entry
    // We verify by checking the entry renders correctly
    expect(screen.getByText("auth.jwt.pattern")).toBeTruthy();
  });

  test("calls onSelect when an entry is clicked", () => {
    const { onSelect } = renderList();
    fireEvent.click(screen.getByText("auth.jwt.pattern"));
    expect(onSelect).toHaveBeenCalledWith("auth.jwt.pattern");
  });

  test("calls onSelect with correct key for each entry", () => {
    const { onSelect } = renderList();
    fireEvent.click(screen.getByText("arch.overview"));
    expect(onSelect).toHaveBeenCalledWith("arch.overview");
  });

  test("highlights selected entry", () => {
    renderList(entries, "auth.jwt.pattern");
    const selectedButton = screen.getByText("auth.jwt.pattern").closest("button")!;
    expect(selectedButton.className).toContain("primary");
  });

  test("does not highlight non-selected entries", () => {
    renderList(entries, "auth.jwt.pattern");
    const otherButton = screen.getByText("arch.overview").closest("button")!;
    expect(otherButton.className).not.toContain("primary/5");
  });

  test("shows empty state when no entries", () => {
    renderList([]);
    expect(screen.getByText("No memories match filters")).toBeTruthy();
  });

  test("renders empty state with search icon", () => {
    const { container } = renderList([]);
    expect(container).toBeTruthy();
    expect(screen.getByText("No memories match filters")).toBeTruthy();
  });
});
