import { describe, it, expect } from "vitest";
import { TaskNode } from "../task-node.js";
import type { TaskSpec } from "../types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSpec(id: string, dependsOn: string[] = []): TaskSpec {
  return {
    id,
    description: `Task ${id}`,
    dependsOn,
    taskType: "implementation",
    complexity: "low",
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TaskNode", () => {
  describe("initial state", () => {
    it("starts with status queued", () => {
      const node = new TaskNode(makeSpec("A"));
      expect(node.state.status).toBe("queued");
    });

    it("starts with attemptCount 0", () => {
      const node = new TaskNode(makeSpec("A"));
      expect(node.state.attemptCount).toBe(0);
    });

    it("starts with null adapterId", () => {
      const node = new TaskNode(makeSpec("A"));
      expect(node.state.adapterId).toBeNull();
    });

    it("starts with null startedAt and completedAt", () => {
      const node = new TaskNode(makeSpec("A"));
      expect(node.state.startedAt).toBeNull();
      expect(node.state.completedAt).toBeNull();
    });

    it("starts with null session reference", () => {
      const node = new TaskNode(makeSpec("A"));
      expect(node.session).toBeNull();
    });

    it("taskId matches spec id", () => {
      const node = new TaskNode(makeSpec("my-task"));
      expect(node.state.taskId).toBe("my-task");
    });
  });

  describe("isReady()", () => {
    it("returns true when task has no dependencies", () => {
      const node = new TaskNode(makeSpec("A", []));
      expect(node.isReady(new Set())).toBe(true);
    });

    it("returns false when dependency is not yet completed", () => {
      const node = new TaskNode(makeSpec("B", ["A"]));
      expect(node.isReady(new Set())).toBe(false);
    });

    it("returns true when all dependencies are in the completed set", () => {
      const node = new TaskNode(makeSpec("C", ["A", "B"]));
      expect(node.isReady(new Set(["A", "B"]))).toBe(true);
    });

    it("returns false when only some dependencies are completed", () => {
      const node = new TaskNode(makeSpec("D", ["A", "B"]));
      expect(node.isReady(new Set(["A"]))).toBe(false);
    });
  });

  describe("canRetry()", () => {
    it("returns true when attemptCount is 0 (no attempts yet)", () => {
      const node = new TaskNode(makeSpec("A"));
      expect(node.canRetry()).toBe(true);
    });

    it("returns true when attemptCount is 1 (first retry available)", () => {
      const node = new TaskNode(makeSpec("A"));
      node.state = { ...node.state, attemptCount: 1 };
      expect(node.canRetry()).toBe(true);
    });

    it("returns true when attemptCount is 2 (second retry available)", () => {
      const node = new TaskNode(makeSpec("A"));
      node.state = { ...node.state, attemptCount: 2 };
      expect(node.canRetry()).toBe(true);
    });

    it("returns false when attemptCount is 3 (max attempts exhausted)", () => {
      const node = new TaskNode(makeSpec("A"));
      node.state = { ...node.state, attemptCount: 3 };
      expect(node.canRetry()).toBe(false);
    });
  });

  describe("queued → running → completed transition", () => {
    it("state reflects running after manual status update", () => {
      const node = new TaskNode(makeSpec("A"));
      expect(node.state.status).toBe("queued");

      node.state = {
        ...node.state,
        status: "running",
        startedAt: Date.now(),
        attemptCount: 1,
        adapterId: "codex",
      };

      expect(node.state.status).toBe("running");
      expect(node.state.adapterId).toBe("codex");
      expect(node.state.startedAt).not.toBeNull();
    });

    it("state reflects completed after successful transition", () => {
      const node = new TaskNode(makeSpec("A"));
      const now = Date.now();

      node.state = { ...node.state, status: "running", startedAt: now, attemptCount: 1, adapterId: "codex" };
      node.state = { ...node.state, status: "completed", completedAt: now + 100 };

      expect(node.state.status).toBe("completed");
      expect(node.state.completedAt).toBeGreaterThan(now);
    });
  });

  describe("queued → running → failed transition", () => {
    it("state reflects failed with errorMessage", () => {
      const node = new TaskNode(makeSpec("A"));
      const now = Date.now();

      node.state = { ...node.state, status: "running", startedAt: now, attemptCount: 1, adapterId: "codex" };
      node.state = { ...node.state, status: "failed", errorMessage: "Exit code: 1" };

      expect(node.state.status).toBe("failed");
      expect(node.state.errorMessage).toBe("Exit code: 1");
    });
  });

  describe("queued → skipped transition", () => {
    it("state reflects skipped when dependency fails", () => {
      const node = new TaskNode(makeSpec("B", ["A"]));
      // Skipped tasks never ran, so startedAt stays null
      node.state = { ...node.state, status: "skipped" };

      expect(node.state.status).toBe("skipped");
      expect(node.state.startedAt).toBeNull();
      expect(node.state.attemptCount).toBe(0);
    });
  });
});
