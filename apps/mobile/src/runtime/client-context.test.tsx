import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RuntimeSessionStorage, StoredRemoteSession } from "./storage";

const mockCompletePairing = vi.fn();

vi.mock("@lunaria/runtime-client", () => ({
  createRuntimeClient: vi.fn(() => ({
    completePairing: mockCompletePairing,
  })),
}));

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

import { ClientProvider, useClient } from "./client-context";

function TestConsumer() {
  const { auth, isHydrated, error, pairWithDesktop, clearPairing } = useClient();
  return (
    <div>
      <span data-testid="hydrated">{String(isHydrated)}</span>
      <span data-testid="auth">{auth ? auth.accessToken : "null"}</span>
      <span data-testid="error">{error ?? "none"}</span>
      <button onClick={() => pairWithDesktop({ baseUrl: "http://localhost", pairingToken: "tok", pin: "123", deviceName: "Phone" })}>
        Pair
      </button>
      <button onClick={() => clearPairing()}>Clear</button>
    </div>
  );
}

function createMockStorage(initial: StoredRemoteSession | null = null): RuntimeSessionStorage {
  let stored = initial;
  return {
    load: vi.fn(async () => stored),
    save: vi.fn(async (session: StoredRemoteSession) => { stored = session; }),
    clear: vi.fn(async () => { stored = null; }),
  };
}

describe("ClientProvider + useClient", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("throws when useClient is used outside ClientProvider", () => {
    // Suppress console.error for expected throw
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow("useClient must be used inside ClientProvider");
    spy.mockRestore();
  });

  it("hydrates from storage on mount", async () => {
    const session: StoredRemoteSession = {
      tokenType: "Bearer",
      accessToken: "test-access",
      refreshToken: "test-refresh",
      deviceId: "d1",
      scopes: [],
      baseUrl: "http://localhost",
      serverUrl: "http://localhost",
      pairedAt: "2025-01-01T00:00:00.000Z",
    };
    const storage = createMockStorage(session);

    render(
      <ClientProvider storage={storage}>
        <TestConsumer />
      </ClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("hydrated").textContent).toBe("true");
    });
    expect(screen.getByTestId("auth").textContent).toBe("test-access");
  });

  it("hydrates with null when storage is empty", async () => {
    const storage = createMockStorage(null);

    render(
      <ClientProvider storage={storage}>
        <TestConsumer />
      </ClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("hydrated").textContent).toBe("true");
    });
    expect(screen.getByTestId("auth").textContent).toBe("null");
  });

  it("pairWithDesktop saves to storage and updates auth", async () => {
    const storage = createMockStorage();
    mockCompletePairing.mockResolvedValueOnce({
      tokenType: "Bearer",
      accessToken: "paired-access",
      refreshToken: "paired-refresh",
      deviceId: "d2",
      scopes: [],
      baseUrl: "http://localhost",
      serverUrl: "http://localhost",
    });

    render(
      <ClientProvider storage={storage}>
        <TestConsumer />
      </ClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("hydrated").textContent).toBe("true");
    });

    await act(async () => {
      screen.getByText("Pair").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth").textContent).toBe("paired-access");
    });
    expect(storage.save).toHaveBeenCalled();
  });

  it("pairWithDesktop sets error on failure", async () => {
    const storage = createMockStorage();
    mockCompletePairing.mockRejectedValueOnce(new Error("Connection refused"));

    render(
      <ClientProvider storage={storage}>
        <TestConsumer />
      </ClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("hydrated").textContent).toBe("true");
    });

    await act(async () => {
      screen.getByText("Pair").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Connection refused");
    });
  });

  it("clearPairing clears storage and auth", async () => {
    const session: StoredRemoteSession = {
      tokenType: "Bearer",
      accessToken: "test-access",
      refreshToken: "test-refresh",
      deviceId: "d1",
      scopes: [],
      baseUrl: "http://localhost",
      serverUrl: "http://localhost",
      pairedAt: "2025-01-01T00:00:00.000Z",
    };
    const storage = createMockStorage(session);

    render(
      <ClientProvider storage={storage}>
        <TestConsumer />
      </ClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth").textContent).toBe("test-access");
    });

    await act(async () => {
      screen.getByText("Clear").click();
    });

    expect(screen.getByTestId("auth").textContent).toBe("null");
    expect(storage.clear).toHaveBeenCalled();
  });
});
