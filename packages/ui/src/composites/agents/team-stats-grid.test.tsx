import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { TeamStatsGrid } from "./TeamStatsGrid";
import type { AgentTeam } from "./types";

const makeTeam = (overrides: Partial<AgentTeam> = {}): AgentTeam => ({
  id: "team-1",
  name: "Test Team",
  description: "Test team description",
  status: "active",
  completedTasks: 3,
  totalTasks: 5,
  totalTokens: "12.4k",
  startedAt: "2m ago",
  agents: [
    { id: "a1", name: "Agent 1", role: "coder", status: "working", messagesExchanged: 10, model: "sonnet", tuiColor: "#fff", currentTask: "code" },
    { id: "a2", name: "Agent 2", role: "reviewer", status: "idle", messagesExchanged: 5, model: "haiku", tuiColor: "#fff", currentTask: "review" },
  ],
  ...overrides,
});

describe("TeamStatsGrid", () => {
  test("renders all 6 stat labels", () => {
    render(<TeamStatsGrid team={makeTeam()} />);
    expect(screen.getByText("Total Tokens")).toBeTruthy();
    expect(screen.getByText("Agents")).toBeTruthy();
    expect(screen.getByText("Progress")).toBeTruthy();
    expect(screen.getByText("Started")).toBeTruthy();
    expect(screen.getByText("Messages")).toBeTruthy();
    expect(screen.getByText("Utilization")).toBeTruthy();
  });

  test("calculates messages as sum of agent messagesExchanged", () => {
    render(<TeamStatsGrid team={makeTeam()} />);
    expect(screen.getByText("15")).toBeTruthy(); // 10 + 5
  });

  test("calculates utilization as percentage of working agents", () => {
    render(<TeamStatsGrid team={makeTeam()} />);
    expect(screen.getByText("50%")).toBeTruthy(); // 1 working / 2 total
  });

  test("utilization is 0% when team has zero agents (empty array branch)", () => {
    render(<TeamStatsGrid team={makeTeam({ agents: [] })} />);
    expect(screen.getByText("0%")).toBeTruthy();
  });

  test("handles agents with undefined messagesExchanged", () => {
    const team = makeTeam({
      agents: [
        { id: "a1", name: "A", role: "r", status: "working", model: "m", tuiColor: "#fff", currentTask: "t" } as any,
      ],
    });
    render(<TeamStatsGrid team={team} />);
    expect(screen.getByText("0")).toBeTruthy(); // messagesExchanged ?? 0
  });
});
