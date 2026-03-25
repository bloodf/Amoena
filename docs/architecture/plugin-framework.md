# Plugin Framework Architecture

## Overview

This document defines the plugin framework for Amoena, including manifest schema, lifecycle, API surface, permissions, security posture, extension points, and marketplace workflow. The framework is capability-based: every plugin declares what it needs in the manifest, and the host app grants access explicitly.

## Installation Deep Links

Amoena supports **plugin and extension deep links** so users can install resources directly from a README, marketplace page, documentation site, or third-party website by clicking a link.

### Product Decision

Plugin deep-link install is a first-class extension workflow. A plugin README should be able to include a link that opens Amoena and pre-fills the install flow.

### Supported Deep-Link Families

- `amoena://plugin/install?...`
- `amoena://extension/install?...`
- `amoena://marketplace/install?...`

### Required Query Payload

At minimum, the deep link must carry enough information for Amoena to resolve a resource and present an install review:

- `id`
- `source`
- `version` or version selector when available
- `manifestUrl` or registry reference
- optional `signature`
- optional `publisher`
- optional `title`

### UX Requirements

When a deep link is opened:

1. Amoena resolves the resource metadata
2. validates the manifest and signature when available
3. shows an install review sheet
4. displays permissions, publisher, source, version, and install method
5. requires explicit user confirmation before installation

Deep links must **never** silently install a plugin.

### Security Rules

- untrusted sources display a prominent warning
- unsigned plugins are allowed only under an explicit unsafe install flow
- install review must show requested permissions before confirmation
- deep-link payloads are treated as untrusted input and validated server-side

### Compatibility Scope

Deep links may target:

- Amoena-native plugins
- marketplace listings
- MCP server bundles
- extension-style resources imported from compatible ecosystems

### Implementation Requirement

The prompt catalog must include a dedicated implementation prompt for deep-link install handling across runtime, marketplace, and plugin management surfaces.

## Plugin Manifest Schema

