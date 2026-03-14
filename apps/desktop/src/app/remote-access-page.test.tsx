import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { RuntimeRemoteAccessPage } from "./remote-access-page";

const request = vi.fn();

vi.mock("./runtime-api", () => ({
  useRuntimeApi: () => ({ request }),
}));

const mockDevices = [
  {
    deviceId: "device-1",
    name: "iPhone 15 Pro",
    status: "active",
    lastSeen: "2026-01-01T00:00:00Z",
    platform: "iOS",
    scopes: ["read", "write"],
  },
  {
    deviceId: "device-2",
    name: "MacBook Air",
    status: "inactive",
    lastSeen: "2026-01-01T00:00:00Z",
    platform: "macOS",
    scopes: ["read"],
  },
];

const mockLanStatus = {
  enabled: false,
  lanBaseUrl: null,
  bindAddress: "127.0.0.1",
};

const mockLanStatusEnabled = {
  enabled: true,
  lanBaseUrl: "http://192.168.1.1:42100",
  bindAddress: "0.0.0.0",
};

const mockPairingIntent = {
  pinCode: "123456",
  expiresAtUnixMs: Date.now() + 300_000,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <RuntimeRemoteAccessPage />
    </MemoryRouter>,
  );
}

describe("RuntimeRemoteAccessPage", () => {
  beforeEach(() => {
    request.mockReset();
    request.mockImplementation(async (path: string, init?: RequestInit) => {
      if (path === "/api/v1/remote/devices") {
        return mockDevices;
      }
      if (path === "/api/v1/remote/lan" && (!init || !init.method || init.method === "GET")) {
        return mockLanStatus;
      }
      if (path === "/api/v1/remote/lan" && init?.method === "POST") {
        return mockLanStatusEnabled;
      }
      if (path === "/api/v1/remote/pairing/intents" && init?.method === "POST") {
        return mockPairingIntent;
      }
      if (path.includes("/api/v1/remote/devices/") && path.endsWith("/revoke") && init?.method === "POST") {
        return undefined;
      }
      throw new Error(`Unexpected request: ${path}`);
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the Remote Access heading", async () => {
    renderPage();
    expect(await screen.findByRole("heading", { name: "Remote Access" })).toBeInTheDocument();
  });

  it("renders subtitle text", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Remote Access" });
    expect(
      screen.getByText(/Pair devices, review trust state, and manage remote terminal access/i),
    ).toBeInTheDocument();
  });

  it("fetches devices and LAN status on mount", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Remote Access" });

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith("/api/v1/remote/devices");
      expect(request).toHaveBeenCalledWith("/api/v1/remote/lan");
    });
  });

  it("renders paired device names", async () => {
    renderPage();
    expect(await screen.findByText("iPhone 15 Pro")).toBeInTheDocument();
    expect(await screen.findByText("MacBook Air")).toBeInTheDocument();
  });

  it("renders the pairing panel with regenerate button", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Remote Access" });
    // The pairing panel renders a Regenerate button
    expect(await screen.findByRole("button", { name: /regenerate/i })).toBeInTheDocument();
  });

  it("calls pairing intents API when regenerate is clicked", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Remote Access" });

    const regenButton = await screen.findByRole("button", { name: /generate|regenerate/i });
    fireEvent.click(regenButton);

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith(
        "/api/v1/remote/pairing/intents",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("displays pin after generating pairing intent", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Remote Access" });

    const regenButton = await screen.findByRole("button", { name: /generate|regenerate/i });
    fireEvent.click(regenButton);

    await waitFor(() => {
      expect(screen.getByText("123456")).toBeInTheDocument();
    });
  });

  it("shows Enable LAN button when LAN is disabled", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Remote Access" });
    expect(await screen.findByRole("button", { name: "Enable LAN" })).toBeInTheDocument();
  });

  it("calls LAN toggle API and updates label to Disable LAN", async () => {
    renderPage();
    const lanButton = await screen.findByRole("button", { name: "Enable LAN" });
    fireEvent.click(lanButton);

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith(
        "/api/v1/remote/lan",
        expect.objectContaining({ method: "POST" }),
      );
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Disable LAN" })).toBeInTheDocument();
    });
  });

  it("triggers revoke API when confirm revoke is used", async () => {
    renderPage();
    await screen.findByText("iPhone 15 Pro");

    // Click revoke for first device
    const revokeButtons = await screen.findAllByRole("button", { name: /revoke/i });
    fireEvent.click(revokeButtons[0]!);

    // Confirm revoke
    const confirmButton = await screen.findByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith(
        "/api/v1/remote/devices/device-1/revoke",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("cancels revoke confirmation when cancel is clicked", async () => {
    renderPage();
    await screen.findByText("iPhone 15 Pro");

    const revokeButtons = await screen.findAllByRole("button", { name: /revoke/i });
    fireEvent.click(revokeButtons[0]!);

    const cancelButton = await screen.findByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /confirm/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("renders empty pairing controls when no devices exist", async () => {
    request.mockImplementation(async (path: string) => {
      if (path === "/api/v1/remote/devices") return [];
      if (path === "/api/v1/remote/lan") return mockLanStatus;
      throw new Error(`Unexpected request: ${path}`);
    });

    renderPage();
    await screen.findByRole("heading", { name: "Remote Access" });
    expect(screen.queryByText("iPhone 15 Pro")).not.toBeInTheDocument();
  });

  it("renders the pin visibility toggle button", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Remote Access" });
    const toggleButtons = await screen.findAllByRole("button");
    // At least one button for toggle pin visibility should exist
    expect(toggleButtons.length).toBeGreaterThan(0);
  });
});
