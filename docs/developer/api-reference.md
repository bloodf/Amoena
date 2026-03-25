# Runtime API Reference

Complete documentation of all Amoena Desktop runtime HTTP endpoints.

## Authentication

All endpoints except `/health` and `/api/v1/bootstrap/auth` require a session token in the `Authorization` header:

```bash
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  http://localhost:8080/api/v1/sessions
```

## Health & Bootstrap

### GET /health
### GET /api/v1/health

Health check endpoint.

**Response:**
```json
{
  "appName": "Amoena",
  "appVersion": "0.1.0",
  "instanceId": "uuid",
  "status": "ok"
}
```

### POST /api/v1/bootstrap/auth

Initial authentication with bootstrap token. Returns a session token.

**Request:**
```json
{
  "token": "bootstrap_token_from_launch_context"
}
```

**Response:**
```json
{
  "apiBaseUrl": "http://localhost:8080",
  "authToken": "session_token",
  "instanceId": "uuid",
  "sseBaseUrl": "http://localhost:8080",
  "tokenType": "Bearer"
}
```

## Authentication (Continued)

### POST /api/v1/auth/refresh

Refresh a session token using a refresh token.

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "authToken": "new_session_token",
  "refreshToken": "new_refresh_token",
  "expiresIn": 3600
}
```

### POST /api/v1/auth/revoke

Revoke a session.

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:** 204 No Content

## Providers

### GET /api/v1/providers

List all registered providers (Claude, Codex, OpenCode, Gemini, etc.).

**Response:**
```json
[
  {
    "id": "claude",
    "name": "Claude",
    "type": "llm",
    "status": "available",
    "authRequired": true
  }
]
```

### GET /api/v1/providers/{provider_id}/models

List models available from a provider.

**Response:**
```json
[
  {
    "id": "claude-opus-4-1",
    "name": "Claude Opus 4.1",
    "provider": "claude",
    "context_window": 200000,
    "supports_reasoning": true,
    "cost": { "input": 15, "output": 75 }
  }
]
```

### POST /api/v1/providers/{provider_id}/auth

Store authentication credentials for a provider.

**Request:**
```json
{
  "api_key": "sk-..."
}
```

**Response:** 200 OK

### POST /api/v1/providers/{provider_id}/models/{model_id}/reasoning

Update reasoning mode defaults for a model.

**Request:**
```json
{
  "mode": "auto",
  "effort": "medium"
}
```

## Sessions

### GET /api/v1/sessions

List all sessions.

**Query params:**
- `limit` — Max results (default: 50)
- `offset` — Pagination offset

**Response:**
```json
{
  "sessions": [
    {
      "id": "sess-123",
      "status": "active",
      "sessionMode": "agentic",
      "tuiType": "claude-code",
      "workingDir": "/home/user/projects",
      "createdAt": "2026-03-14T10:00:00Z",
      "updatedAt": "2026-03-14T10:05:00Z",
      "providerId": "claude",
      "modelId": "claude-opus-4-1"
    }
  ],
  "total": 15
}
```

### POST /api/v1/sessions

Create a new session.

**Request:**
```json
{
  "workingDir": "/home/user/projects",
  "sessionMode": "agentic",
  "tuiType": "claude-code",
  "providerId": "claude",
  "modelId": "claude-opus-4-1",
  "parentSessionId": "parent-sess-id",
  "metadata": {}
}
```

**Response:**
```json
{
  "id": "sess-123",
  "status": "active",
  "sessionMode": "agentic",
  ...
}
```

### GET /api/v1/sessions/{session_id}

Get session details (implicit in list response).

### DELETE /api/v1/sessions/{session_id}

Delete a session.

**Response:** 204 No Content

### GET /api/v1/sessions/{session_id}/children

List child sessions (sub-agents spawned during this session).

**Response:**
```json
{
  "children": [
    {
      "id": "child-sess-1",
      "parentId": "sess-123",
      "createdAt": "...",
      "status": "completed"
    }
  ]
}
```

### GET /api/v1/sessions/{session_id}/tree

Get full session hierarchy as a tree.

**Response:**
```json
{
  "id": "sess-123",
  "children": [
    {
      "id": "child-1",
      "children": [
        {
          "id": "grandchild-1",
          "children": []
        }
      ]
    }
  ]
}
```

## Messages

### GET /api/v1/sessions/{session_id}/messages

List messages in a session.

**Query params:**
- `limit` — Max results (default: 50)
- `offset` — Pagination offset

**Response:**
```json
{
  "messages": [
    {
      "id": "msg-1",
      "sessionId": "sess-123",
      "role": "user",
      "content": "Hello",
      "createdAt": "...",
      "usage": { "inputTokens": 10, "outputTokens": 100 }
    }
  ]
}
```

### POST /api/v1/sessions/{session_id}/messages

Create a message and stream response.

**Request:**
```json
{
  "content": "What is 2+2?",
  "taskType": "analysis",
  "reasoningMode": "auto",
  "reasoningEffort": "medium",
  "attachments": []
}
```

**Response:** SSE stream

```
event: message.delta
data: {"id":"msg-2","delta":"The"}

