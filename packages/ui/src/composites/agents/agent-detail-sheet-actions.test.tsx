import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";

import { AgentDetailSheet } from "./AgentDetailSheet";
import type { ManagedAgent } from "./types";

const agent: ManagedAgent = {
  name: "Verifier",
  type: "Main",
  source: "built-in",
  provider: "Anthropic",
  model: "claude-4-sonnet",
  status: "idle",
  lastActive: "now",
  role: "Reviewer",
  tools: ["Read"],
  permission: "Read only",
  mailbox: { count: 0 },
  division: "qa",
  collaborationStyle: "advisory",
  communicationPreference: "detailed",
  decisionWeight: 0.6,
  strengths: ["Regression analysis"],
  limitations: ["Cannot write code"],
};

function makeHandlers() {
  return {
    onClose: vi.fn(() => {}),
    onStatusChange: vi.fn(() => {}),
    onPermissionChange: vi.fn(() => {}),
    onDelete: vi.fn(() => {}),
  };
}

describe("AgentDetailSheet actions", () => {
  test("updates permission, activates idle agents, deletes, and closes", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();

    render(
      <AgentDetailSheet
        agent={agent}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("Read only"), {
      target: { value: "Plan only" },
    });
    fireEvent.click(screen.getByText("Activate"));
    fireEvent.click(screen.getByText("Remove Agent"));
    fireEvent.click(screen.getByLabelText(/close agent settings/i));

    expect(onPermissionChange).toHaveBeenCalledWith("Plan only");
    expect(onStatusChange).toHaveBeenCalledWith("active");
    expect(onDelete).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  test("Done button calls onClose", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={agent}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByText("Done"));
    expect(onClose).toHaveBeenCalled();
  });

  test("clicking backdrop overlay calls onClose", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    const { container } = render(
      <AgentDetailSheet
        agent={agent}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    // Click the outermost backdrop div
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClose).toHaveBeenCalled();
  });

  test("clicking inside the card does not close", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={agent}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByText("Agent Settings"));
    expect(onClose).not.toHaveBeenCalled();
  });

  test("shows Pause and Stop buttons for active agent", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={{ ...agent, status: "active" }}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    expect(screen.getByText("Pause")).toBeDefined();
    expect(screen.getByText("Stop")).toBeDefined();
    expect(screen.queryByText("Activate")).toBeNull();
  });

  test("Pause button calls onStatusChange with paused for running agent", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={{ ...agent, status: "running" }}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByText("Pause"));
    expect(onStatusChange).toHaveBeenCalledWith("paused");
  });

  test("Stop button calls onStatusChange with stopped for paused agent", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={{ ...agent, status: "paused" }}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByText("Stop"));
    expect(onStatusChange).toHaveBeenCalledWith("stopped");
    expect(screen.queryByText("Pause")).toBeNull();
  });

  test("shows Cancel button for preparing agent", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={{ ...agent, status: "preparing" }}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    const cancelBtn = screen.getByText("Cancel");
    expect(cancelBtn).toBeDefined();
    fireEvent.click(cancelBtn);
    expect(onStatusChange).toHaveBeenCalledWith("cancelled");
  });

  test("Activate button shown for stopped/failed/cancelled statuses", () => {
    const statuses = ["stopped", "failed", "cancelled", "created"] as const;
    for (const status of statuses) {
      const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
      const { unmount } = render(
        <AgentDetailSheet
          agent={{ ...agent, status }}
          onClose={onClose}
          onStatusChange={onStatusChange}
          onPermissionChange={onPermissionChange}
          onDelete={onDelete}
        />,
      );
      expect(screen.getByText("Activate")).toBeDefined();
      unmount();
    }
  });

  test("renders agent emoji when present", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={{ ...agent, emoji: "🤖" }}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    expect(screen.getByText("🤖")).toBeDefined();
  });

  test("renders session field when session is present", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={{ ...agent, session: "session-abc-123" }}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    expect(screen.getByText("session-abc-123")).toBeDefined();
  });

  test("renders mailbox count when count > 0", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={{ ...agent, mailbox: { count: 5 } }}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    expect(screen.getByText("5 messages")).toBeDefined();
  });

  test("does not render mailbox row when count is 0", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={{ ...agent, mailbox: { count: 0 } }}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    expect(screen.queryByText(/messages/)).toBeNull();
  });

  test("renders vibe quote when vibe is present", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={{ ...agent, vibe: "Thorough and careful" }}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    expect(screen.getByText(/Thorough and careful/)).toBeDefined();
  });

  test("renders decision weight progress bar", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={{ ...agent, decisionWeight: 0.75 }}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    expect(screen.getByText("75%")).toBeDefined();
  });

  test("shows No strengths recorded when strengths array is empty", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={{ ...agent, strengths: [] }}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    expect(screen.getByText("No strengths recorded")).toBeDefined();
  });

  test("shows No limitations recorded when limitations array is empty", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={{ ...agent, limitations: [] }}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    expect(screen.getByText("No limitations recorded")).toBeDefined();
  });

  test("does not render collaboration profile when no collaboration fields", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    const minimalAgent: ManagedAgent = {
      name: "Minimal",
      type: "Sub",
      source: "custom",
      provider: "OpenAI",
      model: "gpt-4",
      status: "idle",
      lastActive: "never",
      role: "Helper",
      tools: [],
      permission: "Default",
      mailbox: { count: 0 },
    };
    render(
      <AgentDetailSheet
        agent={minimalAgent}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    expect(screen.queryByText("Collaboration Profile")).toBeNull();
  });

  test("renders tools list joined by comma", () => {
    const { onClose, onStatusChange, onPermissionChange, onDelete } = makeHandlers();
    render(
      <AgentDetailSheet
        agent={{ ...agent, tools: ["Read", "Write", "Bash"] }}
        onClose={onClose}
        onStatusChange={onStatusChange}
        onPermissionChange={onPermissionChange}
        onDelete={onDelete}
      />,
    );
    expect(screen.getByText("Read, Write, Bash")).toBeDefined();
  });
});
