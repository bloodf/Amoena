import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { MemoryBrowserHeader } from "./MemoryBrowserHeader";

function makeProps(overrides: Partial<Parameters<typeof MemoryBrowserHeader>[0]> = {}) {
  return {
    viewMode: "list" as const,
    onAdd: vi.fn(() => {}),
    onExport: vi.fn(() => {}),
    onViewModeChange: vi.fn((_mode: "list" | "graph") => {}),
    ...overrides,
  };
}

describe("MemoryBrowserHeader", () => {
  test("renders Memory Browser title", () => {
    render(<MemoryBrowserHeader {...makeProps()} />);
    expect(screen.getByText("Memory Browser")).toBeTruthy();
  });

  test("renders Add Memory button", () => {
    render(<MemoryBrowserHeader {...makeProps()} />);
    expect(screen.getByText("Add Memory")).toBeTruthy();
  });

  test("renders Export button", () => {
    render(<MemoryBrowserHeader {...makeProps()} />);
    expect(screen.getByText("Export")).toBeTruthy();
  });

  test("calls onAdd when Add Memory clicked", () => {
    const onAdd = vi.fn(() => {});
    render(<MemoryBrowserHeader {...makeProps({ onAdd })} />);
    fireEvent.click(screen.getByText("Add Memory"));
    expect(onAdd).toHaveBeenCalled();
  });

  test("renders List and Graph view buttons", () => {
    render(<MemoryBrowserHeader {...makeProps()} />);
    expect(screen.getByText("List")).toBeTruthy();
    expect(screen.getByText("Graph")).toBeTruthy();
  });

  test("calls onViewModeChange with graph when Graph clicked", () => {
    const onViewModeChange = vi.fn((_mode: "list" | "graph") => {});
    render(<MemoryBrowserHeader {...makeProps({ onViewModeChange })} />);
    fireEvent.click(screen.getByText("Graph"));
    expect(onViewModeChange).toHaveBeenCalledWith("graph");
  });
});
