import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CachedRunSummary, NotificationPreferences } from "@/lib/types";
import { MAX_CACHED_RUNS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// In-memory AsyncStorage mock — mirrors the API from
// @react-native-async-storage/async-storage.
// ---------------------------------------------------------------------------

class InMemoryAsyncStorage {
  private store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  async getAllKeys(): Promise<string[]> {
    return [...this.store.keys()];
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    return keys.map((k) => [k, this.store.get(k) ?? null]);
  }

  async multiRemove(keys: string[]): Promise<void> {
    for (const k of keys) this.store.delete(k);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

// ---------------------------------------------------------------------------
// Storage wrapper under test — thin helpers over AsyncStorage following
// the same immutability pattern as src/runtime/storage.ts.
// ---------------------------------------------------------------------------

const KEYS = {
  NOTIFICATION_PREFS: "amoena.notification.prefs",
  CACHED_RUNS: "amoena.cached.runs",
  THEME: "amoena.theme",
} as const;

function createAppStorage(backend: InMemoryAsyncStorage) {
  return {
    async getNotificationPreferences(): Promise<NotificationPreferences | null> {
      const raw = await backend.getItem(KEYS.NOTIFICATION_PREFS);
      return raw ? (JSON.parse(raw) as NotificationPreferences) : null;
    },

    async saveNotificationPreferences(prefs: NotificationPreferences): Promise<void> {
      await backend.setItem(KEYS.NOTIFICATION_PREFS, JSON.stringify(prefs));
    },

    async getCachedRuns(): Promise<readonly CachedRunSummary[]> {
      const raw = await backend.getItem(KEYS.CACHED_RUNS);
      return raw ? (JSON.parse(raw) as CachedRunSummary[]) : [];
    },

    async addCachedRun(run: CachedRunSummary): Promise<readonly CachedRunSummary[]> {
      const existing = await this.getCachedRuns();
      // Deduplicate by sessionId, keeping the newest entry
      const filtered = existing.filter((r) => r.sessionId !== run.sessionId);
      const updated = [run, ...filtered].slice(0, MAX_CACHED_RUNS);
      await backend.setItem(KEYS.CACHED_RUNS, JSON.stringify(updated));
      return updated;
    },

    async removeCachedRun(sessionId: string): Promise<readonly CachedRunSummary[]> {
      const existing = await this.getCachedRuns();
      const updated = existing.filter((r) => r.sessionId !== sessionId);
      await backend.setItem(KEYS.CACHED_RUNS, JSON.stringify(updated));
      return updated;
    },

    async clearCachedRuns(): Promise<void> {
      await backend.removeItem(KEYS.CACHED_RUNS);
    },

    async getTheme(): Promise<string | null> {
      return backend.getItem(KEYS.THEME);
    },

    async setTheme(theme: string): Promise<void> {
      await backend.setItem(KEYS.THEME, theme);
    },

    async clearAll(): Promise<void> {
      await backend.clear();
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AppStorage", () => {
  let backend: InMemoryAsyncStorage;
  let storage: ReturnType<typeof createAppStorage>;

  beforeEach(() => {
    backend = new InMemoryAsyncStorage();
    storage = createAppStorage(backend);
  });

  describe("notification preferences", () => {
    const prefs: NotificationPreferences = {
      permissionRequests: true,
      sessionStarted: false,
      sessionCompleted: true,
      costAlerts: true,
      errorAlerts: true,
    };

    it("returns null when no preferences are saved", async () => {
      expect(await storage.getNotificationPreferences()).toBeNull();
    });

    it("saves and retrieves preferences", async () => {
      await storage.saveNotificationPreferences(prefs);
      expect(await storage.getNotificationPreferences()).toEqual(prefs);
    });

    it("overwrites existing preferences immutably", async () => {
      await storage.saveNotificationPreferences(prefs);
      const updated = { ...prefs, sessionStarted: true };
      await storage.saveNotificationPreferences(updated);

      const result = await storage.getNotificationPreferences();
      expect(result?.sessionStarted).toBe(true);
    });
  });

  describe("cached runs", () => {
    const makeRun = (id: string, overrides?: Partial<CachedRunSummary>): CachedRunSummary => ({
      sessionId: id,
      workingDir: `/projects/${id}`,
      status: "completed",
      startedAt: "2026-03-24T10:00:00Z",
      completedAt: "2026-03-24T10:30:00Z",
      tokenUsage: 5000,
      costUsd: 0.25,
      agentCount: 2,
      cachedAt: "2026-03-24T10:31:00Z",
      ...overrides,
    });

    it("returns empty array when no runs are cached", async () => {
      expect(await storage.getCachedRuns()).toEqual([]);
    });

    it("adds a run and retrieves it", async () => {
      const run = makeRun("sess-1");
      await storage.addCachedRun(run);

      const runs = await storage.getCachedRuns();
      expect(runs).toHaveLength(1);
      expect(runs[0]!.sessionId).toBe("sess-1");
    });

    it("newest run is at the front", async () => {
      await storage.addCachedRun(makeRun("sess-1"));
      await storage.addCachedRun(makeRun("sess-2"));

      const runs = await storage.getCachedRuns();
      expect(runs[0]!.sessionId).toBe("sess-2");
      expect(runs[1]!.sessionId).toBe("sess-1");
    });

    it("deduplicates by sessionId, keeping newest", async () => {
      await storage.addCachedRun(makeRun("sess-1", { costUsd: 0.1 }));
      await storage.addCachedRun(makeRun("sess-1", { costUsd: 0.5 }));

      const runs = await storage.getCachedRuns();
      expect(runs).toHaveLength(1);
      expect(runs[0]!.costUsd).toBe(0.5);
    });

    it("enforces max cached runs limit", async () => {
      for (let i = 0; i < MAX_CACHED_RUNS + 10; i++) {
        await storage.addCachedRun(makeRun(`sess-${i}`));
      }

      const runs = await storage.getCachedRuns();
      expect(runs.length).toBe(MAX_CACHED_RUNS);
    });

    it("removes a run by sessionId", async () => {
      await storage.addCachedRun(makeRun("sess-1"));
      await storage.addCachedRun(makeRun("sess-2"));

      const remaining = await storage.removeCachedRun("sess-1");
      expect(remaining).toHaveLength(1);
      expect(remaining[0]!.sessionId).toBe("sess-2");
    });

    it("clears all cached runs", async () => {
      await storage.addCachedRun(makeRun("sess-1"));
      await storage.addCachedRun(makeRun("sess-2"));

      await storage.clearCachedRuns();
      expect(await storage.getCachedRuns()).toEqual([]);
    });
  });

  describe("theme", () => {
    it("returns null when no theme is set", async () => {
      expect(await storage.getTheme()).toBeNull();
    });

    it("saves and retrieves theme", async () => {
      await storage.setTheme("dark");
      expect(await storage.getTheme()).toBe("dark");
    });

    it("overwrites existing theme", async () => {
      await storage.setTheme("dark");
      await storage.setTheme("light");
      expect(await storage.getTheme()).toBe("light");
    });
  });

  describe("clearAll", () => {
    it("removes all stored data", async () => {
      await storage.saveNotificationPreferences({
        permissionRequests: true,
        sessionStarted: true,
        sessionCompleted: true,
        costAlerts: true,
        errorAlerts: true,
      });
      await storage.setTheme("dark");

      await storage.clearAll();

      expect(await storage.getNotificationPreferences()).toBeNull();
      expect(await storage.getTheme()).toBeNull();
      expect(await storage.getCachedRuns()).toEqual([]);
    });
  });
});
