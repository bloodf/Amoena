export type SessionSummary = {
  id: string;
  sessionMode: string;
  tuiType: string;
  providerId?: string | null;
  modelId?: string | null;
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
  toolCalls: unknown[];
  tokens: number;
  cost: number;
  createdAt: string;
};

export type SessionAgent = {
  id: string;
  parentAgentId?: string | null;
  agentType: string;
  mode: string;
  model: string;
  systemPrompt?: string | null;
  toolAccess: string[];
  status: string;
  stepsLimit?: number | null;
  division?: string | null;
  collaborationStyle?: string | null;
  communicationPreference?: string | null;
  decisionWeight?: number | null;
  source?: string | null;
  provider?: string | null;
  lastActive?: string | null;
  tools?: string[] | null;
  permission?: string | null;
};

export type SessionMemoryEntry = {
  id: string;
  title: string;
  observationType: string;
  category: 'profile' | 'preference' | 'entity' | 'pattern' | 'tool_usage' | 'skill';
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
  decision: 'approve' | 'deny';
  reason?: string;
};

export type UsageRecord = {
  id: string;
  sessionId: string | null;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: string;
  latencyMs: number | null;
};

export type UsageDailyAggregate = {
  date: string;
  provider: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  requestCount: number;
};

export type UsageProviderSummary = {
  provider: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  requestCount: number;
  avgLatencyMs: number | null;
};

export type UsageSessionAggregate = {
  sessionId: string | null;
  provider: string;
  model: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  requestCount: number;
};

export type ProviderSummary = {
  id: string;
  name: string;
  authStatus: string;
  modelCount: number;
  providerType: string;
};

export type ProviderModel = {
  displayName: string;
  modelId: string;
  contextWindow?: number | null;
  inputCostPerMillion?: number | null;
  outputCostPerMillion?: number | null;
  supportsVision: boolean;
  supportsTools: boolean;
  supportsReasoning: boolean;
  reasoningModes: string[];
  reasoningEffortSupported: boolean;
  reasoningEffortValues: string[];
  reasoningTokenBudgetSupported: boolean;
};

// Session creation types
export type CreateSessionRequest = {
  workingDir: string;
  sessionMode: string;
  tuiType: string;
  providerId?: string;
  modelId?: string;
  metadata?: Record<string, unknown>;
};

export type SessionAutopilotStatus = {
  enabled: boolean;
  state?: string;
  currentPhase?: string;
  goal?: string;
  activityLog?: { time: string; action: string; target: string; status: string }[];
  storySteps?: { label: string; status: string; tokens: string }[];
  runHistory?: {
    id: string;
    goal: string;
    state: string;
    steps: number;
    tokens: string;
    duration: string;
    startedAt: string;
  }[];
  subAgents?: { id: string; name: string; role: string; status: string; tokensUsed: string }[];
};

// Agent spawn types
export type SpawnAgentRequest = {
  agentType: string;
  model: string;
  division?: string;
  collaborationStyle?: string;
};

// Memory types
export type MemorySearchResult = {
  id: string;
  title: string;
  l0Summary: string;
  score: number;
};

export type AddObservationRequest = {
  title: string;
  observationType: string;
  category: string;
  content: string;
};

// File types
export type FileContentResponse = { path: string; content: string };
export type FileSaveRequest = { path: string; content: string };
export type FileTreeNode = {
  name: string;
  path: string;
  isDir: boolean;
  children?: FileTreeNode[];
};

// Plugin types (extended)
export type PluginRecord = {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  url?: string;
};

// Settings types
export type SettingsPayload = Record<string, unknown>;

// Health types
export type HealthStatus = { status: string; version?: string; uptime?: number };
