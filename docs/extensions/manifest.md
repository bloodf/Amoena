# Extension Manifest Reference

Every `.luna` extension contains an embedded JSON manifest that declares its identity, permissions, activation conditions, and contributions. This page documents every field with types, defaults, and examples.

## Full Schema

```json
{
  "id": "com.example.my-extension",
  "name": "My Extension",
  "version": "1.0.0",
  "publisher": "Your Name or Org",
  "description": "What this extension does",
  "icon": "icon.png",
  "permissions": ["fs.read", "network"],
  "activationEvents": ["onSession", "onCommand:com.example.my-extension.run"],
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
    "type": "bun",
    "entry": "main.js"
  }
}
```

All fields use **camelCase** keys. The manifest is serialized as UTF-8 JSON.

---

## Top-Level Fields

### `id` (string, required)

A globally unique identifier in reverse-DNS notation.

```json
"id": "com.example.my-extension"
```

- Must be stable across versions — the ID is used as the filename (`<id>.luna`) in the extensions directory
- Lowercase letters, digits, hyphens, and dots only
- Examples: `"io.github.username.my-tool"`, `"com.company.product-name"`

---

### `name` (string, required)

Human-readable display name shown in the Extensions panel and command palette.

```json
"name": "My Extension"
```

- Keep it short (under 40 characters)
- Title case recommended

---

### `version` (string, required)

Semantic version string.

```json
"version": "1.0.0"
```

- Must follow [semver](https://semver.org): `MAJOR.MINOR.PATCH`
- Used to determine whether a reinstall should upgrade or replace

---

### `publisher` (string, optional)

Name of the author or organization publishing this extension.

```json
"publisher": "Acme Corp"
```

- Shown in the Extensions panel
- No format constraints

---

### `description` (string, required)

Short description of what the extension does.

```json
"description": "Adds a Git blame panel to the workspace sidebar"
```

- One to two sentences
- Shown in Extensions panel and installation dialogs

---

### `icon` (string, optional)

Asset name of the extension icon. Must be an asset embedded in the `.luna` bundle.

```json
"icon": "icon.png"
```

- Recommended size: 128×128 px PNG
- Used in the Extensions panel, menus, and sidebar

---

### `permissions` (array of string, required)

Capabilities this extension requires. The array may be empty (`[]`) if the extension has no privileged needs.

```json
"permissions": ["fs.read", "network", "sessions.read"]
```

All permissions must be declared upfront. Undeclared permissions will be denied at runtime.

#### Available Permissions

| Permission | Grants |
|---|---|
| `fs.read` | Read files in the workspace |
| `fs.write` | Write files in the workspace |
| `network` | Make outbound HTTP requests |
| `shell.execute` | Spawn shell processes |
| `notifications` | Send desktop notifications |
| `sessions.read` | Read session data (messages, metadata) |
| `sessions.write` | Create or modify sessions |
| `settings.read` | Read Lunaria settings |
| `settings.write` | Modify Lunaria settings |
| `agents.spawn` | Create sub-agents |
| `memory.observe` | Record memory observations |
| `memory.search` | Query the memory store |
| `hooks.register` | Register hook handlers at runtime |
| `tools.register` | Register custom AI tools at runtime |
| `providers.register` | Register LLM providers at runtime |

---

### `activationEvents` (array of string, required)

Conditions that trigger activation of this extension. An extension is only activated (its backend started, its hooks registered) when one of these events fires.

```json
"activationEvents": ["onSession", "onCommand:com.example.my-extension.run"]
```

#### Supported Activation Events

| Event | Fires when |
|---|---|
| `"onSession"` | Any session starts |
| `"onCommand:<commandId>"` | The specified command is invoked |
| `"onCommand:*"` | Any command contributed by this extension is invoked (wildcard) |

The wildcard `*` suffix is supported: `"onCommand:com.example.*"` matches any command whose ID starts with `com.example.`.

---

### `contributes` (object, required)

Declares what this extension contributes to Lunaria. All sub-fields are optional arrays/objects that default to empty.

See [Contributions](./contributions.md) for the complete reference for each type.

```json
"contributes": {
  "commands": [...],
  "menus": { "sidebar": [...], "context.session": [...] },
  "panels": [...],
  "settings": [...],
  "hooks": [...],
  "tools": [...],
  "providers": [...]
}
```

---

### `backend` (object, optional)

Declares a backend entry point. Required only if the extension needs to execute server-side logic (handle commands, process hook events, serve tool calls).

```json
"backend": {
  "type": "bun",
  "entry": "main.js"
}
```

#### `backend.type` (string)

The runtime for the backend process. Currently only `"bun"` is supported.

#### `backend.entry` (string)

Asset name of the entry point file embedded in the `.luna` bundle. This file is executed by Bun when the extension is activated.

The backend communicates with Lunaria via JSON-RPC over stdin/stdout. See [Getting Started](./getting-started.md) for a backend template.

---

## Validation Rules

The manifest is validated when the `.luna` file is loaded. A bundle that fails validation is logged as a warning and skipped — it does not crash the application.

| Rule | Error |
|---|---|
| `id` missing or empty | `failed to parse extension manifest` |
| `name` missing | Parse error |
| `version` missing | Parse error |
| `backend.entry` references a missing asset | Backend will fail to start at activation time |
| `contributes.panels[].entry` references a missing asset | Panel will fail to render |

---

## Complete Example

```json
{
  "id": "com.example.git-blame",
  "name": "Git Blame",
  "version": "2.1.0",
  "publisher": "Example Inc",
  "description": "Shows git blame annotations in a workspace panel",
  "icon": "icon.png",
  "permissions": ["fs.read", "shell.execute", "sessions.read"],
  "activationEvents": ["onSession", "onCommand:com.example.git-blame.show"],
  "contributes": {
    "commands": [
      {
        "id": "com.example.git-blame.show",
        "title": "Git Blame: Show Blame"
      }
    ],
    "menus": {
      "sidebar": [
        {
          "panel": "com.example.git-blame.panel",
          "title": "Git Blame",
          "icon": "icon.png"
        }
      ]
    },
    "panels": [
      {
        "id": "com.example.git-blame.panel",
        "title": "Git Blame",
        "entry": "panel.html"
      }
    ],
    "settings": [
      {
        "id": "com.example.git-blame.showAvatar",
        "type": "boolean",
        "title": "Show author avatars",
        "default": true
      }
    ]
  },
  "backend": {
    "type": "bun",
    "entry": "main.js"
  }
}
```
