# Extensions

Extensions add functionality to Lunaria through a single `.luna` file that bundles a manifest and assets. Extensions can contribute commands, menu items, panels, settings, hooks, tools, and providers.

## Installing Extensions

### From the Desktop UI

1. Open the **Marketplace** page
2. Browse or search for an extension
3. Click **Install** and review the requested permissions
4. The extension activates immediately

### From the CLI

```bash
# Install from a local .luna file
lunaria extensions install /path/to/my-extension.luna

# List installed extensions
lunaria extensions list

# Enable/disable an extension
lunaria extensions toggle my-extension --enable
lunaria extensions toggle my-extension --disable

# Uninstall
lunaria extensions uninstall my-extension
```

### From a URL

Extensions can also be installed from a URL via the `ExtensionManager`:

```bash
lunaria extensions install-url https://example.com/my-extension.luna
```

## The .luna Format

A `.luna` file is a single binary bundle with the following structure:

```
+------+--------+-------------------+-----------+
| LUNA | v1     | Manifest (JSON)   | Assets    |
| 4B   | 4B LE  | 4B len + payload  | N entries |
+------+--------+-------------------+-----------+
```

### Binary Layout

| Offset | Size     | Description                                       |
| ------ | -------- | ------------------------------------------------- |
| 0      | 4 bytes  | Magic bytes: `LUNA` (0x4C554E41)                  |
| 4      | 4 bytes  | Format version (little-endian u32, = 1)           |
| 8      | 4 bytes  | Manifest length in bytes (LE u32)                 |
| 12     | N bytes  | Manifest JSON                                     |
| 12+N   | 4 bytes  | Asset count (LE u32)                              |
| ...    | variable | For each asset: name_len + name + data_len + data |

Each asset entry:

- 4 bytes: name length (LE u32)
- N bytes: name (UTF-8 string, e.g. `"panel.html"`)
- 4 bytes: data length (LE u32)
- M bytes: raw data

The parser is implemented in `apps/desktop/src-tauri/src/extensions/format.rs`.

## Extension Manifest

The manifest is a JSON object embedded in the `.luna` file:

```json
{
  "id": "my-publisher.my-extension",
  "name": "My Extension",
  "version": "1.0.0",
  "publisher": "my-publisher",
  "description": "A sample Lunaria extension",
  "icon": "icon.png",
  "permissions": ["read_files", "write_files"],
  "activationEvents": ["onSession"],
  "contributes": {
    "commands": [],
    "menus": {},
    "panels": [],
    "settings": [],
    "hooks": [],
    "tools": [],
    "providers": []
  },
  "backend": {
    "type": "wasm",
    "entry": "backend.wasm"
  }
}
```

### Required Fields

| Field              | Type       | Description                               |
| ------------------ | ---------- | ----------------------------------------- |
| `id`               | `string`   | Unique identifier (publisher.name format) |
| `name`             | `string`   | Human-readable display name               |
| `version`          | `string`   | Semver version string                     |
| `description`      | `string`   | Short description                         |
| `permissions`      | `string[]` | Requested permission scopes               |
| `activationEvents` | `string[]` | Events that trigger extension activation  |
| `contributes`      | `object`   | Contribution points (see below)           |

### Optional Fields

| Field       | Type     | Description                            |
| ----------- | -------- | -------------------------------------- |
| `publisher` | `string` | Publisher name                         |
| `icon`      | `string` | Asset name for the extension icon      |
| `backend`   | `object` | Backend entry point (`type` + `entry`) |

## Contribution Points

### Commands

Register commands that users can invoke from the Command Palette:

```json
{
  "commands": [
    {
      "id": "my-extension.formatCode",
      "title": "Format Code with My Formatter"
    }
  ]
}
```

### Menu Items

Add items to Lunaria's menus. Keys are menu location identifiers:

```json
{
  "menus": {
    "sidebar": [
      {
        "command": "my-extension.formatCode",
        "title": "Format",
        "icon": "format-icon.png"
      }
    ],
    "context": [
      {
        "panel": "my-extension.settingsPanel",
        "title": "Extension Settings"
      }
    ]
  }
}
```

Each menu item can reference either a `command` or a `panel`.

### Panels

Contribute UI panels rendered from HTML assets:

```json
{
  "panels": [
    {
      "id": "my-extension.dashboard",
      "entry": "dashboard.html",
      "title": "My Dashboard"
    }
  ]
}
```

The `entry` field references an asset name in the `.luna` bundle. The HTML is loaded and rendered within Lunaria's panel system.

### Settings

Expose configurable settings in the Settings page:

```json
{
  "settings": [
    {
      "id": "my-extension.autoFormat",
      "type": "boolean",
      "title": "Auto-format on save",
      "default": true
    },
    {
      "id": "my-extension.indentSize",
      "type": "number",
      "title": "Indent size",
      "default": 2
    }
  ]
}
```

Supported `type` values: `"boolean"`, `"string"`, `"number"`.

### Hooks

Register event handlers that run when specific events fire:

```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "handler": "on-session-start.js"
    },
    {
      "event": "PostToolUse",
      "handler": "after-tool.js"
    }
  ]
}
```

See the [Hook Engine documentation](../architecture/overview.md#hook-engine) for the full list of 23 supported event types.

### Tools

Provide custom tools that agents can invoke:

```json
{
  "tools": [
    {
      "name": "my-extension.lint",
      "description": "Run linter on the current file",
      "handler": "lint-tool.js",
      "inputSchema": {
        "type": "object",
        "properties": {
          "filePath": { "type": "string" }
        },
        "required": ["filePath"]
      }
    }
  ]
}
```

### Providers

Register custom AI providers:

```json
{
  "providers": [
    {
      "id": "my-extension.localLlama",
      "name": "Local Llama",
      "handler": "llama-provider.js"
    }
  ]
}
```

## Activation Events

Extensions are activated lazily based on their `activationEvents`:

| Event            | Trigger                       |
| ---------------- | ----------------------------- |
| `onSession`      | Any session starts            |
| `onCommand:<id>` | A specific command is invoked |
| `onCommand:*`    | Any command is invoked        |

Wildcard matching is supported: `onCommand:my-ext.*` matches `onCommand:my-ext.format`.

## Permissions

Extensions declare the permissions they need. Users review these before installation:

| Permission    | Grants                          |
| ------------- | ------------------------------- |
| `read_files`  | Read files in the workspace     |
| `write_files` | Create and modify files         |
| `execute`     | Run shell commands              |
| `network`     | Make HTTP requests              |
| `settings`    | Read and write Lunaria settings |
| `memory`      | Access the memory system        |

## Viewing Contributions

See all active contributions from enabled extensions:

```bash
lunaria extensions contributions
```

This returns the aggregated commands, menu items, panels, settings, hooks, tools, and providers from all enabled extensions.

## Building a .luna File

To create a `.luna` file programmatically, use the `LunaBundle` API from the Rust crate:

```rust
use lunaria_desktop::extensions::format::{LunaBundle, ExtensionManifest};

let bundle = LunaBundle {
    manifest: ExtensionManifest { /* ... */ },
    assets: HashMap::from([
        ("panel.html".into(), html_bytes),
        ("icon.png".into(), icon_bytes),
    ]),
};

bundle.write(Path::new("my-extension.luna"))?;
```

Or build one manually by writing the binary format described above.
