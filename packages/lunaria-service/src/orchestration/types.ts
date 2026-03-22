/**
 * Shared types for the orchestration layer.
 */

/** Permission levels for agents, ordered from least to most privileged. */
export enum PermissionLevel {
  ReadOnly = "ReadOnly",
  ReadWrite = "ReadWrite",
  ShellAccess = "ShellAccess",
  Admin = "Admin",
}

/** Numeric rank for permission comparison (higher = more privileged). */
const PERMISSION_RANK: Record<PermissionLevel, number> = {
  [PermissionLevel.ReadOnly]: 0,
  [PermissionLevel.ReadWrite]: 1,
  [PermissionLevel.ShellAccess]: 2,
  [PermissionLevel.Admin]: 3,
};

/**
 * Returns true when `candidate` is within the ceiling set by `ceiling`.
 * Equal levels are permitted.
 */
export function isWithinCeiling(
  candidate: PermissionLevel,
  ceiling: PermissionLevel,
): boolean {
  return PERMISSION_RANK[candidate] <= PERMISSION_RANK[ceiling];
}

/**
 * Returns the lower of two permission levels.
 */
export function lowerPermission(
  a: PermissionLevel,
  b: PermissionLevel,
): PermissionLevel {
  return PERMISSION_RANK[a] <= PERMISSION_RANK[b] ? a : b;
}

/** Configuration used to create an agent. */
export interface AgentConfig {
  /** Human-readable identifier for the agent. */
  name: string;
  /** Model identifier (e.g. "claude-sonnet-4-6"). */
  model: string;
  /** Maximum permission level this agent may exercise. */
  permissionLevel: PermissionLevel;
  /** Set of tool names available to this agent. */
  tools: ReadonlyArray<string>;
  /** System prompt injected at conversation start. */
  systemPrompt: string;
}

/** Runtime representation of a running agent. */
export interface AgentInstance {
  /** Unique identifier for this instance. */
  readonly id: string;
  /** The configuration the agent was created with. */
  readonly config: AgentConfig;
  /** Current lifecycle status. */
  readonly status: AgentStatus;
  /** OS process ID, if the agent is backed by a subprocess. */
  readonly pid: number | null;
  /** Wall-clock time when the instance was started. */
  readonly startedAt: Date;
}

/** Lifecycle states an agent instance can be in. */
export type AgentStatus = "pending" | "running" | "completed" | "failed";
