import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetItemAsync, mockSetItemAsync, mockDeleteItemAsync } = vi.hoisted(() => ({
  mockGetItemAsync: vi.fn(),
  mockSetItemAsync: vi.fn(),
  mockDeleteItemAsync: vi.fn(),
}));

vi.mock("expo-secure-store", () => ({
  default: {},
  getItemAsync: mockGetItemAsync,
  setItemAsync: mockSetItemAsync,
  deleteItemAsync: mockDeleteItemAsync,
}));

import { secureRuntimeSessionStorage, type StoredRemoteSession } from "./storage";

const STORAGE_KEY = "amoena.remote.session";

const fakeSession: StoredRemoteSession = {
  accessToken: "tok-123",
  baseUrl: "http://localhost:47821",
  pairedAt: "2025-01-01T00:00:00Z",
} as StoredRemoteSession;

describe("secureRuntimeSessionStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("load", () => {
    it("returns null when no data is stored", async () => {
      mockGetItemAsync.mockResolvedValue(null);
      const result = await secureRuntimeSessionStorage.load();
      expect(result).toBeNull();
      expect(mockGetItemAsync).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it("parses and returns stored session data", async () => {
      mockGetItemAsync.mockResolvedValue(JSON.stringify(fakeSession));
      const result = await secureRuntimeSessionStorage.load();
      expect(result).toEqual(fakeSession);
    });

    it("reads from the correct storage key", async () => {
      mockGetItemAsync.mockResolvedValue(null);
      await secureRuntimeSessionStorage.load();
      expect(mockGetItemAsync).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it("returns parsed object with all fields intact", async () => {
      const session: StoredRemoteSession = {
        ...fakeSession,
        pairedAt: "2025-06-15T12:30:00Z",
      };
      mockGetItemAsync.mockResolvedValue(JSON.stringify(session));
      const result = await secureRuntimeSessionStorage.load();
      expect(result?.pairedAt).toBe("2025-06-15T12:30:00Z");
    });
  });

  describe("save", () => {
    it("serializes and stores the session", async () => {
      await secureRuntimeSessionStorage.save(fakeSession);
      expect(mockSetItemAsync).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(fakeSession),
      );
    });

    it("overwrites previous data with new session", async () => {
      const newSession = { ...fakeSession, accessToken: "tok-456" };
      await secureRuntimeSessionStorage.save(newSession as StoredRemoteSession);
      expect(mockSetItemAsync).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(newSession),
      );
    });
  });

  describe("clear", () => {
    it("deletes the stored session", async () => {
      await secureRuntimeSessionStorage.clear();
      expect(mockDeleteItemAsync).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it("calls deleteItemAsync exactly once", async () => {
      await secureRuntimeSessionStorage.clear();
      expect(mockDeleteItemAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe("round-trip", () => {
    it("save then load returns the same data", async () => {
      let stored: string | null = null;
      mockSetItemAsync.mockImplementation(async (_key: string, value: string) => {
        stored = value;
      });
      mockGetItemAsync.mockImplementation(async () => stored);

      await secureRuntimeSessionStorage.save(fakeSession);
      const loaded = await secureRuntimeSessionStorage.load();
      expect(loaded).toEqual(fakeSession);
    });
  });
});
