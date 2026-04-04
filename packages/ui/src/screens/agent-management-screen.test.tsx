import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { AgentManagementScreen } from "./AgentManagementScreen";
import type { AgentTeam, ManagedAgent } from "@/composites/agents/types";

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
    permission: "Default",
    session: "runtime-session",
    mailbox: { count: 1, lastMessage: "Parallelize the fixes" },
    division: "engineering",
    emoji: "🛠",
    collaborationStyle: "directive",
    communicationPreference: "structured",
    decisionWeight: 0.9,
    strengths: ["Planning", "Execution"],
    limitations: ["Needs human approval for destructive actions"],
  },
  {
    name: "Verifier",
    type: "Main",
    source: "built-in",
    provider: "runtime",
    model: "claude-4-sonnet",
    status: "awaiting_review",
    lastActive: "2m ago",
    role: "Reviewer",
    tools: ["read_file"],
    permission: "Read only",
    session: "runtime-session",
    mailbox: { count: 0 },
    division: "qa",
    emoji: "🧪",
    collaborationStyle: "advisory",
    communicationPreference: "detailed",
    decisionWeight: 0.7,
    strengths: ["Regression analysis"],
    limitations: ["Does not write code"],
  },
];

const teams: AgentTeam[] = [
  {
    id: "team-1",
    name: "Runtime Team",
    description: "Live session team",
    status: "active",
    totalTokens: "12.4k",
    startedAt: "now",
    completedTasks: 2,
    totalTasks: 4,
    agents: [
      {
        id: "member-1",
        name: "Navigator",
        role: "Lead",
        model: "gpt-5-mini",
        tuiColor: "tui-opencode",
        status: "working",
        collaborationStyle: "directive",
        communicationPreference: "structured",
        decisionWeight: 0.9,
        currentTask: "Plan patches",
        tokensUsed: "8.2k",
      },
      {
        id: "member-2",
        name: "Verifier",
        role: "QA",
        model: "claude-4-sonnet",
        tuiColor: "tui-claude",
        status: "waiting",
        collaborationStyle: "advisory",
        communicationPreference: "detailed",
        decisionWeight: 0.7,
        currentTask: "Review deltas",
        tokensUsed: "4.2k",
      },
    ],
  },
];

