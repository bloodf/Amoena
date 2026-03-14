import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AgentTeamsScreen } from "./AgentTeamsScreen";
import type { AgentTeam } from "@/composites/agents/types";

const activeTeam: AgentTeam = {
  id: "t1",
  name: "Auth Squad",
  description: "Rewrite auth system",
  status: "active",
  totalTokens: "10k",
  startedAt: "5 min ago",
  completedTasks: 2,
  totalTasks: 5,
  agents: [
    {
      id: "a1",
      name: "Architect",
      role: "Lead",
      model: "Claude 4 Sonnet",
      tuiColor: "tui-claude",
      status: "working",
      currentTask: "Designing flow",
      tokensUsed: "5k",
      collaborationStyle: "directive",
      communicationPreference: "structured",
      decisionWeight: 0.9,
    },
  ],
};

const pausedTeam: AgentTeam = {
  id: "t2",
  name: "Perf Sprint",
  description: "DB optimization",
  status: "paused",
  totalTokens: "8k",
  startedAt: "1 hour ago",
  completedTasks: 3,
  totalTasks: 6,
  agents: [
    {
      id: "a2",
      name: "DB Expert",
      role: "Lead",
      model: "Claude 4 Sonnet",
      tuiColor: "tui-claude",
      status: "idle",
      currentTask: "Paused",
      tokensUsed: "8k",
      collaborationStyle: "directive",
      communicationPreference: "structured",
      decisionWeight: 0.85,
    },
  ],
};

describe("AgentTeamsScreen", () => {
  it("renders null when no teams provided", () => {
    const { container } = render(<AgentTeamsScreen teams={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders with active team showing Pause button", () => {
    render(<AgentTeamsScreen teams={[activeTeam]} />);
    expect(screen.getByRole("button", { name: "Pause team" })).toBeTruthy();
    // Team name appears in list pane and heading - use getAllByText
    expect(screen.getAllByText("Auth Squad").length).toBeGreaterThan(0);
  });

  it("renders with paused team showing Resume button", () => {
    render(<AgentTeamsScreen teams={[pausedTeam]} />);
    expect(screen.getByRole("button", { name: "Resume team" })).toBeTruthy();
    expect(screen.getAllByText("Perf Sprint").length).toBeGreaterThan(0);
  });

  it("selects first team by default", () => {
    render(<AgentTeamsScreen teams={[activeTeam, pausedTeam]} />);
    expect(screen.getAllByText("Auth Squad").length).toBeGreaterThan(0);
    // Active team shows Pause
    expect(screen.getByRole("button", { name: "Pause team" })).toBeTruthy();
  });

  it("shows team description", () => {
    render(<AgentTeamsScreen teams={[activeTeam]} />);
    expect(screen.getAllByText("Rewrite auth system").length).toBeGreaterThan(0);
  });

  it("uses default teams when no teams prop provided", () => {
    render(<AgentTeamsScreen />);
    expect(screen.getAllByText("Auth Overhaul Squad").length).toBeGreaterThan(0);
  });

  it("updates selected team on selection", () => {
    render(<AgentTeamsScreen teams={[activeTeam, pausedTeam]} />);
    // Click on second team in the list pane
    const teamItems = screen.getAllByText("Perf Sprint");
    fireEvent.click(teamItems[0]!);
    expect(screen.getByRole("button", { name: "Resume team" })).toBeTruthy();
  });

  it("renders the status action button for active state (Pause)", () => {
    render(<AgentTeamsScreen teams={[activeTeam]} />);
    // Active team: conditional renders Pause button
    expect(screen.getByRole("button", { name: "Pause team" })).toBeTruthy();
  });

  it("renders the status action button for non-active state (Resume)", () => {
    render(<AgentTeamsScreen teams={[pausedTeam]} />);
    // Paused team: conditional renders Resume button (not Pause)
    expect(screen.getByRole("button", { name: "Resume team" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Pause team" })).toBeNull();
  });
});
