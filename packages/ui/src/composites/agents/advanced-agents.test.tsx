import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";

import { AgentDetailSheet } from "./AgentDetailSheet";
import { AgentRow } from "./AgentRow";
import { SubAgentSwarmGrid } from "./SubAgentSwarmGrid";
import { TeamStatusTable } from "./TeamStatusTable";
import type { AgentTeam, ManagedAgent } from "./types";
import { AgentManagementScreen } from "@/screens/AgentManagementScreen";

const baseAgent: ManagedAgent = {
  name: "Navigator",
  type: "Main",
  source: "built-in",
  provider: "Anthropic",
  model: "claude-4-sonnet",
  status: "idle",
  lastActive: "just now",
  role: "Lead agent",
  tools: ["Read", "Edit"],
  permission: "Default",
  mailbox: { count: 1, lastMessage: "Heads up" },
  division: "engineering",
  emoji: "🛠",
  collaborationStyle: "directive",
  communicationPreference: "structured",
  decisionWeight: 0.8,
  strengths: ["Planning", "Execution"],
  limitations: ["Needs clearer specs"],
};

describe("advanced agent surfaces", () => {
  test("division chips filter the management list and detail sheets show collaboration profile fields", () => {
    render(<AgentManagementScreen />);

    fireEvent.click(screen.getByRole("button", { name: "Security" }));
    expect(screen.getByText("Security Auditor")).toBeTruthy();
    expect(screen.queryByText("Claude 4 Sonnet")).toBeNull();

    fireEvent.click(screen.getAllByTitle("Agent Settings")[0]!);
    expect(screen.getByText("Collaboration Profile")).toBeTruthy();
    expect(screen.getByText("Threat modeling")).toBeTruthy();
    expect(screen.getByText("High false-positive rate without context")).toBeTruthy();
  });

  test("agent rows support the extended 10-state status model", () => {
    const statuses: ManagedAgent["status"][] = [
      "idle",
      "thinking",
      "executing",
      "blocked",
      "awaiting_review",
      "paused",
      "complete",
      "error",
      "delegating",
      "synthesizing",
    ];

    for (const status of statuses) {
      const { unmount } = render(
        <AgentRow
          agent={{ ...baseAgent, status, name: `Agent ${status}` }}
          expanded={false}
          onToggle={() => {}}
          onOpenSettings={() => {}}
        />,
      );

      expect(screen.getByText(`Agent ${status}`)).toBeTruthy();
      unmount();
    }
  });

  test("detail sheets render strengths and limitations with empty-state fallbacks", () => {
    const { rerender } = render(
      <AgentDetailSheet
        agent={baseAgent}
        onClose={() => {}}
        onStatusChange={() => {}}
        onPermissionChange={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByText("Planning")).toBeTruthy();
    expect(screen.getByText("Needs clearer specs")).toBeTruthy();

    rerender(
      <AgentDetailSheet
        agent={{ ...baseAgent, strengths: [], limitations: [] }}
        onClose={() => {}}
        onStatusChange={() => {}}
        onPermissionChange={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(screen.getByText("No strengths recorded")).toBeTruthy();
    expect(screen.getByText("No limitations recorded")).toBeTruthy();
  });

  test("subagent swarm grid renders live cards for parallel workers", () => {
    render(
      <SubAgentSwarmGrid
        agents={[
          { ...baseAgent, name: "Builder", status: "executing" },
          { ...baseAgent, name: "Reviewer", status: "awaiting_review", division: "qa", emoji: "🧪" },
        ]}
      />,
    );

    expect(screen.getByText("Builder")).toBeTruthy();
    expect(screen.getByText("Reviewer")).toBeTruthy();
    expect(screen.getByText("Awaiting Review")).toBeTruthy();
  });

  test("team status table renders new collaboration style chips and proportional weight bars", () => {
    const team: AgentTeam = {
      id: "team-1",
      name: "Consensus Team",
      description: "Runtime-backed decision review",
      status: "active",
      totalTokens: "24k",
      startedAt: "now",
      completedTasks: 2,
      totalTasks: 4,
      agents: [
        {
          id: "agent-1",
          name: "Architect",
          role: "Lead",
          model: "claude-4-sonnet",
          tuiColor: "tui-claude",
          status: "working",
          currentTask: "Reviewing design",
          collaborationStyle: "directive",
          decisionWeight: 0.9,
          tokensUsed: "12k",
        },
        {
          id: "agent-2",
          name: "Reviewer",
          role: "QA",
          model: "gpt-5",
          tuiColor: "tui-opencode",
          status: "idle",
          currentTask: "Waiting",
          collaborationStyle: "advisory",
          decisionWeight: 0.4,
          tokensUsed: "4k",
        },
      ],
    };

    render(<TeamStatusTable team={team} />);

    expect(screen.getByText("directive")).toBeTruthy();
    expect(screen.getByText("advisory")).toBeTruthy();
    expect(screen.getByText("0.9")).toBeTruthy();
    expect(screen.getByText("0.4")).toBeTruthy();
  });
});
