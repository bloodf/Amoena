import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { MemoryEntryList } from "./MemoryEntryList";
import type { MemoryEntry } from "./types";

const entry: MemoryEntry = {
  key: "auth.jwt.structure",
  source: "auto",
  scope: "workspace",
  value: "JWT uses RS256",
  timestamp: "2 min ago",
  size: "1.2 KB",
  type: "code_pattern",
  pinned: false,
};

const pinnedEntry: MemoryEntry = {
  ...entry,
  key: "auth.middleware",
  pinned: true,
};

describe("MemoryEntryList", () => {
  test("renders empty state when no entries", () => {
    render(<MemoryEntryList entries={[]} selectedKey={null} onSelect={mock(() => {})} />);
    expect(screen.getByText("No memories match filters")).toBeTruthy();
  });

  test("renders entry key", () => {
    render(<MemoryEntryList entries={[entry]} selectedKey={null} onSelect={mock(() => {})} />);
    expect(screen.getByText("auth.jwt.structure")).toBeTruthy();
  });

  test("renders type badge", () => {
    render(<MemoryEntryList entries={[entry]} selectedKey={null} onSelect={mock(() => {})} />);
    expect(screen.getByText("Code Pattern")).toBeTruthy();
  });

  test("renders source badge", () => {
    render(<MemoryEntryList entries={[entry]} selectedKey={null} onSelect={mock(() => {})} />);
    expect(screen.getByText("auto")).toBeTruthy();
  });

  test("calls onSelect when entry clicked", () => {
    const onSelect = mock((_key: string) => {});
    render(<MemoryEntryList entries={[entry]} selectedKey={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("auth.jwt.structure"));
    expect(onSelect).toHaveBeenCalledWith("auth.jwt.structure");
  });

  test("highlights selected entry", () => {
    render(<MemoryEntryList entries={[entry]} selectedKey="auth.jwt.structure" onSelect={mock(() => {})} />);
    const btn = screen.getByText("auth.jwt.structure").closest("button")!;
    expect(btn.className).toContain("bg-primary/5");
  });

  test("renders timestamp", () => {
    render(<MemoryEntryList entries={[entry]} selectedKey={null} onSelect={mock(() => {})} />);
    expect(screen.getByText("2 min ago")).toBeTruthy();
  });
});
