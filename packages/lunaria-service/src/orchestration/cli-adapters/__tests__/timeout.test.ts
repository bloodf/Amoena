import { describe, it, expect, vi } from "vitest";
import { withTimeout, DEFAULT_SESSION_TIMEOUT_MS } from "../utils/timeout.js";

describe("timeout utilities", () => {
  describe("DEFAULT_SESSION_TIMEOUT_MS", () => {
    it("is 5 minutes in milliseconds", () => {
      expect(DEFAULT_SESSION_TIMEOUT_MS).toBe(5 * 60 * 1000);
    });
  });

  describe("withTimeout", () => {
    it("resolves when promise completes before timeout", async () => {
      const result = await withTimeout(Promise.resolve("done"), 1000);
      expect(result).toBe("done");
    });

    it("rejects when promise takes longer than timeout", async () => {
      vi.useFakeTimers();
      try {
        const slow = new Promise<string>((resolve) => {
          setTimeout(() => resolve("late"), 5000);
        });

        const promise = withTimeout(slow, 100, "slow-op");
        vi.advanceTimersByTime(101);

        await expect(promise).rejects.toThrow("Timeout: slow-op exceeded 100ms");
      } finally {
        vi.useRealTimers();
      }
    });

    it("uses default label in timeout error", async () => {
      vi.useFakeTimers();
      try {
        const slow = new Promise<string>((resolve) => {
          setTimeout(() => resolve("late"), 5000);
        });

        const promise = withTimeout(slow, 50);
        vi.advanceTimersByTime(51);

        await expect(promise).rejects.toThrow("Timeout: operation exceeded 50ms");
      } finally {
        vi.useRealTimers();
      }
    });

    it("propagates rejection from the original promise", async () => {
      const failing = Promise.reject(new Error("original error"));
      await expect(withTimeout(failing, 1000)).rejects.toThrow("original error");
    });

    it("clears timeout on successful resolution", async () => {
      const clearSpy = vi.spyOn(global, "clearTimeout");
      await withTimeout(Promise.resolve("ok"), 1000);
      expect(clearSpy).toHaveBeenCalled();
      clearSpy.mockRestore();
    });

    it("clears timeout on rejection", async () => {
      const clearSpy = vi.spyOn(global, "clearTimeout");
      try {
        await withTimeout(Promise.reject(new Error("fail")), 1000);
      } catch {
        // expected
      }
      expect(clearSpy).toHaveBeenCalled();
      clearSpy.mockRestore();
    });

    it("preserves the resolved value type", async () => {
      const result = await withTimeout(Promise.resolve(42), 1000);
      expect(result).toBe(42);
    });
  });
});
