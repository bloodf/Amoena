import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, mock, vi } from "vitest";

import { MessageTimeline } from "./MessageTimeline";
import { SessionComposer } from "./SessionComposer";
import { AgentsTab } from "@/composites/side-panel/AgentsTab";
import { MemoryTab } from "@/composites/side-panel/MemoryTab";
import type { ManagedAgent } from "@/composites/agents/types";

describe("runtime-ready workspace surfaces", () => {
  it("submits composer payloads with attachments and reasoning choices", async () => {
    const onSubmit = vi.fn(async () => undefined);

    render(
      <SessionComposer
        provider="opencode"
        session={{
          provider: "opencode",
          permission: "default",
          continueIn: "local",
          branch: "main",
        }}
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByPlaceholderText(/Ask anything/i);
    fireEvent.change(input, { target: { value: "@tok" } });
    fireEvent.click(screen.getByText("src/auth/tokens.rs"));
    fireEvent.click(screen.getByLabelText(/open reasoning picker/i));
    fireEvent.click(screen.getByText("Medium"));
    fireEvent.change(input, { target: { value: "Review the auth changes" } });
    fireEvent.drop(input.closest("div")?.parentElement?.parentElement!, {
      preventDefault: () => {},
      dataTransfer: {
        getData: (type: string) =>
          type === "amoena/file"
            ? JSON.stringify({
                type: "folder",
                name: "src/auth",
                path: "src/auth",
                itemCount: 7,
              })
            : "",
        files: [],
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Review the auth changes",
          reasoningLevel: "medium",
          attachments: expect.arrayContaining([
            expect.objectContaining({ type: "file", path: "src/auth/tokens.rs" }),
            expect.objectContaining({ type: "folder", path: "src/auth", itemCount: 7 }),
          ]),
        }),
      );
    });

    await waitFor(() => {
      expect(screen.queryByText("tokens.rs")).toBeNull();
      expect(screen.queryByText("src/auth")).toBeNull();
    });
  });

  it("renders runtime timeline messages and routes permission decisions through callbacks", () => {
    const onApprovePermission = vi.fn(() => {});
    const onDenyPermission = vi.fn(() => {});

    render(
      <MessageTimeline
        isStreaming
        messages={[
          {
            id: "message-1",
            role: "user",
            content: "Fix the refresh flow",
            timestamp: "10:00",
          },
          {
            id: "message-2",
            role: "assistant",
            content: "Reviewing the workspace files now.",
            model: "Claude 4 Sonnet",
            timestamp: "10:01",
            reasoningActive: true,
          },
          {
            id: "message-3",
            role: "permission",
            content: "Write src/auth/tokens.rs",
            timestamp: "10:02",
            requestId: "perm-1",
          },
        ]}
        onApprovePermission={onApprovePermission}
        onDenyPermission={onDenyPermission}
      />,
    );

    expect(screen.getByText("Fix the refresh flow")).toBeTruthy();
    expect(screen.getByText("Reviewing the workspace files now.")).toBeTruthy();
    expect(screen.getByText("REASONING")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    fireEvent.click(screen.getByRole("button", { name: "Deny" }));

    expect(onApprovePermission).toHaveBeenCalledWith("perm-1");
    expect(onDenyPermission).toHaveBeenCalledWith("perm-1");
    expect(screen.getByLabelText(/assistant is streaming/i)).toBeTruthy();
  });

  it("switches the agents tab into a swarm grid when multiple subagents are active", () => {
    const agents: ManagedAgent[] = [
      {
        name: "Navigator",
        type: "Main",
        source: "built-in",
        provider: "runtime",
        model: "gpt-5-mini",
        status: "active",
        lastActive: "now",
        role: "Coordinator",
        tools: ["read_file"],
        permission: "default",
        mailbox: { count: 1, lastMessage: "Parallelize the fixes" },
        children: [
          {
            name: "Patch",
            type: "Sub",
            source: "built-in",
            provider: "runtime",
            model: "gpt-5-mini",
            status: "thinking",
            lastActive: "2s ago",
            role: "Code Agent",
            tools: ["edit_file"],
            permission: "default",
            mailbox: { count: 0 },
          },
          {
            name: "Review",
            type: "Sub",
            source: "built-in",
            provider: "runtime",
            model: "claude-4-sonnet",
            status: "awaiting_review",
            lastActive: "5s ago",
            role: "Review Agent",
            tools: ["read_file"],
            permission: "read-only",
            mailbox: { count: 2, lastMessage: "Ready for review" },
          },
        ],
      },
    ];

    render(<AgentsTab agents={agents} />);

    expect(screen.getByRole("group", { name: /subagent swarm grid/i })).toBeTruthy();
    expect(screen.getByText("Patch")).toBeTruthy();
    expect(screen.getByText("Review")).toBeTruthy();
    expect(screen.getByTestId("swarm-status-thinking")).toBeTruthy();
    expect(screen.getByTestId("swarm-status-awaiting_review")).toBeTruthy();
  });

  it("renders memory tiers with token budget segments and category filtering", () => {
    render(
      <MemoryTab
        tokenBudget={{ total: 2000, l0: 300, l1: 700, l2: 1000 }}
        entries={[
          {
            id: "memory-1",
            title: "Current turn context",
            type: "working",
            category: "pattern",
            timestamp: "10:00",
            l0Summary: "Inspect auth middleware changes",
            l1Summary: "Focus on refresh-token handling in middleware and session bootstrap.",
            l2Content: "Expanded context for middleware review",
          },
          {
            id: "memory-2",
            title: "Preference note",
            type: "session",
            category: "preference",
            timestamp: "09:58",
            l0Summary: "Prefer integration tests over mocks",
            l1Summary: "User preference recorded from earlier session.",
            l2Content: "Long-form preference memory.",
          },
        ]}
      />,
    );

    expect(screen.getByLabelText(/memory token budget/i)).toBeTruthy();
    expect(screen.getByText("Current turn context")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /preference/i }));
    expect(screen.queryByText("Current turn context")).toBeNull();
    expect(screen.getByText("Preference note")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /preference/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /show more/i })[0]);
    expect(screen.getByText(/Focus on refresh-token handling/i)).toBeTruthy();
  });
});
