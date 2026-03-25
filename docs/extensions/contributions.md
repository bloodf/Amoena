# Extension Contributions

The `contributes` field in the manifest declares what an extension adds to Amoena. Each contribution type is described below with its full schema and examples.

## commands

Commands are named actions that appear in the command palette and can be invoked from menus or keybindings.

### Schema

```json
{
  "contributes": {
    "commands": [
      {
        "id": "com.example.my-extension.run",
        "title": "My Extension: Run Action"
      }
    ]
  }
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Globally unique command identifier. Use reverse-DNS prefix. |
| `title` | string | yes | Display name in the command palette. Convention: `"Category: Action"` |

### Notes

- Command IDs must match between `contributes.commands` and `activationEvents` if you use `onCommand:` activation
- Commands without a corresponding `menus` entry are only accessible from the command palette
- Backend execution of commands requires a `backend` entry point in the manifest

### Example

```json
{
  "commands": [
    { "id": "com.example.ext.open",   "title": "My Ext: Open Panel" },
    { "id": "com.example.ext.refresh","title": "My Ext: Refresh Data" },
    { "id": "com.example.ext.export", "title": "My Ext: Export to CSV" }
  ]
}
```

---

## menus

Menus place commands or panel openers into specific locations in the Amoena UI. The `menus` field is a map from **location key** to an array of menu items.

### Schema

```json
{
  "contributes": {
    "menus": {
      "<location>": [
        {
          "command": "com.example.ext.run",
          "title": "Run Action",
          "icon": "run.png"
        },
        {
          "panel": "com.example.ext.panel",
          "title": "Open Panel",
          "icon": "panel.png"
        }
      ]
    }
  }
}
```

### Location Keys

| Key | Where items appear |
|---|---|
| `"sidebar"` | Sidebar navigation rail |
| `"context.session"` | Right-click context menu on a session |
| `"context.message"` | Right-click context menu on a message |
| `"toolbar"` | Main toolbar area |
| `"toolbar.session"` | Per-session toolbar |

### Menu Item Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `command` | string | no* | Command ID to invoke. Mutually exclusive with `panel`. |
| `panel` | string | no* | Panel ID to open. Mutually exclusive with `command`. |
| `title` | string | yes | Display label for the menu item |
| `icon` | string | no | Asset name for an icon to show alongside the label |

*Either `command` or `panel` must be provided (not both).

### Example

```json
{
  "menus": {
    "sidebar": [
      {
        "panel": "com.example.ext.dashboard",
        "title": "Dashboard",
        "icon": "dashboard.png"
      }
    ],
    "context.session": [
      {
        "command": "com.example.ext.analyze",
        "title": "Analyze Session"
      }
    ]
  }
}
```

---

## panels

Panels are HTML/CSS/JS applications rendered in a sandboxed webview inside the Amoena workspace. They are the primary way to add rich UI to the application.

### Schema

```json
{
  "contributes": {
    "panels": [
      {
        "id": "com.example.ext.panel",
        "title": "My Panel",
        "entry": "panel.html"
      }
    ]
  }
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique panel identifier within the extension namespace |
| `entry` | string | yes | Asset name of the HTML entry point embedded in the bundle |
| `title` | string | no | Display name shown in the panel header. Falls back to `id` if omitted. |

### Panel Runtime

Panels run as full HTML documents. You can use standard web APIs, inline `<script>` tags, and `<style>` blocks. CSS custom properties for Amoena's theme colors are injected into the document root:

```css
/* Available CSS variables */
--color-background
--color-foreground
--color-muted
--color-accent
--color-border
--font-family-ui
--font-size-base
```

Panels communicate with the host application via `postMessage`:

```js
// Receive events from the host
window.addEventListener('message', (event) => {
  const { type, ...data } = event.data;
  if (type === 'session-update') {
    renderSession(data.session);
  }
});

// Send messages to the host (currently informational)
window.parent.postMessage({ type: 'panel-ready' }, '*');
```

### Example

```json
{
  "panels": [
    {
      "id": "com.example.git-blame.view",
      "title": "Git Blame",
      "entry": "blame-panel.html"
    }
  ]
}
```

---

## settings

Settings declare user-configurable preferences that appear in the Amoena settings UI under an extension-specific section.

### Schema

```json
{
  "contributes": {
    "settings": [
      {
        "id": "com.example.ext.apiKey",
        "type": "string",
        "title": "API Key",
        "default": ""
      }
    ]
  }
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique setting identifier. Namespaced by extension `id` by convention. |
| `type` | string | yes | Value type. One of: `"string"`, `"boolean"`, `"number"` |
| `title` | string | yes | Human-readable label shown in the settings UI |
| `default` | any | no | Default value for the setting. Must match `type`. |

### Type Values

| Type | Default example | UI control |
|---|---|---|
| `"string"` | `""` | Text input |
| `"boolean"` | `true` | Toggle |
| `"number"` | `0` | Number input |

### Example

```json
{
  "settings": [
    {
      "id": "com.example.ext.enabled",
      "type": "boolean",
      "title": "Enable automatic analysis",
      "default": true
    },
    {
      "id": "com.example.ext.maxResults",
      "type": "number",
      "title": "Maximum results to display",
      "default": 50
    },
    {
      "id": "com.example.ext.endpoint",
      "type": "string",
      "title": "API endpoint URL",
      "default": "https://api.example.com"
    }
  ]
}
```

---

## hooks

Hooks register handlers for Amoena lifecycle events. When an event fires, all registered handlers execute.

### Schema

```json
{
  "contributes": {
    "hooks": [
      {
        "event": "SessionStart",
        "handler": "onSessionStart"
      }
    ]
  }
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `event` | string | yes | Event name. Must be one of the 24 supported hook events. |
| `handler` | string | yes | Handler identifier. Used to route the event to your backend entry point. |

### Supported Events

All 24 hook events: `SessionStart`, `SessionEnd`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `SubagentStart`, `SubagentStop`, `Stop`, `Notification`, `TeammateIdle`, `TaskCompleted`, `InstructionsLoaded`, `ConfigChange`, `WorktreeCreate`, `WorktreeRemove`, `PreCompact`, `MemoryObserve`, `MemoryInject`, `AutopilotStoryStart`, `AutopilotStoryComplete`, `ProviderSwitch`, `ErrorUnhandled`.

See [Activation Events](./activation.md) and the [Plugin Hooks Reference](../plugins/hooks.md) for complete payload schemas.

### Example

```json
{
  "hooks": [
    { "event": "SessionStart",  "handler": "onSessionStart" },
    { "event": "PreToolUse",    "handler": "onPreToolUse" },
    { "event": "PostToolUse",   "handler": "onPostToolUse" }
  ]
}
```

---

## tools

Tools add new capabilities that the AI can call during a session. Each tool has a name, description (used by the AI to decide when to call it), a JSON Schema describing its input, and a handler.

### Schema

```json
{
  "contributes": {
    "tools": [
      {
        "name": "fetch_weather",
        "description": "Fetch current weather for a city",
        "handler": "handleFetchWeather",
        "inputSchema": {
          "type": "object",
          "properties": {
            "city": {
              "type": "string",
              "description": "City name"
            }
          },
          "required": ["city"]
        }
      }
    ]
  }
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Tool name used by the AI when calling it. Snake_case recommended. |
| `description` | string | yes | Natural-language description. The AI uses this to decide when to call the tool. Be specific. |
| `handler` | string | yes | Handler identifier routed to your backend entry point |
| `inputSchema` | JSON Schema object | no | JSON Schema describing the tool's input parameters. Passed to the AI as-is. |

### Handler Execution

When the AI calls your tool, Amoena sends a JSON-RPC request to your backend:

```json
{
  "jsonrpc": "2.0",
  "id": "tool-exec-1",
  "method": "plugin.execute",
  "params": {
    "hook": "handleFetchWeather",
    "payload": {
      "city": "San Francisco"
    }
  }
}
```

Your backend responds:

```json
{
  "jsonrpc": "2.0",
  "id": "tool-exec-1",
  "result": {
    "temperature": "18°C",
    "condition": "Partly cloudy"
  }
}
```

### Example

```json
{
  "tools": [
    {
      "name": "search_docs",
      "description": "Search the project documentation for a given query",
      "handler": "handleSearchDocs",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": { "type": "string", "description": "Search query" },
          "limit": { "type": "number", "description": "Max results", "default": 10 }
        },
        "required": ["query"]
      }
    }
  ]
}
```

---

## providers

Providers add new LLM providers that appear in the model picker. Each provider declares its name, the handler used to route requests, and is identified by a unique ID.

### Schema

```json
{
  "contributes": {
    "providers": [
      {
        "id": "com.example.my-provider",
        "name": "My Provider",
        "handler": "handleProviderRequest"
      }
    ]
  }
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Unique provider identifier |
| `name` | string | yes | Display name shown in the provider/model picker |
| `handler` | string | yes | Handler identifier routed to your backend when the provider is selected |

### Notes

- The provider backend is responsible for proxying requests to the underlying LLM API
- API keys and configuration should be handled via extension `settings` contributions
- Use the `providers.register` permission when contributing providers

### Example

```json
{
  "providers": [
    {
      "id": "com.example.ollama",
      "name": "Ollama (Local)",
      "handler": "handleOllamaRequest"
    }
  ]
}
```

---

## Contribution Aggregation

All enabled extensions' contributions are merged into a single `AggregatedContributions` object at runtime. Contributions from disabled extensions are excluded. The aggregated set is refreshed when an extension is enabled, disabled, installed, or uninstalled.

Each contribution carries the source `extensionId` so the host can route calls, resolve assets, and attribute errors correctly.