describe("AgentManagementScreen", () => {
  test("filters by division chips and renders collaboration profile details", () => {
    render(<AgentManagementScreen agents={agents} teams={teams} readOnly />);

    fireEvent.click(screen.getByRole("button", { name: "QA" }));
    expect(screen.getByText("Verifier")).toBeTruthy();
    expect(screen.queryByText("Navigator")).toBeNull();

    fireEvent.click(screen.getByTitle("Agent Settings"));
    expect(screen.getByText("Collaboration Profile")).toBeTruthy();
    expect(screen.getByText("Regression analysis")).toBeTruthy();
    expect(screen.getByText("Does not write code")).toBeTruthy();
  });

  test("renders provided runtime teams in the team tab", () => {
    render(<AgentManagementScreen agents={agents} teams={teams} readOnly />);

    fireEvent.click(screen.getByRole("button", { name: /teams/i }));
    expect(screen.getAllByText("Runtime Team").length).toBeGreaterThan(0);
    expect(screen.getByText("Team Consensus")).toBeTruthy();
    expect(screen.getByText("directive")).toBeTruthy();
    expect(screen.getByText("advisory")).toBeTruthy();
  });

  test("updates permissions, status, and deletes agents from the detail sheet", () => {
    render(<AgentManagementScreen agents={agents} teams={teams} />);

    fireEvent.click(screen.getAllByTitle("Agent Settings")[0]!);
    fireEvent.change(screen.getByDisplayValue("Default"), {
      target: { value: "Plan only" },
    });
    fireEvent.click(screen.getByText("Pause"));
    fireEvent.click(screen.getByText("Remove Agent"));

    expect(screen.queryByText("Navigator")).toBeNull();
    expect(screen.queryByText("Agent Settings")).toBeNull();
  });

  test("shows empty state when all agents are filtered out by division", () => {
    render(<AgentManagementScreen agents={agents} teams={teams} />);
    // "DevOps" division has no agents in our test fixture
    fireEvent.click(screen.getByRole("button", { name: "DevOps" }));
    expect(screen.getByText("No agents match the current filters")).toBeTruthy();
  });

  test("adds a new agent when New Agent button is clicked", () => {
    render(<AgentManagementScreen agents={agents} teams={teams} />);
    const initialCount = screen.getAllByTitle("Agent Settings").length;
    fireEvent.click(screen.getByRole("button", { name: /new agent/i }));
    expect(screen.getAllByTitle("Agent Settings").length).toBe(initialCount + 1);
  });

  test("imports an agent when Import button is clicked", () => {
    render(<AgentManagementScreen agents={agents} teams={teams} />);
    const initialCount = screen.getAllByTitle("Agent Settings").length;
    fireEvent.click(screen.getByRole("button", { name: /^import$/i }));
    expect(screen.getAllByTitle("Agent Settings").length).toBe(initialCount + 1);
  });

  test("readOnly mode does not add agent on New Agent button click", () => {
    render(<AgentManagementScreen agents={agents} teams={teams} readOnly />);
    // Close the detail sheet if open
    const initialCount = screen.getAllByTitle("Agent Settings").length;
    fireEvent.click(screen.getByRole("button", { name: /new agent/i }));
    expect(screen.getAllByTitle("Agent Settings").length).toBe(initialCount);
  });

  test("readOnly mode does not import agent on Import button click", () => {
    render(<AgentManagementScreen agents={agents} teams={teams} readOnly />);
    const initialCount = screen.getAllByTitle("Agent Settings").length;
    fireEvent.click(screen.getByRole("button", { name: /^import$/i }));
    expect(screen.getAllByTitle("Agent Settings").length).toBe(initialCount);
  });

  test("closes detail sheet with Done button", () => {
    render(<AgentManagementScreen agents={agents} teams={teams} />);
    fireEvent.click(screen.getAllByTitle("Agent Settings")[0]!);
    expect(screen.getByText("Collaboration Profile")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /close agent settings/i }));
    expect(screen.queryByText("Collaboration Profile")).toBeNull();
  });

  test("closes detail sheet by clicking Done button", () => {
    render(<AgentManagementScreen agents={agents} teams={teams} />);
    fireEvent.click(screen.getAllByTitle("Agent Settings")[0]!);
    expect(screen.getByText("Agent Settings")).toBeTruthy();
    fireEvent.click(screen.getByText("Done"));
    expect(screen.queryByText("Collaboration Profile")).toBeNull();
  });

  test("uses initialManagedAgents when no agents prop provided", () => {
    render(<AgentManagementScreen />);
    expect(screen.getAllByTitle("Agent Settings").length).toBeGreaterThan(0);
  });

  test("resets division filter back to All Divisions", () => {
    render(<AgentManagementScreen agents={agents} teams={teams} />);
    fireEvent.click(screen.getByRole("button", { name: "QA" }));
    expect(screen.queryByText("Navigator")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "All Divisions" }));
    expect(screen.getByText("Navigator")).toBeTruthy();
    expect(screen.getByText("Verifier")).toBeTruthy();
  });

  test("opens and closes detail sheet for second agent", () => {
    render(<AgentManagementScreen agents={agents} teams={teams} />);
    // Open settings for the second agent (index 1)
    fireEvent.click(screen.getAllByTitle("Agent Settings")[1]!);
    expect(screen.getAllByText("Verifier").length).toBeGreaterThan(0);
    expect(screen.getByText("Collaboration Profile")).toBeTruthy();
    fireEvent.click(screen.getByText("Done"));
    expect(screen.queryByText("Collaboration Profile")).toBeNull();
  });

  test("activates an agent from idle status in detail sheet", () => {
    const idleAgents: ManagedAgent[] = [
      { ...agents[0]!, status: "idle" },
    ];
    render(<AgentManagementScreen agents={idleAgents} teams={teams} />);
    fireEvent.click(screen.getByTitle("Agent Settings"));
    expect(screen.getByText("Activate")).toBeTruthy();
    fireEvent.click(screen.getByText("Activate"));
    // After activating, Pause button should appear
    expect(screen.getByText("Pause")).toBeTruthy();
  });

  test("stops an active agent from detail sheet", () => {
    render(<AgentManagementScreen agents={agents} teams={teams} />);
    fireEvent.click(screen.getAllByTitle("Agent Settings")[0]!);
    // Navigator is active -> shows Pause and Stop
    expect(screen.getByText("Pause")).toBeTruthy();
    expect(screen.getByText("Stop")).toBeTruthy();
    fireEvent.click(screen.getByText("Stop"));
    // After stopping: Activate should now show
    expect(screen.getByText("Activate")).toBeTruthy();
  });
});
