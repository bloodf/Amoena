# Hook System

Extensions register event handlers via the hook system. All hooks are registered through the `POST /api/v1/hooks` endpoint.

## Handler Types

Each hook handler specifies a type and configuration:

### command

Execute an external shell command.

```json
{
  "type": "command",
  "config": {
    "command": "bash -c 'echo $AMOENA_EVENT'",
    "env": {
      "AMOENA_EVENT": "{event}"
    }
  }
}
```

Environment variables are templated with hook payload fields.

### http

POST to an HTTP endpoint.

```json
{
  "type": "http",
  "config": {
    "url": "https://webhook.example.com/hook",
    "headers": {
      "Authorization": "Bearer token"
    },
    "body_template": "{event_payload_json}"
  }
}
```

Body is JSON-encoded hook payload by default.

### prompt

Inject context into the next user message or AI reasoning.

```json
{
  "type": "prompt",
  "config": {
    "template": "System context: {event_name} fired with payload {event_payload}"
  }
}
```

Used for lightweight context injection into the AI message.

### agent

Spawn a sub-agent to handle the event.

```json
{
  "type": "agent",
  "config": {
    "persona_id": "my-agent",
    "task_prompt": "An event occurred: {event_name}. Analyze and respond."
  }
}
```

The spawned agent runs independently and reports results.

## Hook Events (24 total)

| Event | Fired | Payload |
|-------|-------|---------|
| `SessionStart` | User creates a session | `{ session_id, working_dir }` |
| `SessionEnd` | Session closes | `{ session_id, status }` |
| `UserPromptSubmit` | User submits a message | `{ session_id, content }` |
| `PreToolUse` | Before a tool runs | `{ session_id, tool_id, input }` |
| `PostToolUse` | After tool succeeds | `{ session_id, tool_id, output }` |
| `PostToolUseFailure` | After tool fails | `{ session_id, tool_id, error }` |
| `PermissionRequest` | AI requests a permission | `{ request_id, resource, action }` |
| `SubagentStart` | AI spawns a child agent | `{ parent_id, child_id, task }` |
| `SubagentStop` | Child agent completes | `{ agent_id, status }` |
| `Stop` | Agent run is stopping | `{ session_id, reason }` |
| `Notification` | Notification event dispatched | `{ session_id, message, level }` |
| `TeammateIdle` | Team member agent becomes idle | `{ agent_id, team_id }` |
| `TaskCompleted` | Task is marked done | `{ task_id, status }` |
| `InstructionsLoaded` | CLAUDE.md or AGENTS.md loaded/reloaded | `{ session_id, path }` |
| `ConfigChange` | Configuration value changes at runtime | `{ key, old_value, new_value }` |
| `WorktreeCreate` | Workspace cloned | `{ workspace_id, strategy }` |
| `WorktreeRemove` | Workspace deleted | `{ workspace_id }` |
| `PreCompact` | Context compaction about to run | `{ session_id, token_count }` |
| `MemoryObserve` | Memory observation recorded | `{ observation_id, category }` |
| `MemoryInject` | Retrieved memory about to be injected | `{ session_id, observation_ids }` |
| `AutopilotStoryStart` | Autopilot story begins | `{ session_id, story_id }` |
| `AutopilotStoryComplete` | Autopilot story finishes | `{ session_id, story_id, status }` |
| `ProviderSwitch` | Active provider changes | `{ old_provider, new_provider }` |
| `ErrorUnhandled` | Unhandled error occurred | `{ error_type, message, session_id }` |

## API Endpoints

### List Hooks

```bash
curl -H "Authorization: Bearer $SESSION_TOKEN" \
  http://localhost:8080/api/v1/hooks
```

Response:
```json
[
  {
    "id": "hook-123",
    "event_name": "SessionStart",
    "handler_type": "http",
    "handler_config": { ... },
    "priority": 100,
    "timeout_ms": 5000,
    "created_at": "2026-03-14T10:00:00Z"
  }
]
```

### Register a Hook

```bash
curl -X POST -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "SessionStart",
    "handler_type": "http",
    "handler_config": {
      "url": "https://webhook.example.com/session-start"
    },
    "priority": 100,
    "timeout_ms": 5000
  }' \
  http://localhost:8080/api/v1/hooks
```

Returns the created hook object with `id`.

### Delete a Hook

```bash
curl -X DELETE -H "Authorization: Bearer $SESSION_TOKEN" \
  http://localhost:8080/api/v1/hooks/hook-123
```

### Fire a Hook (Manual Test)

```bash
curl -X POST -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "SessionStart",
    "payload": {
      "session_id": "sess-123",
      "working_dir": "/home/user/projects"
    }
  }' \
  http://localhost:8080/api/v1/hooks/fire
```

## Hook Registration in Extensions

Extensions register hooks declaratively in their manifest:

```json
{
  "contributes": {
    "hooks": [
      {
        "event": "SessionStart",
        "handler": {
          "type": "http",
          "config": {
            "url": "https://my-service.com/hooks/session-start"
          }
        },
        "priority": 100,
        "timeout_ms": 5000
      }
    ]
  }
}
```

## Best Practices

- **Keep hooks fast** — 5-second timeout is enforced by the runtime
- **Be deterministic** — Hooks are invoked synchronously during critical operations
- **Minimize side effects** — Failed hooks cause the operation to abort or retry
- **Use command only for necessity** — External process spawning adds latency
- **Use prompt for context** — Lightweight context injection is preferred
- **Use agent sparingly** — Only when sub-agent analysis is truly needed
- **Log failures** — Document why your hook might fail so users can debug
