# Plugins

Plugins are backend automation bundles that extend Amoena's behavior through event hooks, custom commands, and backend processing. Unlike extensions, plugins live as directories on disk and are executed via Bun's JavaScript runtime using a JSON-RPC protocol.

## What Plugins Do

Plugins respond to Amoena's lifecycle events (sessions starting, tools being called, prompts submitted) and execute arbitrary logic: calling external APIs, transforming data, spawning processes, or sending notifications.

| Capability | Description |
|---|---|
| **Hook handlers** | React to any of 24 lifecycle events |
| **Command execution** | Execute logic when commands are triggered |
| **Backend processing** | Long-running or async backend jobs |
| **Permission-gated access** | Controlled access to sessions, files, and system resources |

## Plugins vs. Extensions

| | Plugins | Extensions |
|---|---|---|
| **Format** | Directory with `manifest.json` | Single `.luna` binary file |
| **UI** | No panels or menus | Panels, menus, commands |
| **Install** | Copy directory to plugins dir, or deeplink | Drag `.luna` file or deeplink |
| **Runtime** | Bun process per invocation | Bun process (optional) |
| **Primary use** | Backend automation, event handling | UI features, custom panels |
| **Persistence** | Stateless per-invocation | Can maintain state via backend |

Use plugins for automation and backend logic. Use extensions when you need UI contributions.

## JSON-RPC Execution Model

Every plugin invocation uses JSON-RPC 2.0 over stdin/stdout. When Amoena calls a plugin:

1. A Bun process is spawned with the plugin's entry point (`main` field from manifest)
2. A JSON-RPC request is written to stdin:
   ```json
   {
     "jsonrpc": "2.0",
     "id": "plugin-exec-1",
     "method": "plugin.execute",
     "params": {
       "pluginId": "com.example.my-plugin",
       "hook": "onSessionStart",
       "payload": { "session_id": "sess-abc", "working_dir": "/projects/myapp" }
     }
   }
   ```
3. The plugin reads the request, processes it, and writes a JSON-RPC response to stdout:
   ```json
   {
     "jsonrpc": "2.0",
     "id": "plugin-exec-1",
     "result": { "ok": true }
   }
   ```
4. The process exits

Each invocation is stateless by default — a fresh process per call. If you need state, write to disk or use an external store.

## Plugin Lifecycle

```
Install → Discover → Activate → Execute (per event) → Disable/Uninstall
```

1. **Install** — Plugin directory is copied to the plugins root; `manifest.json` is parsed and the plugin is registered in the database
2. **Discover** — On startup, Amoena scans the plugins directory and loads all valid plugins
3. **Activate** — Activation events in the manifest are matched; enabled plugins receive hook calls
4. **Execute** — For each matched event, a Bun process is spawned with the JSON-RPC payload
5. **Disable** — Plugin is marked disabled; health status set to `Disabled`; no more invocations
6. **Uninstall** — Plugin directory is removed; database record deleted

## Deeplink Installation

Plugins can be installed via the `amoena://` deeplink scheme. This enables one-click install from the web or a marketplace:

```
amoena://plugin/install?id=com.example.my-plugin&source=https://example.com/my-plugin.tar.gz&publisher=Example
```

Amoena parses the deeplink and shows a review dialog before installing. Plugins with a valid HTTPS `manifestUrl` and a `signature` parameter are marked **trusted**; others show warnings.

## Health Monitoring

Amoena tracks plugin health in its database:

| Status | Meaning |
|---|---|
| `Healthy` | Plugin is enabled and has not errored recently |
| `Disabled` | Plugin was manually disabled |
| `Degraded` | Plugin has recent errors but is still enabled |
| `Failed` | Plugin has exceeded error thresholds |

Health status is updated after each invocation. Use the Plugins panel in Settings to see current health.

## Division Affinity

Plugins can declare which "divisions" (workspace contexts) they are active in:

```json
"divisionAffinity": ["backend", "devops"]
```

Use `["*"]` (the default) to activate in all contexts.

## Next Steps

- [Creating a Plugin](./creating.md) — Manifest, entry point, and first hook
- [Plugin Lifecycle](./lifecycle.md) — Install, activate, execute, uninstall
- [Hooks Reference](./hooks.md) — All 24 events with payload schemas
- [Manifest Reference](./manifest.md) — Complete manifest schema
