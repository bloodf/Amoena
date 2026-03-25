import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";

import { TeamListPane } from "./TeamListPane";
import type { AgentTeam } from "./types";

const teams: AgentTeam[] = [
  {
    id: "team-1",
    name: "Alpha Squad",
    description: "Primary engineering team",
    status: "active",
    agents: [
      { id: "a1", name: "Coder", role: "dev", model: "claude-4", tuiColor: "#00ff00", status: "working" },
    ],
    totalTokens: "42k",
    startedAt: "2025-01-01T10:00:00Z",
    completedTasks: 7,
    totalTasks: 10,
  },
  {
    id: "team-2",
    name: "Beta Team",
    description: "QA and testing team",
    status: "paused",
    agents: [],
    totalTokens: "8k",
    startedAt: "2025-01-02T10:00:00Z",
    completedTasks: 2,
    totalTasks: 8,
  },
  {
    id: "team-3",
    name: "Gamma",
    description: "Security review",
    status: "failed",
    agents: [],
    totalTokens: "1k",
    startedAt: "2025-01-03T10:00:00Z",
    completedTasks: 0,
    totalTasks: 3,
  },
];

describe("TeamListPane - functional tests", () => {
  test("renders all team names", () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={() => {}} />);
    expect(screen.getByText("Alpha Squad")).toBeTruthy();
    expect(screen.getByText("Beta Team")).toBeTruthy();
    expect(screen.getByText("Gamma")).toBeTruthy();
  });

  test("renders team descriptions", () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={() => {}} />);
    expect(screen.getByText("Primary engineering team")).toBeTruthy();
    expect(screen.getByText("QA and testing team")).toBeTruthy();
  });

  test("renders team status badges", () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={() => {}} />);
    expect(screen.getByText("active")).toBeTruthy();
    expect(screen.getByText("paused")).toBeTruthy();
    expect(screen.getByText("failed")).toBeTruthy();
  });

  test("renders agent count for each team", () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={() => {}} />);
    expect(screen.getByText("1 agents")).toBeTruthy();
    expect(screen.getAllByText("0 agents").length).toBe(2);
  });

  test("renders token counts", () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={() => {}} />);
    expect(screen.getByText("42k")).toBeTruthy();
    expect(screen.getByText("8k")).toBeTruthy();
  });

  test("renders task progress counts", () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={() => {}} />);
    expect(screen.getByText("7/10 tasks")).toBeTruthy();
    expect(screen.getByText("2/8 tasks")).toBeTruthy();
  });

  test("calls onSelectTeam when a team is clicked", () => {
    const onSelect = mock(() => {});
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={onSelect} />);
    fireEvent.click(screen.getByText("Beta Team"));
    expect(onSelect).toHaveBeenCalledWith("team-2");
  });

  test("marks selected team with aria-selected", () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-2" onSelectTeam={() => {}} />);
    const options = screen.getAllByRole("option");
    const selected = options.find((el) => el.getAttribute("aria-selected") === "true");
    expect(selected?.textContent).toContain("Beta Team");
  });

  test("renders heading and create button", () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={() => {}} />);
    expect(screen.getByText("Agent Teams")).toBeTruthy();
    expect(screen.getByText("New Team")).toBeTruthy();
  });

  test("renders listbox role", () => {
    render(<TeamListPane teams={teams} selectedTeamId="team-1" onSelectTeam={() => {}} />);
    expect(screen.getByRole("listbox")).toBeTruthy();
  });
});
