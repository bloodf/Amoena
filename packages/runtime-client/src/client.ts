import type {
  AddObservationRequest,
  CreateSessionRequest,
  ExtensionContributions,
  ExtensionSummary,
  FileContentResponse,
  FileSaveRequest,
  FileTreeNode,
  HealthStatus,
  HookInvocationResult,
  HookRecord,
  MemorySearchResult,
  PermissionDecisionRequest,
  PluginHealth,
  PluginRecord,
  ProviderModel,
  ProviderSummary,
  QueueMessage,
  RemoteDeviceSelf,
  RemotePairingCompleteRequest,
  RemotePairingIntent,
  RemotePairingSession,
  SessionAgent,
  SessionAutopilotStatus,
  SessionMemoryResponse,
  SessionMessage,
  SessionMessageCreateRequest,
  SessionSummary,
  SettingsPayload,
  SpawnAgentRequest,
  TaskRecord,
  TerminalEvent,
  TerminalSessionCreated,
  TranscriptEventEnvelope,
  UsageDailyAggregate,
  UsageProviderSummary,
  UsageRecord,
  WorkspaceCreateRequest,
  WorkspaceInspection,
  WorkspaceSummary,
} from './types';

type RuntimeClientOptions = {
  baseUrl: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
};

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

export function createRuntimeClient({
  baseUrl,
  authToken,
  fetchImpl = fetch,
}: RuntimeClientOptions) {
  async function request<T>(path: string, init?: RequestOptions): Promise<T> {
    const headers = new Headers(init?.headers);
    const shouldSendJsonHeader =
      init?.body !== undefined && !(init.body instanceof FormData) && !headers.has('Content-Type');

    if (shouldSendJsonHeader) {
      headers.set('Content-Type', 'application/json');
    }

    if (!init?.skipAuth && authToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await fetchImpl(`${baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const errorBody = await response.json();
        if (errorBody?.error) message = `${message}: ${errorBody.error}`;
        else if (errorBody?.message) message = `${message}: ${errorBody.message}`;
      } catch {
        // Response body not JSON — use default message
      }
      const err = new Error(message);
      (err as Error & { status: number }).status = response.status;
      throw err;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  return {
    request,
    sessionEventsUrl(sessionId: string, token: string = authToken ?? '') {
      return `${baseUrl}/api/v1/sessions/${sessionId}/stream?authToken=${encodeURIComponent(token)}`;
    },
    globalEventsUrl(token: string = authToken ?? '') {
      return `${baseUrl}/api/v1/events?authToken=${encodeURIComponent(token)}`;
    },
    listSessions() {
      return request<SessionSummary[]>('/api/v1/sessions');
    },
    deleteSession(sessionId: string) {
      return request<void>(`/api/v1/sessions/${sessionId}`, {
        method: 'DELETE',
      });
    },
    listSessionMessages(sessionId: string) {
      return request<SessionMessage[]>(`/api/v1/sessions/${sessionId}/messages`);
    },
    getSessionTranscript(sessionId: string) {
      return request<TranscriptEventEnvelope[]>(`/api/v1/sessions/${sessionId}/transcript`);
    },
    createSessionMessage(sessionId: string, body: SessionMessageCreateRequest) {
      return request<SessionMessage>(`/api/v1/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    setSessionAutopilot(sessionId: string, enabled: boolean) {
      return request<SessionSummary>(`/api/v1/sessions/${sessionId}/autopilot`, {
        method: 'POST',
        body: JSON.stringify({ enabled }),
      });
    },
    listSessionAgents(sessionId: string) {
      return request<SessionAgent[]>(`/api/v1/sessions/${sessionId}/agents/list`);
    },
    listAllAgents() {
      return request<SessionAgent[]>('/api/v1/agents');
    },
    getSessionMemory(sessionId: string) {
      return request<SessionMemoryResponse>(`/api/v1/sessions/${sessionId}/memory`);
    },
    createPairingIntent(scopes: string[] = []) {
      return request<RemotePairingIntent>('/api/v1/remote/pairing/intents', {
        method: 'POST',
        body: JSON.stringify({ scopes }),
        skipAuth: true,
      });
    },
    completePairing(body: RemotePairingCompleteRequest) {
      return request<RemotePairingSession>('/api/v1/remote/pair/complete', {
        method: 'POST',
        body: JSON.stringify(body),
        skipAuth: true,
      });
    },
    refreshRemoteAuth(refreshToken: string) {
      return request<RemotePairingSession>('/api/v1/remote/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        skipAuth: true,
      });
    },
    remoteDeviceMe() {
      return request<RemoteDeviceSelf>('/api/v1/remote/devices/me');
    },
    createTerminalSession(body: { shell?: string; cwd?: string; cols?: number; rows?: number }) {
      return request<TerminalSessionCreated>('/api/v1/terminal/sessions', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    sendTerminalInput(terminalSessionId: string, data: string) {
      return request<void>(`/api/v1/terminal/sessions/${terminalSessionId}/input`, {
        method: 'POST',
        body: JSON.stringify({ data }),
      });
    },
    resizeTerminalSession(terminalSessionId: string, cols: number, rows: number) {
      return request<void>(`/api/v1/terminal/sessions/${terminalSessionId}/resize`, {
        method: 'POST',
        body: JSON.stringify({ cols, rows }),
      });
    },
    listTerminalEvents(terminalSessionId: string, lastEventId = 0) {
      return request<TerminalEvent[]>(
        `/api/v1/terminal/sessions/${terminalSessionId}/events?lastEventId=${lastEventId}`,
      );
    },
    resolveRemotePermission(
      sessionId: string,
      body: { requestId: string; decision: string; reason?: string },
    ) {
      return request<void>(`/api/v1/remote/sessions/${sessionId}/permissions`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    // Hook operations
    listHooks() {
      return request<HookRecord[]>('/api/v1/hooks');
    },
    registerHook(body: Omit<HookRecord, 'id'>) {
      return request<HookRecord>('/api/v1/hooks', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    deleteHook(hookId: string) {
      return request<void>(`/api/v1/hooks/${hookId}`, { method: 'DELETE' });
    },
    fireHook(eventName: string, payload?: Record<string, unknown>) {
      return request<HookInvocationResult[]>('/api/v1/hooks/fire', {
        method: 'POST',
        body: JSON.stringify({ eventName, payload: payload ?? {} }),
      });
    },

    // Workspace operations
    listWorkspaces() {
      return request<WorkspaceSummary[]>('/api/v1/workspaces');
    },
    createWorkspace(body: WorkspaceCreateRequest) {
      return request<WorkspaceSummary>('/api/v1/workspaces', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    inspectWorkspace(workspaceId: string) {
      return request<WorkspaceInspection>(`/api/v1/workspaces/${workspaceId}`);
    },
    archiveWorkspace(workspaceId: string) {
      return request<void>(`/api/v1/workspaces/${workspaceId}/archive`, { method: 'POST' });
    },
    destroyWorkspace(workspaceId: string) {
      return request<void>(`/api/v1/workspaces/${workspaceId}`, { method: 'DELETE' });
    },
    reviewWorkspace(workspaceId: string) {
      return request<unknown>(`/api/v1/workspaces/${workspaceId}/reviews`, { method: 'POST' });
    },

    // Queue operations
    listQueueMessages(sessionId: string) {
      return request<QueueMessage[]>(`/api/v1/sessions/${sessionId}/queue`);
    },
    enqueueMessage(sessionId: string, body: { content: string }) {
      return request<QueueMessage>(`/api/v1/sessions/${sessionId}/queue`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    editQueueMessage(sessionId: string, messageId: string, body: { content: string }) {
      return request<QueueMessage>(`/api/v1/sessions/${sessionId}/queue/${messageId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },
    removeQueueMessage(sessionId: string, messageId: string) {
      return request<void>(`/api/v1/sessions/${sessionId}/queue/${messageId}`, {
        method: 'DELETE',
      });
    },
    reorderQueue(sessionId: string, orderedIds: string[]) {
      return request<void>(`/api/v1/sessions/${sessionId}/queue/reorder`, {
        method: 'POST',
        body: JSON.stringify({ orderedIds }),
      });
    },
    flushQueue(sessionId: string) {
      return request<void>(`/api/v1/sessions/${sessionId}/queue/flush`, { method: 'POST' });
    },

    // Task operations
    listAllTasks() {
      return request<TaskRecord[]>('/api/v1/tasks');
    },
    listTasks(sessionId: string) {
      return request<TaskRecord[]>(`/api/v1/sessions/${sessionId}/tasks`);
    },
    createTask(
      sessionId: string,
      body: { title: string; description?: string; parentTaskId?: string },
    ) {
      return request<TaskRecord>(`/api/v1/sessions/${sessionId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    updateTask(
      sessionId: string,
      taskId: string,
      body: { status?: string; title?: string; description?: string },
    ) {
      return request<TaskRecord>(`/api/v1/sessions/${sessionId}/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },
    deleteTask(sessionId: string, taskId: string) {
      return request<void>(`/api/v1/sessions/${sessionId}/tasks/${taskId}`, { method: 'DELETE' });
    },
    reorderTasks(sessionId: string, orderedIds: string[]) {
      return request<void>(`/api/v1/sessions/${sessionId}/tasks/reorder`, {
        method: 'POST',
        body: JSON.stringify({ orderedIds }),
      });
    },

    // Extension operations
    listExtensions() {
      return request<ExtensionSummary[]>('/api/v1/extensions');
    },
    installExtension(body: FormData) {
      return request<ExtensionSummary>('/api/v1/extensions/install', {
        method: 'POST',
        body: body as BodyInit,
      });
    },
    uninstallExtension(extensionId: string) {
      return request<void>(`/api/v1/extensions/${extensionId}`, { method: 'DELETE' });
    },
    toggleExtension(extensionId: string, enabled: boolean) {
      return request<void>(`/api/v1/extensions/${extensionId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ enabled }),
      });
    },
    getExtensionContributions() {
      return request<ExtensionContributions>('/api/v1/extensions/contributions');
    },

    // Plugin operations
    installPlugin(body: { url: string }) {
      return request<unknown>('/api/v1/plugins/install', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    uninstallPlugin(pluginId: string) {
      return request<void>(`/api/v1/plugins/${pluginId}`, { method: 'DELETE' });
    },
    executePlugin(pluginId: string, body: { action: string; args?: Record<string, unknown> }) {
      return request<unknown>(`/api/v1/plugins/${pluginId}/execute`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    pluginHealth(pluginId: string) {
      return request<PluginHealth>(`/api/v1/plugins/${pluginId}/health`);
    },

    // Permission operations
    resolvePermission(sessionId: string, body: PermissionDecisionRequest) {
      return request<void>(`/api/v1/sessions/${sessionId}/permissions`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    // Usage analytics operations
    refreshUsage() {
      return request<{ imported: number }>('/api/v1/usage/refresh', { method: 'POST' });
    },
    listUsage(params?: { limit?: number; offset?: number; range?: number }) {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.offset) searchParams.set('offset', String(params.offset));
      if (params?.range) searchParams.set('range', String(params.range));
      const query = searchParams.toString();
      return request<UsageRecord[]>(`/api/v1/usage${query ? `?${query}` : ''}`);
    },
    listUsageDaily(range?: number) {
      const query = range ? `?range=${range}` : '';
      return request<UsageDailyAggregate[]>(`/api/v1/usage/daily${query}`);
    },
    getUsageSummary(range?: number) {
      const query = range ? `?range=${range}` : '';
      return request<UsageProviderSummary[]>(`/api/v1/usage/summary${query}`);
    },

    // Provider operations
    authenticateProvider(providerId: string, body: Record<string, unknown>) {
      return request<unknown>(`/api/v1/providers/${providerId}/auth`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    listProviders() {
      return request<ProviderSummary[]>('/api/v1/providers');
    },
    listProviderModels(providerId: string) {
      return request<ProviderModel[]>(`/api/v1/providers/${providerId}/models`);
    },
    testProviderConnection(providerId: string, body: Record<string, unknown>) {
      return request<unknown>(`/api/v1/providers/${providerId}/test`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    // Session creation / detail
    createSession(body: CreateSessionRequest) {
      return request<SessionSummary>('/api/v1/sessions', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    getSession(sessionId: string) {
      return request<SessionSummary>(`/api/v1/sessions/${sessionId}`);
    },
    getSessionChildren(sessionId: string) {
      return request<SessionSummary[]>(`/api/v1/sessions/${sessionId}/children`);
    },
    interruptSession(sessionId: string) {
      return request<void>(`/api/v1/sessions/${sessionId}/interrupt`, { method: 'POST' });
    },
    getSessionAutopilot(sessionId: string) {
      return request<SessionAutopilotStatus>(`/api/v1/sessions/${sessionId}/autopilot`);
    },
    patchSessionAutopilot(sessionId: string, body: Partial<SessionAutopilotStatus>) {
      return request<SessionAutopilotStatus>(`/api/v1/sessions/${sessionId}/autopilot`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },

    // Settings operations
    getSettings() {
      return request<SettingsPayload>('/api/v1/settings');
    },
    getSetting(key: string) {
      return request<unknown>(`/api/v1/settings/${key}`);
    },
    saveSettings(body: SettingsPayload) {
      return request<SettingsPayload>('/api/v1/settings', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    // Agent spawn / update
    spawnAgent(sessionId: string, body: SpawnAgentRequest) {
      return request<SessionAgent>(`/api/v1/sessions/${sessionId}/agents`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    updateAgent(sessionId: string, agentId: string, body: Partial<SpawnAgentRequest>) {
      return request<SessionAgent>(`/api/v1/sessions/${sessionId}/agents/${agentId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },

    // Memory operations
    addObservation(body: AddObservationRequest) {
      return request<SessionMemoryResponse>('/api/v1/memory/observe', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    deleteObservation(observationId: string) {
      return request<void>(`/api/v1/memory/observations/${observationId}`, { method: 'DELETE' });
    },
    pinObservation(observationId: string) {
      return request<void>(`/api/v1/memory/observations/${observationId}/pin`, { method: 'POST' });
    },
    searchMemory(query: string) {
      return request<MemorySearchResult[]>(`/api/v1/memory/search?q=${encodeURIComponent(query)}`);
    },

    // File operations
    getFileContent(path: string) {
      return request<FileContentResponse>(`/api/v1/files/content?path=${encodeURIComponent(path)}`);
    },
    getFileTree(root: string) {
      return request<FileTreeNode[]>(`/api/v1/files/tree?root=${encodeURIComponent(root)}`);
    },
    saveFileContent(body: FileSaveRequest) {
      return request<FileContentResponse>('/api/v1/files/content', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    // Plugin list / toggle / install-review
    installPluginReview(body: { url: string; [key: string]: unknown }) {
      return request<unknown>('/api/v1/plugins/install-review', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    listPlugins() {
      return request<PluginRecord[]>('/api/v1/plugins');
    },
    togglePlugin(pluginId: string, enabled: boolean) {
      return request<PluginRecord>(`/api/v1/plugins/${pluginId}`, {
        method: 'POST',
        body: JSON.stringify({ enabled }),
      });
    },

    // Team mailbox operations
    getTeamMailbox(teamId: string) {
      return request<unknown[]>(`/api/v1/teams/${teamId}/mailbox`);
    },
    postTeamMailbox(
      teamId: string,
      message: { content: string; fromAgentId: string; toAgentId?: string },
    ) {
      return request<unknown>(`/api/v1/teams/${teamId}/mailbox`, {
        method: 'POST',
        body: JSON.stringify(message),
      });
    },

    // Health check
    getHealth() {
      return request<HealthStatus>('/api/v1/health');
    },
  };
}
