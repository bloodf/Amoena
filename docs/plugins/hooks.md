# Plugin Hooks Reference

Amoena fires 24 hook events across the application lifecycle. Plugins and extensions register handlers for these events. This page documents every event: when it fires, its JSON payload schema, and example handlers.

## Handler Types

Each hook handler has a `type` that determines how it is invoked:

| Type | Description |
|---|---|
| `command` | Executes a shell command via `zsh -lc`. Payload is available via environment or stdin. |
| `http` | POSTs the payload as JSON to a URL. |
| `prompt` | Injects static text into the AI context. No network call. |
| `agent` | Routes the event to a named agent type. |

For extension-declared hooks (in `contributes.hooks`), the `handler` field is a string identifier routed to the backend via JSON-RPC.

---

## Hook Registration

### Via API (plugins)

```bash
curl -X POST http://localhost:8080/api/v1/hooks \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "SessionStart",
    "handler_type": "command",
    "handler_config": { "command": "echo session started" },
    "priority": 100,
    "timeout_ms": 5000,
    "enabled": true
  }'
```

### Via manifest (extensions)

```json
{
  "contributes": {
    "hooks": [
      { "event": "SessionStart", "handler": "onSessionStart" }
    ]
  }
}
```

### Importing from Claude Code

```bash
curl -X POST http://localhost:8080/api/v1/hooks/import/claude \
  -F "file=@~/.claude/hooks.json"
```

### Importing from OpenCode

```bash
curl -X POST http://localhost:8080/api/v1/hooks/import/opencode \
  -F "file=@~/opencode.json"
```

---

## Timeout and Priority

| Field | Default | Description |
|---|---|---|
| `timeout_ms` | 30000 | Maximum milliseconds before the hook is cancelled |
| `priority` | 100 | Execution order (lower = earlier) when multiple hooks match the same event |
| `matcher_regex` | null | Optional regex applied to the payload JSON string to filter invocations |

---

## All 24 Hook Events

---

### `SessionStart`

**Fires when:** A new session is created.

**Payload:**
```json
{
  "session_id": "sess-a1b2c3d4",
  "working_dir": "/home/user/projects/myapp"
}
```

**Example — command handler:**
```json
{
  "event_name": "SessionStart",
  "handler_type": "command",
  "handler_config": {
    "command": "echo \"Session $AMOENA_SESSION_ID started\" >> ~/amoena.log"
  }
}
```

**Example — http handler:**
```json
{
  "event_name": "SessionStart",
  "handler_type": "http",
  "handler_config": {
    "url": "https://webhook.example.com/session-start"
  }
}
```

---

### `SessionEnd`

**Fires when:** A session is closed or terminated.

**Payload:**
```json
{
  "session_id": "sess-a1b2c3d4",
  "status": "completed"
}
```

`status` values: `"completed"`, `"aborted"`, `"error"`

**Example — command handler:**
```json
{
  "event_name": "SessionEnd",
  "handler_type": "command",
  "handler_config": {
    "command": "notify-send 'Amoena' 'Session ended'"
  }
}
```

---

### `UserPromptSubmit`

**Fires when:** The user submits a message in the composer.

**Payload:**
```json
{
  "session_id": "sess-a1b2c3d4",
  "content": "Please refactor the auth module"
}
```

**Example — prompt handler (context injection):**
```json
{
  "event_name": "UserPromptSubmit",
  "handler_type": "prompt",
  "handler_config": {
    "text": "System note: User is working in a monorepo. Prefer small, focused changes."
  }
}
```

---

### `PreToolUse`

**Fires when:** The AI is about to call a tool, before execution begins.

**Payload:**
```json
{
  "session_id": "sess-a1b2c3d4",
  "tool_id": "bash",
  "input": {
    "command": "git status"
  }
}
```

