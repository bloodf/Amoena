import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MobileHomeScreen } from "./home-screen";

const pairWithDesktop = vi.fn();
const clearPairing = vi.fn();

vi.mock("@/runtime/provider", () => ({
  useRuntime: () => ({
    auth: null,
    isHydrated: true,
    pendingPermissions: [],
    sessions: [],
    pairWithDesktop,
    clearPairing,
    refreshSessions: vi.fn(),
    resolvePermission: vi.fn(),
    sendMessage: vi.fn(),
  }),
}));

vi.mock("expo-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

describe("MobileHomeScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits pairing details when the device is not yet paired", () => {
    render(<MobileHomeScreen />);

    fireEvent.change(screen.getByPlaceholderText("Desktop base URL"), {
      target: { value: "http://127.0.0.1:47821" },
    });
    fireEvent.change(screen.getByPlaceholderText("Pairing token"), {
      target: { value: "pair-token" },
    });
    fireEvent.change(screen.getByPlaceholderText("PIN"), {
      target: { value: "847291" },
    });
    fireEvent.click(screen.getByText("Complete pairing"));

    expect(pairWithDesktop).toHaveBeenCalledWith({
      baseUrl: "http://127.0.0.1:47821",
      pairingToken: "pair-token",
      pin: "847291",
      deviceName: "Lunaria Phone",
    });
  });
});
