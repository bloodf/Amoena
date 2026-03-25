import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SettingsScreen } from "./settings-screen";

vi.mock("@lunaria/i18n", () => ({
  useAmoenaTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/runtime/provider", () => ({
  useRuntime: () => ({
    auth: null,
    clearPairing: vi.fn(),
    error: null,
    isHydrated: true,
    pendingPermissions: [],
    sessions: [],
    pairWithDesktop: vi.fn(),
    refreshSessions: vi.fn(),
    resolvePermission: vi.fn(),
    sendMessage: vi.fn(),
  }),
}));

vi.mock("@/lib/storage", () => ({
  loadPreferences: vi.fn().mockResolvedValue({
    notificationsEnabled: true,
    darkMode: true,
    costAlertThreshold: 1.0,
  }),
  savePreferences: vi.fn().mockResolvedValue(undefined),
}));

describe("SettingsScreen", () => {
  it("renders settings title", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("mobile.settings")).toBeTruthy();
  });
});
