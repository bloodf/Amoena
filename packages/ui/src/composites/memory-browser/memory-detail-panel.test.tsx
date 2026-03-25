import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { MemoryDetailPanel } from "./MemoryDetailPanel";
import type { MemoryEntry } from "./types";

const entry: MemoryEntry = {
  key: "auth.jwt.structure",
  source: "auto",
  scope: "workspace",
  value: "JWT uses RS256 with rotating keys",
  timestamp: "2 min ago",
  size: "1.2 KB",
  type: "code_pattern",
  pinned: false,
};

function makeProps(overrides: Partial<Parameters<typeof MemoryDetailPanel>[0]> = {}) {
  return {
    entry,
    confirmDelete: null,
    onTogglePin: mock((_key: string) => {}),
    onExport: mock(() => {}),
    onAskDelete: mock((_key: string) => {}),
    onCancelDelete: mock(() => {}),
    onConfirmDelete: mock((_key: string) => {}),
    onConvertToPersistent: mock((_key: string) => {}),
    ...overrides,
  };
}

describe("MemoryDetailPanel", () => {
  test("renders placeholder when entry is null", () => {
    render(<MemoryDetailPanel {...makeProps({ entry: null })} />);
    expect(screen.getByText("Select a memory entry")).toBeTruthy();
  });

  test("renders entry key as title", () => {
    render(<MemoryDetailPanel {...makeProps()} />);
    expect(screen.getByText("auth.jwt.structure")).toBeTruthy();
  });

  test("renders entry value", () => {
    render(<MemoryDetailPanel {...makeProps()} />);
    expect(screen.getByText("JWT uses RS256 with rotating keys")).toBeTruthy();
  });

  test("renders type badge", () => {
    render(<MemoryDetailPanel {...makeProps()} />);
    expect(screen.getByText("Code Pattern")).toBeTruthy();
  });

  test("renders Convert to Persistent Memory for workspace entries", () => {
    render(<MemoryDetailPanel {...makeProps()} />);
    expect(screen.getByText("Convert to Persistent Memory")).toBeTruthy();
  });

  test("hides Convert to Persistent Memory for global entries", () => {
    render(<MemoryDetailPanel {...makeProps({ entry: { ...entry, scope: "global" } })} />);
    expect(screen.queryByText("Convert to Persistent Memory")).toBeNull();
  });

  test("calls onConvertToPersistent when clicked", () => {
    const onConvertToPersistent = mock((_key: string) => {});
    render(<MemoryDetailPanel {...makeProps({ onConvertToPersistent })} />);
    fireEvent.click(screen.getByText("Convert to Persistent Memory"));
    expect(onConvertToPersistent).toHaveBeenCalledWith("auth.jwt.structure");
  });
});
