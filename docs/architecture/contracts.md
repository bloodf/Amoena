# Runtime Client & Type System

The `@lunaria/runtime-client` package provides a typed HTTP client for communicating with the Lunaria runtime server. It defines the complete type system shared between the frontend and the API.

Source: `packages/runtime-client/src/`

## Package Structure

```
packages/runtime-client/src/
+-- index.ts           # Public exports
+-- client.ts          # createRuntimeClient() factory
+-- types.ts           # All shared type definitions
+-- client.test.ts     # Client tests
```

## Client Factory

The client is created via `createRuntimeClient()`:

```typescript
import { createRuntimeClient } from '@lunaria/runtime-client';

const client = createRuntimeClient({
  baseUrl: 'http://localhost:3456',
  authToken: 'bearer-token',
  fetchImpl: fetch, // optional, defaults to global fetch
});
```

All methods return typed promises. The client handles:

- JSON serialization/deserialization
- Bearer token authentication (via `Authorization` header)
- Error extraction from response bodies
- 204 No Content responses (returns `undefined`)

## API Surface

The client exposes methods organized by domain:

### Sessions

```
client.listSessions()                              -> SessionSummary[]
client.createSession(body)                         -> SessionSummary
client.getSession(sessionId)                       -> SessionSummary
client.deleteSession(sessionId)                    -> void
client.getSessionChildren(sessionId)               -> SessionSummary[]
client.interruptSession(sessionId)                 -> void
client.listSessionMessages(sessionId)              -> SessionMessage[]
client.createSessionMessage(sessionId, body)       -> SessionMessage
client.getSessionTranscript(sessionId)             -> TranscriptEventEnvelope[]
```

### Autopilot

```
client.setSessionAutopilot(sessionId, enabled)     -> SessionSummary
client.getSessionAutopilot(sessionId)              -> SessionAutopilotStatus
client.patchSessionAutopilot(sessionId, body)      -> SessionAutopilotStatus
```

### Agents

```
client.listSessionAgents(sessionId)                -> SessionAgent[]
client.listAllAgents()                             -> SessionAgent[]
client.spawnAgent(sessionId, body)                 -> SessionAgent
client.updateAgent(sessionId, agentId, body)       -> SessionAgent
```

### Teams

```
client.getTeamMailbox(teamId)                      -> unknown[]
client.postTeamMailbox(teamId, message)             -> unknown
```

### Tasks

```
client.listAllTasks()                              -> TaskRecord[]
client.listTasks(sessionId)                        -> TaskRecord[]
client.createTask(sessionId, body)                 -> TaskRecord
client.updateTask(sessionId, taskId, body)         -> TaskRecord
client.deleteTask(sessionId, taskId)               -> void
client.reorderTasks(sessionId, orderedIds)         -> void
```

### Message Queue

```
client.listQueueMessages(sessionId)                -> QueueMessage[]
client.enqueueMessage(sessionId, body)             -> QueueMessage
client.editQueueMessage(sessionId, messageId, body)-> QueueMessage
client.removeQueueMessage(sessionId, messageId)    -> void
client.reorderQueue(sessionId, orderedIds)         -> void
client.flushQueue(sessionId)                       -> void
```

### Workspaces

```
client.listWorkspaces()                            -> WorkspaceSummary[]
client.createWorkspace(body)                       -> WorkspaceSummary
client.inspectWorkspace(workspaceId)               -> WorkspaceInspection
client.archiveWorkspace(workspaceId)               -> void
client.destroyWorkspace(workspaceId)               -> void
client.reviewWorkspace(workspaceId)                -> unknown
```

### Extensions

```
client.listExtensions()                            -> ExtensionSummary[]
client.installExtension(formData)                  -> ExtensionSummary
client.uninstallExtension(extensionId)             -> void
client.toggleExtension(extensionId, enabled)       -> void
client.getExtensionContributions()                 -> ExtensionContributions
```

### Plugins

```
client.listPlugins()                               -> PluginRecord[]
client.installPlugin(body)                         -> unknown
client.uninstallPlugin(pluginId)                   -> void
client.executePlugin(pluginId, body)               -> unknown
client.pluginHealth(pluginId)                      -> PluginHealth
client.togglePlugin(pluginId, enabled)             -> PluginRecord
client.installPluginReview(body)                   -> unknown
```

### Memory

```
client.getSessionMemory(sessionId)                 -> SessionMemoryResponse
client.addObservation(body)                        -> SessionMemoryResponse
client.deleteObservation(observationId)            -> void
client.pinObservation(observationId)               -> void
client.searchMemory(query)                         -> MemorySearchResult[]
```

### Providers

```
client.listProviders()                             -> ProviderSummary[]
client.listProviderModels(providerId)              -> ProviderModel[]
client.authenticateProvider(providerId, body)       -> unknown
client.testProviderConnection(providerId, body)    -> unknown
```

### Hooks

