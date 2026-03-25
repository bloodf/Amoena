import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { AgentDetailSheet } from "./AgentDetailSheet";
import type { ManagedAgent } from "./types";

const baseAgent: ManagedAgent = {
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

function makeProps(overrides: Partial<Parameters<typeof AgentDetailSheet>[0]> = {}) {
  return {
    agent: baseAgent,
    onClose: mock(() => {}),
    onStatusChange: mock((_s: any) => {}),
    onPermissionChange: mock((_p: string) => {}),
    onDelete: mock(() => {}),
    ...overrides,
  };
}

describe("AgentDetailSheet", () => {
  test("renders Agent Settings heading", () => {
    render(<AgentDetailSheet {...makeProps()} />);
    expect(screen.getByText("Agent Settings")).toBeTruthy();
  });

  test("renders agent name", () => {
    render(<AgentDetailSheet {...makeProps()} />);
    expect(screen.getByText("Claude 4 Sonnet")).toBeTruthy();
  });

  test("renders agent provider and model", () => {
    render(<AgentDetailSheet {...makeProps()} />);
    const text = document.body.textContent ?? "";
    expect(text).toContain("Anthropic");
    expect(text).toContain("claude-4-sonnet");
  });

  test("renders role info", () => {
    render(<AgentDetailSheet {...makeProps()} />);
    expect(screen.getByText("Primary Engineer")).toBeTruthy();
  });

  test("renders tools list", () => {
    render(<AgentDetailSheet {...makeProps()} />);
    expect(screen.getByText("file_edit, terminal")).toBeTruthy();
  });

  test("calls onClose when close button clicked", () => {
    const onClose = mock(() => {});
    render(<AgentDetailSheet {...makeProps({ onClose })} />);
    fireEvent.click(screen.getByLabelText("Close agent settings"));
    expect(onClose).toHaveBeenCalled();
  });

  test("calls onDelete when Remove Agent clicked", () => {
    const onDelete = mock(() => {});
    render(<AgentDetailSheet {...makeProps({ onDelete })} />);
    fireEvent.click(screen.getByText("Remove Agent"));
    expect(onDelete).toHaveBeenCalled();
  });

  test("shows Activate button for idle agents", () => {
    render(<AgentDetailSheet {...makeProps({ agent: { ...baseAgent, status: "idle" } })} />);
    expect(screen.getByText("Activate")).toBeTruthy();
  });

  test("shows Pause button for active agents", () => {
    render(<AgentDetailSheet {...makeProps({ agent: { ...baseAgent, status: "active" } })} />);
    expect(screen.getByText("Pause")).toBeTruthy();
  });

  test("shows collaboration profile when division is set", () => {
    render(<AgentDetailSheet {...makeProps({ agent: { ...baseAgent, division: "engineering", collaborationStyle: "cooperative" } })} />);
    expect(screen.getByText("Collaboration Profile")).toBeTruthy();
    expect(screen.getByText("Engineering")).toBeTruthy();
  });

  test("shows mailbox count when messages exist", () => {
    render(<AgentDetailSheet {...makeProps({ agent: { ...baseAgent, mailbox: { count: 3 } } })} />);
    expect(screen.getByText("3 messages")).toBeTruthy();
  });
});