The plugin manifest is `manifest.json` at the plugin root. Example schema (Draft 2020-12):

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://amoena.app/schemas/plugin-manifest.schema.json",
  "title": "Amoena Plugin Manifest",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "id",
    "name",
    "version",
    "author",
    "description",
    "main",
    "permissions",
    "contributes",
    "activationEvents",
    "minAppVersion"
  ],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9]+(\\.[a-z0-9-]+)*$",
      "description": "Stable reverse-DNS-like plugin identifier."
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 128
    },
    "version": {
      "type": "string",
      "pattern": "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-[0-9A-Za-z.-]+)?(?:\\+[0-9A-Za-z.-]+)?$",
      "description": "SemVer version for update and compatibility checks."
    },
    "author": {
      "type": "string",
      "minLength": 1
    },
    "description": {
      "type": "string",
      "minLength": 1,
      "maxLength": 2048
    },
    "main": {
      "type": "string",
      "description": "Main entry point relative to plugin root, e.g. dist/index.js"
    },
    "permissions": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "type": "string",
        "enum": [
          "fs.read",
          "fs.write",
          "network",
          "shell.execute",
          "notifications",
          "sessions.read",
          "sessions.write",
          "settings.read",
          "settings.write"
        ]
      }
    },
    "contributes": {
      "type": "object",
      "additionalProperties": false,
      "required": ["commands", "views", "settings", "hooks", "menus"],
      "properties": {
        "commands": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "title"],
            "properties": {
              "id": { "type": "string" },
              "title": { "type": "string" },
              "when": { "type": "string" }
            },
            "additionalProperties": false
          }
        },
        "views": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "type", "target"],
            "properties": {
              "id": { "type": "string" },
              "type": { "type": "string", "enum": ["panel", "widget", "page", "decorator", "tui-adapter"] },
              "target": { "type": "string" }
            },
            "additionalProperties": false
          }
        },
        "settings": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["key", "type", "default"],
            "properties": {
              "key": { "type": "string" },
              "type": { "type": "string", "enum": ["string", "number", "boolean", "object", "array"] },
              "default": {}
            },
            "additionalProperties": false
          }
        },
        "hooks": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["event", "handler"],
            "properties": {
              "event": { "type": "string" },
              "handler": {
                "type": "object",
                "required": ["type"],
                "properties": {
                  "type": { "type": "string", "enum": ["command", "http", "prompt", "agent"] }
                },
                "additionalProperties": true
              }
            },
            "additionalProperties": false
          }
        },
        "menus": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["location", "command"],
            "properties": {
              "location": { "type": "string" },
              "command": { "type": "string" },
              "group": { "type": "string" }
            },
            "additionalProperties": false
          }
        },
        "tools": {
          "type": "array",
          "items": { "type": "object" }
        },
        "observationTypes": {
          "type": "array",
          "items": { "type": "object" }
        },
        "conceptCategories": {
          "type": "array",
          "items": { "type": "object" }
        },
        "agentTypes": {
          "type": "array",
          "items": { "type": "object" }
        },
        "providers": {
          "type": "array",
          "items": { "type": "object" }
        },
        "tuiAdapter": {
          "type": "array",
          "items": { "type": "object" }
        },
        "tuiAuthProvider": {
          "type": "array",
          "items": { "type": "object" }
        },
        "tuiMcpBridge": {
          "type": "array",
          "items": { "type": "object" }
        }
      }
    },
    "activationEvents": {
      "type": "array",
      "items": {
        "type": "string",
        "examples": ["onStartup", "onCommand:plugin.command", "onView:chat", "onWorkspaceOpen"]
      }
    },
    "minAppVersion": {
      "type": "string",
      "pattern": "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)$"
    }
  }
}
```

### TUI Manifest Extensions (Additive)

TUI integrations are plugin-first in Amoena. Built-in adapters and community adapters use the same manifest model and host runtime APIs. The existing manifest structure remains unchanged; TUI support is added by extending `contributes`.

Additive contribution types:

- `contributes.tuiAdapter`: full TUI runtime integration plugin.
- `contributes.tuiAuthProvider`: custom auth login/refresh flows for TUI runtimes.
- `contributes.tuiMcpBridge`: MCP bridge provider for runtime-specific MCP setup.

Example additive schema fragment:

```json
{
  "contributes": {
    "commands": [],
    "views": [],
    "settings": [],
    "hooks": [],
    "menus": [],
    "tuiAdapter": [
      {
        "id": "acme.nova",
        "displayName": "Nova CLI",
        "handler": "./dist/tui/nova-adapter.js",
        "mode": "structured-api",
        "capabilities": [
          "session.start",
          "session.resume",
          "stream.token",
          "permission.request",
          "mcp.configure",
          "usage.report"
        ],
        "priority": 50,
        "extends": "builtin.opencode"
      }
    ],
    "tuiAuthProvider": [
      {
        "id": "acme.nova.auth",
        "for": "acme.nova",
        "handler": "./dist/tui/nova-auth.js",
        "supports": ["oauth-device-code", "api-key"]
      }
    ],
    "tuiMcpBridge": [
      {
        "id": "acme.nova.mcp",
        "for": "acme.nova",
        "handler": "./dist/tui/nova-mcp.js",
        "supports": ["stdio", "sse", "http"]
      }
    ]
  }
}
```

Minimal TUI plugin manifest example:

```json
{
  "id": "com.acme.nova-tui",
  "name": "Nova TUI Adapter",
  "version": "1.0.0",
  "author": "Acme Labs",
  "description": "Adds Nova CLI as a first-class TUI integration.",
  "main": "dist/index.js",
  "permissions": ["network", "sessions.read", "sessions.write"],
  "contributes": {
    "commands": [],
    "views": [],
    "settings": [],
    "hooks": [],
    "menus": [],
    "tuiAdapter": [
      {
        "id": "acme.nova",
        "displayName": "Nova CLI",
        "handler": "./dist/tui/nova-adapter.js",
        "mode": "structured-api",
        "capabilities": ["session.start", "stream.token", "usage.report"]
      }
    ]
  },
  "activationEvents": ["onStartup", "onCommand:tui.install.acme.nova"],
  "minAppVersion": "0.8.0"
}
```

### Minimal Manifest Example

```json
{
  "id": "com.acme.session-insights",
  "name": "Session Insights",
  "version": "1.0.0",
  "author": "Acme Labs",
  "description": "Adds session analytics panel and status widget.",
  "main": "dist/index.js",
  "permissions": ["sessions.read", "notifications"],
  "contributes": {
    "commands": [{ "id": "insights.open", "title": "Open Session Insights" }],
    "views": [{ "id": "insights.sidebar", "type": "panel", "target": "sidebar" }],
    "settings": [{ "key": "insights.refreshMs", "type": "number", "default": 30000 }],
    "hooks": [],
    "menus": [{ "location": "chat.context", "command": "insights.open" }]
  },
  "activationEvents": ["onStartup", "onCommand:insights.open"],
  "minAppVersion": "0.8.0"
}
```

## Lifecycle Hooks

Lifecycle hooks are registered through the plugin main module and orchestrated by the host runtime. Amoena exposes a Claude-compatible core event set plus a small number of Amoena-specific extensions. Existing Claude Code hook configurations can be imported directly, while Amoena-native events extend that model for workspaces, memory, and autopilot.

### Hook Events

The following lifecycle events are available for plugin subscription:

| Event | Description | Phase |
| --- | --- | --- |
| `SessionStart` | A new agent session is initialized | Session |
| `SessionEnd` | An agent session is terminated or completed | Session |
| `UserPromptSubmit` | The user submits a prompt to the agent | Input |
| `PreToolUse` | A tool invocation is about to execute | Tool |
| `PostToolUse` | A tool invocation completed successfully | Tool |
| `PostToolUseFailure` | A tool invocation failed with an error | Tool |
| `PermissionRequest` | The agent requests user permission for a sensitive operation | Security |
| `SubagentStart` | A subagent is spawned by the parent agent | Agent |
| `SubagentStop` | A subagent terminates (success or failure) | Agent |
| `Stop` | The agent run is stopping (user cancel, completion, or error) | Session |
| `Notification` | A notification event is dispatched | System |
| `TeammateIdle` | A team member agent becomes idle and awaits work | Coordination |
| `TaskCompleted` | A delegated task finishes execution | Coordination |
| `InstructionsLoaded` | CLAUDE.md or AGENTS.md instructions are loaded/reloaded | Configuration |
| `ConfigChange` | A configuration value changes at runtime | Configuration |
| `WorktreeCreate` | A new git worktree or CoW clone is created | Workspace |
| `WorktreeRemove` | A git worktree or CoW clone is removed | Workspace |
| `PreCompact` | Context compaction is about to run (opportunity to preserve data) | Session |
| `MemoryObserve` | An observation is about to be persisted | Memory |
| `MemoryInject` | Retrieved memory is about to be injected | Memory |
| `AutopilotStoryStart` | Autopilot begins a story | Autopilot |
| `AutopilotStoryComplete` | Autopilot finishes a story | Autopilot |
| `ProviderSwitch` | Active provider or model changes | Provider |
| `ErrorUnhandled` | An unhandled runtime error occurs | System |

### Handler Types

Each hook can be handled by one of four handler types:

| Handler Type | Description | Use Case |
| --- | --- | --- |
| `command` | Executes a shell command with the hook event as JSON on stdin | Linters, formatters, external scripts |
| `http` | Sends a POST webhook to a URL with the hook event as JSON body | External service integration, logging pipelines |
| `prompt` | Injects text into the agent's context when the hook fires | Dynamic instructions, context augmentation |
| `agent` | Spawns a subagent with the hook event as input | Automated review, secondary analysis |

Handler registration in the plugin manifest:

```json
{
  "contributes": {
    "hooks": [
      {
        "event": "PreToolUse",
        "handler": { "type": "command", "command": "npx my-linter --check" }
      },
      {
        "event": "PostToolUse",
        "handler": { "type": "http", "url": "https://hooks.example.com/tool-usage" }
      },
      {
        "event": "SessionStart",
        "handler": { "type": "prompt", "text": "Always use TypeScript strict mode." }
      },
      {
        "event": "TaskCompleted",
        "handler": { "type": "agent", "agentType": "quality-reviewer" }
      }
    ]
  }
}
```

### Claude Code Hook Compatibility

Amoena's hooks fire with the same JSON format as Claude Code hooks. The event payload structure, field names, and lifecycle semantics are identical. This means:

- Existing Claude Code `.claude/hooks.json` configurations work unchanged when imported into Amoena.
- Plugins written for Claude Code's hook system require zero modification to run as Amoena plugins.
- The `command` handler type is a direct equivalent of Claude Code's shell-command hooks.
- Hook event payloads include the same fields: `event`, `session_id`, `tool_name` (for tool hooks), `timestamp`, and `metadata`.

The compatibility layer translates between Claude Code's flat hook configuration and Amoena's plugin manifest format during the ecosystem compat scan (see `setup-wizard.md` Step 7).

### OpenCode Hook Compatibility

OpenCode's event hooks (session lifecycle, tool execution, approval/guardrail events) are normalized to Amoena's Hook Engine event format:

- OpenCode approval/guardrail events map to Amoena's `PermissionRequest` event.
- OpenCode session lifecycle events map to the corresponding Amoena `session.*` events.
- OpenCode tool execution events map to `PreToolUse` and `PostToolUse` events.
- OpenCode agent definitions (build, plan, general, explore, etc.) are imported as Amoena agent profiles, available as tab-switchable agents in the SessionComposer.

### Dual-Ecosystem Plugin Manager

Amoena is the **only AI tool that can run plugins from both Claude Code and OpenCode ecosystems simultaneously**. The Plugin Ecosystem Manager provides:

- **Auto-discovery**: Scans `~/.claude/` for Claude Code plugins (oh-my-claudecode, claude-mem, etc.) and `~/.opencode/` plus `opencode.json` for OpenCode plugins (oh-my-opencode, etc.).
- **Per-plugin enable/disable**: Each plugin individually toggleable via Settings > Plugins.
- **Ecosystem-level toggle**: Enable/disable all plugins from a given ecosystem as a group.
- **Conflict resolution**: When plugins from different ecosystems register handlers for the same event, both fire in declared priority order (configurable via drag-and-drop in Settings).
- **Plugin isolation**: Each plugin's hooks run in their own context. Failures are logged and do not block other plugins or the agent loop.
- **100% capability access**: Plugins get full access to Amoena's tool execution, memory, agent spawning, and hook events — identical to their native ecosystem behavior.

### Plugin Hook Context

```ts
export interface PluginContext {
  appVersion: string
  pluginId: string
  permissions: string[]
  storagePath: string
  log: (level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: Record<string, unknown>) => void
}

