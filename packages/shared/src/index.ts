import { randomBytes } from "node:crypto";

// --- Constants ---

export const AMOENA_VERSION = "0.1.0";

export const DEFAULT_PORTS = {
  dashboard: 3456,
  terminal: 4879,
  memory: 37777,
} as const;

// --- Common types ---

export type AgentStatus = "idle" | "running" | "paused" | "error" | "done";

export type TaskStatus = "pending" | "in_progress" | "completed" | "failed" | "cancelled";

export interface WorkspaceConfig {
  id: string;
  name: string;
  rootPath: string;
  worktreeId?: string;
  createdAt: string;
}

export interface SessionInfo {
  id: string;
  workspaceId: string;
  agentId?: string;
  status: AgentStatus;
  startedAt?: string;
  endedAt?: string;
}

// --- Utility functions ---

/**
 * Generates a short random ID (nanoid-style, URL-safe, 21 chars).
 */
export function generateId(): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  const bytes = randomBytes(21);
  let id = "";
  for (let i = 0; i < 21; i++) {
    id += alphabet[bytes[i] & 63];
  }
  return id;
}

/**
 * Formats a duration in milliseconds into a human-readable string.
 * e.g. 3661000 -> "1h 1m 1s"
 */
export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

/**
 * Truncates `s` to at most `n` characters, appending "…" if truncated.
 */
export function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, Math.max(0, n - 1)) + "…";
}
