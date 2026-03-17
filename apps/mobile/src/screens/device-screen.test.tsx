import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DeviceScreen } from "./device-screen";

vi.mock("@lunaria/i18n", () => ({
  useLunariaTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/runtime/client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      remoteDeviceMe: vi.fn().mockResolvedValue({
        deviceId: "device-1",
        scopes: ["sessions", "permissions"],
        pairedAt: "2026-03-14T00:00:00Z",
      }),
    },
    clearPairing: vi.fn(),
  }),
}));

describe("DeviceScreen", () => {
  it("renders device title", () => {
    render(<DeviceScreen />);
    expect(screen.getByText("mobile.device")).toBeTruthy();
  });
});