export interface PluginLifecycle {
  onLoad?: (ctx: PluginContext) => Promise<void> | void
  onActivate?: (ctx: PluginContext, reason: 'startup' | 'event' | 'manual') => Promise<void> | void
  onDeactivate?: (ctx: PluginContext, reason: 'shutdown' | 'disable' | 'reload') => Promise<void> | void
  onUninstall?: (ctx: PluginContext) => Promise<void> | void
  onSettingsChange?: (ctx: PluginContext, diff: Record<string, { oldValue: unknown; newValue: unknown }>) => Promise<void> | void
  onUpdate?: (
    ctx: PluginContext,
    update: { fromVersion: string; toVersion: string; firstRunAfterUpdate: boolean }
  ) => Promise<void> | void
}
```

### TUI Lifecycle Hooks

TUI plugins can opt into a TUI-specific lifecycle in addition to base plugin hooks.

```ts
export interface TuiPluginContext extends PluginContext {
  tuiId: string
  runtimeKind: 'structured-api' | 'pty' | 'native'
  capabilities: {
    bidirectionalApi: boolean
    requiresPtyInput: boolean
    supportsSse: boolean
    supportsJsonRpc: boolean
    supportsWebSocket: boolean
    supportsHooks: boolean
    supportsOtel: boolean
    supportsFiles: boolean
    supportsImages: boolean
    supportsAudio: boolean
    usageMetricsGranularity: 'none' | 'session' | 'event'
  }
  session: {
    create(input: { model?: string; cwd?: string; env?: Record<string, string> }): Promise<{ id: string }>
    close(sessionId: string): Promise<void>
  }
  auth: {
    status(): Promise<'authenticated' | 'unauthenticated' | 'expired'>
    begin(flow?: 'oauth-device-code' | 'browser' | 'api-key'): Promise<void>
    refresh(): Promise<void>
  }
}

