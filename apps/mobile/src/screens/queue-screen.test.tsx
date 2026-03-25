import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QueueScreen } from "./queue-screen";

vi.mock("@lunaria/i18n", () => ({
  useAmoenaTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/runtime/client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      listQueueMessages: vi.fn().mockResolvedValue([]),
      enqueueMessage: vi.fn(),
      removeQueueMessage: vi.fn(),
      flushQueue: vi.fn(),
      sessionEventsUrl: () => "http://localhost/events",
    },
  }),
}));

vi.mock("@/runtime/event-source", () => ({
  createReconnectingEventSource: () => ({ close: vi.fn() }),
}));

describe("QueueScreen", () => {
  it("renders queue title", () => {
    render(<QueueScreen sessionId="s1" />);
    expect(screen.getByText("mobile.messageQueue")).toBeTruthy();
  });
});
