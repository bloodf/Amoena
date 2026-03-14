export type SessionSummary = {
  id: string;
  sessionMode: string;
  tuiType: string;
  workingDir: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};

export type SessionMessage = {
  id: string;
  role: string;
  content: string;
  attachments: unknown[];
  createdAt: string;
};

export type SessionAgent = {
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

export type SessionMemoryEntry = {
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
};

export type SessionMemoryResponse = {
  summary: unknown;
  tokenBudget: {
    total: number;
    l0: number;
    l1: number;
    l2: number;
  };
  entries: SessionMemoryEntry[];
};

export type RemoteDeviceSelf = {
  deviceId: string;
  deviceType?: string | null;
  platform?: string | null;
  scopes: string[];
  pairedAt?: string;
  lastSeen?: string;
};

export type RemotePairingIntent = {
  pairingToken: string;
  pin: string;
  pinCode: string;
  qrPayload: string;
  baseUrl: string;
  serverUrl: string;
  expiresAtUnixMs: number;
};

export type RemotePairingSession = {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  deviceId: string;
  scopes: string[];
  baseUrl: string;
  serverUrl: string;
};

export type RemotePairingCompleteRequest = {
  pairingToken: string;
  pin: string;
  deviceName?: string;
  deviceType?: string;
  platform?: string;
  metadata?: Record<string, unknown>;
};

export type TerminalSessionCreated = {
  terminalSessionId: string;
};

export type TerminalEvent = {
  eventId: number;
  data: string;
};

export type TranscriptEventEnvelope = {
  id: string;
  eventType: string;
  sessionId?: string | null;
  occurredAt: string;
  payload: Record<string, unknown>;
};

export type SessionMessageCreateRequest = {
  content: string;
  taskType?: string;
  reasoningMode?: string;
  reasoningEffort?: string;
  attachments?: unknown[];
};

// Hook types
export type HookRecord = {
  id: string;
  eventName: string;
  handlerType: string;
  handlerConfig: Record<string, unknown>;
  matcherRegex?: string | null;
  enabled: boolean;
  priority: number;
  timeoutMs: number;
};

export type HookInvocationResult = {
  hookId: string;
  eventName: string;
  status: string;
  output?: string | null;
  error?: string | null;
};

// Workspace types
export type WorkspaceSummary = {
  id: string;
  name: string;
  rootPath: string;
  status: string;
  branchName?: string | null;
  createdAt: string;
};

export type WorkspaceCreateRequest = {
  name: string;
  rootPath: string;
  branchName?: string;
};

export type WorkspaceInspection = {
  id: string;
  name: string;
  rootPath: string;
  status: string;
  branchName?: string | null;
  files: unknown[];
};

// Queue types
export type QueueMessage = {
  id: string;
  content: string;
  queueType: string;
  status: string;
  orderIndex: number;
};

// Task types
export type TaskRecord = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: number;
  parentTaskId?: string | null;
};

// Extension types
export type ExtensionSummary = {
  id: string;
  name: string;
  version: string;
  publisher?: string | null;
  description: string;
  enabled: boolean;
  permissions: string[];
};

export type ExtensionContributions = {
  commands: unknown[];
  menuItems: unknown[];
  panels: unknown[];
  settings: unknown[];
  hooks: unknown[];
  tools: unknown[];
  providers: unknown[];
};

// Plugin types
export type PluginHealth = {
  pluginId: string;
  status: string;
  version?: string | null;
};

// Permission types
export type PermissionDecisionRequest = {
  requestId: string;
  decision: "approve" | "deny";
  reason?: string;
};