event: message.delta
data: {"id":"msg-2","delta":" answer"}

event: tool.start
data: {"tool":"calculator","input":"2+2"}

event: tool.result
data: {"tool":"calculator","output":"4"}

event: usage
data: {"inputTokens":50,"outputTokens":200}

event: message.complete
data: {"id":"msg-2"}
```

### GET /api/v1/sessions/{session_id}/stream

Subscribe to session events via SSE.

**Response:** SSE stream (all events for this session)

### GET /api/v1/sessions/{session_id}/transcript

Get full session transcript (all messages in order).

**Response:**
```json
{
  "sessionId": "sess-123",
  "messages": [...]
}
```

## Session Control

### POST /api/v1/sessions/{session_id}/interrupt

Stop the current generation/operation in a session.

**Response:** 200 OK

### POST /api/v1/sessions/{session_id}/autopilot

Enable or disable autopilot mode.

**Request:**
```json
{
  "enabled": true
}
```

**Response:** 200 OK

### POST /api/v1/sessions/{session_id}/permissions

Approve or deny a permission request from the AI.

**Request:**
```json
{
  "requestId": "perm-123",
  "decision": "approve",
  "reason": "User approved"
}
```

**Response:** 200 OK

## Agents

### POST /api/v1/sessions/{session_id}/agents

Spawn a sub-agent (child session with AI control).

**Request:**
```json
{
  "parentAgentId": "parent-sess-123",
  "personaId": "my-persona",
  "agentType": "autonomous",
  "model": "claude-opus-4-1",
  "requestedTools": ["shell", "git"],
  "stepsLimit": 100
}
```

**Response:**
```json
{
  "agentId": "agent-123",
  "sessionId": "child-sess-123",
  "status": "running"
}
```

### GET /api/v1/sessions/{session_id}/agents/list

List all agents/sub-agents for a session.

**Response:**
```json
{
  "agents": [
    {
      "id": "agent-1",
      "type": "autonomous",
      "status": "running",
      "createdAt": "..."
    }
  ]
}
```

## Message Queue

The message queue allows reordering, editing, or removing messages before they're sent to the AI.

### GET /api/v1/sessions/{session_id}/queue

List queued messages.

**Response:**
```json
{
  "messages": [
    {
      "id": "queue-msg-1",
      "content": "First message",
      "position": 0
    }
  ]
}
```

### POST /api/v1/sessions/{session_id}/queue

Enqueue a message (add to queue without sending).

**Request:**
```json
{
  "content": "Message text",
  "queueType": "user"
}
```

**Response:**
```json
{
  "id": "queue-msg-1",
  "content": "...",
  "position": 0
}
```

### PUT /api/v1/sessions/{session_id}/queue/{msg_id}

Edit a queued message.

**Request:**
```json
{
  "content": "Updated message text"
}
```

**Response:** 200 OK

### DELETE /api/v1/sessions/{session_id}/queue/{msg_id}

Remove a queued message.

**Response:** 204 No Content

### POST /api/v1/sessions/{session_id}/queue/reorder

Reorder queued messages.

**Request (App Queue only):**
```json
{
  "orderedIds": ["queue-msg-3", "queue-msg-1", "queue-msg-2"]
}
```

**Note:** CLI queue returns 403 Forbidden (reorder not supported from CLI).

**Response:** 200 OK

### POST /api/v1/sessions/{session_id}/queue/flush

Send all queued messages in order.

**Response:** 200 OK (returns SSE stream handle for responses)

## Tasks

Tasks represent work items created by the user or AI.

### GET /api/v1/sessions/{session_id}/tasks

List tasks for a session.

**Response:**
```json
{
  "tasks": [
    {
      "id": "task-1",
      "title": "Fix bug in auth",
      "description": "Login is failing",
      "status": "pending",
      "parentTaskId": null,
      "agentId": "agent-123",
      "priority": 1,
      "createdAt": "..."
    }
  ]
}
```

### POST /api/v1/sessions/{session_id}/tasks

Create a new task.

**Request:**
```json
{
  "title": "Implement feature X",
  "description": "Add feature X to the system",
  "agentId": "agent-123",
  "parentTaskId": "task-1",
  "priority": 1
}
```

**Response:**
```json
{
  "id": "task-2",
  "title": "...",
  "status": "pending"
}
```

### PUT /api/v1/sessions/{session_id}/tasks/{task_id}

Update a task.

**Request:**
```json
{
  "title": "Updated title",
  "status": "in_progress",
  "priority": 2
}
```

**Response:** 200 OK

### DELETE /api/v1/sessions/{session_id}/tasks/{task_id}

Delete a task.

**Response:** 204 No Content

### POST /api/v1/sessions/{session_id}/tasks/reorder

Reorder tasks.

**Request:**
```json
{
  "orderedIds": ["task-3", "task-1", "task-2"]
}
```

**Response:** 200 OK

## Hooks

Hooks are event handlers that fire on specific runtime events.

### GET /api/v1/hooks

List registered hooks.

**Response:**
```json
[
  {
    "id": "hook-1",
    "eventName": "SessionStart",
    "handlerType": "http",
    "handlerConfig": { "url": "https://..." },
    "priority": 100,
    "timeoutMs": 5000,
    "createdAt": "..."
  }
]
```

### POST /api/v1/hooks

Register a new hook.

**Request:**
```json
{
  "eventName": "SessionStart",
  "handlerType": "http",
  "handlerConfig": {
    "url": "https://webhook.example.com/session-start"
  },
  "priority": 100,
  "timeoutMs": 5000,
  "matcherRegex": ".*"
}
```

**Response:**
```json
{
  "id": "hook-1",
  "eventName": "SessionStart",
  ...
}
```

### DELETE /api/v1/hooks/{hook_id}

Delete a hook.

**Response:** 204 No Content

### POST /api/v1/hooks/fire

Fire a hook event (for testing).

**Request:**
```json
{
  "event": "SessionStart",
  "payload": {
    "session_id": "sess-123",
    "working_dir": "/home/user"
  }
}
```

**Response:** 200 OK

## Workspaces

Workspaces are isolated project copies (clones) for safe experimentation.

### GET /api/v1/workspaces

List all workspaces.

**Response:**
```json
{
  "workspaces": [
    {
      "id": "ws-1",
      "name": "Feature Branch Experiment",
      "strategy": "git_worktree",
      "basePath": "/home/user/projects/main",
      "createdAt": "...",
      "status": "active"
    }
  ]
}
```

### POST /api/v1/workspaces

Create a new workspace (clone).

**Request:**
```json
{
  "name": "My Experiment",
  "basePath": "/home/user/projects",
  "strategy": "git_worktree|cow|full_copy"
}
```

**Strategies:**
- `git_worktree` — Git worktree (fastest, requires git)
- `cow` — Copy-on-write APFS cloning (macOS only, fast)
- `full_copy` — Full directory copy (slowest, most compatible)

**Response:**
```json
{
  "id": "ws-1",
  "name": "My Experiment",
  "clonePath": "/home/user/projects/.workspaces/ws-1",
  "status": "ready"
}
```

### GET /api/v1/workspaces/{workspace_id}

Inspect a workspace.

**Response:**
```json
{
  "id": "ws-1",
  "name": "...",
  "strategy": "git_worktree",
  "basePath": "...",
  "clonePath": "...",
  "status": "active",
  "createdAt": "...",
  "size_bytes": 1024000,
  "file_count": 50
}
```

### DELETE /api/v1/workspaces/{workspace_id}

Destroy a workspace (cannot be undone).

**Response:** 204 No Content

### POST /api/v1/workspaces/{workspace_id}/archive

Archive a workspace (soft delete, can restore).

**Response:** 200 OK

### POST /api/v1/workspaces/{workspace_id}/reviews

Prepare a merge review between workspace and base.

**Request:**
```json
{
  "strategy": "consensus",
  "reviewers": ["reviewer-1", "reviewer-2"]
}
```

**Response:**
```json
{
  "reviewId": "review-1",
  "conflictCount": 5,
  "changeCount": 42,
  "consensus": {
    "scores": { "reviewer-1": 0.8, "reviewer-2": 0.9 },
    "decision": "approved"
  }
}
```

## Plugins

### GET /api/v1/plugins

List all installed plugins.

**Response:**
```json
{
  "plugins": [
    {
      "id": "my.plugin",
      "name": "My Plugin",
      "version": "1.0.0",
      "enabled": true,
      "createdAt": "...",
      "status": "loaded"
    }
  ]
}
```

### POST /api/v1/plugins/{plugin_id}

Toggle a plugin on/off.

**Request:**
```json
{
  "enabled": false
}
```

**Response:** 200 OK

### POST /api/v1/plugins/install-review

Parse a plugin installation deeplink and prepare for install.

**Request:**
```json
{
  "deeplink": "amoena://plugin/install?url=https://..."
}
```

**Response:**
```json
{
  "id": "plugin-id",
  "name": "Plugin Name",
  "version": "1.0.0",
  "permissions": ["fs.read", "sessions.read"],
  "installUrl": "https://..."
}
```

## Extensions

### GET /api/v1/extensions

List all installed `.luna` extensions.

**Response:**
```json
{
  "extensions": [
    {
      "id": "my.extension",
      "name": "My Extension",
      "version": "1.0.0",
      "enabled": true,
      "createdAt": "...",
      "contributions": {
        "commands": 2,
        "panels": 1,
        "hooks": 3
      }
    }
  ]
}
```

### POST /api/v1/extensions

Install a new extension.

**Request (multipart/form-data):**
```
file: <luna_file>
```

Or:

```json
{
  "url": "https://example.com/my-extension.luna"
}
```

**Response:**
```json
{
  "id": "my.extension",
  "name": "My Extension",
  "status": "installed"
}
```

### DELETE /api/v1/extensions/{extension_id}

Uninstall an extension.

**Response:** 204 No Content

### POST /api/v1/extensions/{extension_id}/toggle

Enable/disable an extension.

**Request:**
```json
{
  "enabled": false
}
```

**Response:** 200 OK

### GET /api/v1/extensions/{extension_id}/contributions

Get all contributions from an extension.

**Response:**
```json
{
  "commands": [...],
  "panels": [...],
  "hooks": [...],
  "menus": [...],
  "settings": [...]
}
```

### GET /api/v1/extensions/{extension_id}/panels/{panel_id}

Get a panel's HTML/CSS/JS assets.

**Response:**
```json
{
  "html": "<div>...</div>",
  "css": "...",
  "scripts": ["panel.js"]
}
```

## Memory

### POST /api/v1/memory/observe

Record a memory observation.

**Request:**
```json
{
  "sessionId": "sess-123",
  "title": "User prefers TypeScript",
  "narrative": "User specified preference for TypeScript in this session",
  "category": "user_preference"
}
```

**Response:**
```json
{
  "id": "obs-1",
  "sessionId": "sess-123",
  "title": "...",
  "createdAt": "..."
}
```

### GET /api/v1/memory/search

Search memory observations.

**Query params:**
- `query` — Search text (required)
- `category` — Filter by category

**Response:**
```json
{
  "results": [
    {
      "id": "obs-1",
      "title": "User prefers TypeScript",
      "l0Summary": "...",
      "relevance": 0.95
    }
  ]
}
```

### GET /api/v1/sessions/{session_id}/memory

Get memory summary for a session.

**Response:**
```json
{
  "summary": {
    "id": "...",
    "sessionId": "sess-123",
    "observationCount": 15
  },
  "tokenBudget": {
    "total": 10000,
    "l0": 5000,
    "l1": 3000,
    "l2": 2000
  },
  "entries": [...]
}
```

## Files

### GET /api/v1/files/tree

Get file tree for a workspace.

**Query params:**
- `root` — Root directory path (required)

**Response:**
```json
{
  "name": "project",
  "path": "/home/user/project",
  "nodeType": "directory",
  "children": [
    {
      "name": "src",
      "path": "/home/user/project/src",
      "nodeType": "directory",
      "children": [...]
    }
  ]
}
```

### GET /api/v1/files/content

Get file contents.

**Query params:**
- `path` — File path (required)

**Response:**
```json
{
  "path": "/home/user/project/main.ts",
  "content": "console.log('hello');"
}
```

### POST /api/v1/files/content

Update file contents.

**Request:**
```json
{
  "path": "/home/user/project/main.ts",
  "content": "console.log('updated');"
}
```

**Response:** 200 OK

## Teams & Mailbox

### POST /api/v1/teams

Create a team (multi-agent group).

**Request:**
```json
{
  "name": "Code Review Team",
  "divisionRequirements": {
    "security": { "expertise": "high" },
    "qa": { "expertise": "high" }
  },
  "threshold": 0.8,
  "sharedTaskListPath": "/tmp/tasks.json"
}
```

**Response:**
```json
{
  "id": "team-1",
  "name": "Code Review Team",
  "members": [...]
}
```

### GET /api/v1/teams/{team_id}/mailbox

Get team mailbox messages.

**Response:**
```json
{
  "messages": [
    {
      "id": "msg-1",
      "from": "agent-1",
      "to": "agent-2",
      "content": "...",
      "createdAt": "..."
    }
  ]
}
```

### POST /api/v1/teams/{team_id}/mailbox

Send a message via mailbox.

**Request:**
```json
{
  "sessionId": "sess-123",
  "fromAgentId": "agent-1",
  "toAgentId": "agent-2",
  "content": "Message body",
  "messageType": "consensus_request"
}
```

**Response:**
```json
{
  "id": "msg-1",
  "from": "agent-1",
  "to": "agent-2",
  "status": "sent"
}
```

## Terminal

### POST /api/v1/terminal/sessions

Create a new terminal session.

**Request:**
```json
{
  "shell": "/bin/bash",
  "cwd": "/home/user",
  "cols": 80,
  "rows": 24
}
```

**Response:**
```json
{
  "id": "term-1",
  "shell": "/bin/bash",
  "cwd": "/home/user"
}
```

### POST /api/v1/terminal/sessions/{terminal_id}/input

Send input to terminal.

**Request:**
```json
{
  "data": "ls -la\n"
}
```

**Response:** 200 OK

### POST /api/v1/terminal/sessions/{terminal_id}/resize

Resize terminal.

**Request:**
```json
{
  "cols": 120,
  "rows": 30
}
```

**Response:** 200 OK

### GET /api/v1/terminal/sessions/{terminal_id}/events

Get terminal output events (SSE).

**Response:** SSE stream

```
event: output
data: {"data":"$ ls -la\n"}