export interface TuiPluginLifecycle {
  onTuiInstall?: (ctx: TuiPluginContext) => Promise<void> | void
  onTuiAuth?: (ctx: TuiPluginContext, event: { stage: 'start' | 'success' | 'failure'; error?: string }) => Promise<void> | void
  onTuiSessionStart?: (ctx: TuiPluginContext, session: { id: string; model?: string }) => Promise<void> | void
  onTuiSessionStop?: (ctx: TuiPluginContext, session: { id: string; reason: 'user' | 'error' | 'shutdown' }) => Promise<void> | void
  onTuiMcpBridge?: (ctx: TuiPluginContext, bridge: { serverName: string; transport: 'stdio' | 'sse' | 'http' }) => Promise<void> | void
  onTuiCleanup?: (ctx: TuiPluginContext) => Promise<void> | void
}
```

TUI lifecycle mapping:

- Install: package resolved, verified, and adapter dependencies prepared -> `onTuiInstall`.
- Auth: auth provider selected and flow run -> `onTuiAuth`.
- Session: session boot/resume/stop events -> `onTuiSessionStart` and `onTuiSessionStop`.
- MCP bridge: runtime-specific MCP mapping and credential wiring -> `onTuiMcpBridge`.
- Cleanup: runtime temp files, sockets, and orphan sessions removed -> `onTuiCleanup`.

- `onLoad(ctx)` initializes static resources, validates config, and should avoid side effects.
- `onActivate(ctx, reason)` starts active behavior after matching an activation event.
- `onDeactivate(ctx, reason)` disposes resources, timers, subscriptions, and UI registrations.
- `onUninstall(ctx)` removes plugin-owned data and unregisters external integrations.
- `onSettingsChange(ctx, diff)` reacts to user settings changes with targeted reconfiguration.
- `onUpdate(ctx, update)` performs migration logic between plugin versions.

## Plugin Contributions

Beyond commands, views, settings, hooks, and menus, plugins can contribute the following extension types to the Amoena runtime:

### Custom Tools

Plugins can register custom tools that agents can invoke during sessions. Tools are declared in the manifest and implemented via the plugin API.

```json
{
  "contributes": {
    "tools": [
      {
        "id": "acme.screenshot",
        "displayName": "Take Screenshot",
        "description": "Captures a screenshot of the current preview surface",
        "inputSchema": { "type": "object", "properties": { "url": { "type": "string" } } },
        "handler": "./dist/tools/screenshot.js"
      }
    ]
  }
}
```

Custom tools appear in the agent's tool palette alongside built-in tools. Permission checks apply: tools that access the filesystem or network require the corresponding manifest permissions.

### Observation Types

Plugins can define custom observation types that extend Amoena's memory system. Observations are structured data units stored in the SQLite database and indexed for semantic retrieval.

```json
{
  "contributes": {
    "observationTypes": [
      {
        "id": "acme.code-smell",
        "displayName": "Code Smell",
        "schema": { "type": "object", "properties": { "file": { "type": "string" }, "smell": { "type": "string" }, "severity": { "type": "string" } } },
        "embeddable": true
      }
    ]
  }
}
```

### Concept Categories

Plugins can register new concept categories for the knowledge graph. Concepts are high-level abstractions extracted from observations and linked to sessions, files, and other concepts.

```json
{
  "contributes": {
    "conceptCategories": [
      {
        "id": "acme.design-pattern",
        "displayName": "Design Pattern",
        "parentCategory": "architecture",
        "icon": "puzzle"
      }
    ]
  }
}
```

### Agent Types

Plugins can contribute custom agent types that appear in the agent selector and can be spawned by other agents or the user.

```json
{
  "contributes": {
    "agentTypes": [
      {
        "id": "acme.data-analyst",
        "displayName": "Data Analyst",
        "description": "Specialized agent for data analysis and visualization",
        "systemPrompt": "./prompts/data-analyst.md",
        "defaultModel": "claude-sonnet-4-20250514",
        "tools": ["acme.screenshot", "builtin.python-repl"]
      }
    ]
  }
}
```

### Provider Integrations

Plugins can register new model providers that extend the available model list beyond the built-in providers (Anthropic, OpenAI, Google).

```json
{
  "contributes": {
    "providers": [
      {
        "id": "acme.local-llm",
        "displayName": "Local LLM (Ollama)",
        "authType": "none",
        "baseUrl": "http://localhost:11434",
        "handler": "./dist/providers/ollama.js",
        "models": [
          { "id": "llama3.3", "displayName": "Llama 3.3 70B", "contextWindow": 131072 }
        ]
      }
    ]
  }
}
```

Provider plugins must implement the provider adapter interface for chat completions, streaming, and model listing. The handler receives the same `PluginContext` and has access to the settings API for user-configured parameters (temperature, max tokens, etc.).

## Plugin API Surface

Plugins receive a scoped `api` object from the host and cannot directly import internal app modules.

- Session management: read session metadata, append messages, tag sessions, and subscribe to session lifecycle events.
- UI extension points: register panels, widgets, decorators, menus, and command palette entries.
- Settings read/write: read namespace-scoped settings and persist validated updates.
- Notification dispatch: emit in-app notifications and optional OS notifications if granted.
- File system (scoped): read/write only inside approved roots (workspace, plugin storage), path traversal blocked.
- Theme modification: register theme tokens or temporary overrides via controlled API, no global stylesheet injection.

Example TypeScript shape:

```ts
export interface PluginApi {
  sessions: {
    list(): Promise<Array<{ id: string; title: string; updatedAt: string }>>
    read(sessionId: string): Promise<{ id: string; messages: Array<{ role: string; content: string }> }>
    append(sessionId: string, message: { role: string; content: string }): Promise<void>
  }
  ui: {
    registerView(def: { id: string; target: string; render: () => unknown }): () => void
    registerCommand(def: { id: string; title: string; run: () => Promise<void> | void }): () => void
    registerMenuItem(def: { location: string; command: string }): () => void
    registerSettings(def: { key: string; render: () => unknown }): () => void
  }
  settings: {
    get<T = unknown>(key: string): Promise<T>
    set<T = unknown>(key: string, value: T): Promise<void>
  }
  notifications: {
    info(message: string): void
    warn(message: string): void
    error(message: string): void
  }
  fs: {
    readText(path: string): Promise<string>
    writeText(path: string, content: string): Promise<void>
  }
  theme: {
    setToken(name: string, value: string): void
    resetToken(name: string): void
  }
}
```

## Permission System

- Manifest-declared capabilities define requested access (`permissions` in manifest).
- Install flow presents permission rationale and prompts user approval before activation.
- Grants are stored per-plugin and can be revoked from settings at any time.
- Sensitive permissions (`shell.execute`, `network`, `fs.write`, `sessions.write`) require explicit opt-in.
- Runtime checks enforce least privilege: API methods fail fast if permission is absent.

## Security Model

Amoena uses an **Obsidian-style same-process model**: plugins are JavaScript loaded and executed directly in the main renderer webview. There is no process isolation between plugins and the host application.

### What this means in practice

- Plugins run in the same JS context as the Amoena UI and have access to the full Tauri IPC bridge.
- A plugin can call `@tauri-apps/api/core invoke()` directly, bypassing the scoped Plugin Host API entirely.
- CSP cannot prevent this: `invoke()` is a JavaScript function call, not a network request, so `script-src` and `connect-src` directives do not intercept it.
- Any plugin that requests `shell.execute`, `fs.write`, or `network` capabilities — or that calls IPC directly — can perform those operations once loaded.

### Security boundary: capability-based consent, not isolation

The security boundary is **user consent at install time**, not process separation. This is the same model used by Obsidian (millions of users) and browser extensions:

- Users review declared permissions before installing a plugin.
- Sensitive capabilities (`shell.execute`, `fs.write`, `network`, `sessions.write`) require explicit opt-in.
- Grants are stored per-plugin and can be revoked from settings.
- Runtime checks in the Plugin Host API enforce permissions for calls that go through the API surface.

**Trust model**: third-party plugins should be treated like browser extensions — the user installs them at their own risk. Amoena's marketplace mitigates this through plugin signing, verified publisher badges, and permission summaries visible before install.

### Defence-in-depth layers

Even though process isolation is not available, multiple layers reduce the blast radius:

- **Layer 1 — Manifest permissions**: Plugins declare capabilities; users approve at install time.
- **Layer 2 — Runtime permission checks**: Sensitive Plugin Host API methods validate permission on every call, not just at install.
- **Layer 3 — Tauri capability scoping**: Tauri 2's capability system limits which IPC commands are registered per window, reducing the raw IPC surface accessible to the renderer.
- **Layer 4 — Audit logging**: All plugin IPC calls are logged for forensic review. Anomalous patterns (bulk file reads, unexpected network connections) surface in the audit log.
- **Layer 5 — Plugin signing**: Marketplace plugins must be signed. Unsigned plugins display a prominent warning at install time.
- **Layer 6 — CSP hardening**: `connect-src` is locked down, `unsafe-eval` is blocked (except in the isolated Monaco webview), and inline scripts are disallowed. This limits XSS escalation paths even though it cannot block `invoke()` calls.

### Limitations to document clearly

- A plugin that calls `invoke()` directly can exceed its declared manifest permissions if the corresponding Tauri command is registered in that window. Tauri capability scoping (Layer 3) is the primary guard against this — commands not included in the window's capability set are rejected at the Rust layer.
- CSP is not a substitute for process isolation in this model.
- CVE-2024-35222 (Tauri path traversal) illustrates that the Tauri IPC surface has had real vulnerabilities; defence-in-depth is essential.

### V2 isolation path

A future V2 could introduce stronger isolation for untrusted plugins by running each plugin in a dedicated Web Worker or a separate WebView. This would enforce a true message-passing API boundary and prevent direct `invoke()` access. The Plugin Host API is designed as a message-passing surface today so this migration path is preserved without breaking the plugin SDK contract.

## Extension Points

The framework supports the following extension points:

1. Sidebar panels (custom persistent views).
2. Toolbar buttons (global or context-specific actions).
3. Context menu items (editor/chat/workspace right-click entries).
4. Status bar widgets (live state indicators and quick actions).
5. Settings pages (plugin configuration UI sections).
6. Chat message decorators (render badges, inline metadata, or actions).
7. Custom TUI adapters (integration hooks for terminal-based assistants).

### TUI Adapter Extension Point

TUI handlers register through `contributes.tuiAdapter[].handler`. The host resolves all matching handlers, evaluates compatibility, then selects one adapter per active TUI target.

Selection order:

1. Explicit user choice in settings.
2. Highest capability match for requested workflow (for example structured API before PTY fallback).
3. Highest `priority` in manifest.
4. Built-in default as final fallback.

Capabilities are declarative and must align with `docs/architecture/tui-capability-matrix.md` and adapter contracts in `docs/architecture/agent-backend-interface.md`.

### Built-in and Community Plugin Categories

All categories share the same manifest/lifecycle contract:

- Core plugins (built-in): shipped with app and versioned with Amoena.
  - `builtin.claude-code`
  - `builtin.opencode`
  - `builtin.codex`
  - `builtin.gemini`
- Community plugins (third-party): marketplace-installed adapters and helper providers.
- External integration plugins (future): non-TUI product integrations (for example Gmail, Calendar, ticketing systems) reusing the same plugin manifest, permission model, and lifecycle architecture.

Core plugins are implemented as regular plugins internally, not hardcoded special cases. This keeps community plugin behavior and built-in behavior aligned and testable.

### Extending or Overriding Built-in TUI Behavior

Plugins can extend or override built-ins by declaring `extends` in `contributes.tuiAdapter`:

- Extend: add capabilities, auth providers, or MCP bridge presets while preserving base adapter behavior.
- Override: replace adapter selection for a given runtime ID when user enables override in settings.
- Safety rule: only one override may be active per runtime; conflicts are blocked with a deterministic error.

Example extension flow:

- `com.acme.opencode-plus` declares `extends: "builtin.opencode"`.
- Plugin contributes stronger `usage.report` and custom `tuiMcpBridge` templates.
- User selects "Prefer community override" for OpenCode.
- Host routes OpenCode sessions through plugin handler while preserving permission enforcement.

## Plugin Development Guide

### Creating a New TUI Integration Plugin

1) Scaffold plugin

- Run `amoena plugin init` and choose "TUI Adapter Plugin" template.
- Keep base manifest fields unchanged and add `contributes.tuiAdapter`.
- Add optional `contributes.tuiAuthProvider` and `contributes.tuiMcpBridge` when needed.

2) Implement plugin structure

Recommended layout:

```text
my-tui-plugin/
  manifest.json
  src/
    index.ts
    tui/
      adapter.ts
      auth-provider.ts
      mcp-bridge.ts
    test/
      adapter.spec.ts
      lifecycle.spec.ts
