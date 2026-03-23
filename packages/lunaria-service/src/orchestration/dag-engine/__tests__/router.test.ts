import { describe, it, expect, vi } from "vitest";
import { routeTask } from "../router.js";
import type { AgentAdapter } from "../../cli-adapters/types.js";
import type { TaskSpec } from "../types.js";

function makeAdapter(id: string, available: boolean): AgentAdapter {
  return {
    id,
    displayName: id,
    capabilities: ["code-generation"],
    costPerToken: null,
    isAvailable: vi.fn().mockResolvedValue(available),
    spawn: vi.fn(),
  };
}

function makeSpec(
  overrides: Partial<TaskSpec> = {},
): TaskSpec {
  return {
    id: "t1",
    description: "do something",
    dependsOn: [],
    taskType: "implementation",
    complexity: "high",
    ...overrides,
  };
}

describe("routeTask()", () => {
  it("implementation/high → claude-code when available", async () => {
    const adapters = new Map<string, AgentAdapter>([
      ["claude-code", makeAdapter("claude-code", true)],
      ["codex", makeAdapter("codex", true)],
    ]);
    const spec = makeSpec({ taskType: "implementation", complexity: "high" });

    const decision = await routeTask(spec, adapters);
    expect(decision.adapter.id).toBe("claude-code");
    expect(decision.reason).toContain("matrix:implementation/high");
  });

  it("implementation/low → codex when available", async () => {
    const adapters = new Map<string, AgentAdapter>([
      ["claude-code", makeAdapter("claude-code", true)],
      ["codex", makeAdapter("codex", true)],
    ]);
    const spec = makeSpec({ taskType: "implementation", complexity: "low" });

    const decision = await routeTask(spec, adapters);
    expect(decision.adapter.id).toBe("codex");
    expect(decision.reason).toContain("matrix:implementation/low");
  });

  it("implementation/low → falls back to claude-code when codex unavailable", async () => {
    const adapters = new Map<string, AgentAdapter>([
      ["claude-code", makeAdapter("claude-code", true)],
      ["codex", makeAdapter("codex", false)],
    ]);
    const spec = makeSpec({ taskType: "implementation", complexity: "low" });

    const decision = await routeTask(spec, adapters);
    expect(decision.adapter.id).toBe("claude-code");
    expect(decision.reason).toContain("fallback");
  });

  it("unavailable preferred → uses fallback → reason string reflects this", async () => {
    const adapters = new Map<string, AgentAdapter>([
      ["claude-code", makeAdapter("claude-code", false)],
      ["codex", makeAdapter("codex", true)],
    ]);
    const spec = makeSpec({ taskType: "implementation", complexity: "medium" });

    const decision = await routeTask(spec, adapters);
    expect(decision.adapter.id).toBe("codex");
    expect(decision.reason).toContain("fallback");
    expect(decision.reason).toContain("claude-code-unavailable");
  });

  it("both adapters unavailable → throws descriptive error", async () => {
    const adapters = new Map<string, AgentAdapter>([
      ["claude-code", makeAdapter("claude-code", false)],
      ["codex", makeAdapter("codex", false)],
    ]);
    const spec = makeSpec({ taskType: "implementation", complexity: "high" });

    await expect(routeTask(spec, adapters)).rejects.toThrow(
      /No available adapter/,
    );
  });

  it("preferredAgent override bypasses matrix", async () => {
    const adapters = new Map<string, AgentAdapter>([
      ["claude-code", makeAdapter("claude-code", true)],
      ["codex", makeAdapter("codex", true)],
    ]);
    const spec = makeSpec({
      taskType: "implementation",
      complexity: "high",
      preferredAgent: "codex",
    });

    const decision = await routeTask(spec, adapters);
    expect(decision.adapter.id).toBe("codex");
    expect(decision.reason).toBe("override:codex");
  });

  it("preferredAgent override falls through to matrix when unavailable", async () => {
    const adapters = new Map<string, AgentAdapter>([
      ["claude-code", makeAdapter("claude-code", true)],
      ["codex", makeAdapter("codex", false)],
    ]);
    const spec = makeSpec({
      taskType: "implementation",
      complexity: "high",
      preferredAgent: "codex",
    });

    const decision = await routeTask(spec, adapters);
    expect(decision.adapter.id).toBe("claude-code");
    expect(decision.reason).toContain("matrix:");
  });

  it("documentation/any → codex preferred", async () => {
    const adapters = new Map<string, AgentAdapter>([
      ["claude-code", makeAdapter("claude-code", true)],
      ["codex", makeAdapter("codex", true)],
    ]);

    for (const complexity of ["low", "medium", "high"] as const) {
      const spec = makeSpec({ taskType: "documentation", complexity });
      const decision = await routeTask(spec, adapters);
      expect(decision.adapter.id).toBe("codex");
    }
  });

  it("review/any → claude-code preferred", async () => {
    const adapters = new Map<string, AgentAdapter>([
      ["claude-code", makeAdapter("claude-code", true)],
    ]);

    for (const complexity of ["low", "medium", "high"] as const) {
      const spec = makeSpec({ taskType: "review", complexity });
      const decision = await routeTask(spec, adapters);
      expect(decision.adapter.id).toBe("claude-code");
    }
  });
});
