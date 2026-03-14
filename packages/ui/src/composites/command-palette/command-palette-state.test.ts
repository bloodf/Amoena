import { act, renderHook } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "bun:test";

import type { CommandPaletteItem } from "./data";
import { useCommandPaletteState } from "./useCommandPaletteState";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeItem(overrides: Partial<CommandPaletteItem> = {}): CommandPaletteItem {
  return {
    type: "command",
    icon: (() => null) as any,
    label: "New Session",
    description: "Start a new session",
    action: mock(() => {}),
    ...overrides,
  };
}

const items: CommandPaletteItem[] = [
  makeItem({ label: "New Session", description: "Start a new session", type: "command" }),
  makeItem({ label: "Toggle Terminal", description: "Show or hide terminal", type: "command" }),
  makeItem({ label: "Agent Management", description: "Manage agents", type: "navigation" }),
  makeItem({ label: "src/main.rs", description: "Entry point", type: "file", action: undefined }),
];

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("useCommandPaletteState initial state", () => {
  test("query starts empty", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));
    expect(result.current.query).toBe("");
  });

  test("selectedIndex starts at 0", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));
    expect(result.current.selectedIndex).toBe(0);
  });

  test("isClosing starts false", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));
    expect(result.current.isClosing).toBe(false);
  });

  test("filtered contains all items when query is empty", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));
    expect(result.current.filtered.length).toBe(items.length);
  });

  test("groups are keyed by type", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));
    expect(Object.keys(result.current.groups)).toContain("command");
    expect(Object.keys(result.current.groups)).toContain("navigation");
    expect(Object.keys(result.current.groups)).toContain("file");
  });
});

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

describe("useCommandPaletteState filtering", () => {
  test("filters by label (case-insensitive)", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => { result.current.setQuery("session"); });

    expect(result.current.filtered.length).toBe(1);
    expect(result.current.filtered[0].label).toBe("New Session");
  });

  test("filters by description", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => { result.current.setQuery("entry point"); });

    expect(result.current.filtered.length).toBe(1);
    expect(result.current.filtered[0].label).toBe("src/main.rs");
  });

  test("returns empty array when no match", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => { result.current.setQuery("zzznomatch"); });

    expect(result.current.filtered.length).toBe(0);
  });

  test("filter is case-insensitive for query", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => { result.current.setQuery("TERMINAL"); });

    expect(result.current.filtered.length).toBe(1);
    expect(result.current.filtered[0].label).toBe("Toggle Terminal");
  });

  test("groups update to reflect filtered results", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => { result.current.setQuery("Manage agents"); });

    expect(Object.keys(result.current.groups)).toEqual(["navigation"]);
    expect(result.current.groups["command"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// handleClose / isClosing
// ---------------------------------------------------------------------------

describe("useCommandPaletteState handleClose", () => {
  test("sets isClosing to true immediately on handleClose", () => {
    vi.useFakeTimers();
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => { result.current.handleClose(); });

    expect(result.current.isClosing).toBe(true);
    vi.useRealTimers();
  });

  test("calls onClose after 150ms and resets isClosing", () => {
    vi.useFakeTimers();
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => { result.current.handleClose(); });
    expect(onClose).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(150); });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(result.current.isClosing).toBe(false);
    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// runAction
// ---------------------------------------------------------------------------

describe("useCommandPaletteState runAction", () => {
  test("calls the provided action", () => {
    vi.useFakeTimers();
    const onClose = mock(() => {});
    const action = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => { result.current.runAction(action); });

    expect(action).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  test("works when no action is provided (undefined)", () => {
    vi.useFakeTimers();
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    expect(() => {
      act(() => { result.current.runAction(undefined); });
    }).not.toThrow();
    vi.useRealTimers();
  });

  test("also triggers handleClose (sets isClosing)", () => {
    vi.useFakeTimers();
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => { result.current.runAction(mock(() => {})); });

    expect(result.current.isClosing).toBe(true);
    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// handleKeyDown
// ---------------------------------------------------------------------------

describe("useCommandPaletteState handleKeyDown", () => {
  function makeKeyEvent(key: string): React.KeyboardEvent {
    return { key, preventDefault: mock(() => {}) } as unknown as React.KeyboardEvent;
  }

  test("Escape calls handleClose (isClosing becomes true)", () => {
    vi.useFakeTimers();
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => { result.current.handleKeyDown(makeKeyEvent("Escape")); });

    expect(result.current.isClosing).toBe(true);
    vi.useRealTimers();
  });

  test("ArrowDown increments selectedIndex", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => { result.current.handleKeyDown(makeKeyEvent("ArrowDown")); });

    expect(result.current.selectedIndex).toBe(1);
  });

  test("ArrowDown clamps at last item", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => {
      for (let i = 0; i < 20; i++) {
        result.current.handleKeyDown(makeKeyEvent("ArrowDown"));
      }
    });

    expect(result.current.selectedIndex).toBe(items.length - 1);
  });

  test("ArrowUp decrements selectedIndex", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => {
      result.current.handleKeyDown(makeKeyEvent("ArrowDown"));
      result.current.handleKeyDown(makeKeyEvent("ArrowDown"));
      result.current.handleKeyDown(makeKeyEvent("ArrowUp"));
    });

    expect(result.current.selectedIndex).toBe(1);
  });

  test("ArrowUp clamps at 0", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => { result.current.handleKeyDown(makeKeyEvent("ArrowUp")); });

    expect(result.current.selectedIndex).toBe(0);
  });

  test("Enter runs action of currently selected item", () => {
    vi.useFakeTimers();
    const onClose = mock(() => {});
    const action = mock(() => {});
    const testItems = [makeItem({ label: "Item A", action })];
    const { result } = renderHook(() => useCommandPaletteState(testItems, onClose));

    act(() => { result.current.handleKeyDown(makeKeyEvent("Enter")); });

    expect(action).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  test("Enter does nothing when selected item has no action", () => {
    vi.useFakeTimers();
    const onClose = mock(() => {});
    const testItems = [makeItem({ label: "No Action", action: undefined })];
    const { result } = renderHook(() => useCommandPaletteState(testItems, onClose));

    expect(() => {
      act(() => { result.current.handleKeyDown(makeKeyEvent("Enter")); });
    }).not.toThrow();
    vi.useRealTimers();
  });

  test("Enter does nothing when filtered list is empty", () => {
    vi.useFakeTimers();
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => { result.current.setQuery("zzznomatch"); });
    expect(() => {
      act(() => { result.current.handleKeyDown(makeKeyEvent("Enter")); });
    }).not.toThrow();
    vi.useRealTimers();
  });

  test("unrecognized key does nothing", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));
    const before = result.current.selectedIndex;

    act(() => { result.current.handleKeyDown(makeKeyEvent("Tab")); });

    expect(result.current.selectedIndex).toBe(before);
    expect(result.current.isClosing).toBe(false);
  });

  test("setSelectedIndex updates selectedIndex directly", () => {
    const onClose = mock(() => {});
    const { result } = renderHook(() => useCommandPaletteState(items, onClose));

    act(() => { result.current.setSelectedIndex(2); });

    expect(result.current.selectedIndex).toBe(2);
  });
});