```

`src/index.ts` example:

```ts
import type { PluginLifecycle } from './types'
import { registerAdapter } from './tui/adapter'
import { registerAuthProvider } from './tui/auth-provider'
import { registerMcpBridge } from './tui/mcp-bridge'

const plugin: PluginLifecycle = {
  onLoad(ctx) {
    ctx.log('info', 'Loading TUI plugin')
  },
  onActivate(ctx) {
    registerAdapter(ctx)
    registerAuthProvider(ctx)
    registerMcpBridge(ctx)
  },
  onTuiInstall(ctx) {
    ctx.log('info', `TUI adapter installed: ${ctx.tuiId}`)
  },
  onTuiAuth(ctx, event) {
    ctx.log('info', `Auth event: ${event.stage}`)
  },
  onTuiCleanup(ctx) {
    ctx.log('info', `Cleaning up ${ctx.tuiId}`)
  }
}

export default plugin
```

3) Test locally

- Run `amoena plugin build`.
- Install local package in dev mode: `amoena plugin install --local ./my-tui-plugin`.
- Validate lifecycle and capabilities:
  - install -> `onTuiInstall`
  - auth flow -> `onTuiAuth`
  - session start/stop -> `onTuiSessionStart` / `onTuiSessionStop`
  - cleanup/uninstall -> `onTuiCleanup` / `onUninstall`
- Verify capability declarations against adapter behavior and permission prompts.

4) Publish

- Submit signed package with capability and permission summary.
- Include compatibility note for supported runtime modes (`structured-api`, `pty`, `native`).
- Include setup wizard metadata if plugin provides guided onboarding.

### 1) Create

- Scaffold with `amoena plugin init`.
- Fill `manifest.json` with id, permissions, contributes, and activationEvents.
- Implement lifecycle hooks in `src/index.ts` and export default plugin object.

### 2) Test

- Run unit tests for command handlers and settings migrations.
- Run integration tests in a sandbox workspace with mocked plugin API.
- Validate lifecycle behavior: install, activate, deactivate, update, uninstall.
- Verify permission denials produce clear user-facing errors.

### 3) Publish

- Bundle with `amoena plugin build`.
- Include changelog and compatibility metadata (`minAppVersion`).
- Submit signed package and manifest to the marketplace registry.

## Marketplace Integration

- Discovery: searchable catalog with tags, ratings, verified publisher badges, and permission summaries.
- Install: download package, verify signature/hash, display requested permissions, require user approval.
- Update: background check with semver policy and permission-diff prompt when new capabilities are requested.
- Removal: deactivate plugin, run uninstall hook, remove files, and revoke permissions.
- Recovery: failed plugin startup triggers safe mode fallback and disable option to protect app startup.

### TUI Plugin Discovery and Installation Flow

1. Discovery

- Marketplace shows TUI plugins under dedicated categories: Core, Community, External Integrations.
- TUI cards expose capability badges (for example `bidirectional-api`, `pty`, `mcp-bridge`, `auth-provider`) and supported runtimes.

2. One-click install with auto-detection

- User clicks install.
- Host detects local runtime availability (Claude Code, OpenCode, Codex, Gemini, or plugin-defined runtime).
- If runtime exists, plugin setup starts immediately; otherwise user gets install prerequisites.

3. Setup wizard hooks

- Plugins may contribute setup steps (login, binary path, runtime flags, MCP mapping).
- Wizard calls plugin lifecycle hooks and blocks completion on failed required steps.

4. Activation

- Host verifies permissions, runs `onTuiInstall`, then activates adapter for selected workflows.
- If plugin overrides a built-in adapter, host displays explicit confirmation and rollback option.

## Dependency Management

### Per-Plugin node_modules (MVP)

Each plugin ships with its own `node_modules` directory. This means dependencies are not shared between plugins or between plugins and the host application.

- **Duplication acknowledged**: two plugins that both depend on `lodash` will each install their own copy. This is intentional for MVP.
- **Why duplication is acceptable for MVP**: isolation is simpler and safer. Plugins cannot break each other through shared dependency version conflicts, and the host app's dependency tree is never polluted by plugin packages.
- **Disk usage estimate**: a plugin with no npm dependencies is typically 1–5 MB. A plugin with a moderate dependency tree (e.g., an HTTP client, a parsing library) averages approximately 50 MB including `node_modules`. Plan storage accordingly.
- **Recommended maximum installed plugins (MVP)**: 20 plugins. Beyond this, total disk usage and startup scan time may degrade noticeably on lower-end machines.

### Future Optimization Path

Per-plugin isolation can be relaxed in a future version without changing the plugin manifest contract:

- **npm workspaces**: hoist shared compatible dependency versions to a root `node_modules` while preserving per-plugin overrides for incompatible versions.
- **pnpm content-addressable store**: pnpm's hard-link store deduplicates identical package versions across all plugins at the filesystem level with zero code changes to plugins.
- The Plugin Host API is designed so plugins never import from the host's own `node_modules`; this boundary must be preserved regardless of the deduplication strategy chosen.

## Config File Safety

Plugins that install MCP servers or modify TUI configuration must follow the same safety constraints as the Marketplace Client (see `marketplace-discovery.md`). These rules apply to any plugin using `mcp-config-inject` or writing to TUI config files:

- **No direct config file writes**: Plugins MUST NOT write directly to TUI config files via `fs.write` or Tauri IPC. Config changes must go through Amoena's managed config layer in the Rust backend.
- **User diff review**: Any config change (add, modify, or remove an MCP entry) must be presented to the user as a before/after diff before being applied. No silent writes.
- **Allowlist schema validation**: All config values written by plugins are validated against the same allowlist schema used by the Marketplace Client:
  - MCP server `command`: absolute path or safe binary name; no shell metacharacters.
  - MCP server `args`: each argument validated individually; no shell expansion.
  - MCP server transport URLs: `http://` or `https://` only; `file://` and localhost-redirect patterns are rejected.
  - No sensitive `env` variable overrides (`PATH`, `LD_PRELOAD`, `DYLD_INSERT_LIBRARIES`, etc.).
