# Extension Manifest

All Lunaria extensions (`.luna` files) contain an embedded JSON manifest that declares capabilities, permissions, and contribution points.

## Format

Extensions are single `.luna` binary files with:
- Magic bytes (`0x4C55 4E41` = "LUNA")
- Manifest JSON
- Embedded assets (icons, HTML, CSS, JavaScript)
- Handler bytecode or source

## Manifest Schema

### Required Fields

```json
{
  "id": "my.extension.id",
  "name": "My Extension",
  "version": "1.0.0",
  "description": "What this extension does",
  "permissions": ["sessions.read"],
  "contributes": {}
}
```

### Optional Fields

```json
{
  "homepage": "https://...",
  "repository": "https://...",
  "icon": "icon.png",
  "backend": {
    "type": "bun",
    "entrypoint": "handler.ts"
  }
}
```

## Permissions Model

Extensions must declare all permissions upfront. Available permissions:

- `fs.read` — Read workspace files
- `fs.write` — Write workspace files
- `network` — Make HTTP requests
- `shell.execute` — Run shell commands
- `notifications` — Send notifications
- `sessions.read` — Read session data
- `sessions.write` — Create/modify sessions
- `settings.read` — Read settings
- `settings.write` — Modify settings
- `agents.spawn` — Create sub-agents
- `memory.observe` — Record observations
- `memory.search` — Search memory
- `hooks.register` — Register hook handlers
- `tools.register` — Register custom tools
- `providers.register` — Register LM providers

## Contributions

Extensions declare what they contribute via the `contributes` field.

### commands

```json
{
  "contributes": {
    "commands": [
      {
        "id": "my.command.id",
        "title": "My Command",
        "description": "What it does",
        "category": "category-name",
        "icon": "icon.png",
        "keybinding": "ctrl+shift+p"
      }
    ]
  }
}
```

### panels

```json
{
  "contributes": {
    "panels": [
      {
        "id": "my.panel",
        "title": "My Panel",
        "html": "panel.html",
        "css": "panel.css",
        "scripts": ["panel.js"],
        "default": false
      }
    ]
  }
}
```

Panels are HTML/CSS/JS embedded as assets. They run in a sandboxed context with access to the `lunaria.*` API.

### menus

```json
{
  "contributes": {
    "menus": [
      {
        "id": "context.session",
        "label": "Session Actions",
        "items": [
          {
            "command": "my.command.id",
            "label": "Do Something"
          }
        ]
      }
    ]
  }
}
```

### settings

```json
{
  "contributes": {
    "settings": [
      {
        "id": "my.setting",
        "title": "My Setting",
        "type": "boolean|string|number|select",
        "default": "value",
        "description": "What this does"
      }
    ]
  }
}
```

### hooks

```json
{
  "contributes": {
    "hooks": [
      {
        "event": "SessionStart",
        "handler": {
          "type": "command|http|prompt|agent",
          "config": {}
        },
        "priority": 100,
        "timeout_ms": 5000
      }
    ]
  }
}
```

See [hooks.md](./hooks.md) for all 24 event types and handler types.

### tools

```json
{
  "contributes": {
    "tools": [
      {
        "id": "my.tool",
        "name": "My Tool",
        "description": "What it does",
        "input_schema": {
          "type": "object",
          "properties": {}
        },
        "handler": {
          "type": "command|http|agent",
          "config": {}
        }
      }
    ]
  }
}
```

### providers

```json
{
  "contributes": {
    "providers": [
      {
        "id": "my.provider",
        "name": "My Provider",
        "type": "llm|tool|embedding",
        "models": [
          {
            "id": "model-1",
            "name": "Model 1",
            "reasoning": false
          }
        ]
      }
    ]
  }
}
```

## Compatibility Notes

- Imported Claude Code and OpenCode plugins are auto-normalized into this schema.
- Do not assume browser-extension or VS Code extension semantics.
- Lunaria has its own host model, permissions system, and runtime.
