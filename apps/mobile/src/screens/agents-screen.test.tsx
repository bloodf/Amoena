import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AgentsScreen } from "./agents-screen";

vi.mock("@lunaria/i18n", () => ({
  useAmoenaTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/runtime/client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      listSessionAgents: vi.fn().mockResolvedValue([
        { id: "a1", agentType: "Navigator", model: "gpt-5", status: "executing", parentAgentId: null },
      ]),
      sessionEventsUrl: () => "http://localhost/events",
    },
  }),
}));

vi.mock("@/runtime/event-source", () => ({
  createReconnectingEventSource: () => ({ close: vi.fn() }),
}));

describe("AgentsScreen", () => {
  it("renders agents title", () => {
    render(<AgentsScreen sessionId="s1" />);
    expect(screen.getByText("mobile.agents")).toBeTruthy();
  });
});
