export type AgentSource = "built-in" | "imported" | "marketplace" | "custom";
export type AgentStatus =
  | "created"
  | "preparing"
  | "active"
  | "idle"
  | "running"
  | "paused"
  | "stopped"
  | "completed"
  | "failed"
  | "cancelled"
  | "thinking"
  | "executing"
  | "blocked"
  | "awaiting_review"
  | "complete"
  | "error"
  | "delegating"
  | "synthesizing";
export type AgentDivision = "engineering" | "design" | "qa" | "product" | "security" | "devops" | "ai" | "general";
export type CollaborationStyle =
  | "cooperative"
  | "critical"
  | "exploratory"
  | "directive"
  | "supportive"
  | "collaborative"
  | "advisory"
  | "autonomous";
export type CommunicationPreference = "concise" | "detailed" | "structured" | "conversational";

export interface ManagedAgent {
  name: string;
  type: "Main" | "Sub";
  source: AgentSource;
  provider: string;
  model: string;
  status: AgentStatus;
  lastActive: string;
  role: string;
  tools: string[];
  permission: string;
  session?: string;
  mailbox: { count: number; lastMessage?: string };
  children?: ManagedAgent[];
  division?: AgentDivision;
  color?: string;
  emoji?: string;
  vibe?: string;
  collaborationStyle?: CollaborationStyle;
  communicationPreference?: CommunicationPreference;
  decisionWeight?: number;
  strengths?: string[];
  limitations?: string[];
}

export interface TeamAgent {
  id: string;
  name: string;
  role: string;
  model: string;
  tuiColor: string;
  status: "created" | "preparing" | "working" | "idle" | "waiting" | "paused" | "completed" | "failed";
  currentTask?: string;
  progress?: number;
  tokensUsed?: string;
  messagesExchanged?: number;
  collaborationStyle?: CollaborationStyle;
  communicationPreference?: CommunicationPreference;
  decisionWeight?: number;
}

export interface AgentTeam {
  id: string;
  name: string;
  description: string;
  status: "idle" | "assembling" | "active" | "paused" | "disbanded" | "completed" | "failed";
  agents: TeamAgent[];
  totalTokens: string;
  startedAt: string;
  completedTasks: number;
  totalTasks: number;
}