```
client.listHooks()                                 -> HookRecord[]
client.registerHook(body)                          -> HookRecord
client.deleteHook(hookId)                          -> void
client.fireHook(eventName, payload)                -> HookInvocationResult[]
```

### Settings

```
client.getSettings()                               -> SettingsPayload
client.getSetting(key)                             -> unknown
client.saveSettings(body)                          -> SettingsPayload
```

### Usage Analytics

```
client.refreshUsage()                              -> { imported: number }
client.listUsage(params?)                          -> UsageRecord[]
client.listUsageDaily(range?)                      -> UsageDailyAggregate[]
client.getUsageSummary(range?)                     -> UsageProviderSummary[]
```

### Remote Access

```
client.createPairingIntent(scopes?)                -> RemotePairingIntent
client.completePairing(body)                       -> RemotePairingSession
client.refreshRemoteAuth(refreshToken)             -> RemotePairingSession
client.remoteDeviceMe()                            -> RemoteDeviceSelf
client.resolveRemotePermission(sessionId, body)    -> void
```

### Terminal

```
client.createTerminalSession(body)                 -> TerminalSessionCreated
client.sendTerminalInput(terminalSessionId, data)  -> void
client.resizeTerminalSession(id, cols, rows)       -> void
client.listTerminalEvents(id, lastEventId?)        -> TerminalEvent[]
```

### Files

```
client.getFileContent(path)                        -> FileContentResponse
client.getFileTree(root)                           -> FileTreeNode[]
client.saveFileContent(body)                       -> FileContentResponse
```

### Health

```
client.getHealth()                                 -> HealthStatus
```

### SSE Streams

```
client.sessionEventsUrl(sessionId, token?)         -> string (SSE URL)
client.globalEventsUrl(token?)                     -> string (SSE URL)
```

## Type System

All types are defined in `packages/runtime-client/src/types.ts`. Key types:

### Session Types

```typescript
type SessionSummary = {
  id: string;
  sessionMode: string; // "wrapper" | "native"
  tuiType: string; // "claude-code" | "codex" | "gemini" | "opencode" | "native"
  providerId?: string | null;
  modelId?: string | null;
  workingDir: string;
  status: string; // "created" | "running" | "paused" | "completed" | ...
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};

type CreateSessionRequest = {
  workingDir: string;
  sessionMode: string;
  tuiType: string;
  providerId?: string;
  modelId?: string;
  metadata?: Record<string, unknown>;
};
```

### Agent Types

```typescript
type SessionAgent = {
  id: string;
  parentAgentId?: string | null;
  agentType: string;
  mode: string; // "primary" | "subagent" | "system"
  model: string;
  systemPrompt?: string | null;
  toolAccess: string[];
  status: string;
  stepsLimit?: number | null;
  division?: string | null;
  collaborationStyle?: string | null;
  communicationPreference?: string | null;
  decisionWeight?: number | null;
};

type SpawnAgentRequest = {
  agentType: string;
  model: string;
  division?: string;
  collaborationStyle?: string;
};
```

### Memory Types

```typescript
type SessionMemoryEntry = {
  id: string;
  title: string;
  observationType: string;
  category: 'profile' | 'preference' | 'entity' | 'pattern' | 'tool_usage' | 'skill';
  createdAt: string;
  l0Summary: string; // One-line summary
  l1Summary: string; // Paragraph summary (max 320 chars)
  l2Content: string; // Full JSON detail (max 2000 chars)
  l0Tokens: number;
  l1Tokens: number;
  l2Tokens: number;
};

type SessionMemoryResponse = {
  summary: unknown;
  tokenBudget: { total: number; l0: number; l1: number; l2: number };
  entries: SessionMemoryEntry[];
};
```

### Provider Types

```typescript
type ProviderModel = {
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
```

### Extension Types

```typescript
type ExtensionSummary = {
  id: string;
  name: string;
  version: string;
  publisher?: string | null;
  description: string;
  enabled: boolean;
  permissions: string[];
};

type ExtensionContributions = {
  commands: unknown[];
  menuItems: unknown[];
  panels: unknown[];
  settings: unknown[];
  hooks: unknown[];
  tools: unknown[];
  providers: unknown[];
};
```

## Communication Protocol

The runtime uses standard HTTP REST with JSON bodies. Real-time updates are delivered via Server-Sent Events (SSE):

```
REST API:  POST/GET/PATCH/DELETE  ->  JSON response
SSE:       GET /api/v1/sessions/{id}/stream  ->  event stream
           GET /api/v1/events  ->  global event stream
```

### Authentication

All API requests (except pairing endpoints) require a Bearer token:

```
Authorization: Bearer <auth-token>
```

The token is obtained during bootstrap:

```
POST /api/v1/bootstrap/auth
Body: { "token": "<bootstrap-token>" }
Response: { "authToken": "...", "sseBaseUrl": "...", ... }
```

### Error Format

Failed requests return:

```json
{
  "error": "descriptive error message"
}
```

The client extracts the error message and throws an `Error` with the HTTP status attached as a `status` property.
