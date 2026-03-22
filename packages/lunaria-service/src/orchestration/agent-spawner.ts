/**
 * Multi-agent spawning with permission ceiling enforcement.
 *
 * Agents are created with a permission level and tool set that can never
 * exceed those of their parent.  The parent passes its own config as the
 * `parentConfig` when calling `spawnAgent`.
 */

import { randomUUID } from "crypto";
import {
  AgentConfig,
  AgentInstance,
  PermissionLevel,
  isWithinCeiling,
  lowerPermission,
} from "./types.js";

export type { AgentConfig, AgentInstance, PermissionLevel };

/** Options accepted by `spawnAgent`. */
export interface SpawnOptions {
  /**
   * Config of the parent agent.  The child's permission level and tool set
   * are capped to what the parent already holds.
   */
  parentConfig: AgentConfig;
  /** Requested config for the new child agent. */
  childConfig: AgentConfig;
}

/** Error thrown when a spawn request violates permission constraints. */
export class PermissionCeilingError extends Error {
  constructor(
    public readonly requested: PermissionLevel,
    public readonly ceiling: PermissionLevel,
  ) {
    super(
      `Agent requested permission level "${requested}" but parent ceiling is "${ceiling}".`,
    );
    this.name = "PermissionCeilingError";
  }
}

/**
 * Computes the effective tool set for a child agent.
 *
 * The result is the intersection of the parent's tools and the child's
 * requested tools — a child can never gain access to tools the parent
 * does not already hold.
 */
function intersectTools(
  parentTools: ReadonlyArray<string>,
  childTools: ReadonlyArray<string>,
): ReadonlyArray<string> {
  const parentSet = new Set(parentTools);
  return childTools.filter((tool) => parentSet.has(tool));
}

/**
 * Derives a safe `AgentConfig` for a child by enforcing:
 * 1. Permission level is the minimum of parent and requested.
 * 2. Tools are the intersection of parent tools and requested tools.
 *
 * Throws `PermissionCeilingError` if the child explicitly requests a level
 * higher than the parent (rather than silently downgrading, which would be
 * surprising).
 */
function enforceConstraints(
  parentConfig: AgentConfig,
  childConfig: AgentConfig,
): AgentConfig {
  if (!isWithinCeiling(childConfig.permissionLevel, parentConfig.permissionLevel)) {
    throw new PermissionCeilingError(
      childConfig.permissionLevel,
      parentConfig.permissionLevel,
    );
  }

  const effectivePermission = lowerPermission(
    childConfig.permissionLevel,
    parentConfig.permissionLevel,
  );

  const effectiveTools = intersectTools(parentConfig.tools, childConfig.tools);

  return {
    ...childConfig,
    permissionLevel: effectivePermission,
    tools: effectiveTools,
  };
}

/**
 * Spawns a new agent instance under the constraints of the parent.
 *
 * @param options - Parent config and the desired child config.
 * @returns A resolved `AgentInstance` representing the new agent.
 * @throws {PermissionCeilingError} When the child requests more permission than the parent holds.
 *
 * @example
 * ```ts
 * const instance = await spawnAgent({ parentConfig, childConfig });
 * console.log(instance.id, instance.config.permissionLevel);
 * ```
 */
export async function spawnAgent(options: SpawnOptions): Promise<AgentInstance> {
  const { parentConfig, childConfig } = options;

  const effectiveConfig = enforceConstraints(parentConfig, childConfig);

  const instance: AgentInstance = {
    id: randomUUID(),
    config: effectiveConfig,
    status: "running",
    pid: null,
    startedAt: new Date(),
  };

  return instance;
}
