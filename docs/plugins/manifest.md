# Manifest Reference

Every plugin must include a `manifest.json` file at the root of its directory. This file describes the plugin's identity, capabilities, and required permissions. Lunaria validates the manifest on install and on every startup scan.

## Minimal Manifest

```json
{
  "id": "com.example.my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "main": "main.js"
}
```

These four fields are required. Everything else is optional.

## Complete Schema

```json
{
  "id": "com.example.my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "A short description shown in Settings → Plugins",
  "main": "main.js",
  "permissions": [
    "sessions.read",
    "sessions.write",
    "files.read",
    "files.write",
    "network",
    "shell"
  ],
  "activationEvents": [
    "onSession",
    "PreToolUse",
    "PostToolUse"
  ],
  "divisionAffinity": ["*"],
  "handlerType": "Command",
  "manifestUrl": "https://example.com/my-plugin/manifest.json",
  "homepageUrl": "https://example.com/my-plugin",
  "repository": "https://github.com/example/my-plugin"
}
```

## Field Reference

### `id` — required

**Type:** `string`

Reverse-domain identifier. Must be unique across all installed plugins. Used as the stable identifier in the database and in deeplink URLs.

```json
"id": "com.example.my-plugin"
```

Convention: use `com.yourname.plugin-name` or `io.github.yourhandle.plugin-name`.

---

### `name` — required

**Type:** `string`

Human-readable plugin name shown in Settings → Plugins.

```json
"name": "Slack Notifier"
```

---

### `version` — required

**Type:** `string`

Semantic version string. Informational only — Lunaria does not enforce upgrade ordering.

```json
"version": "1.2.0"
```

---

### `main` — required

**Type:** `string`

Path to the plugin entry point, relative to the manifest directory. Bun executes this file for every hook invocation.

```json
"main": "main.js"
```

You can use TypeScript directly:

```json
"main": "src/index.ts"
```

---

### `author`

**Type:** `string`

Author name or contact. Displayed in Settings → Plugins.

```json
"author": "Your Name <you@example.com>"
```

---

### `description`

**Type:** `string`

One or two sentences describing what the plugin does. Shown in Settings → Plugins and in the install review dialog.

---

### `permissions`

**Type:** `string[]`

Capabilities the plugin requires. Plugins only receive hook calls for events relevant to their declared permissions. Declaring a permission does not grant access to an API — it signals intent and enables the install review dialog to show a warning.

| Permission | Grants |
|-----------|--------|
| `sessions.read` | Access to session IDs, metadata, and tool results |
| `sessions.write` | Ability to inject messages or modify session state |
| `files.read` | Read file paths and contents from payloads |
| `files.write` | Write access to workspace files |
| `network` | Plugin makes outbound HTTP calls |
| `shell` | Plugin spawns child processes |

```json
"permissions": ["sessions.read", "network"]
```

If `permissions` is omitted, the plugin is treated as requesting no special capabilities.

---

### `activationEvents`

**Type:** `string[]`

List of hook event names that activate this plugin. Only events in this list will cause Lunaria to invoke the plugin. If omitted, defaults to `[]` (plugin receives no calls).

```json
"activationEvents": ["SessionStart", "PreToolUse", "PostToolUse"]
```

Use the special value `"*"` to receive all events (not recommended for production):

```json
"activationEvents": ["*"]
```

See [Hooks Reference](./hooks.md) for all 24 event names.

---

### `divisionAffinity`

**Type:** `string[]`

List of workspace division names this plugin is active in. Defaults to `["*"]` (all divisions).

```json
"divisionAffinity": ["backend", "devops"]
```

Divisions correspond to workspace context labels configured in Lunaria's workspace settings.

---

### `handlerType`

**Type:** `"Command" | "Http" | "Prompt" | "Agent"`

Declares the primary execution pattern of the plugin. Used for display purposes and future routing logic. Defaults to `"Command"`.

| Value | Use case |
|-------|---------|
| `"Command"` | Executes logic and returns a result (most common) |
| `"Http"` | Makes outbound HTTP calls as its primary action |
| `"Prompt"` | Processes or transforms prompt text |
| `"Agent"` | Spawns or coordinates sub-agents |

---

### `manifestUrl`

**Type:** `string` (HTTPS URL)

Public URL where the canonical manifest can be fetched. Required for **trusted** deeplink installations. Must be HTTPS.

```json
"manifestUrl": "https://example.com/my-plugin/manifest.json"
```

---

### `homepageUrl`

**Type:** `string` (URL)

Link to the plugin's documentation or homepage. Shown as a link in Settings → Plugins.

---

### `repository`

**Type:** `string` (URL)

Source code repository URL. Displayed in the install review dialog.

## Validation Rules

Lunaria rejects manifests that:
- Are missing any required field (`id`, `name`, `version`, `main`)
- Have an `id` that is not a non-empty string
- Have a `main` path that does not exist in the plugin directory
- Contain duplicate `id` values with another installed plugin (second one is skipped)
- Are not valid JSON

Rejected manifests are logged to Help → Developer Logs with a reason.

## Example: Notification Plugin

```json
{
  "id": "com.example.slack-notifier",
  "name": "Slack Notifier",
  "version": "2.0.1",
  "author": "Example Corp",
  "description": "Posts a Slack message when a session ends or a tool fails.",
  "main": "src/index.ts",
  "permissions": ["sessions.read", "network"],
  "activationEvents": ["SessionEnd", "PostToolUseFailure"],
  "divisionAffinity": ["*"],
  "handlerType": "Http",
  "manifestUrl": "https://example.com/slack-notifier/manifest.json",
  "homepageUrl": "https://example.com/slack-notifier",
  "repository": "https://github.com/example/slack-notifier"
}
```

## Example: Code Quality Agent Plugin

```json
{
  "id": "io.github.myhandle.code-quality",
  "name": "Code Quality Checker",
  "version": "1.0.0",
  "author": "myhandle",
  "description": "Runs linters and type checks after every tool use that modifies files.",
  "main": "index.js",
  "permissions": ["sessions.read", "files.read", "shell"],
  "activationEvents": ["PostToolUse"],
  "divisionAffinity": ["frontend", "backend"],
  "handlerType": "Command"
}
```

## Next Steps

- [Creating a Plugin](./creating.md) — Step-by-step guide
- [Plugin Lifecycle](./lifecycle.md) — Install, activate, execute, uninstall
- [Hooks Reference](./hooks.md) — All 24 events with payload schemas
