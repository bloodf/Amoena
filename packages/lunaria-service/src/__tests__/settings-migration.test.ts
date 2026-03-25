import { describe, it, expect, vi } from "vitest";
import { migrateFromDefaults } from "../settings/settings-migration.js";
import type { SettingsStore } from "../settings/settings-store.js";

function makeMockStore(): SettingsStore & { data: Map<string, unknown> } {
  const data = new Map<string, unknown>();
  return {
    data,
    get: vi.fn((key: string, _scope: string) => data.get(key)),
    set: vi.fn((key: string, value: unknown, _scope: string) => {
      data.set(key, value);
    }),
  } as unknown as SettingsStore & { data: Map<string, unknown> };
}

describe("settings-migration", () => {
  describe("migrateFromDefaults", () => {
    it("sets default values for keys that do not exist", () => {
      const store = makeMockStore();
      const defaults = { theme: "dark", fontSize: 14 };

      migrateFromDefaults(store, defaults);

      expect(store.set).toHaveBeenCalledWith("theme", "dark", "global");
      expect(store.set).toHaveBeenCalledWith("fontSize", 14, "global");
    });

    it("does not overwrite existing values", () => {
      const store = makeMockStore();
      store.data.set("theme", "light");

      const defaults = { theme: "dark", fontSize: 14 };
      migrateFromDefaults(store, defaults);

      // theme should not be overwritten
      expect(store.set).not.toHaveBeenCalledWith("theme", "dark", "global");
      // fontSize should be set
      expect(store.set).toHaveBeenCalledWith("fontSize", 14, "global");
    });

    it("handles empty defaults object", () => {
      const store = makeMockStore();
      migrateFromDefaults(store, {});
      expect(store.set).not.toHaveBeenCalled();
    });

    it("handles all existing keys (no sets)", () => {
      const store = makeMockStore();
      store.data.set("a", 1);
      store.data.set("b", 2);

      migrateFromDefaults(store, { a: 10, b: 20 });
      expect(store.set).not.toHaveBeenCalled();
    });

    it("preserves undefined values as defaults", () => {
      const store = makeMockStore();
      migrateFromDefaults(store, { nullable: null, undef: undefined });

      expect(store.set).toHaveBeenCalledWith("nullable", null, "global");
      expect(store.set).toHaveBeenCalledWith("undef", undefined, "global");
    });

    it("calls get with global scope for each key", () => {
      const store = makeMockStore();
      migrateFromDefaults(store, { a: 1, b: 2, c: 3 });

      expect(store.get).toHaveBeenCalledWith("a", "global");
      expect(store.get).toHaveBeenCalledWith("b", "global");
      expect(store.get).toHaveBeenCalledWith("c", "global");
    });
  });
});