This is the last chance to intercept a tool call before it runs. A hook that times out or errors here may cause the tool call to be skipped (behavior depends on the host's error handling policy).

**Example — command handler (audit log):**
```json
{
  "event_name": "PreToolUse",
  "handler_type": "command",
  "handler_config": {
    "command": "logger -t amoena 'tool_use: $AMOENA_TOOL_ID'"
  }
}
```

---

### `PostToolUse`

**Fires when:** A tool call completed successfully.

**Payload:**
```json
{
  "session_id": "sess-a1b2c3d4",
  "tool_id": "bash",
  "output": "On branch main\nnothing to commit"
}
```

**Example — http handler:**
```json
{
  "event_name": "PostToolUse",
  "handler_type": "http",
  "handler_config": {
    "url": "https://metrics.example.com/tool-use"
  }
}
```

---

### `PostToolUseFailure`

**Fires when:** A tool call failed (non-zero exit, exception, or timeout).

**Payload:**
```json
{
  "session_id": "sess-a1b2c3d4",
  "tool_id": "bash",
  "error": "command exited with code 1: git: command not found"
}
```

**Example — agent handler (auto-remediation):**
```json
{
  "event_name": "PostToolUseFailure",
  "handler_type": "agent",
  "handler_config": {
    "agentType": "oh-my-claudecode:build-fixer"
  }
}
```

---

### `PermissionRequest`

**Fires when:** The AI requests a permission that requires user approval.

**Payload:**
```json
{
  "request_id": "perm-xyz789",
  "resource": "shell.execute",
  "action": "run"
}
```

`resource` matches the permission strings from the manifest (`fs.read`, `network`, `shell.execute`, etc.).

**Example — http handler (approval workflow):**
```json
{
  "event_name": "PermissionRequest",
  "handler_type": "http",
  "handler_config": {
    "url": "https://approval.example.com/amoena-permission"
  }
}
```

---

### `SubagentStart`

**Fires when:** The AI spawns a child sub-agent (e.g. in team mode or autopilot).

**Payload:**
```json
{
  "parent_id": "sess-a1b2c3d4",
  "child_id": "agent-sub-001",
  "task": "Analyze the authentication module for security issues"
}
```

**Example — command handler:**
```json
{
  "event_name": "SubagentStart",
  "handler_type": "command",
  "handler_config": {
    "command": "echo 'Subagent started: $AMOENA_CHILD_ID' >> ~/agents.log"
  }
}
```

---

### `SubagentStop`

**Fires when:** A child sub-agent finishes its task.

**Payload:**
```json
{
  "agent_id": "agent-sub-001",
  "status": "completed"
}
```

`status` values: `"completed"`, `"failed"`, `"cancelled"`

---

### `Stop`

**Fires when:** The AI run is stopping (the agent is done or was interrupted).

**Payload:**
```json
{
  "session_id": "sess-a1b2c3d4",
  "reason": "task_completed"
}
```

`reason` values: `"task_completed"`, `"user_interrupted"`, `"error"`, `"timeout"`

**Example — prompt handler (summary request):**
```json
{
  "event_name": "Stop",
  "handler_type": "prompt",
  "handler_config": {
    "text": "Before stopping, write a brief summary of what was accomplished to SUMMARY.md."
  }
}
```

---

### `Notification`

**Fires when:** A notification event is dispatched within the application.

**Payload:**
```json
{
  "session_id": "sess-a1b2c3d4",
  "message": "Build succeeded",
  "level": "info"
}
```

`level` values: `"info"`, `"warning"`, `"error"`, `"success"`

**Example — command handler (desktop notification):**
```json
{
  "event_name": "Notification",
  "handler_type": "command",
  "handler_config": {
    "command": "osascript -e 'display notification \"$AMOENA_MESSAGE\" with title \"Amoena\"'"
  }
}
```

---

### `TeammateIdle`

**Fires when:** A team member agent becomes idle (has finished its current task and is waiting).

**Payload:**
```json
{
  "agent_id": "agent-team-02",
  "team_id": "team-alpha"
}
```

Use this event to reassign work or log team utilization metrics.

---

### `TaskCompleted`

**Fires when:** A task tracked in Amoena's task system is marked done.

**Payload:**
```json
{
  "task_id": "task-abc123",
  "status": "done"
}
```

`status` values: `"done"`, `"cancelled"`, `"failed"`

**Example — http handler (project management integration):**
```json
{
  "event_name": "TaskCompleted",
  "handler_type": "http",
  "handler_config": {
    "url": "https://linear.example.com/webhook/task-done"
  }
}
```

---

### `InstructionsLoaded`

**Fires when:** A `CLAUDE.md` or `AGENTS.md` instructions file is loaded or reloaded.

**Payload:**
```json
{
  "session_id": "sess-a1b2c3d4",
  "path": "/home/user/projects/myapp/CLAUDE.md"
}
```

Use this to validate or augment instructions at load time.

---

### `ConfigChange`

**Fires when:** A Amoena configuration value changes at runtime.

**Payload:**
```json
{
  "key": "ai.model",
  "old_value": "claude-sonnet-4-6",
  "new_value": "claude-opus-4-5"
}
```

**Example — command handler (audit trail):**
```json
{
  "event_name": "ConfigChange",
  "handler_type": "command",
  "handler_config": {
    "command": "echo \"Config changed: $AMOENA_KEY\" >> ~/config-audit.log"
  }
}
```

---

### `WorktreeCreate`

**Fires when:** A new workspace (worktree) is created, e.g. when cloning a repository or branching.

**Payload:**
```json
{
  "workspace_id": "ws-abc456",
  "strategy": "clone"
}
```

`strategy` values: `"clone"`, `"branch"`, `"import"`

---

### `WorktreeRemove`

**Fires when:** A workspace is deleted.

**Payload:**
```json
{
  "workspace_id": "ws-abc456"
}
```

**Example — command handler (cleanup):**
```json
{
  "event_name": "WorktreeRemove",
  "handler_type": "command",
  "handler_config": {
    "command": "rm -rf ~/workspace-backups/$AMOENA_WORKSPACE_ID"
  }
}
```

---

### `PreCompact`

**Fires when:** Context compaction is about to run (the conversation is approaching token limits and will be summarized).

**Payload:**
```json
{
  "session_id": "sess-a1b2c3d4",
  "token_count": 180000
}
```

**Example — prompt handler (save state before compaction):**
```json
{
  "event_name": "PreCompact",
  "handler_type": "prompt",
  "handler_config": {
    "text": "Before compacting context, output a brief bulleted summary of current progress and next steps."
  }
}
```

---

### `MemoryObserve`

**Fires when:** A memory observation is recorded to the memory store.

**Payload:**
```json
{
  "observation_id": "obs-def789",
  "category": "code-pattern"
}
```

`category` values depend on the memory system configuration (e.g. `"code-pattern"`, `"user-preference"`, `"project-context"`).

---

### `MemoryInject`

**Fires when:** Retrieved memories are about to be injected into the AI context.

**Payload:**
```json
{
  "session_id": "sess-a1b2c3d4",
  "observation_ids": ["obs-def789", "obs-abc123"]
}
```

---

### `AutopilotStoryStart`

**Fires when:** An autopilot story (a queued task unit) begins execution.

**Payload:**
```json
{
  "session_id": "sess-a1b2c3d4",
  "story_id": "story-001"
}
```

---

### `AutopilotStoryComplete`

**Fires when:** An autopilot story finishes.

**Payload:**
```json
{
  "session_id": "sess-a1b2c3d4",
  "story_id": "story-001",
  "status": "completed"
}
```

`status` values: `"completed"`, `"failed"`, `"skipped"`

**Example — http handler (CI notification):**
```json
{
  "event_name": "AutopilotStoryComplete",
  "handler_type": "http",
  "handler_config": {
    "url": "https://ci.example.com/webhook/story-done"
  }
}
```

---

### `ProviderSwitch`

**Fires when:** The active LLM provider changes (user switches models or providers).

**Payload:**
```json
{
  "old_provider": "anthropic",
  "new_provider": "com.example.ollama-provider.ollama"
}
```

**Example — command handler (log provider changes):**
```json
{
  "event_name": "ProviderSwitch",
  "handler_type": "command",
  "handler_config": {
    "command": "echo \"Provider: $AMOENA_OLD_PROVIDER -> $AMOENA_NEW_PROVIDER\" >> ~/provider.log"
  }
}
```

---

### `ErrorUnhandled`

**Fires when:** An unhandled error occurs in the Amoena runtime.

**Payload:**
```json
{
  "error_type": "ToolExecutionError",
  "message": "timeout waiting for bash to complete",
  "session_id": "sess-a1b2c3d4"
}
```

**Example — http handler (error alerting):**
```json
{
  "event_name": "ErrorUnhandled",
  "handler_type": "http",
  "handler_config": {
    "url": "https://alerts.example.com/amoena-error"
  }
}
```

---

## Hook Invocation Result

After firing, each hook returns an invocation result:

```json
{
  "hook_id": "hook-abc123",
  "event_name": "SessionStart",
  "status": "ok",
  "output": "session logged",
  "error": null
}
```

| Field | Type | Description |
|---|---|---|
| `hook_id` | string | The registered hook's ID |
| `event_name` | string | The event that fired |
| `status` | string | `"ok"` or `"failed"` |
| `output` | string? | stdout (command), HTTP status (http), text (prompt), agentType (agent) |
| `error` | string? | Error message if status is `"failed"` |

---

## Event Name Normalization

When importing hooks from Claude Code or OpenCode, event names are normalized:

| Import format | Normalized to |
|---|---|
| `pre_tool_use` | `PreToolUse` |
| `post_tool_use` | `PostToolUse` |
| `session_start` | `SessionStart` |
| `session_end` | `SessionEnd` |
| Other values | Passed through unchanged |

---

## Best Practices

- **Keep handlers fast** — The default timeout is 30 seconds; aim for under 2 seconds
- **Handle errors gracefully** — A crashed command handler returns `status: "failed"` but does not crash Amoena
- **Use `prompt` for context injection** — It is zero-latency; no process or network involved
- **Use `http` for webhooks** — Lower overhead than spawning a shell process
- **Use `command` sparingly** — Shell process spawn adds ~50–100ms; prefer `http` for latency-sensitive hooks
- **Use `agent` only when needed** — Spawning a sub-agent is expensive; reserve for complex remediation
