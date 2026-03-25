# Plugin Authoring Guide

## Overview

This guide walks you through creating a Amoena plugin from scratch. For the full plugin API reference, see `docs/developer/plugins/`.

## Prerequisites

- Amoena desktop app installed and running
- Familiarity with TypeScript
- Read `docs/developer/plugins/manifest.md` for the manifest schema

## Quick Start

### 1. Create the Plugin Directory

```
my-plugin/
├── manifest.json     # Plugin manifest (required)
├── src/
│   └── index.ts      # Entry point
├── package.json
└── README.md
```

### 2. Write the Manifest

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "display_name": "My Plugin",
  "description": "A short description of what this plugin does",
  "api_version": "1",
  "min_host_version": "1.0.0",
  "permissions": ["read_session", "write_memory"],
  "contributions": {
    "commands": [
      {
        "id": "my-plugin.hello",
        "title": "Say Hello"
      }
    ]
  }
}
```

### 3. Implement the Entry Point

```typescript
import type { PluginContext } from "@lunaria/plugin-api";

export function activate(ctx: PluginContext) {
  ctx.commands.register("my-plugin.hello", async () => {
    ctx.ui.showNotification("Hello from my plugin!");
  });
}

export function deactivate() {
  // Cleanup resources
}
```

## What Plugins Can Do

| Capability | Permission Required | Phase |
|-----------|-------------------|-------|
| Register commands | `commands` | V1.5 |
| Add UI views/panels | `ui_extensions` | V1.5 |
| Add settings panels | `settings` | V1.5 |
| Register lifecycle hooks | `hooks` | V1.5 |
| Add context menu items | `menus` | V1.5 |
| Register custom tools | `tools` | V1.5 |
| Add observation types | `memory` | V1.5 |
| Register agent types | `agents` | V1.5 |
| Add LLM providers | `providers` | V2.0 |

## Permission Model

Plugins declare required permissions in `manifest.json`. Users approve permissions at install time.

**Principles:**
- Plugins cannot access anything not declared in their permissions.
- File system access is scoped to the plugin's own directory unless `workspace_read` or `workspace_write` is granted.
- Network access requires the `network` permission.
- Sensitive operations (shell exec, git push) are never available to plugins.

## Hooks

Plugins can register handlers for lifecycle events:

```typescript
ctx.hooks.on("session.start", async (session) => {
  // Run when a new session starts
});

ctx.hooks.on("message.send", async (message) => {
  // Run before a message is sent to the model
  return message; // Return modified message or original
});

ctx.hooks.on("tool.before", async (toolCall) => {
  // Run before a tool is executed
});
```

See `docs/developer/plugins/hooks.md` for the full event list.

## UI Extensions

Plugins can contribute UI panels rendered in the sidebar or as tabs:

```typescript
ctx.ui.registerPanel({
  id: "my-plugin.panel",
  title: "My Panel",
  location: "sidebar",
  component: () => import("./MyPanel"),
});
```

See `docs/developer/plugins/ui-extensions.md` for layout options.

## Testing

```bash
# Run plugin tests
bun test

# Load plugin in development mode
# In Amoena: Settings > Plugins > Load from directory > select your plugin folder
```

See `docs/developer/plugins/testing-and-release.md` for the full testing workflow.

## Ecosystem Compatibility

Amoena can import plugins from both Claude Code (`oh-my-claudecode`) and OpenCode (`oh-my-opencode`) ecosystems. If you're porting an existing plugin, see the ecosystem compatibility section in `docs/architecture/plugin-framework.md`.

## Publishing

Plugin distribution is handled through the Amoena Marketplace (V2.0). Until then, plugins are shared as git repositories and loaded from local directories.

## Deep-Link Install Format

Amoena supports install-review deep links for plugins and extensions. The current deeplink parser expects the `amoena://` scheme and an `install` path.

Example:

```text
amoena://plugin/install?id=my-plugin&source=registry&manifestUrl=https://example.com/manifest.json&version=1.0.0&publisher=amoena-team&title=My%20Plugin&signature=abc123
```

Important fields:

- `id`
- `source`
- `manifestUrl`
- `version`
- `publisher`
- `title`
- `signature`

## Install Review Safety Model

Deep-link installs are reviewed before enablement:

- unsigned plugins are flagged
- non-HTTPS manifest URLs are flagged
- trust state is shown to the user before enablement
- plugin permissions are surfaced during install review

The deeplink parser and warning model are implemented in the desktop runtime and must stay aligned with `docs/architecture/plugin-framework.md`.
