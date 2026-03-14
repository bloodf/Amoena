# Extensions API

Extensions add capabilities to Lunaria via `.luna` packages. Each extension can contribute commands, menu items, UI panels, settings, hooks, tools, and providers. Extensions are loaded from the extensions directory and can be installed from a local path or a remote URL.

---

## List Extensions

Returns all installed extensions.

```
GET /api/v1/extensions
Authorization: Bearer <token>
```

**Response `200`**

```json
[
  {
    "id": "com.example.git-tools",
    "name": "Git Tools",
    "version": "1.2.0",
    "publisher": "Example Corp",
    "description": "Enhanced Git integration for Lunaria",
    "enabled": true,
    "permissions": ["filesystem.read", "shell.execute"]
  }
]
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/extensions \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
const extensions = await client.listExtensions();
```

---

## Install Extension

Installs an extension from a local file path or remote URL. The request uses `multipart/form-data` to upload a `.luna` file directly, or provides a `path`/`url` field.

```
POST /api/v1/extensions/install
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form fields**

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | The `.luna` extension archive |
| `path` | string | Absolute local path to a `.luna` file |
| `url` | string | Remote URL to download the extension from |

Provide either `file` (upload), `path` (local install), or `url` (remote install).

**Response `200`**

```json
{
  "id": "com.example.git-tools",
  "name": "Git Tools",
  "version": "1.2.0",
  "publisher": "Example Corp",
  "description": "Enhanced Git integration for Lunaria",
  "enabled": true,
  "permissions": ["filesystem.read", "shell.execute"]
}
```

**curl — file upload**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/extensions/install \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/extension.luna"
```

**curl — local path**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/extensions/install \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "/home/user/extensions/my-extension.luna"}'
```

**TypeScript — file upload**

```typescript
const formData = new FormData();
formData.append("file", file); // File object from <input type="file">
const ext = await client.installExtension(formData);
```

---

## Uninstall Extension

Removes an installed extension. Any contributions from the extension are immediately revoked.

```
DELETE /api/v1/extensions/{extId}
Authorization: Bearer <token>
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `extId` | Extension ID (e.g., `com.example.git-tools`) |

**Response `204`** — No content

**curl**

```bash
curl -X DELETE http://127.0.0.1:PORT/api/v1/extensions/com.example.git-tools \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
await client.uninstallExtension(extensionId);
```

---

## Toggle Extension

Enables or disables an extension without uninstalling it. Disabled extensions remain installed but their contributions are not active.

```
POST /api/v1/extensions/{extId}/toggle
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "enabled": false
}
```

**Response `204`** — No content

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/extensions/com.example.git-tools/toggle \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

**TypeScript**

```typescript
await client.toggleExtension(extensionId, false);
```

---

## Get Extension Contributions

Returns the aggregated contributions from all enabled extensions. This is the primary way to discover what commands, panels, and tools are available from extensions.

```
GET /api/v1/extensions/contributions
Authorization: Bearer <token>
```

**Response `200`**

```json
{
  "commands": [
    {
      "id": "git-tools.commit",
      "title": "Git: Commit All Changes",
      "shortcut": "Ctrl+Shift+C"
    }
  ],
  "menuItems": [],
  "panels": [
    {
      "id": "git-tools.timeline",
      "title": "Git Timeline",
      "location": "sidebar"
    }
  ],
  "settings": [
    {
      "key": "git-tools.defaultBranch",
      "type": "string",
      "default": "main"
    }
  ],
  "hooks": [],
  "tools": [],
  "providers": []
}
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/extensions/contributions \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
const contributions = await client.getExtensionContributions();
console.log(`${contributions.commands.length} commands available`);
```

---

## Get Extension Panel HTML

Returns the HTML content for a specific panel contributed by an extension. Used to render extension UI panels inside Lunaria's panel system.

```
GET /api/v1/extensions/{extId}/panels/{panelId}
Authorization: Bearer <token>
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `extId` | Extension ID |
| `panelId` | Panel ID as declared in the extension manifest |

**Response `200`** — `text/html` content of the panel

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/extensions/com.example.git-tools/panels/timeline \
  -H "Authorization: Bearer $TOKEN"
```

> **Extension format:** Extensions must be packaged as single `.luna` files (not zip archives). See the [Extensions Guide](../extensions/) for the manifest format and packaging instructions.
