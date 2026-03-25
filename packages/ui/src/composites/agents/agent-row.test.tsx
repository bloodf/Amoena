import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { AgentRow } from "./AgentRow";
import type { ManagedAgent } from "./types";

const agent: ManagedAgent = {
  name: "Claude 4 Sonnet",
  type: "Main",
  source: "built-in",
  provider: "Anthropic",
  model: "claude-4-sonnet",
  status: "active",
  lastActive: "Just now",
  role: "Primary Engineer",
  tools: ["file_edit", "terminal"],
  permission: "Full access",
  mailbox: { count: 0 },
};

function makeProps(overrides: Partial<Parameters<typeof AgentRow>[0]> = {}) {
  return {
    agent,
    depth: 0,
    expanded: false,
    onToggle: mock(() => {}),
    onOpenSettings: mock((_a: ManagedAgent) => {}),
    ...overrides,
  };
}

describe("AgentRow", () => {
  test("renders agent name", () => {
    render(<AgentRow {...makeProps()} />);
    expect(screen.getByText("Claude 4 Sonnet")).toBeTruthy();
  });

  test("renders agent role", () => {
    render(<AgentRow {...makeProps()} />);
    expect(screen.getByText("Primary Engineer")).toBeTruthy();
  });

  test("renders source badge", () => {
    render(<AgentRow {...makeProps()} />);
    expect(screen.getByText("built-in")).toBeTruthy();
  });

  test("renders tool count", () => {
    render(<AgentRow {...makeProps()} />);
    expect(screen.getByText("2")).toBeTruthy();
  });

  test("renders permission label", () => {
    render(<AgentRow {...makeProps()} />);
    expect(screen.getByText("Full access")).toBeTruthy();
  });

  test("calls onToggle when row clicked", () => {
    const onToggle = mock(() => {});
    render(<AgentRow {...makeProps({ onToggle })} />);
    fireEvent.click(screen.getByText("Claude 4 Sonnet"));
    expect(onToggle).toHaveBeenCalled();
  });

  test("calls onOpenSettings when settings button clicked", () => {
    const onOpenSettings = mock((_a: ManagedAgent) => {});
    render(<AgentRow {...makeProps({ onOpenSettings })} />);
    fireEvent.click(screen.getByTitle("Agent Settings"));
    expect(onOpenSettings).toHaveBeenCalledWith(agent);
  });

  test("shows mailbox count when messages exist", () => {
    render(<AgentRow {...makeProps({ agent: { ...agent, mailbox: { count: 5 } } })} />);
    expect(screen.getByText("5")).toBeTruthy();
  });
});