- **Atomic writes**: Config files are written atomically (write to temp file, then rename).

Plugins that attempt to bypass these controls (e.g., by calling `invoke('write_file', ...)` directly to write to a TUI config path) will be rejected by Tauri capability scoping — TUI config paths are not included in the `fs.write` scope available to plugins.

## Operational Notes

- Compatibility gate checks `minAppVersion` before install or update.
- `activationEvents` should be as specific as possible to reduce startup overhead.
- Keep `contributes` declarative and side-effect free; runtime logic belongs in lifecycle handlers.

## Competitive Reference: Osaurus Plugin Architecture

Osaurus is a macOS-native AI environment with a mature plugin system worth studying. Its model diverges from Amoena's hook-based approach in several important ways.

### Native Plugin Library

Osaurus ships **20+ first-party plugins** covering common developer and productivity workflows: Mail, Calendar, Vision, macOS Use, XLSX, PPTX, Browser, Music, Git, Filesystem, Search, Fetch, and more. These are installable by name (e.g., `osaurus.browser`) and discoverable through a built-in plugin registry.

### Two-Tier ABI Model

Osaurus distinguishes between two plugin capability tiers:

| Tier | Name | Capabilities |
| --- | --- | --- |
| **v1** | Tools-only ABI | Plugin exposes tool definitions that agents can call. Lightweight, no host integration beyond tool dispatch. Equivalent to an MCP tool provider. |
| **v2** | Full Host ABI | Plugin receives a rich host API and can: register HTTP routes on the Osaurus server, serve web apps (UI extensions), persist data in SQLite, dispatch agent tasks, and call inference through any configured model. |

