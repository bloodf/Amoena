import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TeamConsensusMeter, calculateConsensus } from "./TeamConsensusMeter";
import type { AgentTeam, TeamAgent } from "./types";

const team: AgentTeam = {
  id: "team-1",
  name: "Auth Squad",
  description: "Auth work",
  status: "active",
  totalTokens: "12k",
  startedAt: "now",
  completedTasks: 2,
  totalTasks: 4,
  agents: [
    {
      id: "a1",
      name: "Lead",
      role: "Lead",
      model: "Claude 4 Sonnet",
      tuiColor: "tui-claude",
      status: "completed",
      decisionWeight: 1,
    },
    {
      id: "a2",
      name: "Implementer",
      role: "Builder",
      model: "GPT-5.4",
      tuiColor: "tui-opencode",
      status: "working",
      decisionWeight: 0.5,
    },
  ],
};

describe("TeamConsensusMeter", () => {
  it("calculates weighted consensus", () => {
    expect(calculateConsensus(team)).toBeGreaterThan(0.8);
  });

  it("renders an accessible consensus label", () => {
    render(<TeamConsensusMeter team={team} />);
    expect(screen.getByLabelText(/Consensus/i)).toBeInTheDocument();
    expect(screen.getByText("Team Consensus")).toBeInTheDocument();
  });

  it("handles low and zero-weight consensus boundaries", () => {
    const lowTeam: AgentTeam = {
      ...team,
      agents: [
        { ...team.agents[0], status: "failed", decisionWeight: 1 },
        { ...team.agents[1], status: "paused", decisionWeight: 0.5 },
      ],
    };
    const zeroWeightTeam: AgentTeam = {
      ...team,
      agents: [{ ...team.agents[0], decisionWeight: 0 }, { ...team.agents[1], decisionWeight: 0 }],
    };

    expect(calculateConsensus(lowTeam)).toBeLessThan(0.4);
    expect(calculateConsensus(zeroWeightTeam)).toBe(0);

    const { rerender } = render(<TeamConsensusMeter team={lowTeam} />);
    expect(screen.getByLabelText(/Consensus 18%/i)).toBeTruthy();

    rerender(<TeamConsensusMeter team={team} />);
    expect(screen.getByLabelText(/Consensus 92%/i)).toBeTruthy();
  });

  it("applies green gradient for high consensus (>=0.75) — consensusColor branch", () => {
    // High consensus team: completed agents
    const highTeam: AgentTeam = {
      ...team,
      agents: [
        { ...team.agents[0], status: "completed", decisionWeight: 1 },
        { ...team.agents[1], status: "completed", decisionWeight: 1 },
      ],
    };
    const { container } = render(<TeamConsensusMeter team={highTeam} />);
    const bar = container.querySelector(".from-green-500");
    expect(bar).toBeTruthy();
  });

  it("applies amber gradient for mid consensus (0.4–0.75) — consensusColor branch", () => {
    // Working + waiting gives ~0.55 consensus
    const midTeam: AgentTeam = {
      ...team,
      agents: [
        { ...team.agents[0], status: "working", decisionWeight: 1 },
        { ...team.agents[1], status: "waiting", decisionWeight: 1 },
      ],
    };
    const consensus = calculateConsensus(midTeam);
    expect(consensus).toBeGreaterThanOrEqual(0.4);
    expect(consensus).toBeLessThan(0.75);
    const { container } = render(<TeamConsensusMeter team={midTeam} />);
    const bar = container.querySelector(".from-amber-500");
    expect(bar).toBeTruthy();
  });

  it("applies red gradient for low consensus (<0.4) — consensusColor branch", () => {
    const lowTeam: AgentTeam = {
      ...team,
      agents: [
        { ...team.agents[0], status: "failed", decisionWeight: 1 },
        { ...team.agents[1], status: "failed", decisionWeight: 1 },
      ],
    };
    const consensus = calculateConsensus(lowTeam);
    expect(consensus).toBeLessThan(0.4);
    const { container } = render(<TeamConsensusMeter team={lowTeam} />);
    const bar = container.querySelector(".from-red-500");
    expect(bar).toBeTruthy();
  });

  it("calculateConsensus handles all TeamAgent status values", () => {
    const statuses: Array<TeamAgent["status"]> = [
      "completed", "working", "idle", "waiting", "paused", "failed", "preparing", "created",
    ];
    statuses.forEach((status) => {
      const t: AgentTeam = {
        ...team,
        agents: [{ ...team.agents[0], status, decisionWeight: 1 }],
      };
      const result = calculateConsensus(t);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  it("uses default decisionWeight of 0.5 when not provided — branch line 25", () => {
    const noWeightTeam: AgentTeam = {
      ...team,
      agents: [
        { id: "x1", name: "X", role: "R", model: "M", tuiColor: "t", status: "completed" },
      ],
    };
    // decisionWeight undefined → default 0.5; should return 1.0 (completed)
    expect(calculateConsensus(noWeightTeam)).toBe(1);
  });
});
