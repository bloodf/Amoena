import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MobileSessionScreen } from "./session-screen";

const sendMessage = vi.fn();

vi.mock("@/runtime/provider", () => ({
  useRuntime: () => ({
    auth: {
      baseUrl: "http://127.0.0.1:47821",
      accessToken: "access",
      refreshToken: "refresh",
      deviceId: "device-1",
    },
    isHydrated: true,
    pendingPermissions: [],
    sessions: [
      {
        id: "session-1",
        workingDir: "/tmp/project",
        tuiType: "native",
        status: "active",
        updatedAt: "2026-03-13T00:00:00Z",
      },
    ],
    sendMessage,
    clearPairing: vi.fn(),
    pairWithDesktop: vi.fn(),
    refreshSessions: vi.fn(),
    resolvePermission: vi.fn(),
  }),
  useSessionMessages: () => ({
    isLoading: false,
    messages: [
      {
        id: "message-1",
        role: "assistant",
        content: "Runtime hydrated.",
        createdAt: "2026-03-13T00:00:00Z",
        attachments: [],
      },
    ],
  }),
  useSessionAgents: () => ({
    agents: [
      {
        id: "agent-1",
        agentType: "Navigator",
        model: "gpt-5-mini",
        status: "executing",
        decisionWeight: 0.8,
        collaborationStyle: "directive",
      },
    ],
  }),
}));

describe("MobileSessionScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders transcript and sends a new mobile message", () => {
    render(<MobileSessionScreen sessionId="session-1" />);

    expect(screen.getByText("Runtime hydrated.")).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText("Send a message to the paired desktop session"), {
      target: { value: "Approve the patch" },
    });
    fireEvent.click(screen.getByText("Send to desktop"));

    expect(sendMessage).toHaveBeenCalledWith("session-1", "Approve the patch");
  });
});