The v1 tier is intentionally constrained. A plugin author can ship a useful tool with a single JSON manifest and a handler function. The v2 tier unlocks full extensibility but requires the plugin to link against the host SDK and accept a broader permission surface.

### JSON Plugin Recipes

Osaurus supports **JSON-only plugin definitions** — a plain JSON manifest is enough to declare a plugin, its tools, and its metadata. No Xcode project, no Swift Package Manager, no build toolchain required. This dramatically lowers the barrier to entry for plugin authors who want to ship simple tool integrations.

### Plugin CLI

Osaurus provides a dedicated CLI for plugin management:

| Command | Description |
| --- | --- |
| `osaurus tools install <name>` | Install a plugin by name from the registry |
| `osaurus tools list` | List installed plugins |
| `osaurus tools create <Name> --swift` | Scaffold a new plugin project |
| `osaurus tools dev` | Start hot-reload development mode |

The `dev` command watches the plugin directory and live-reloads on change, giving plugin authors a tight feedback loop without restarting the host application.

### Key Differences from Amoena

| Dimension | Osaurus | Amoena |
| --- | --- | --- |
| **Plugin runtime** | Native Swift dylibs (v2) or JSON recipes (v1) | JavaScript in renderer webview (same-process, Obsidian-style) |
| **Extension model** | ABI contract — plugin links against host SDK | Hook-based — plugin subscribes to lifecycle events |
| **Tool registration** | Declarative in manifest, dispatched by agent | Declarative in manifest via `contributes.tools`, dispatched by agent |
| **UI extensibility** | v2 plugins serve web apps as routes | Extension points: panels, toolbar, context menus, status bar, settings pages |
| **Data persistence** | v2 plugins get SQLite access through host API | Plugins use scoped `settings` API; no direct SQLite access yet |
| **Isolation** | Process-level (dylib boundary) | Same JS context; V2 isolation via Web Workers planned |
| **Platform** | macOS-only (Swift ABI) | Cross-platform (Tauri 2 + Rust + React 19) |

The ABI model trades platform portability for runtime safety: a native dylib boundary enforces isolation by default. Amoena's same-process JS model prioritizes developer ergonomics and cross-platform reach, with isolation deferred to the V2 Web Worker path.

## Plugin Capabilities Roadmap (Osaurus-Inspired)

The following enhancements are proposed to close capability gaps identified through the Osaurus competitive analysis, while preserving Amoena's cross-platform, hook-based architecture.

### Two-Tier Plugin Model

Introduce an explicit tier distinction in the manifest:

| Tier | Manifest Field | Capabilities |
| --- | --- | --- |
| **Basic** (tool provider) | `"tier": "basic"` | Register tools via `contributes.tools`. Subscribe to lifecycle hooks. Read scoped settings. No host API access beyond tool dispatch. |
| **Advanced** (full host API) | `"tier": "advanced"` | Everything in Basic, plus: register Axum routes on the backend, access a plugin-scoped SQLite database, dispatch agent tasks programmatically, call inference through any configured model provider. |

Basic-tier plugins are reviewed with a lighter permission surface and can be distributed as JSON recipes. Advanced-tier plugins require explicit user consent for each host API capability and undergo stricter marketplace review.

```json
{
  "id": "com.acme.code-search",
  "tier": "basic",
  "contributes": {
    "tools": [
      {
        "id": "acme.ripgrep",
        "displayName": "Ripgrep Search",
        "inputSchema": { "type": "object", "properties": { "pattern": { "type": "string" } } },
        "handler": "./dist/tools/ripgrep.js"
      }
    ]
  }
}
```

### Advanced Plugin Host API Extensions

Advanced-tier plugins receive an extended `api` object with additional surfaces:

```ts
export interface AdvancedPluginApi extends PluginApi {
  routes: {
    /** Register an HTTP route on the Amoena backend (Axum). */
    register(def: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE'
      path: string
      handler: string
    }): () => void
  }
  db: {
    /** Execute a SQL query against the plugin-scoped SQLite database. */
    execute(sql: string, params?: unknown[]): Promise<unknown[]>
    /** Run a migration script. */
    migrate(version: number, sql: string): Promise<void>
  }
  agents: {
    /** Dispatch a task to an agent and return the result. */
    dispatch(def: {
      agentType: string
      prompt: string
      tools?: string[]
    }): Promise<{ result: string; usage: { inputTokens: number; outputTokens: number } }>
  }
  inference: {
    /** Call inference through any configured model provider. */
    complete(def: {
      model: string
      messages: Array<{ role: string; content: string }>
      maxTokens?: number
      temperature?: number
    }): Promise<{ content: string; usage: { inputTokens: number; outputTokens: number } }>
  }
}
```

