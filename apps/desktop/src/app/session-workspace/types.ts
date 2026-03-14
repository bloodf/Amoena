import type { AutopilotPipelinePhase } from "@/composites/autopilot/types";
import type { ManagedAgent } from "@/composites/agents/types";

export type MessageRecord = {
  id: string;
  role: string;
  content: string;
  attachments: unknown[];
  createdAt: string;
};

export type AgentRecord = {
  id: string;
  parentAgentId?: string | null;
  agentType: string;
  model: string;
  status: string;
  division?: string | null;
  collaborationStyle?: string | null;
  communicationPreference?: string | null;
  decisionWeight?: number | null;
};

export type FileContentResponse = {
  path: string;
  content: string;
};

export type RuntimeFileNode = {
  name: string;
  path: string;
  nodeType: "folder" | "file";
  children: RuntimeFileNode[];
};

export type SessionMemoryResponse = {
  summary?: {
    summaryText?: string | null;
  } | null;
  tokenBudget: {
    total: number;
    l0: number;
    l1: number;
    l2: number;
  };
  entries: Array<{
    id: string;
    title: string;
    observationType: string;
    category: "profile" | "preference" | "entity" | "pattern" | "tool_usage" | "skill";
    createdAt: string;
    l0Summary: string;
    l1Summary: string;
    l2Content: string;
    l0Tokens: number;
    l1Tokens: number;
    l2Tokens: number;
  }>;
};

export type TranscriptEvent = {
  id: string;
  eventType: string;
  occurredAt: string;
  payload: Record<string, unknown>;
};

export type RuntimeEventEnvelope = {
  id: string;
  eventType: string;
  occurredAt: string;
  payload: Record<string, unknown>;
};

export type ComposerAttachment = {
  type: "file" | "folder";
  name: string;
  path: string;
  itemCount?: number;
  inferredTypes?: string[];
  truncated?: boolean;
};

export type TerminalCreated = {
  terminalSessionId: string;
};

export type TerminalEvent = {
  eventId: number;
  data: string;
};

export type FileSaveRequest = {
  path: string;
  content: string;
};

export type SessionWorkspaceStateSetters = {
  setMessages: React.Dispatch<React.SetStateAction<MessageRecord[]>>;
  setStreamingMessage: React.Dispatch<React.SetStateAction<string>>;
  setAgents: React.Dispatch<React.SetStateAction<ManagedAgent[]>>;
  setFileTree: React.Dispatch<React.SetStateAction<RuntimeFileNode[]>>;
  setSelectedFile: React.Dispatch<
    React.SetStateAction<{ path: string; content: string } | null>
  >;
  setMemory: React.Dispatch<React.SetStateAction<SessionMemoryResponse | null>>;
  setTranscriptEvents: React.Dispatch<React.SetStateAction<TranscriptEvent[]>>;
  setAutopilotPhase: React.Dispatch<
    React.SetStateAction<AutopilotPipelinePhase | null>
  >;
};

export const sideTabs = ["review", "files", "agents", "memory"] as const;
