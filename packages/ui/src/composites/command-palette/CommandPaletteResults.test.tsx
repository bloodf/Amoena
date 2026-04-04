import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { FileText, Settings, Terminal } from "lucide-react";

import { CommandPaletteResults } from "./CommandPaletteResults";
import type { CommandPaletteItem } from "./data";

const groups: Record<string, CommandPaletteItem[]> = {
  command: [
    { type: "command", icon: Terminal, label: "New Session", shortcut: "⌘N" },
    { type: "command", icon: Terminal, label: "Toggle Terminal", shortcut: "⌘`" },
  ],
  navigation: [
    { type: "navigation", icon: Settings, label: "Settings" },
  ],
  file: [
    { type: "file", icon: FileText, label: "src/main.ts", description: "Entry point" },
  ],
};

function renderResults(selectedIndex = 0) {
  const handlers = {
    onHover: vi.fn((_i: number) => {}),
    onSelect: vi.fn((_item: CommandPaletteItem) => {}),
  };
  const result = render(
    <CommandPaletteResults
      groups={groups}
      selectedIndex={selectedIndex}
      {...handlers}
    />,
  );
  return { ...result, ...handlers };
}

describe("CommandPaletteResults", () => {
  test("renders group headings", () => {
    renderResults();
    expect(screen.getByText("Commands")).toBeTruthy();
    expect(screen.getByText("Navigation")).toBeTruthy();
    expect(screen.getByText("Files")).toBeTruthy();
  });

  test("renders item labels", () => {
    renderResults();
    expect(screen.getByText("New Session")).toBeTruthy();
    expect(screen.getByText("Toggle Terminal")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
    expect(screen.getByText("src/main.ts")).toBeTruthy();
  });

  test("renders item shortcuts when present", () => {
    renderResults();
    expect(screen.getByText("⌘N")).toBeTruthy();
    expect(screen.getByText("⌘`")).toBeTruthy();
  });

  test("renders item descriptions when present", () => {
    renderResults();
    expect(screen.getByText("Entry point")).toBeTruthy();
  });

  test("calls onSelect when an item is clicked", () => {
    const { onSelect } = renderResults();
    fireEvent.click(screen.getByText("New Session"));
    expect(onSelect).toHaveBeenCalled();
    const calledWith = onSelect.mock.calls[0][0] as CommandPaletteItem;
    expect(calledWith.label).toBe("New Session");
  });

  test("calls onHover when mouse enters an item", () => {
    const { onHover } = renderResults();
    fireEvent.mouseEnter(screen.getByText("Toggle Terminal").closest("button")!);
    expect(onHover).toHaveBeenCalledWith(1);
  });

  test("highlights the selected item", () => {
    renderResults(0);
    const firstButton = screen.getByText("New Session").closest("button")!;
    expect(firstButton.className).toContain("accent/50");
  });

  test("does not highlight non-selected items", () => {
    renderResults(0);
    const secondButton = screen.getByText("Toggle Terminal").closest("button")!;
    expect(secondButton.className).not.toContain("accent/50");
  });

  test("renders empty groups gracefully", () => {
    render(
      <CommandPaletteResults
        groups={{}}
        selectedIndex={0}
        onHover={vi.fn(() => {})}
        onSelect={vi.fn(() => {})}
      />,
    );
    // Should render without crashing
    expect(screen.queryByText("Commands")).toBeNull();
  });
});
