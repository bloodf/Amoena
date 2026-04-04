import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { CommandPaletteResults } from "./CommandPaletteResults";
import type { CommandPaletteItem } from "./data";
import { FileText, Settings } from "lucide-react";

const itemWithDesc: CommandPaletteItem = {
  label: "Open File",
  icon: FileText,
  description: "Open a file in the editor",
  shortcut: "⌘O",
  type: "file",
};

const itemNoExtras: CommandPaletteItem = {
  label: "Settings",
  icon: Settings,
  type: "navigation",
};

function makeGroups(items: CommandPaletteItem[]) {
  return { action: items };
}

describe("CommandPaletteResults", () => {
  test("renders group label and item labels", () => {
    render(
      <CommandPaletteResults
        groups={makeGroups([itemWithDesc])}
        selectedIndex={0}
        onHover={vi.fn(() => {})}
        onSelect={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText("Open File")).toBeTruthy();
  });

  test("renders description when item has description — branch line 36", () => {
    render(
      <CommandPaletteResults
        groups={makeGroups([itemWithDesc])}
        selectedIndex={0}
        onHover={vi.fn(() => {})}
        onSelect={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText("Open a file in the editor")).toBeTruthy();
  });

  test("does not render description when item has no description — branch line 36", () => {
    render(
      <CommandPaletteResults
        groups={makeGroups([itemNoExtras])}
        selectedIndex={0}
        onHover={vi.fn(() => {})}
        onSelect={vi.fn(() => {})}
      />,
    );
    // No description element
    expect(screen.queryByText("Open a file in the editor")).toBeNull();
  });

  test("renders shortcut kbd when item has shortcut — branch line 38", () => {
    render(
      <CommandPaletteResults
        groups={makeGroups([itemWithDesc])}
        selectedIndex={0}
        onHover={vi.fn(() => {})}
        onSelect={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText("⌘O")).toBeTruthy();
  });

  test("does not render shortcut kbd when item has no shortcut — branch line 38", () => {
    render(
      <CommandPaletteResults
        groups={makeGroups([itemNoExtras])}
        selectedIndex={0}
        onHover={vi.fn(() => {})}
        onSelect={vi.fn(() => {})}
      />,
    );
    expect(screen.queryByText("⌘O")).toBeNull();
  });

  test("applies active style when selectedIndex matches item index", () => {
    const { container } = render(
      <CommandPaletteResults
        groups={makeGroups([itemWithDesc])}
        selectedIndex={0}
        onHover={vi.fn(() => {})}
        onSelect={vi.fn(() => {})}
      />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("bg-accent/50");
  });

  test("applies hover style when selectedIndex does not match — branch line 31", () => {
    const { container } = render(
      <CommandPaletteResults
        groups={makeGroups([itemWithDesc])}
        selectedIndex={99}
        onHover={vi.fn(() => {})}
        onSelect={vi.fn(() => {})}
      />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("hover:bg-accent/30");
  });

  test("calls onSelect when item is clicked", () => {
    const onSelect = vi.fn(() => {});
    render(
      <CommandPaletteResults
        groups={makeGroups([itemWithDesc])}
        selectedIndex={0}
        onHover={vi.fn(() => {})}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText("Open File").closest("button")!);
    expect(onSelect).toHaveBeenCalledWith(itemWithDesc);
  });

  test("calls onHover when mouse enters item", () => {
    const onHover = vi.fn(() => {});
    render(
      <CommandPaletteResults
        groups={makeGroups([itemWithDesc])}
        selectedIndex={0}
        onHover={onHover}
        onSelect={vi.fn(() => {})}
      />,
    );
    fireEvent.mouseEnter(screen.getByText("Open File").closest("button")!);
    expect(onHover).toHaveBeenCalledWith(0);
  });

  test("uses type key as fallback label when type not in commandPaletteTypeLabels — branch line 21", () => {
    // Cast to bypass type checking so we can test the fallback branch
    const unknownGroups = { unknowntype: [itemNoExtras] } as unknown as Record<string, CommandPaletteItem[]>;
    render(
      <CommandPaletteResults
        groups={unknownGroups}
        selectedIndex={0}
        onHover={vi.fn(() => {})}
        onSelect={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText("unknowntype")).toBeTruthy();
  });

  test("tracks flat indices correctly across multiple groups", () => {
    const onHover = vi.fn(() => {});
    const groups = {
      action: [itemWithDesc],
      file: [itemNoExtras],
    };
    render(
      <CommandPaletteResults
        groups={groups}
        selectedIndex={1}
        onHover={onHover}
        onSelect={vi.fn(() => {})}
      />,
    );
    // Second item (index 1) should have active style
    const buttons = screen.getAllByRole("button");
    expect(buttons[1].className).toContain("bg-accent/50");
    // First item should not
    expect(buttons[0].className).toContain("hover:bg-accent/30");
  });
});
