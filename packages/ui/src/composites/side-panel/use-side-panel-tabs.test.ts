import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSidePanelTabs } from "./useSidePanelTabs";

describe("useSidePanelTabs", () => {
  it("initialises with files as active tab", () => {
    const { result } = renderHook(() => useSidePanelTabs());
    expect(result.current.activeTab).toBe("files");
  });

  it("initialises with default tabs", () => {
    const { result } = renderHook(() => useSidePanelTabs());
    expect(result.current.tabs.length).toBe(4);
  });

  it("initialises dropIndex as null", () => {
    const { result } = renderHook(() => useSidePanelTabs());
    expect(result.current.dropIndex).toBeNull();
  });

  it("setActiveTab updates activeTab", () => {
    const { result } = renderHook(() => useSidePanelTabs());
    act(() => result.current.setActiveTab("memory"));
    expect(result.current.activeTab).toBe("memory");
  });

  it("handleDragStart sets dragItem ref", () => {
    const { result } = renderHook(() => useSidePanelTabs());
    act(() => result.current.handleDragStart(2));
    expect(result.current.dragItem.current).toBe(2);
  });

  it("handleDragOver sets dropIndex when drag source differs from target", () => {
    const { result } = renderHook(() => useSidePanelTabs());
    act(() => result.current.handleDragStart(0));
    const fakeEvent = { preventDefault: () => {} } as React.DragEvent;
    act(() => result.current.handleDragOver(fakeEvent, 2));
    expect(result.current.dropIndex).toBe(2);
  });

  it("handleDragOver sets dropIndex to null when source equals target", () => {
    const { result } = renderHook(() => useSidePanelTabs());
    act(() => result.current.handleDragStart(1));
    const fakeEvent = { preventDefault: () => {} } as React.DragEvent;
    act(() => result.current.handleDragOver(fakeEvent, 1));
    expect(result.current.dropIndex).toBeNull();
  });

  it("handleDragOver sets dropIndex to null when dragItem is null", () => {
    const { result } = renderHook(() => useSidePanelTabs());
    // dragItem starts null
    const fakeEvent = { preventDefault: () => {} } as React.DragEvent;
    act(() => result.current.handleDragOver(fakeEvent, 2));
    expect(result.current.dropIndex).toBeNull();
  });

  it("handleDragEnd resets state when dragItem is null", () => {
    const { result } = renderHook(() => useSidePanelTabs());
    act(() => result.current.handleDragEnd());
    expect(result.current.dropIndex).toBeNull();
    expect(result.current.dragItem.current).toBeNull();
  });

  it("handleDragEnd resets when dropIndex is null", () => {
    const { result } = renderHook(() => useSidePanelTabs());
    act(() => result.current.handleDragStart(0));
    // dropIndex stays null
    act(() => result.current.handleDragEnd());
    expect(result.current.dropIndex).toBeNull();
    expect(result.current.dragItem.current).toBeNull();
  });

  it("handleDragEnd reorders tabs when both dragItem and dropIndex are set", () => {
    const { result } = renderHook(() => useSidePanelTabs());
    const originalOrder = result.current.tabs.map(t => t.id);

    // Drag tab 0 to position 2
    act(() => result.current.handleDragStart(0));
    const fakeEvent = { preventDefault: () => {} } as React.DragEvent;
    act(() => result.current.handleDragOver(fakeEvent, 2));
    act(() => result.current.handleDragEnd());

    const newOrder = result.current.tabs.map(t => t.id);
    // The order should have changed
    expect(newOrder).not.toEqual(originalOrder);
    expect(result.current.dropIndex).toBeNull();
    expect(result.current.dragItem.current).toBeNull();
  });

  it("handleDragLeave resets dropIndex to null", () => {
    const { result } = renderHook(() => useSidePanelTabs());
    act(() => result.current.handleDragStart(0));
    const fakeEvent = { preventDefault: () => {} } as React.DragEvent;
    act(() => result.current.handleDragOver(fakeEvent, 2));
    expect(result.current.dropIndex).toBe(2);
    act(() => result.current.handleDragLeave());
    expect(result.current.dropIndex).toBeNull();
  });
});
