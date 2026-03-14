import type {
  ExtensionContributions,
  ExtensionSummary,
  HookInvocationResult,
  HookRecord,
  PermissionDecisionRequest,
  PluginHealth,
  QueueMessage,
  RemoteDeviceSelf,
  RemotePairingCompleteRequest,
  RemotePairingIntent,
  RemotePairingSession,
  SessionAgent,
  SessionMemoryResponse,
  SessionMessage,
  SessionMessageCreateRequest,
  SessionSummary,
  TaskRecord,
  TerminalEvent,
  TerminalSessionCreated,
  TranscriptEventEnvelope,
  WorkspaceCreateRequest,
  WorkspaceInspection,
  WorkspaceSummary,
} from "./types";

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
      init?.body !== undefined &&
      !(init.body instanceof FormData) &&
      !headers.has("Content-Type");

    if (shouldSendJsonHeader) {
      headers.set("Content-Type", "application/json");
    }

    if (!init?.skipAuth && authToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }

    const response = await fetchImpl(`${baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  return {
    request,
    sessionEventsUrl(sessionId: string, token: string = authToken ?? "") {
      return `${baseUrl}/api/v1/sessions/${sessionId}/stream?authToken=${encodeURIComponent(token)}`;
    },
    globalEventsUrl(token: string = authToken ?? "") {
      return `${baseUrl}/api/v1/events?authToken=${encodeURIComponent(token)}`;
    },
    listSessions() {
      return request<SessionSummary[]>("/api/v1/sessions");
    },
    deleteSession(sessionId: string) {
      return request<void>(`/api/v1/sessions/${sessionId}`, {
        method: "DELETE",
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
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    setSessionAutopilot(sessionId: string, enabled: boolean) {
      return request<SessionSummary>(`/api/v1/sessions/${sessionId}/autopilot`, {
        method: "POST",
        body: JSON.stringify({ enabled }),
      });
    },
    listSessionAgents(sessionId: string) {
      return request<SessionAgent[]>(`/api/v1/sessions/${sessionId}/agents/list`);
    },
    getSessionMemory(sessionId: string) {
      return request<SessionMemoryResponse>(`/api/v1/sessions/${sessionId}/memory`);
    },
    createPairingIntent(scopes: string[] = []) {
      return request<RemotePairingIntent>("/api/v1/remote/pairing/intents", {
        method: "POST",
        body: JSON.stringify({ scopes }),
        skipAuth: true,
      });
    },
    completePairing(body: RemotePairingCompleteRequest) {
      return request<RemotePairingSession>("/api/v1/remote/pair/complete", {
        method: "POST",
        body: JSON.stringify(body),
        skipAuth: true,
      });
    },
    refreshRemoteAuth(refreshToken: string) {
      return request<RemotePairingSession>("/api/v1/remote/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
        skipAuth: true,
      });
    },
    remoteDeviceMe() {
      return request<RemoteDeviceSelf>("/api/v1/remote/devices/me");
    },
    createTerminalSession(body: {
      shell?: string;
      cwd?: string;
      cols?: number;
      rows?: number;
    }) {
      return request<TerminalSessionCreated>("/api/v1/terminal/sessions", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    sendTerminalInput(terminalSessionId: string, data: string) {
      return request<void>(`/api/v1/terminal/sessions/${terminalSessionId}/input`, {
        method: "POST",
        body: JSON.stringify({ data }),
      });
    },
    resizeTerminalSession(terminalSessionId: string, cols: number, rows: number) {
      return request<void>(`/api/v1/terminal/sessions/${terminalSessionId}/resize`, {
        method: "POST",
        body: JSON.stringify({ cols, rows }),
      });
    },
    listTerminalEvents(terminalSessionId: string, lastEventId = 0) {
      return request<TerminalEvent[]>(
        `/api/v1/terminal/sessions/${terminalSessionId}/events?lastEventId=${lastEventId}`,
      );
    },
    resolveRemotePermission(sessionId: string, body: { requestId: string; decision: string; reason?: string }) {
      return request<void>(`/api/v1/remote/sessions/${sessionId}/permissions`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    // Hook operations
    listHooks() {
      return request<HookRecord[]>("/api/v1/hooks");
    },
    registerHook(body: Omit<HookRecord, "id">) {
      return request<HookRecord>("/api/v1/hooks", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    deleteHook(hookId: string) {
      return request<void>(`/api/v1/hooks/${hookId}`, { method: "DELETE" });
    },
    fireHook(eventName: string, payload?: Record<string, unknown>) {
      return request<HookInvocationResult[]>("/api/v1/hooks/fire", {
        method: "POST",
        body: JSON.stringify({ eventName, payload: payload ?? {} }),
      });
    },

    // Workspace operations
    listWorkspaces() {
      return request<WorkspaceSummary[]>("/api/v1/workspaces");
    },
    createWorkspace(body: WorkspaceCreateRequest) {
      return request<WorkspaceSummary>("/api/v1/workspaces", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    inspectWorkspace(workspaceId: string) {
      return request<WorkspaceInspection>(`/api/v1/workspaces/${workspaceId}`);
    },
    archiveWorkspace(workspaceId: string) {
      return request<void>(`/api/v1/workspaces/${workspaceId}/archive`, { method: "POST" });
    },
    destroyWorkspace(workspaceId: string) {
      return request<void>(`/api/v1/workspaces/${workspaceId}`, { method: "DELETE" });
    },
    reviewWorkspace(workspaceId: string) {
      return request<unknown>(`/api/v1/workspaces/${workspaceId}/review`, { method: "POST" });
    },

    // Queue operations
    listQueueMessages(sessionId: string) {
      return request<QueueMessage[]>(`/api/v1/sessions/${sessionId}/queue`);
    },
    enqueueMessage(sessionId: string, body: { content: string }) {
      return request<QueueMessage>(`/api/v1/sessions/${sessionId}/queue`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    editQueueMessage(sessionId: string, messageId: string, body: { content: string }) {
      return request<QueueMessage>(`/api/v1/sessions/${sessionId}/queue/${messageId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    removeQueueMessage(sessionId: string, messageId: string) {
      return request<void>(`/api/v1/sessions/${sessionId}/queue/${messageId}`, { method: "DELETE" });
    },
    reorderQueue(sessionId: string, orderedIds: string[]) {
      return request<void>(`/api/v1/sessions/${sessionId}/queue/reorder`, {
        method: "POST",
        body: JSON.stringify({ orderedIds }),
      });
    },
    flushQueue(sessionId: string) {
      return request<void>(`/api/v1/sessions/${sessionId}/queue/flush`, { method: "POST" });
    },

    // Task operations
    listTasks(sessionId: string) {
      return request<TaskRecord[]>(`/api/v1/sessions/${sessionId}/tasks`);
    },
    createTask(sessionId: string, body: { title: string; description?: string; parentTaskId?: string }) {
      return request<TaskRecord>(`/api/v1/sessions/${sessionId}/tasks`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    updateTask(sessionId: string, taskId: string, body: { status?: string; title?: string; description?: string }) {
      return request<TaskRecord>(`/api/v1/sessions/${sessionId}/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    deleteTask(sessionId: string, taskId: string) {
      return request<void>(`/api/v1/sessions/${sessionId}/tasks/${taskId}`, { method: "DELETE" });
    },
    reorderTasks(sessionId: string, orderedIds: string[]) {
      return request<void>(`/api/v1/sessions/${sessionId}/tasks/reorder`, {
        method: "POST",
        body: JSON.stringify({ orderedIds }),
      });
    },

    // Extension operations
    listExtensions() {
      return request<ExtensionSummary[]>("/api/v1/extensions");
    },
    installExtension(body: FormData) {
      return request<ExtensionSummary>("/api/v1/extensions/install", {
        method: "POST",
        body: body as unknown as string,
      });
    },
    uninstallExtension(extensionId: string) {
      return request<void>(`/api/v1/extensions/${extensionId}`, { method: "DELETE" });
    },
    toggleExtension(extensionId: string, enabled: boolean) {
      return request<void>(`/api/v1/extensions/${extensionId}/toggle`, {
        method: "POST",
        body: JSON.stringify({ enabled }),
      });
    },
    getExtensionContributions() {
      return request<ExtensionContributions>("/api/v1/extensions/contributions");
    },

    // Plugin operations
    installPlugin(body: { url: string }) {
      return request<unknown>("/api/v1/plugins/install", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    uninstallPlugin(pluginId: string) {
      return request<void>(`/api/v1/plugins/${pluginId}`, { method: "DELETE" });
    },
    executePlugin(pluginId: string, body: { action: string; args?: Record<string, unknown> }) {
      return request<unknown>(`/api/v1/plugins/${pluginId}/execute`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    pluginHealth(pluginId: string) {
      return request<PluginHealth>(`/api/v1/plugins/${pluginId}/health`);
    },

    // Permission operations
    resolvePermission(sessionId: string, body: PermissionDecisionRequest) {
      return request<void>(`/api/v1/sessions/${sessionId}/permissions`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  };
}
