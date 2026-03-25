import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { RuntimeSessionStorage, StoredRemoteSession } from "./storage";

const mockListSessions = vi.fn().mockResolvedValue([]);
const mockCompletePairing = vi.fn();
const mockCreateSessionMessage = vi.fn().mockResolvedValue({});
const mockResolveRemotePermission = vi.fn().mockResolvedValue(undefined);
const mockGetSessionTranscript = vi.fn().mockResolvedValue([]);
const mockListSessionMessages = vi.fn().mockResolvedValue([]);
const mockListSessionAgents = vi.fn().mockResolvedValue([]);
const mockGlobalEventsUrl = vi.fn(() => "http://localhost/events");

vi.mock("@lunaria/runtime-client", () => ({
  createRuntimeClient: vi.fn(() => ({
    listSessions: mockListSessions,
    completePairing: mockCompletePairing,
    createSessionMessage: mockCreateSessionMessage,
    resolveRemotePermission: mockResolveRemotePermission,
    getSessionTranscript: mockGetSessionTranscript,
    globalEventsUrl: mockGlobalEventsUrl,
    listSessionMessages: mockListSessionMessages,
    listSessionAgents: mockListSessionAgents,
  })),
}));

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

import { RuntimeProvider, useRuntime } from "./provider";

function createMockStorage(initial: StoredRemoteSession | null = null): RuntimeSessionStorage {
  let stored = initial;
  return {
    load: vi.fn(async () => stored),
    save: vi.fn(async (session: StoredRemoteSession) => { stored = session; }),
    clear: vi.fn(async () => { stored = null; }),
  };
}

function TestConsumer() {
  const { auth, isHydrated, error, sessions, pendingPermissions } = useRuntime();
  return (
    <div>
      <span data-testid="hydrated">{String(isHydrated)}</span>
      <span data-testid="auth">{auth ? auth.accessToken : "null"}</span>
      <span data-testid="error">{error ?? "none"}</span>
      <span data-testid="sessions">{sessions.length}</span>
      <span data-testid="permissions">{pendingPermissions.length}</span>
    </div>
  );
}

describe("RuntimeProvider + useRuntime", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("throws when useRuntime is used outside RuntimeProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow("useRuntime must be used inside RuntimeProvider");
    spy.mockRestore();
  });

  it("hydrates and shows isHydrated=true", async () => {
    const storage = createMockStorage();

    render(
      <RuntimeProvider storage={storage}>
        <TestConsumer />
      </RuntimeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("hydrated").textContent).toBe("true");
    });
    expect(screen.getByTestId("auth").textContent).toBe("null");
  });

  it("hydrates with a stored session", async () => {
    const session: StoredRemoteSession = {
      tokenType: "Bearer",
      accessToken: "stored-token",
      refreshToken: "ref",
      deviceId: "d1",
      scopes: [],
      baseUrl: "http://localhost",
      serverUrl: "http://localhost",
      pairedAt: "2025-01-01T00:00:00.000Z",
    };
    const storage = createMockStorage(session);

    render(
      <RuntimeProvider storage={storage}>
        <TestConsumer />
      </RuntimeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth").textContent).toBe("stored-token");
    });
  });

  it("loads sessions when auth is present", async () => {
    const session: StoredRemoteSession = {
      tokenType: "Bearer",
      accessToken: "tok",
      refreshToken: "ref",
      deviceId: "d1",
      scopes: [],
      baseUrl: "http://localhost",
      serverUrl: "http://localhost",
      pairedAt: "2025-01-01T00:00:00.000Z",
    };
    mockListSessions.mockResolvedValue([
      { id: "s1", status: "active", workingDir: "/test", tuiType: "cli" },
    ]);

    const storage = createMockStorage(session);

    render(
      <RuntimeProvider storage={storage}>
        <TestConsumer />
      </RuntimeProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByTestId("sessions").textContent).toBe("1");
      },
      { timeout: 3000 },
    );
  });
});
