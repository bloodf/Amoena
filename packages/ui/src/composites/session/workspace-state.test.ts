import { act, renderHook } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { useSessionWorkspaceState } from "./useSessionWorkspaceState";

describe("useSessionWorkspaceState", () => {
  test("initializes with default state", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    expect(result.current.sidePanelOpen).toBe(true);
    expect(result.current.sidePanelWidth).toBe(300);
    expect(result.current.terminalHeight).toBe(180);
    expect(result.current.terminalOpen).toBe(true);
    expect(result.current.composerMessage).toBe("");
    expect(result.current.tabDropIndex).toBeNull();
  });

  test("initializes with sessions from data", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    expect(result.current.sessions.length).toBeGreaterThan(0);
    expect(result.current.tabs.length).toBe(result.current.sessions.length);
  });

  test("activeTabId defaults to '1'", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    expect(result.current.activeTabId).toBe("1");
  });

  test("activeSession resolves from activeTabId", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    expect(result.current.activeSession?.id).toBe("1");
  });

  test("setSidePanelOpen toggles side panel", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    act(() => { result.current.setSidePanelOpen(false); });
    expect(result.current.sidePanelOpen).toBe(false);
  });

  test("setTerminalOpen toggles terminal", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    act(() => { result.current.setTerminalOpen(false); });
    expect(result.current.terminalOpen).toBe(false);
  });

  test("setActiveTabId changes active tab and session", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    const secondId = result.current.sessions[1].id;
    act(() => { result.current.setActiveTabId(secondId); });
    expect(result.current.activeTabId).toBe(secondId);
    expect(result.current.activeSession?.id).toBe(secondId);
  });

  test("updateSession mutates the target session immutably", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    act(() => { result.current.updateSession("1", { title: "Updated Title" }); });
    expect(result.current.sessions.find((s) => s.id === "1")?.title).toBe("Updated Title");
    // Other sessions unaffected
    expect(result.current.sessions.find((s) => s.id === "2")?.title).not.toBe("Updated Title");
  });

  test("handleNewSession creates a new tab and activates it", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    const prevCount = result.current.tabs.length;
    act(() => { result.current.handleNewSession(); });
    expect(result.current.tabs.length).toBe(prevCount + 1);
    expect(result.current.sessions.find((s) => s.id === result.current.activeTabId)?.title).toBe("New Session");
  });

  test("handleNewSession uses provided config values", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    act(() => {
      result.current.handleNewSession({
        name: "My Session",
        model: "gpt-5",
        provider: "opencode",
        permission: "full",
        workTarget: "worktree",
      });
    });
    const newSession = result.current.sessions.find((s) => s.id === result.current.activeTabId);
    expect(newSession?.title).toBe("My Session");
    expect(newSession?.model).toBe("gpt-5");
    expect(newSession?.provider).toBe("opencode");
    expect(newSession?.permission).toBe("full");
    expect(newSession?.continueIn).toBe("worktree");
  });

  test("handleCloseTab removes tab and switches active if needed", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    const initialTabs = result.current.tabs.length;
    // Need more than 1 session tab to close one
    expect(initialTabs).toBeGreaterThan(1);
    const idToClose = "1";
    act(() => {
      result.current.handleCloseTab(idToClose, { stopPropagation: mock(() => {}) } as unknown as React.MouseEvent);
    });
    expect(result.current.tabs.find((t) => t.id === idToClose)).toBeUndefined();
    expect(result.current.tabs.length).toBe(initialTabs - 1);
  });

  test("handleCloseTab does not close last session tab", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    // Close all but one session
    const sessionTabs = result.current.tabs.filter((t) => t.type === "session");
    // Leave only the first by closing all others
    for (const tab of sessionTabs.slice(1)) {
      act(() => {
        result.current.handleCloseTab(tab.id, { stopPropagation: mock(() => {}) } as unknown as React.MouseEvent);
      });
    }
    const remaining = result.current.tabs.filter((t) => t.type === "session");
    expect(remaining.length).toBe(1);

    // Attempting to close the last session tab should be a no-op
    const lastId = remaining[0].id;
    act(() => {
      result.current.handleCloseTab(lastId, { stopPropagation: mock(() => {}) } as unknown as React.MouseEvent);
    });
    expect(result.current.tabs.filter((t) => t.type === "session").length).toBe(1);
  });

  test("handleOpenFile opens a new file tab", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    const prevCount = result.current.tabs.length;
    act(() => { result.current.handleOpenFile("README.md"); });
    expect(result.current.tabs.length).toBe(prevCount + 1);
    const fileTab = result.current.tabs.find((t) => t.type === "file" && (t as { fileName: string }).fileName === "README.md");
    expect(fileTab).toBeTruthy();
    expect(result.current.activeTabId).toBe(fileTab!.id);
  });

  test("handleOpenFile reuses existing file tab instead of creating a new one", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    act(() => { result.current.handleOpenFile("main.rs"); });
    const countAfterFirst = result.current.tabs.length;
    act(() => { result.current.handleOpenFile("main.rs"); });
    expect(result.current.tabs.length).toBe(countAfterFirst);
  });

  test("handleSuggestionClick sets composerMessage", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    act(() => { result.current.handleSuggestionClick("Refactor auth"); });
    expect(result.current.composerMessage).toBe("Refactor auth");
  });

  test("setComposerMessage updates composer message directly", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    act(() => { result.current.setComposerMessage("Hello world"); });
    expect(result.current.composerMessage).toBe("Hello world");
  });

  test("handleTabDragStart stores drag index", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    act(() => { result.current.handleTabDragStart(2); });
    expect(result.current.dragTabItem.current).toBe(2);
  });

  test("handleTabDragOver sets tabDropIndex when dragging over different index", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    act(() => { result.current.handleTabDragStart(0); });
    act(() => {
      result.current.handleTabDragOver(
        { preventDefault: mock(() => {}) } as unknown as React.DragEvent,
        2
      );
    });
    expect(result.current.tabDropIndex).toBe(2);
  });

  test("handleTabDragOver clears tabDropIndex when same index as drag source", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    act(() => { result.current.handleTabDragStart(1); });
    act(() => {
      result.current.handleTabDragOver(
        { preventDefault: mock(() => {}) } as unknown as React.DragEvent,
        1
      );
    });
    expect(result.current.tabDropIndex).toBeNull();
  });

  test("handleTabDragEnd reorders tabs", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    const originalIds = result.current.tabs.map((t) => t.id);
    act(() => { result.current.handleTabDragStart(0); });
    act(() => {
      result.current.handleTabDragOver(
        { preventDefault: mock(() => {}) } as unknown as React.DragEvent,
        2
      );
    });
    act(() => { result.current.handleTabDragEnd(); });
    // Tab at index 0 should have moved
    expect(result.current.tabs.map((t) => t.id)).not.toEqual(originalIds);
    expect(result.current.tabDropIndex).toBeNull();
  });

  test("handleTabDragEnd is no-op when dragTabItem is null", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    const originalIds = result.current.tabs.map((t) => t.id);
    // Don't call handleTabDragStart — dragTabItem.current stays null
    act(() => { result.current.handleTabDragEnd(); });
    expect(result.current.tabs.map((t) => t.id)).toEqual(originalIds);
  });

  test("handleTabDragLeave clears tabDropIndex", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    act(() => { result.current.handleTabDragStart(0); });
    act(() => {
      result.current.handleTabDragOver(
        { preventDefault: mock(() => {}) } as unknown as React.DragEvent,
        1
      );
    });
    expect(result.current.tabDropIndex).toBe(1);
    act(() => { result.current.handleTabDragLeave(); });
    expect(result.current.tabDropIndex).toBeNull();
  });

  test("handleTabCloseKey closes tab on Enter", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    const initialCount = result.current.tabs.length;
    expect(initialCount).toBeGreaterThan(1);
    const idToClose = result.current.tabs[1].id;
    act(() => {
      result.current.handleTabCloseKey(idToClose, {
        key: "Enter",
        preventDefault: mock(() => {}),
        stopPropagation: mock(() => {}),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.tabs.find((t) => t.id === idToClose)).toBeUndefined();
  });

  test("handleTabCloseKey closes tab on Space", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    const initialCount = result.current.tabs.length;
    expect(initialCount).toBeGreaterThan(1);
    const idToClose = result.current.tabs[1].id;
    act(() => {
      result.current.handleTabCloseKey(idToClose, {
        key: " ",
        preventDefault: mock(() => {}),
        stopPropagation: mock(() => {}),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.tabs.find((t) => t.id === idToClose)).toBeUndefined();
  });

  test("handleTabCloseKey does nothing for other keys", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    const initialCount = result.current.tabs.length;
    act(() => {
      result.current.handleTabCloseKey("1", {
        key: "a",
        preventDefault: mock(() => {}),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.tabs.length).toBe(initialCount);
  });

  test("processes locationState.newSession on mount", () => {
    const locationState = { newSession: { name: "From Route", provider: "claude" } };
    const { result } = renderHook(() =>
      useSessionWorkspaceState(locationState)
    );
    expect(result.current.sessions.some((s) => s.title === "From Route")).toBe(true);
  });

  test("activeTab is null when activeTabId points to a file tab", () => {
    const { result } = renderHook(() => useSessionWorkspaceState(null));
    act(() => { result.current.handleOpenFile("index.ts"); });
    // activeTab is a file tab, so activeSession should be null
    expect(result.current.activeSession).toBeNull();
  });
});
