# Plugins API

Plugins are runtime-loaded modules that extend Lunaria's core capabilities. Unlike extensions (which contribute UI and tools), plugins operate at the system level and can provide new AI providers, tool backends, and system integrations.

Plugins are installed from deeplink URLs and can be toggled, executed, and health-checked independently.

---

## List Plugins

Returns all installed plugins.

```
GET /api/v1/plugins
Authorization: Bearer <token>
```

**Response `200`**

```json
[
  {
    "id": "openai-provider",
    "name": "OpenAI Provider Plugin",
    "version": "2.1.0",
    "enabled": true
  },
  {
    "id": "tavily-search",
    "name": "Tavily Web Search",
    "version": "1.0.3",
    "enabled": false
  }
]
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/plugins \
  -H "Authorization: Bearer $TOKEN"
```

---

## Install Plugin

Installs a plugin from a deeplink URL.

```
POST /api/v1/plugins/install
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "deeplinkUrl": "lunaria://plugins/install?id=tavily-search&version=1.0.3&source=https://plugins.lunaria.app"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deeplinkUrl` | `string` | Yes | Plugin deeplink URL |

**Response `200`** — Installed plugin record

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/plugins/install \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deeplinkUrl": "lunaria://plugins/install?id=tavily-search"}'
```

**TypeScript**

```typescript
await client.installPlugin({ url: "lunaria://plugins/install?id=tavily-search" });
```

---

## Uninstall Plugin

Removes a plugin.

```
DELETE /api/v1/plugins/{pluginId}
Authorization: Bearer <token>
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `pluginId` | Plugin ID |

**Response `204`** — No content

**curl**

```bash
curl -X DELETE http://127.0.0.1:PORT/api/v1/plugins/tavily-search \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
await client.uninstallPlugin(pluginId);
```

---

## Toggle Plugin

Enables or disables a plugin.

```
POST /api/v1/plugins/{pluginId}
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "enabled": true
}
```

**Response `200`** — Updated plugin record

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/plugins/tavily-search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

---

## Execute Plugin Action

Invokes a plugin hook/action with an optional payload.

```
POST /api/v1/plugins/{pluginId}/execute
Authorization: Bearer <token>
Content-Type: application/json
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `pluginId` | Plugin ID |

**Request body**

```json
{
  "hook": "search",
  "payload": {
    "query": "latest Rust async patterns",
    "maxResults": 5
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hook` | `string` | Yes | Hook/action name to invoke |
| `payload` | `object` | No | Action-specific input data |

**Response `200`** — Plugin-defined response

```json
{
  "results": [
    {
      "title": "Async Rust Book",
      "url": "https://rust-lang.github.io/async-book/",
      "snippet": "..."
    }
  ]
}
```

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/plugins/tavily-search/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hook": "search", "payload": {"query": "Rust async"}}'
```

**TypeScript**

```typescript
const result = await client.executePlugin(pluginId, {
  action: "search",
  args: { query: "Rust async patterns" },
});
```

---

## Plugin Health Check

Returns the health status of a plugin. Useful for diagnosing installation or connectivity issues.

```
GET /api/v1/plugins/{pluginId}/health
Authorization: Bearer <token>
```

**Response `200`**

```json
{
  "pluginId": "tavily-search",
  "status": "healthy",
  "version": "1.0.3"
}
```

| Status | Description |
|--------|-------------|
| `healthy` | Plugin is running normally |
| `degraded` | Plugin is functional but with reduced capabilities |
| `unhealthy` | Plugin has errors and may not function correctly |

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/plugins/tavily-search/health \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
const health = await client.pluginHealth(pluginId);
if (health.status !== "healthy") {
  console.warn(`Plugin ${pluginId} is ${health.status}`);
}
```

---

## Install Review

Parses a plugin install deeplink and returns review information before committing to the install. Use this to show users a confirmation dialog.

```
POST /api/v1/plugins/install-review
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "deeplink": "lunaria://plugins/install?id=tavily-search&version=1.0.3"
}
```

**Response `200`** — Plugin metadata extracted from the deeplink, including name, permissions, and version
