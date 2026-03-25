import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useCommandPaletteState } from "./useCommandPaletteState";
import type { CommandPaletteItem } from "./data";
import { Bot, FileText, MessageSquare, Settings } from "lucide-react";

const commands: CommandPaletteItem[] = [
  { type: "command", icon: MessageSquare, label: "New Session", shortcut: "Cmd+N" },
  { type: "command", icon: MessageSquare, label: "Quick Prompt", shortcut: "Cmd+J" },
  { type: "navigation", icon: Settings, label: "Settings" },
  { type: "navigation", icon: Bot, label: "Agent Management" },
  { type: "file", icon: FileText, label: "src/main.rs", description: "Entry point" },
];

describe("useCommandPaletteState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("initial state has empty query and all items", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useCommandPaletteState(commands, onClose));

    expect(result.current.query).toBe("");
    expect(result.current.selectedIndex).toBe(0);
    expect(result.current.filtered).toHaveLength(5);
    expect(result.current.isClosing).toBe(false);
  });

  test("setQuery filters items by label", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useCommandPaletteState(commands, onClose));

    act(() => {
      result.current.setQuery("session");
    });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].label).toBe("New Session");
  });

  test("setQuery filters by description", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useCommandPaletteState(commands, onClose));

    act(() => {
      result.current.setQuery("entry point");
    });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].label).toBe("src/main.rs");
  });

  test("groups items by type", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useCommandPaletteState(commands, onClose));

    expect(Object.keys(result.current.groups)).toContain("command");
    expect(Object.keys(result.current.groups)).toContain("navigation");
    expect(Object.keys(result.current.groups)).toContain("file");
  });

  test("handleKeyDown ArrowDown increments selectedIndex", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useCommandPaletteState(commands, onClose));

    act(() => {
      result.current.handleKeyDown({
        key: "ArrowDown",
        preventDefault: () => {},
      } as React.KeyboardEvent);
    });

    expect(result.current.selectedIndex).toBe(1);
  });

  test("handleKeyDown ArrowUp decrements selectedIndex", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useCommandPaletteState(commands, onClose));

    act(() => {
      result.current.setSelectedIndex(2);
    });

    act(() => {
      result.current.handleKeyDown({
        key: "ArrowUp",
        preventDefault: () => {},
      } as React.KeyboardEvent);
    });

    expect(result.current.selectedIndex).toBe(1);
  });

  test("handleKeyDown ArrowUp does not go below 0", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useCommandPaletteState(commands, onClose));

    act(() => {
      result.current.handleKeyDown({
        key: "ArrowUp",
        preventDefault: () => {},
      } as React.KeyboardEvent);
    });

    expect(result.current.selectedIndex).toBe(0);
  });

  test("handleKeyDown Escape triggers close", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useCommandPaletteState(commands, onClose));

    act(() => {
      result.current.handleKeyDown({
        key: "Escape",
        preventDefault: () => {},
      } as React.KeyboardEvent);
    });

    expect(result.current.isClosing).toBe(true);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onClose).toHaveBeenCalled();
  });

  test("handleClose sets isClosing and calls onClose after delay", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useCommandPaletteState(commands, onClose));

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.isClosing).toBe(true);
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onClose).toHaveBeenCalled();
  });

  test("runAction executes action and closes", () => {
    const onClose = vi.fn();
    const action = vi.fn();
    const { result } = renderHook(() => useCommandPaletteState(commands, onClose));

    act(() => {
      result.current.runAction(action);
    });

    expect(action).toHaveBeenCalled();
    expect(result.current.isClosing).toBe(true);
  });

  test("case-insensitive filtering", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useCommandPaletteState(commands, onClose));

    act(() => {
      result.current.setQuery("SETTINGS");
    });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].label).toBe("Settings");
  });
});
