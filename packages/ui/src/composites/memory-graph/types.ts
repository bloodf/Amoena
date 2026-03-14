export interface MemoryGraphNode {
  id: string;
  key: string;
  scope: "global" | "workspace";
  source: "auto" | "manual" | "agent";
  connections: string[];
  x: number;
  y: number;
  vx: number;
  vy: number;
}
