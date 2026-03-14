# Extensions

Extensions are self-contained capability bundles that integrate directly into the Lunaria desktop application. They ship as single `.luna` binary files — no zip archives, no directories to manage. Drag one into Lunaria, and it installs immediately.

## What Extensions Can Do

An extension can contribute any combination of the following:

| Contribution | What it adds |
|---|---|
| **Commands** | Actions that appear in the command palette and can be bound to keybindings |
| **Menus** | Items in toolbars, context menus, and the sidebar navigation |
| **Panels** | Full HTML/CSS/JS UI panels embedded in the workspace |
| **Settings** | User-configurable preferences with their own UI controls |
| **Hooks** | Event handlers that react to 24 lifecycle events (session start, tool use, etc.) |
| **Tools** | Custom tools the AI can call during a session |
| **Providers** | Additional LLM providers with their own model lists |

## Extensions vs. Plugins

Lunaria has two extensibility systems:

| | Extensions | Plugins |
|---|---|---|
| **Format** | Single `.luna` binary file | Directory with `manifest.json` |
| **Install** | Drag-and-drop or deeplink | Copied to plugins directory |
| **Backend runtime** | Bun (optional) | Bun (required) |
| **UI panels** | Yes — embedded HTML | No |
| **Primary use** | UI features, panels, commands | Automation, hooks, backend logic |
| **Discovery** | Scanned from `extensions/` dir | Scanned from `plugins/` dir |

Use extensions when you need UI contributions (panels, menus, commands). Use plugins when you need persistent background logic or complex backend processing.

## The .luna Format

A `.luna` file is a compact binary bundle:

```
[4 bytes]  Magic: "LUNA" (0x4C554E41)
[4 bytes]  Format version: 1 (little-endian u32)
[4 bytes]  Manifest length in bytes (little-endian u32)
[N bytes]  Manifest JSON (UTF-8)
[4 bytes]  Asset count (little-endian u32)
  For each asset:
  [4 bytes]  Name length (little-endian u32)
  [N bytes]  Asset name (UTF-8, e.g. "panel.html")
  [4 bytes]  Data length (little-endian u32)
  [N bytes]  Asset bytes (raw)
```

All assets — HTML panels, icons, JavaScript — are embedded directly in the binary. There are no external file references at runtime.

See [luna-format.md](./luna-format.md) for the full binary spec and tooling.

## Minimal Extension Example

The smallest valid extension contributes one command:

**manifest.json** (before packaging):
```json
{
  "id": "com.example.hello",
  "name": "Hello World",
  "version": "1.0.0",
  "description": "A minimal example extension",
  "permissions": [],
  "activationEvents": ["onCommand:com.example.hello.greet"],
  "contributes": {
    "commands": [
      {
        "id": "com.example.hello.greet",
        "title": "Hello: Say Hello"
      }
    ]
  }
}
```

Package it:
```bash
lunaria-pack manifest.json --out hello.luna
```

Install it by dragging `hello.luna` into the Lunaria window, or via deeplink:
```
lunaria://extension/install?source=https://example.com/hello.luna
```

## Installation

Extensions can be installed three ways:

1. **Drag and drop** — Drop a `.luna` file onto the Lunaria window
2. **File path** — Via the Extensions settings panel, browse to a `.luna` file
3. **URL / deeplink** — `lunaria://extension/install?source=<url>` triggers a review prompt before installing

Installed extensions live in `~/.lunaria/extensions/<id>.luna`.

## Next Steps

- [Getting Started](./getting-started.md) — Build and package your first extension
- [Manifest Reference](./manifest.md) — Complete schema for all manifest fields
- [Contributions](./contributions.md) — Deep dive into every contribution type
- [.luna Format](./luna-format.md) — Binary format specification
- [Activation Events](./activation.md) — When and how extensions activate
- [Examples](./examples.md) — Complete working examples
