import type { AgentAdapter } from "../cli-adapters/types.js";
import type { TaskSpec, TaskType, TaskComplexity } from "./types.js";

export interface RoutingDecision {
  adapter: AgentAdapter;
  reason: string;
}

interface MatrixEntry {
  preferred: string;
  fallback: string | null;
}

const ROUTING_MATRIX: Record<string, MatrixEntry> = {
  "implementation/low": { preferred: "codex", fallback: "claude-code" },
  "implementation/medium": { preferred: "claude-code", fallback: "codex" },
  "implementation/high": { preferred: "claude-code", fallback: null },
  "review/low": { preferred: "claude-code", fallback: null },
  "review/medium": { preferred: "claude-code", fallback: null },
  "review/high": { preferred: "claude-code", fallback: null },
  "testing/low": { preferred: "codex", fallback: "claude-code" },
  "testing/medium": { preferred: "claude-code", fallback: null },
  "testing/high": { preferred: "claude-code", fallback: null },
  "documentation/low": { preferred: "codex", fallback: "claude-code" },
  "documentation/medium": { preferred: "codex", fallback: "claude-code" },
  "documentation/high": { preferred: "codex", fallback: "claude-code" },
  "analysis/low": { preferred: "claude-code", fallback: null },
  "analysis/medium": { preferred: "claude-code", fallback: null },
  "analysis/high": { preferred: "claude-code", fallback: null },
  "refactoring/low": { preferred: "codex", fallback: "claude-code" },
  "refactoring/medium": { preferred: "claude-code", fallback: null },
  "refactoring/high": { preferred: "claude-code", fallback: null },
};

function matrixKey(taskType: TaskType, complexity: TaskComplexity): string {
  return `${taskType}/${complexity}`;
}

export async function routeTask(
  spec: TaskSpec,
  adapters: Map<string, AgentAdapter>,
): Promise<RoutingDecision> {
  // Override: preferredAgent on the spec bypasses matrix lookup
  if (spec.preferredAgent) {
    const adapter = adapters.get(spec.preferredAgent);
    if (adapter && (await adapter.isAvailable())) {
      return {
        adapter,
        reason: `override:${spec.preferredAgent}`,
      };
    }
    // preferred override unavailable — fall through to matrix
  }

  const key = matrixKey(spec.taskType, spec.complexity);
  const entry = ROUTING_MATRIX[key];

  if (!entry) {
    throw new Error(
      `No routing entry for task type "${spec.taskType}" / complexity "${spec.complexity}"`,
    );
  }

  const preferredAdapter = adapters.get(entry.preferred);
  if (preferredAdapter && (await preferredAdapter.isAvailable())) {
    return {
      adapter: preferredAdapter,
      reason: `matrix:${key}→${entry.preferred}`,
    };
  }

  if (entry.fallback) {
    const fallbackAdapter = adapters.get(entry.fallback);
    if (fallbackAdapter && (await fallbackAdapter.isAvailable())) {
      return {
        adapter: fallbackAdapter,
        reason: `matrix:${key}→${entry.fallback}(fallback,${entry.preferred}-unavailable)`,
      };
    }
  }

  throw new Error(
    `No available adapter for task "${spec.id}" (type=${spec.taskType}, complexity=${spec.complexity}). ` +
      `Preferred "${entry.preferred}" and fallback "${entry.fallback ?? "none"}" are both unavailable.`,
  );
}
