# Plugin Lifecycle

This page describes the full lifecycle of a Lunaria plugin, from installation through uninstallation, including health monitoring and error handling.

## Lifecycle Stages

```
Install → Discover → Enable → Execute (per event) → Disable → Uninstall
                                    ↑                    |
                                    └────────────────────┘
                                      (re-enable)
```

### 1. Install

Installation occurs when:
- The user copies a plugin directory to `~/.lunaria/plugins/`
- A deeplink (`lunaria://plugin/install?...`) is confirmed
- The API endpoint `POST /api/v1/plugins/install` is called

During install, `PluginRegistryService.discover()` reads the plugin directory, parses `manifest.json`, and creates a `PluginRecord` in the database with:

```
health_status: Healthy
enabled: true
error_count: 0
```

The plugin directory path is stored as `source_path`. The `id` from the manifest is the primary key.

### 2. Discover

On every Lunaria startup, the plugin registry scans `~/.lunaria/plugins/` for subdirectories containing `manifest.json`. This re-discovers any plugins installed while Lunaria was not running.

Plugins already in the database are updated (upserted); their `enabled` state and health data are preserved.

Plugins in the database whose directory no longer exists are left in the database as-is but will fail at execution time. Use uninstall to remove them cleanly.

### 3. Enable / Disable

Plugins are enabled by default on install. They can be toggled via:
- Settings → Plugins (toggle switch)
- API: `PATCH /api/v1/plugins/<id>` with `{ "enabled": true/false }`

When a plugin is **disabled**:
- Its `health_status` is set to `Disabled`
- No invocations are made, even for matching activation events
- It still appears in the plugin list

When a plugin is **re-enabled**:
- Its `health_status` is reset to `Healthy`
- Invocations resume on the next matching event

### 4. Activation

Before executing a plugin for a given hook event, Lunaria checks two conditions:

1. **Plugin is enabled** — disabled plugins are never invoked
2. **Activation event matches** — the hook name must appear in `activationEvents`

```json
{
  "activationEvents": ["onSession", "PreToolUse"]
}
```

If `"PreToolUse"` is not in `activationEvents`, the plugin is not called for that event even if it is enabled.

Additionally, if `required_permission` is specified by the caller, the plugin's `permissions` list is checked. A missing permission causes an error:

```
plugin com.example.my-plugin lacks required permission sessions.write
```

### 5. Execute

For each invocation, Lunaria:

1. Reads the plugin manifest from disk (from `source_path/manifest.json`)
2. Resolves the entry point: `source_path/<manifest.main>`
3. Spawns a Bun process with stdin/stdout piped
4. Writes a JSON-RPC request to stdin:
   ```json
   {
     "jsonrpc": "2.0",
     "id": "plugin-exec-1",
     "method": "plugin.execute",
     "params": {
       "pluginId": "com.example.my-plugin",
       "hook": "onSession",
       "payload": { "session_id": "sess-abc", "working_dir": "/projects" }
     }
   }
   ```
5. Reads one line from stdout (the JSON-RPC response)
6. Waits for the process to exit

Each invocation is independent — no shared memory, no persistent connection. Plugin state must be externalized (files, database, network).

**What happens if the entry point is missing?**

```
plugin com.example.my-plugin entry point missing at /home/user/.lunaria/plugins/my-plugin/main.js
```

The error is returned as an `anyhow` result, which the caller logs. Health status is degraded.

**What happens if the plugin produces no stdout?**

```
plugin com.example.my-plugin produced no response
```

Treated as an execution failure.

**What happens if the response ID mismatches?**

```
plugin com.example.my-plugin returned mismatched response id
```

The response is rejected. Always echo back the `id` from the request.

### 6. Health Monitoring

The `PluginRecord` in the database tracks health state:

| Field | Type | Description |
|---|---|---|
| `health_status` | enum | `Healthy`, `Disabled`, `Degraded`, `Failed` |
| `error_count` | int | Cumulative error count since last reset |
| `last_error` | string? | Message from the most recent error |
| `last_event_at` | datetime? | Timestamp of the last invocation |
| `latency_ms_avg` | float? | Rolling average execution latency |

These fields are updated after each execution. Lunaria's UI reflects the current health status in Settings → Plugins.

### 7. Uninstall

Uninstall removes the plugin directory from disk and deletes the database record:

```bash
# Via API
curl -X DELETE http://localhost:8080/api/v1/plugins/com.example.my-plugin

# Or: remove the directory and rescan
rm -rf ~/.lunaria/plugins/my-plugin
```

If the directory removal fails (e.g. permission error), the error is returned and the database record is not deleted — so the plugin remains registered but will fail at execution.

## Error Handling

### In the Plugin Process

Errors thrown inside your entry point that are not caught will cause the process to exit with a non-zero code and write to stderr. Lunaria reads the response line from stdout before waiting for exit, so:

- If your process exits before writing a response: `plugin produced no response`
- If your process writes an error response: Lunaria propagates the error code and message

Always catch errors and write a proper error response:

```js
async function handleRequest(request) {
  const { id, params } = request;
  try {
    const result = await doWork(params);
    return { jsonrpc: '2.0', id, result };
  } catch (err) {
    console.error('[my-plugin] Error:', err.message);
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32000, message: err.message },
    };
  }
}
```

### From the Host's Perspective

Plugin execution errors are propagated as `anyhow::Error` to the Tauri command handler, which converts them to an error response in the frontend. The plugin's `error_count` is incremented.

The calling code (e.g. a hook handler) decides whether to fail silently or surface the error to the user.

## Execution Timeout

Plugins do not have a built-in timeout at the `PluginRegistryService` level. Timeout enforcement (if needed) is the responsibility of the caller or can be added by wrapping the spawn with `tokio::time::timeout`. Keep plugin responses fast — aim for under 5 seconds.

## Concurrent Invocations

If two events fire simultaneously (e.g. rapid tool calls), two separate Bun processes are spawned in parallel. Plugins must be safe for concurrent invocations. Use file locking or atomic operations if writing to shared state.

## Plugin Records

Plugin records are persisted in Lunaria's SQLite database. You can inspect them (for debugging) via the API:

```bash
curl http://localhost:8080/api/v1/plugins
```

```json
[
  {
    "id": "com.example.my-plugin",
    "name": "My Plugin",
    "ecosystem": "lunaria",
    "version": "1.0.0",
    "enabled": true,
    "healthStatus": "Healthy",
    "errorCount": 0,
    "lastError": null,
    "lastEventAt": "2026-03-14T10:30:00Z",
    "latencyMsAvg": 42.5,
    "capabilities": ["sessions.read"],
    "divisionAffinity": ["*"]
  }
]
```