event: exit
data: {"code":0}
```

### DELETE /api/v1/terminal/sessions/{terminal_id}

Close a terminal session.

**Response:** 204 No Content

## Remote Access

### GET /api/v1/remote/devices/me

Get info about the current device.

**Response:**
```json
{
  "id": "device-123",
  "name": "My MacBook",
  "platform": "darwin",
  "status": "online",
  "pairedAt": "..."
}
```

### GET /api/v1/remote/devices

List paired remote devices.

**Response:**
```json
{
  "devices": [
    {
      "id": "device-456",
      "name": "iPhone",
      "platform": "ios",
      "status": "online"
    }
  ]
}
```

### POST /api/v1/remote/pairing/intents

Create a pairing intent to pair a remote device.

**Request:**
```json
{
  "advertisedHost": "192.168.1.100",
  "scopes": ["sessions.read", "messages.read"]
}
```

**Response:**
```json
{
  "pairingToken": "token",
  "pinCode": "123456",
  "expiresIn": 300
}
```

### POST /api/v1/pair/complete

Complete a pairing with PIN code.

**Request:**
```json
{
  "token": "pairingToken",
  "pin": "123456",
  "deviceName": "My iPhone",
  "deviceType": "mobile",
  "platform": "ios"
}
```

**Response:**
```json
{
  "id": "device-456",
  "name": "My iPhone",
  "refreshToken": "refresh_token"
}
```

### GET /api/v1/remote/status

Get remote access status.

**Response:**
```json
{
  "enabled": true,
  "lanEnabled": true,
  "lanBaseUrl": "http://192.168.1.100:8080",
  "bindAddress": "0.0.0.0",
  "relayEndpoint": "wss://relay.example.com"
}
```

### POST /api/v1/remote/lan/enable

Enable LAN listener.

**Request:**
```json
{
  "bindAddress": "0.0.0.0",
  "port": 8080
}
```

**Response:** 200 OK

### POST /api/v1/remote/lan/disable

Disable LAN listener.

**Response:** 200 OK

## Settings

### GET /api/v1/settings

Get all settings.

**Response:**
```json
{
  "settings": {
    "theme": "dark",
    "fontSize": 14,
    "enableAutosave": true
  }
}
```

### POST /api/v1/settings

Update settings.

**Request:**
```json
{
  "values": {
    "theme": "light",
    "fontSize": 16
  }
}
```

**Response:** 200 OK

## Rate Limiting

All endpoints are rate-limited. Responses include:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1678886400
```

When limit is exceeded, returns 429 Too Many Requests.

## Error Responses

All errors return appropriate HTTP status codes with JSON body:

```json
{
  "error": "not_found",
  "message": "Session not found",
  "details": {
    "sessionId": "sess-999"
  }
}
```

Common status codes:
- 400 Bad Request — Invalid input
- 401 Unauthorized — Missing or invalid token
- 403 Forbidden — Insufficient permissions
- 404 Not Found — Resource not found
- 409 Conflict — State conflict (e.g., session already running)
- 429 Too Many Requests — Rate limit exceeded
- 500 Internal Server Error — Server error

## Server-Sent Events (SSE)

Session streaming endpoints use SSE for real-time updates.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/sessions/sess-123/stream
```

Event types:

| Event | Payload |
|-------|---------|
| `message.delta` | Text chunk of response |
| `message.complete` | Message finalized |
| `tool.start` | Tool invocation started |
| `tool.result` | Tool result returned |
| `tool.error` | Tool failed |
| `usage` | Token usage update |
| `error` | Session error |
| `permission.request` | AI asking for permission |
| `autopilot.story.start` | Autopilot story begins |
| `autopilot.story.complete` | Autopilot story finishes |
