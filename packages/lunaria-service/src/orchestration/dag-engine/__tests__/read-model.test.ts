import { describe, it, expect } from "vitest";
import { createEmptyReadModel } from "../read-model.js";

describe("read-model", () => {
  describe("createEmptyReadModel", () => {
    it("returns an object with empty goalRuns map", () => {
      const rm = createEmptyReadModel();
      expect(rm.goalRuns).toBeInstanceOf(Map);
      expect(rm.goalRuns.size).toBe(0);
    });

    it("returns an object with empty tasks map", () => {
      const rm = createEmptyReadModel();
      expect(rm.tasks).toBeInstanceOf(Map);
      expect(rm.tasks.size).toBe(0);
    });

    it("returns an object with empty agentPerformance map", () => {
      const rm = createEmptyReadModel();
      expect(rm.agentPerformance).toBeInstanceOf(Map);
      expect(rm.agentPerformance.size).toBe(0);
    });

    it("returns a new instance each call (no shared state)", () => {
      const a = createEmptyReadModel();
      const b = createEmptyReadModel();
      expect(a).not.toBe(b);
      expect(a.goalRuns).not.toBe(b.goalRuns);
      expect(a.tasks).not.toBe(b.tasks);
      expect(a.agentPerformance).not.toBe(b.agentPerformance);
    });

    it("maps are mutable (can add entries)", () => {
      const rm = createEmptyReadModel();
      rm.goalRuns.set("g1", {
        goalRunId: "g1",
        description: "test",
        taskCount: 0,
        status: "pending",
        startedAt: Date.now(),
        completedAt: null,
        totalCost: 0,
        totalDurationMs: 0,
        taskIds: [],
      });
      expect(rm.goalRuns.size).toBe(1);
    });
  });
});
