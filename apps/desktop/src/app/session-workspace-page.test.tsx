import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { RuntimeSessionWorkspacePage } from "./session-workspace-page";

const refreshSessions = vi.fn(async () => undefined);
const request = vi.fn();

const sessions = [
  {
    id: "session-1",
    sessionMode: "native",
    tuiType: "native",
    workingDir: "/tmp/project",
    status: "active",
    createdAt: "2026-03-13T00:00:00Z",
    updatedAt: "2026-03-13T00:00:00Z",
    metadata: { autopilot: true },
  },
];

vi.mock("./runtime-api", () => ({
  useRuntimeApi: () => ({
    request,
  }),
}));

vi.mock("./runtime-context", () => ({
  useRuntimeContext: () => ({
    launchContext: { apiBaseUrl: "http://127.0.0.1:41200" },
    session: { authToken: "desktop-token" },
    sessions,
    refreshSessions,
  }),
}));

class EventSourceStub {
  static instances: EventSourceStub[] = [];

  listeners = new Map<string, Array<(event: MessageEvent<string>) => void>>();

  constructor(public readonly url: string) {
    EventSourceStub.instances.push(this);
  }

  addEventListener(type: string, callback: EventListenerOrEventListenerObject) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(callback as (event: MessageEvent<string>) => void);
    this.listeners.set(type, listeners);
  }

  removeEventListener() {}

  close() {}

  emit(type: string, payload: unknown) {
    const event = {
      data: JSON.stringify(payload),
    } as MessageEvent<string>;
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
  }
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/session/session-1"]}>
      <Routes>
        <Route path="/session/:sessionId" element={<RuntimeSessionWorkspacePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RuntimeSessionWorkspacePage", () => {
  beforeEach(() => {
    EventSourceStub.instances = [];
    refreshSessions.mockClear();
    request.mockReset();
    vi.stubGlobal("EventSource", EventSourceStub as unknown as typeof EventSource);

    let messages = [
      {
        id: "message-1",
        role: "assistant",
        content: "Workspace hydrated from runtime.",
        attachments: [],
        createdAt: "2026-03-13T00:00:00Z",
      },
    ];

    request.mockImplementation(async (path: string, init?: RequestInit) => {
      if (path === "/api/v1/sessions/session-1/messages" && (!init || init.method === undefined)) {
        return messages;
      }

      if (path === "/api/v1/sessions/session-1/agents/list") {
        return [
          {
            id: "agent-main",
            parentAgentId: null,
            agentType: "Navigator",
            model: "gpt-5-mini",
            status: "active",
            division: "engineering",
            collaborationStyle: "directive",
            communicationPreference: "structured",
            decisionWeight: 0.8,
          },
          {
            id: "agent-sub-1",
            parentAgentId: "agent-main",
            agentType: "Patch",
            model: "gpt-5-mini",
            status: "thinking",
            division: "engineering",
            collaborationStyle: "cooperative",
            communicationPreference: "concise",
            decisionWeight: 0.6,
          },
          {
            id: "agent-sub-2",
            parentAgentId: "agent-main",
            agentType: "Review",
            model: "claude-4-sonnet",
            status: "awaiting_review",
            division: "qa",
            collaborationStyle: "critical",
            communicationPreference: "detailed",
            decisionWeight: 0.9,
          },
        ];
      }

      if (path === "/api/v1/sessions/session-1/memory") {
        return {
          entries: [
            {
              id: "memory-1",
              title: "Working memory",
              type: "working",
              category: "pattern",
              timestamp: "10:00",
              l0Summary: "Inspect auth middleware",
              l1Summary: "Focus on refresh tokens",
              l2Content: "Expanded memory content",
            },
          ],
          tokenBudget: { total: 2000, l0: 300, l1: 700, l2: 1000 },
        };
      }

      if (path === "/api/v1/sessions/session-1/transcript") {
        return [];
      }

      if (path === "/api/v1/files/tree?root=%2Ftmp%2Fproject") {
        return [
          {
            name: "src",
            path: "/tmp/project/src",
            nodeType: "folder",
            children: [
              {
                name: "auth",
                path: "/tmp/project/src/auth",
                nodeType: "folder",
                children: [
                  {
                    name: "tokens.rs",
                    path: "/tmp/project/src/auth/tokens.rs",
                    nodeType: "file",
                    children: [],
                  },
                  {
                    name: "mod.rs",
                    path: "/tmp/project/src/auth/mod.rs",
                    nodeType: "file",
                    children: [],
                  },
                ],
              },
            ],
          },
        ];
      }

      if (path.startsWith("/api/v1/files/content?path=")) {
        return {
          path: "/tmp/project/src/auth/tokens.rs",
          content: "pub fn refresh() {}",
        };
      }

      if (path === "/api/v1/terminal/sessions") {
        return { terminalSessionId: "terminal-1" };
      }

      if (path.startsWith("/api/v1/terminal/sessions/terminal-1/events?lastEventId=")) {
        return path.endsWith("lastEventId=0") ? [{ eventId: 1, data: "cargo test\n" }] : [];
      }

      if (path === "/api/v1/sessions/session-1/messages" && init?.method === "POST") {
        const body = JSON.parse(String(init.body));
        messages = [
          ...messages,
          {
            id: "message-created",
            role: "user",
            content: body.content,
            attachments: body.attachments,
            createdAt: "2026-03-13T00:01:00Z",
          },
        ];
        return { id: "message-created" };
      }

      if (path === "/api/v1/sessions/session-1" && init?.method === "DELETE") {
        return undefined;
      }

      throw new Error(`Unexpected request: ${path}`);
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("maps composer attachments to structured refs and shows runtime stream updates", async () => {
    renderPage();

    await screen.findByText("Workspace hydrated from runtime.");

    const input = screen.getByPlaceholderText(/Ask anything/i);
    fireEvent.change(input, { target: { value: "@tok" } });
    fireEvent.click(await screen.findByText("src/auth/tokens.rs"));
    fireEvent.click(screen.getByLabelText(/open reasoning picker/i));
    fireEvent.click(screen.getByText("Medium"));
    fireEvent.change(input, { target: { value: "Ship the auth refactor" } });
    fireEvent.drop(input.closest("div")?.parentElement?.parentElement!, {
      preventDefault: () => {},
      dataTransfer: {
        getData: (type: string) =>
          type === "lunaria/file"
            ? JSON.stringify({
                type: "folder",
                name: "auth",
                path: "/tmp/project/src/auth",
                itemCount: 2,
              })
            : "",
        files: [],
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      const postCall = request.mock.calls.find(
        ([path, init]) => path === "/api/v1/sessions/session-1/messages" && init?.method === "POST",
      );
      expect(postCall).toBeTruthy();

      const body = JSON.parse(String(postCall?.[1]?.body));
      expect(body).toMatchObject({
        content: "Ship the auth refactor",
        taskType: "default",
        reasoningMode: "auto",
        reasoningEffort: "medium",
        agentId: "sisyphus",
        modelId: "gpt-5.4",
        planMode: false,
        attachments: [
          {
            type: "file_ref",
            name: "tokens.rs",
            path: "src/auth/tokens.rs",
            status: "preview",
          },
          {
            type: "folder_ref",
            name: "auth",
            path: "/tmp/project/src/auth",
            itemCount: 2,
            truncated: false,
            inferredTypes: ["rs"],
          },
        ],
      });
    });

    const stream = EventSourceStub.instances.at(0);
    expect(stream).toBeTruthy();
    stream?.emit("message.created", {
      eventType: "message.created",
      sessionId: "session-1",
      payload: {
        id: "message-stream",
        role: "assistant",
        content: "Live stream update from Axum.",
        attachments: [],
        createdAt: "2026-03-13T00:02:00Z",
      },
    });

    expect(await screen.findByText("Live stream update from Axum.")).toBeInTheDocument();
  });

  it("renders the pipeline stepper for autopilot sessions and updates phases from SSE", async () => {
    renderPage();

    await screen.findByText("Workspace hydrated from runtime.");
    await waitFor(() => {
      expect(screen.getByText("Goal")).toBeInTheDocument();
      expect(screen.getByText("Stories")).toBeInTheDocument();
    });

    const stream = EventSourceStub.instances.at(0);
    stream?.emit("autopilot.phase", {
      eventType: "autopilot.phase",
      sessionId: "session-1",
      payload: { currentPhase: "verification" },
    });

    await waitFor(() => {
      expect(screen.getByText("Verify")).toHaveClass("border-primary");
    });
  });

  it("deletes the active session when its tab close control is used", async () => {
    renderPage();

    await screen.findByText("Workspace hydrated from runtime.");

    const projectTab = screen.getByText("project").parentElement;
    const closeControl = projectTab?.querySelector('[role="button"]');
    expect(closeControl).toBeTruthy();

    fireEvent.click(closeControl!);

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith("/api/v1/sessions/session-1", {
        method: "DELETE",
      });
      expect(refreshSessions).toHaveBeenCalled();
    });
  });
});
