import type { MemoryGraphNode } from "./types";

export const memoryGraphNodes: MemoryGraphNode[] = [
  { id: "1", key: "auth.strategy", scope: "workspace", source: "auto", connections: ["2", "5"], x: 300, y: 200, vx: 0, vy: 0 },
  { id: "2", key: "api.versioning", scope: "global", source: "manual", connections: ["1", "3"], x: 500, y: 150, vx: 0, vy: 0 },
  { id: "3", key: "db.pool_config", scope: "workspace", source: "agent", connections: ["2", "4", "5"], x: 450, y: 350, vx: 0, vy: 0 },
  { id: "4", key: "error.handling", scope: "global", source: "auto", connections: ["3", "6"], x: 250, y: 400, vx: 0, vy: 0 },
  { id: "5", key: "testing.strategy", scope: "workspace", source: "manual", connections: ["1", "3"], x: 600, y: 300, vx: 0, vy: 0 },
  { id: "6", key: "deploy.pipeline", scope: "global", source: "auto", connections: ["4", "7"], x: 150, y: 300, vx: 0, vy: 0 },
  { id: "7", key: "logging.format", scope: "workspace", source: "agent", connections: ["6", "8"], x: 100, y: 180, vx: 0, vy: 0 },
  { id: "8", key: "cache.strategy", scope: "global", source: "manual", connections: ["7", "3"], x: 350, y: 100, vx: 0, vy: 0 },
  { id: "9", key: "rate.limiting", scope: "workspace", source: "auto", connections: ["2", "5"], x: 550, y: 450, vx: 0, vy: 0 },
  { id: "10", key: "security.headers", scope: "global", source: "agent", connections: ["1", "6"], x: 200, y: 500, vx: 0, vy: 0 },
];

export const memoryGraphSourceColors: Record<string, string> = {
  auto: "hsl(var(--purple))",
  manual: "hsl(var(--green))",
  agent: "hsl(var(--primary))",
};
