import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";

import { AgentRow } from "./AgentRow";
import type { ManagedAgent } from "./types";

const baseAgent: ManagedAgent = {
  name: "Claude",
  type: "Main",
  source: "built-in",
  provider: "Anthropic",
  model: "claude-4-sonnet",
  status: "active",
  lastActive: "2m ago",
  role: "Primary developer",
  tools: ["read", "write", "execute"],
  permission: "Full access",
  session: "session-1",
  mailbox: { count: 0 },
};

function renderRow(overrides: Partial<ManagedAgent> = {}, expanded = false) {
  const onToggle = vi.fn(() => {});
  const onOpenSettings = vi.fn((_a: ManagedAgent) => {});
  const agent = { ...baseAgent, ...overrides };
  const result = render(
    <AgentRow
      agent={agent}
      expanded={expanded}
      onToggle={onToggle}
      onOpenSettings={onOpenSettings}
    />,
  );
  return { ...result, onToggle, onOpenSettings, agent };
}

describe("AgentRow", () => {
  test("renders the agent name", () => {
    renderRow();
    expect(screen.getByText("Claude")).toBeTruthy();
  });

  test("renders the agent role", () => {
    renderRow();
    expect(screen.getByText("Primary developer")).toBeTruthy();
  });

  test("renders the agent source as a pill", () => {
    renderRow();
    expect(screen.getByText("built-in")).toBeTruthy();
  });

  test("renders provider and model", () => {
    renderRow();
    expect(screen.getByText(/Anthropic · claude-4-sonnet/)).toBeTruthy();
  });

  test("renders tool count", () => {
    renderRow();
    expect(screen.getByText("3")).toBeTruthy();
  });

  test("renders permission text", () => {
    renderRow();
    expect(screen.getByText("Full access")).toBeTruthy();
  });

  test("renders last active time", () => {
    renderRow();
    expect(screen.getByText("2m ago")).toBeTruthy();
  });

  test("renders session ID when present", () => {
    renderRow();
    expect(screen.getByText("session-1")).toBeTruthy();
  });

  test("shows mailbox count when > 0", () => {
    renderRow({ mailbox: { count: 5, lastMessage: "Hello" } });
    expect(screen.getByText("5")).toBeTruthy();
  });

  test("hides mailbox when count is 0", () => {
    renderRow({ mailbox: { count: 0 } });
    // No mail count rendered
    expect(screen.queryByTitle("Hello")).toBeNull();
  });

  test("shows emoji and vibe when present", () => {
    renderRow({ emoji: "🔧", vibe: "Industrious" });
    expect(screen.getByText("🔧")).toBeTruthy();
  });

  test("shows collaboration style when present", () => {
    renderRow({ collaborationStyle: "cooperative" });
    expect(screen.getByText("cooperative")).toBeTruthy();
  });

  test("shows division label when division is set", () => {
    renderRow({ division: "engineering" });
    expect(screen.getByText("Engineering")).toBeTruthy();
  });

  test("calls onToggle when row is clicked", () => {
    const { onToggle } = renderRow();
    fireEvent.click(screen.getByText("Claude"));
    expect(onToggle).toHaveBeenCalled();
  });

  test("calls onOpenSettings when settings button is clicked", () => {
    const { onOpenSettings } = renderRow();
    fireEvent.click(screen.getByTitle("Agent Settings"));
    expect(onOpenSettings).toHaveBeenCalled();
  });

  test("shows AlertTriangle icon when status is failed", () => {
    renderRow({ status: "failed" });
    // Failed agents render alert triangles
    expect(screen.getByText("Claude")).toBeTruthy();
  });
});
