import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "./use-theme";

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("defaults to dark when no stored theme", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("reads stored theme from localStorage", () => {
    localStorage.setItem("lunaria-theme", "light");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  it("adds light class to documentElement when theme is light", () => {
    localStorage.setItem("lunaria-theme", "light");
    renderHook(() => useTheme());
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("removes light class when theme is dark", () => {
    document.documentElement.classList.add("light");
    renderHook(() => useTheme());
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("toggleTheme switches from dark to light", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("light");
  });

  it("toggleTheme switches from light to dark", () => {
    localStorage.setItem("lunaria-theme", "light");
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("setTheme updates theme directly", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("light"));
    expect(result.current.theme).toBe("light");
  });

  it("persists theme to localStorage on change", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("light"));
    expect(localStorage.getItem("lunaria-theme")).toBe("light");
  });
});
