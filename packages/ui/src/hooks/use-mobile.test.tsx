import { renderHook } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
  test("returns false for desktop width", () => {
    // happy-dom defaults to a desktop-sized window
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  test("returns a boolean value", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe("boolean");
  });
});
