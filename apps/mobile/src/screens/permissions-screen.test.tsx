import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MobilePermissionsScreen } from "./permissions-screen";

vi.mock("@/runtime/provider", () => ({
  useRuntime: () => ({
    pendingPermissions: [
      {
        requestId: "req-1",
        sessionId: "session-1",
        message: "bash requires approval",
      },
    ],
    resolvePermission: vi.fn(),
  }),
}));

describe("MobilePermissionsScreen", () => {
  it("renders pending approval cards from the selected session transcript", () => {
    render(<MobilePermissionsScreen />);

    expect(screen.getByText("Permission queue")).toBeTruthy();
    expect(screen.getByText("bash requires approval")).toBeTruthy();
  });
});
