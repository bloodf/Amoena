import { describe, it, expect, beforeEach } from "vitest";
import {
  startAutopilot,
  advancePhase,
  rollbackPhase,
  AutopilotPhase,
  AutopilotTerminalError,
  AutopilotRollbackError,
} from "./pipeline.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Advance a run N times, returning the final state. */
async function advanceN(runId: string, n: number) {
  let run: Awaited<ReturnType<typeof advancePhase>> | undefined;
  for (let i = 0; i < n; i++) {
    run = await advancePhase(runId);
  }
  return run!;
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

describe("startAutopilot", () => {
  it("creates a run with the supplied goal", async () => {
    const run = await startAutopilot("Refactor the auth module");
    expect(run.goal).toBe("Refactor the auth module");
  });

  it("starts in the Analysis phase with running status", async () => {
    const run = await startAutopilot("initial goal");
    expect(run.currentPhase).toBe(AutopilotPhase.Analysis);
    expect(run.status).toBe("running");
  });

  it("assigns a unique id to each run", async () => {
    const a = await startAutopilot("goal a");
    const b = await startAutopilot("goal b");
    expect(a.id).not.toBe(b.id);
  });

  it("records the initial phase in the phases array", async () => {
    const run = await startAutopilot("goal");
    expect(run.phases).toHaveLength(1);
    expect(run.phases[0].phase).toBe(AutopilotPhase.Analysis);
    expect(run.phases[0].endedAt).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Phase advancement
// ---------------------------------------------------------------------------

describe("advancePhase", () => {
  it("advances from Analysis to Planning", async () => {
    const run = await startAutopilot("goal");
    const advanced = await advancePhase(run.id);
    expect(advanced.currentPhase).toBe(AutopilotPhase.Planning);
  });

  it("progresses through all 6 phases sequentially", async () => {
    const run = await startAutopilot("goal");
    const phases = [
      AutopilotPhase.Analysis,
      AutopilotPhase.Planning,
      AutopilotPhase.Implementation,
      AutopilotPhase.Testing,
      AutopilotPhase.Review,
      AutopilotPhase.Merge,
    ];
    expect(run.currentPhase).toBe(phases[0]);
    for (let i = 1; i < phases.length; i++) {
      const next = await advancePhase(run.id);
      expect(next.currentPhase).toBe(phases[i]);
    }
  });

  it("closes the current phase record when advancing", async () => {
    const run = await startAutopilot("goal");
    const advanced = await advancePhase(run.id);
    const closedRecord = advanced.phases.find(
      (p) => p.phase === AutopilotPhase.Analysis,
    );
    expect(closedRecord?.endedAt).not.toBeNull();
  });

  it("transitions to completed status when advancing past the final phase", async () => {
    const run = await startAutopilot("goal");
    // Advance through all 5 intermediate steps to reach Merge
    await advanceN(run.id, 5);
    // Advancing from Merge completes the run
    const completed = await advancePhase(run.id);
    expect(completed.status).toBe("completed");
  });

  it("throws AutopilotTerminalError when advancing a completed run", async () => {
    const run = await startAutopilot("goal");
    await advanceN(run.id, 6); // completes the run
    await expect(advancePhase(run.id)).rejects.toBeInstanceOf(AutopilotTerminalError);
  });

  it("throws an error when run id does not exist", async () => {
    await expect(advancePhase("nonexistent-id")).rejects.toThrow(
      /No autopilot run found/,
    );
  });
});

// ---------------------------------------------------------------------------
// Rollback
// ---------------------------------------------------------------------------

describe("rollbackPhase", () => {
  it("rolls back from Planning to Analysis", async () => {
    const run = await startAutopilot("goal");
    await advancePhase(run.id); // → Planning
    const rolled = await rollbackPhase(run.id);
    expect(rolled.currentPhase).toBe(AutopilotPhase.Analysis);
  });

  it("removes the current phase record and reopens the previous phase", async () => {
    const run = await startAutopilot("goal");
    await advancePhase(run.id); // → Planning (phases: Analysis[closed], Planning[open])
    const rolled = await rollbackPhase(run.id);
    // Planning record should be gone; only Analysis (re-opened) remains
    const planningRecord = rolled.phases.find(
      (p) => p.phase === AutopilotPhase.Planning,
    );
    expect(planningRecord).toBeUndefined();
    expect(rolled.phases).toHaveLength(1);
    expect(rolled.phases[0].phase).toBe(AutopilotPhase.Analysis);
    expect(rolled.phases[0].endedAt).toBeNull();
  });

  it("throws AutopilotRollbackError when already at the first phase", async () => {
    const run = await startAutopilot("goal");
    await expect(rollbackPhase(run.id)).rejects.toBeInstanceOf(AutopilotRollbackError);
  });

  it("throws AutopilotTerminalError when rolling back a completed run", async () => {
    const run = await startAutopilot("goal");
    await advanceN(run.id, 6); // completes
    await expect(rollbackPhase(run.id)).rejects.toBeInstanceOf(AutopilotTerminalError);
  });
});

// ---------------------------------------------------------------------------
// Phase timeout configuration
// ---------------------------------------------------------------------------

describe("startAutopilot — phase timeout options", () => {
  it("applies custom timeout override for the Analysis phase", async () => {
    const run = await startAutopilot("goal", {
      phaseTimeouts: { [AutopilotPhase.Analysis]: 30_000 },
    });
    expect(run.phases[0].timeoutMs).toBe(30_000);
  });

  it("uses the default timeout when no override is provided", async () => {
    const run = await startAutopilot("goal");
    const defaultMs = 10 * 60 * 1000;
    expect(run.phases[0].timeoutMs).toBe(defaultMs);
  });
});
