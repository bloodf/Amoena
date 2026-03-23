import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GeminiAdapter } from "../gemini-adapter.js";
import type { AdapterTask } from "../types.js";

const task: AdapterTask = {
  id: "task-gemini-1",
  prompt: "Generate code",
  worktreePath: "/tmp/gemini-worktree",
};

let savedGoogleKey: string | undefined;

beforeEach(() => {
  savedGoogleKey = process.env["GOOGLE_API_KEY"];
});

afterEach(() => {
  if (savedGoogleKey !== undefined) {
    process.env["GOOGLE_API_KEY"] = savedGoogleKey;
  } else {
    delete process.env["GOOGLE_API_KEY"];
  }
});

describe("GeminiAdapter", () => {
  describe("isAvailable()", () => {
    it("missing GOOGLE_API_KEY → isAvailable() returns false", async () => {
      delete process.env["GOOGLE_API_KEY"];
      const adapter = new GeminiAdapter();
      expect(await adapter.isAvailable()).toBe(false);
    });

    it("isAvailable() returns false even if GOOGLE_API_KEY is present (stub not ready)", async () => {
      process.env["GOOGLE_API_KEY"] = "goog-test-key";
      const adapter = new GeminiAdapter();
      expect(await adapter.isAvailable()).toBe(false);
    });

    it("isAvailable() never throws", async () => {
      const adapter = new GeminiAdapter();
      await expect(adapter.isAvailable()).resolves.toBe(false);
    });
  });

  describe("spawn()", () => {
    it("spawn() emits status 'failed' without spawning a process", async () => {
      const adapter = new GeminiAdapter();
      const session = adapter.spawn(task);

      const result = await session.result;
      expect(session.status).toBe("failed");
      expect(result.stderr).toContain("not yet implemented");
    });

    it("spawn() result resolves (not rejects) with failed status", async () => {
      const adapter = new GeminiAdapter();
      const session = adapter.spawn(task);
      await expect(session.result).resolves.toBeDefined();
    });

    it("spawn() result has null exitCode and null tokenUsage", async () => {
      const adapter = new GeminiAdapter();
      const session = adapter.spawn(task);

      const result = await session.result;
      expect(result.exitCode).toBeNull();
      expect(result.tokenUsage).toBeNull();
    });

    it("cancel() on stub session is a no-op", async () => {
      const adapter = new GeminiAdapter();
      const session = adapter.spawn(task);
      await expect(session.cancel()).resolves.toBeUndefined();
    });

    it("session has correct adapterId", () => {
      const adapter = new GeminiAdapter();
      const session = adapter.spawn(task);
      expect(session.adapterId).toBe("gemini");
    });
  });

  describe("adapter properties", () => {
    it("has correct id and displayName", () => {
      const adapter = new GeminiAdapter();
      expect(adapter.id).toBe("gemini");
      expect(adapter.displayName).toBe("Google Gemini");
    });

    it("costPerToken is null", () => {
      const adapter = new GeminiAdapter();
      expect(adapter.costPerToken).toBeNull();
    });

    it("capabilities include code-generation and analysis", () => {
      const adapter = new GeminiAdapter();
      expect(adapter.capabilities).toContain("code-generation");
      expect(adapter.capabilities).toContain("analysis");
    });
  });
});
