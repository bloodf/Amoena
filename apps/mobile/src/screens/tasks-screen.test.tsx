import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TasksScreen } from "./tasks-screen";

vi.mock("@lunaria/i18n", () => ({
  useLunariaTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/runtime/client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      listTasks: vi.fn().mockResolvedValue([]),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      sessionEventsUrl: () => "http://localhost/events",
    },
  }),
}));

vi.mock("@/runtime/event-source", () => ({
  createReconnectingEventSource: () => ({ close: vi.fn() }),
}));

describe("TasksScreen", () => {
  it("renders tasks title", () => {
    render(<TasksScreen sessionId="s1" />);
    expect(screen.getByText("mobile.tasks")).toBeTruthy();
  });
});
