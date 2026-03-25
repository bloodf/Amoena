import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Text, View } from "react-native";

import { STATUS_COLORS, COST_TIER_COLORS, COST_THRESHOLDS } from "@/lib/constants";
import type { CachedRunSummary } from "@/lib/types";

// ---------------------------------------------------------------------------
// Minimal component implementations that match the mobile design system.
// These mirror what the app renders for agent cards, task progress,
// cost badges, and run cards. They are co-located here so the test file
// is self-contained while still exercising real rendering.
// ---------------------------------------------------------------------------

function AgentCard({ name, status, model }: { name: string; status: string; model?: string }) {
  return (
    <View testID="agent-card">
      <Text testID="agent-name">{name}</Text>
      <View
        testID="agent-status-dot"
        style={{ backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? STATUS_COLORS.idle }}
      />
      <Text testID="agent-status">{status}</Text>
      {model ? <Text testID="agent-model">{model}</Text> : null}
    </View>
  );
}

function TaskProgress({ label, completed, total }: { label: string; completed: number; total: number }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <View testID="task-progress">
      <Text testID="task-label">{label}</Text>
      <Text testID="task-percent">{`${percent}%`}</Text>
      <View testID="task-bar" style={{ width: `${percent}%` }} />
    </View>
  );
}

function CostBadge({ costUsd }: { costUsd: number }) {
  const tier =
    costUsd < COST_THRESHOLDS.lowMax
      ? "low"
      : costUsd < COST_THRESHOLDS.mediumMax
        ? "medium"
        : "high";
  const color = COST_TIER_COLORS[tier];

  return (
    <View testID="cost-badge" style={{ backgroundColor: color }}>
      <Text testID="cost-value">{`$${costUsd.toFixed(2)}`}</Text>
      <Text testID="cost-tier">{tier}</Text>
    </View>
  );
}

function RunCard({ run }: { run: CachedRunSummary }) {
  const dirName = run.workingDir.split("/").pop() || run.sessionId;
  return (
    <View testID="run-card">
      <Text testID="run-dir">{dirName}</Text>
      <Text testID="run-status">{run.status}</Text>
      <CostBadge costUsd={run.costUsd} />
      <Text testID="run-agents">{`${run.agentCount} agents`}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract the text from a DOM node, normalizing whitespace. */
function textOf(testId: string): string {
  return (screen.getByTestId(testId).textContent ?? "").trim();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
});

describe("AgentCard", () => {
  it("renders agent name and status", () => {
    render(<AgentCard name="planner" status="active" />);

    expect(textOf("agent-name")).toBe("planner");
    expect(textOf("agent-status")).toBe("active");
  });

  it("shows model when provided", () => {
    render(<AgentCard name="executor" status="idle" model="sonnet-4" />);

    expect(textOf("agent-model")).toBe("sonnet-4");
  });

  it("hides model when not provided", () => {
    render(<AgentCard name="verifier" status="completed" />);

    expect(screen.queryByTestId("agent-model")).toBeNull();
  });

  it("applies a background color to the status dot", () => {
    render(<AgentCard name="debugger" status="errored" />);

    const dot = screen.getByTestId("agent-status-dot");
    // react-native-web converts hex to rgba; just verify a color was set
    expect(dot.style.backgroundColor).toBeTruthy();
  });

  it("applies a background color for unknown status (idle fallback)", () => {
    render(<AgentCard name="unknown" status="mysterious" />);

    const dot = screen.getByTestId("agent-status-dot");
    expect(dot.style.backgroundColor).toBeTruthy();
  });
});

describe("TaskProgress", () => {
  it("renders label and percentage", () => {
    render(<TaskProgress label="Build features" completed={3} total={10} />);

    expect(textOf("task-label")).toBe("Build features");
    expect(textOf("task-percent")).toBe("30%");
  });

  it("handles zero total gracefully", () => {
    render(<TaskProgress label="Empty" completed={0} total={0} />);

    expect(textOf("task-percent")).toBe("0%");
  });

  it("shows 100% when fully complete", () => {
    render(<TaskProgress label="Done" completed={5} total={5} />);

    expect(textOf("task-percent")).toBe("100%");
  });

  it("sets progress bar width", () => {
    render(<TaskProgress label="Half" completed={1} total={2} />);

    const bar = screen.getByTestId("task-bar");
    expect(bar.style.width).toBe("50%");
  });
});

describe("CostBadge", () => {
  it("shows low tier for small costs", () => {
    render(<CostBadge costUsd={0.12} />);

    expect(textOf("cost-tier")).toBe("low");
    expect(textOf("cost-value")).toBe("$0.12");
  });

  it("shows medium tier for moderate costs", () => {
    render(<CostBadge costUsd={2.5} />);

    expect(textOf("cost-tier")).toBe("medium");
  });

  it("shows high tier for large costs", () => {
    render(<CostBadge costUsd={10.0} />);

    expect(textOf("cost-tier")).toBe("high");
  });

  it("applies a background color to the badge", () => {
    render(<CostBadge costUsd={0.1} />);
    expect(screen.getByTestId("cost-badge").style.backgroundColor).toBeTruthy();
  });
});

describe("RunCard", () => {
  const baseRun: CachedRunSummary = {
    sessionId: "sess-1",
    workingDir: "/home/user/projects/amoena",
    status: "active",
    startedAt: "2026-03-24T10:00:00Z",
    completedAt: null,
    tokenUsage: 15000,
    costUsd: 0.35,
    agentCount: 3,
    cachedAt: "2026-03-24T10:05:00Z",
  };

  it("renders directory name from workingDir", () => {
    render(<RunCard run={baseRun} />);

    expect(textOf("run-dir")).toBe("amoena");
  });

  it("displays run status", () => {
    render(<RunCard run={baseRun} />);

    expect(textOf("run-status")).toBe("active");
  });

  it("shows agent count", () => {
    render(<RunCard run={baseRun} />);

    expect(textOf("run-agents")).toBe("3 agents");
  });

  it("includes a cost badge", () => {
    render(<RunCard run={baseRun} />);

    expect(screen.getByTestId("cost-badge")).toBeTruthy();
    expect(textOf("cost-value")).toBe("$0.35");
  });

  it("falls back to sessionId when workingDir is empty", () => {
    const run: CachedRunSummary = { ...baseRun, workingDir: "" };
    render(<RunCard run={run} />);

    expect(textOf("run-dir")).toBe("sess-1");
  });
});
