import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { useComposerInteractions } from "./useComposerInteractions";
import type { ComposerAttachment } from "./types";

function createSetup(overrides: Partial<Parameters<typeof useComposerInteractions>[0]> = {}) {
  const setMessage = vi.fn();
  const setAttachments = vi.fn((updater: any) => {
    if (typeof updater === "function") return updater([]);
    return updater;
  });
  const onCycleAgent = vi.fn();
  const onSelectAgent = vi.fn();
  const onAutocompleteOpen = vi.fn();
  const textareaRef = { current: null } as React.RefObject<HTMLTextAreaElement | null>;

  const agents = [
    { id: "claude", name: "Claude", color: "#ff00ff", role: "dev", model: "claude-4" },
    { id: "gpt", name: "GPT", color: "#00ff00", role: "review", model: "gpt-5.4" },
  ];

  return {
    props: {
      message: "",
      setMessage,
      attachments: [] as ComposerAttachment[],
      setAttachments,
      textareaRef,
      agents,
      onCycleAgent,
      onSelectAgent,
      onAutocompleteOpen,
      ...overrides,
    },
    mocks: { setMessage, setAttachments, onCycleAgent, onSelectAgent, onAutocompleteOpen },
  };
}

describe("useComposerInteractions", () => {
  test("initial state has all menus closed", () => {
    const { props } = createSetup();
    const { result } = renderHook(() => useComposerInteractions(props));

    expect(result.current.showFilePicker).toBe(false);
    expect(result.current.showUnifiedPalette).toBe(false);
    expect(result.current.showSkills).toBe(false);
    expect(result.current.isDragOver).toBe(false);
  });

  test("handleInput triggers file picker on @ symbol", () => {
    const { props, mocks } = createSetup();
    const { result } = renderHook(() => useComposerInteractions(props));

    act(() => {
      result.current.handleInput("@src");
    });

    expect(mocks.setMessage).toHaveBeenCalledWith("@src");
    expect(mocks.onAutocompleteOpen).toHaveBeenCalled();
  });

  test("handleInput triggers skills menu on $ symbol", () => {
    const { props, mocks } = createSetup();
    const { result } = renderHook(() => useComposerInteractions(props));

    act(() => {
      result.current.handleInput("$auto");
    });

    expect(mocks.setMessage).toHaveBeenCalledWith("$auto");
    expect(mocks.onAutocompleteOpen).toHaveBeenCalled();
  });

  test("handleInput triggers unified palette on / prefix", () => {
    const { props, mocks } = createSetup();
    const { result } = renderHook(() => useComposerInteractions(props));

    act(() => {
      result.current.handleInput("/new");
    });

    expect(mocks.setMessage).toHaveBeenCalledWith("/new");
    expect(mocks.onAutocompleteOpen).toHaveBeenCalled();
  });

  test("handleInput closes autocomplete on normal text", () => {
    const { props, mocks } = createSetup();
    const { result } = renderHook(() => useComposerInteractions(props));

    act(() => {
      result.current.handleInput("hello world");
    });

    expect(mocks.setMessage).toHaveBeenCalledWith("hello world");
  });

  test("closeAutocomplete closes all menus", () => {
    const { props } = createSetup();
    const { result } = renderHook(() => useComposerInteractions(props));

    act(() => {
      result.current.closeAutocomplete();
    });

    expect(result.current.showFilePicker).toBe(false);
    expect(result.current.showUnifiedPalette).toBe(false);
    expect(result.current.showSkills).toBe(false);
  });

  test("removeAttachment calls setAttachments", () => {
    const { props, mocks } = createSetup();
    const { result } = renderHook(() => useComposerInteractions(props));

    act(() => {
      result.current.removeAttachment("src/main.ts");
    });

    expect(mocks.setAttachments).toHaveBeenCalled();
  });
});