Each surface requires the corresponding manifest permission (`routes.register`, `db.execute`, `agents.dispatch`, `inference.complete`). The host enforces these at runtime via the same capability-based consent model documented in the Permission System section.

### JSON Plugin Recipes

Support zero-build-tool plugin definitions for simple tool integrations:

```json
{
  "$schema": "https://amoena.app/schemas/plugin-manifest.schema.json",
  "id": "com.acme.url-fetch",
  "name": "URL Fetch",
  "version": "0.1.0",
  "author": { "name": "Acme Corp" },
  "tier": "basic",
  "runtime": "recipe",
  "contributes": {
    "tools": [
      {
        "id": "acme.fetch",
        "displayName": "Fetch URL",
        "description": "Fetches a URL and returns the response body as text",
        "inputSchema": {
          "type": "object",
          "properties": { "url": { "type": "string", "format": "uri" } },
          "required": ["url"]
        },
        "implementation": {
          "type": "fetch",
          "url": "{{input.url}}",
          "responseMapping": { "body": "text" }
        }
      }
    ]
  }
}
```

Recipe plugins declare tool behavior declaratively in the manifest itself. No separate handler file, no `npm install`, no build step. The host interprets the `implementation` block at runtime. Supported implementation types:

- `fetch`: HTTP request with template interpolation.
- `shell`: Execute a shell command with input piped as JSON on stdin.
- `typescript`: Inline TypeScript evaluated in a sandboxed context.
- `wasm`: Load a WASM module exporting a `handle(input: string): string` function. **Planned**: WASM recipe support is planned for a future release and is not available in v1.

### Plugin CLI Commands

Introduce a `amoena plugins` CLI subcommand set for plugin management and development:

| Command | Description |
| --- | --- |
| `amoena plugins install <id>` | Install a plugin from the marketplace or a local path |
| `amoena plugins list` | List installed plugins with status, tier, and version |
| `amoena plugins create <name> [--tier basic\|advanced] [--recipe]` | Scaffold a new plugin project |
| `amoena plugins dev [path]` | Start hot-reload development mode for a plugin directory |
| `amoena plugins validate [path]` | Validate a plugin manifest against the schema |
| `amoena plugins publish` | Package and publish to the Amoena marketplace |

The `dev` command watches the plugin directory for changes, reloads the plugin without restarting Amoena, and streams plugin logs to the terminal. This matches the developer experience provided by Osaurus's `osaurus tools dev`.

### Hot-Reload Development Mode

The `amoena plugins dev` workflow:

1. Watches the plugin directory for file changes (via `notify` crate on the Rust side).
2. On change: validates the manifest, re-bundles if needed, unloads the previous plugin instance, and loads the updated version.
3. Preserves plugin state across reloads when the plugin opts in via `"hotReload": { "preserveState": true }` in the manifest.
4. Streams structured logs (`info`, `warn`, `error`) from the plugin to the terminal and to Amoena's developer console panel.
5. Displays a development badge in the UI for plugins loaded in dev mode.

### Priority Native Plugins

The following first-party plugins should be built to match the most impactful entries in Osaurus's plugin library, adapted for Amoena's cross-platform architecture:

| Plugin ID | Description | Tier | Priority |
| --- | --- | --- | --- |
| `amoena.filesystem` | Scoped file read/write/glob/watch operations | Basic | P0 |
| `amoena.git` | Git operations: status, diff, commit, branch, log | Basic | P0 |
| `amoena.browser` | Headless browser automation via Playwright or similar | Advanced | P0 |
| `amoena.search` | Full-text and semantic search across workspace files | Basic | P1 |
| `amoena.fetch` | HTTP client for external API calls with auth support | Basic | P1 |
| `amoena.terminal` | Terminal session management and command execution | Advanced | P1 |
| `amoena.sqlite` | SQLite database inspection and query tool | Basic | P2 |
| `amoena.mail` | Email integration (read/send via IMAP/SMTP or platform APIs) | Advanced | P2 |
| `amoena.calendar` | Calendar integration (read/create events via CalDAV or platform APIs) | Advanced | P2 |

P0 plugins should ship with the initial plugin framework release. P1 plugins follow in the next cycle. P2 plugins are community-contribution targets with first-party scaffold support.

### Hook-Based vs ABI-Based: Architectural Comparison

Amoena's hook-based model and Osaurus's ABI model represent different trade-offs:

**Hook-based model (Amoena)**

- Plugins subscribe to named lifecycle events and react to them. The host drives execution.
- Advantages: loose coupling, easy to compose multiple plugins on the same event, natural fit for the existing `command`/`http`/`prompt`/`agent` handler types.
- Limitations: plugins are reactive — they respond to events the host defines. Adding new capabilities requires the host to expose new events or API surfaces.
- Best for: cross-cutting concerns (logging, permissions, context augmentation), workflow automation, and integrations that observe rather than extend.

**ABI-based model (Osaurus)**

- Plugins implement a defined interface (ABI contract) and the host calls into them. The plugin drives its own behavior within the contract.
- Advantages: strong isolation boundary, clear capability tiers, plugins can serve their own UI and routes.
- Limitations: platform-specific (Swift dylibs), tighter coupling to host internals, harder to compose multiple plugins on the same surface.
- Best for: self-contained feature modules (mail client, browser automation) that need deep host integration.

**Amoena's path forward** combines both: the hook system remains the primary composition mechanism for event-driven plugins, while the Advanced tier introduces ABI-like capabilities (route registration, SQLite access, inference calls) through the extended `PluginApi`. This preserves the benefits of reactive composition while enabling the deep integration patterns that make Osaurus's v2 plugins powerful.
