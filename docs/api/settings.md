# Settings & Providers API

Settings control Lunaria's runtime behavior. Provider endpoints manage AI provider configurations and API keys.

---

## Settings

### Get Settings

Returns the current settings values.

```
GET /api/v1/settings
Authorization: Bearer <token>
```

**Response `200`**

```json
{
  "theme": "dark",
  "language": "en",
  "telemetryEnabled": false,
  "defaultProviderId": "anthropic",
  "defaultModelId": "claude-sonnet-4-5",
  "autopilotEnabled": false,
  "maxContextTokens": 100000,
  "remoteAccess": {
    "enabled": true,
    "lanEnabled": false
  }
}
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/settings \
  -H "Authorization: Bearer $TOKEN"
```

---

### Update Settings

Batch-updates one or more settings values. Only the keys provided are changed; all other settings remain unchanged.

```
POST /api/v1/settings
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "values": {
    "theme": "light",
    "defaultProviderId": "openai",
    "defaultModelId": "gpt-4o"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `values` | `object` | Yes | Key-value pairs of settings to update |

**Response `200`** — Updated settings object

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"values": {"theme": "light"}}'
```

---

## Providers

### List Providers

Returns all available AI providers from the provider registry.

```
GET /api/v1/providers
Authorization: Bearer <token>
```

**Response `200`**

```json
[
  {
    "id": "anthropic",
    "name": "Anthropic",
    "authenticated": true,
    "models": [
      {
        "id": "claude-opus-4-5",
        "name": "Claude Opus 4.5",
        "contextWindow": 200000,
        "supportsReasoning": true
      },
      {
        "id": "claude-sonnet-4-5",
        "name": "Claude Sonnet 4.5",
        "contextWindow": 200000,
        "supportsReasoning": false
      }
    ]
  },
  {
    "id": "openai",
    "name": "OpenAI",
    "authenticated": false,
    "models": []
  }
]
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/providers \
  -H "Authorization: Bearer $TOKEN"
```

---

### List Provider Models

Returns available models for a specific provider. Refreshes from the provider's model catalog.

```
GET /api/v1/providers/{providerId}/models
Authorization: Bearer <token>
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `providerId` | Provider ID (e.g., `anthropic`, `openai`) |

**Response `200`** — Array of model objects

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/providers/anthropic/models \
  -H "Authorization: Bearer $TOKEN"
```

---

### Set Provider API Key

Stores an API key for a provider. Keys are stored securely in the system keyring.

```
POST /api/v1/providers/{providerId}/auth
Authorization: Bearer <token>
Content-Type: application/json
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `providerId` | Provider ID |

**Request body**

```json
{
  "apiKey": "sk-ant-..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `apiKey` | `string` | Yes | The provider's API key |

**Response `200`**

```json
{ "ok": true }
```

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/providers/anthropic/auth \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "sk-ant-..."}'
```

---

### Update Reasoning Defaults

Sets the default reasoning mode and effort for a specific model.

```
POST /api/v1/providers/{providerId}/models/{modelId}/reasoning
Authorization: Bearer <token>
Content-Type: application/json
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `providerId` | Provider ID |
| `modelId` | Model ID |

**Request body**

```json
{
  "mode": "enabled",
  "effort": "high"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mode` | `string` | Yes | `"auto"`, `"enabled"`, `"disabled"` |
| `effort` | `string` | No | `"low"`, `"medium"`, `"high"` (only relevant when `mode` is `"enabled"`) |

**Response `200`**

```json
{ "ok": true }
```

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/providers/anthropic/models/claude-opus-4-5/reasoning \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "enabled", "effort": "high"}'
```

## Reasoning Modes

| Mode | Description |
|------|-------------|
| `auto` | The model decides whether to use extended reasoning |
| `enabled` | Extended reasoning is always on |
| `disabled` | Extended reasoning is never used |

## Reasoning Effort

| Effort | Description |
|--------|-------------|
| `low` | Minimal reasoning tokens (faster, cheaper) |
| `medium` | Balanced reasoning (default) |
| `high` | Maximum reasoning tokens (most thorough) |

> **Note:** Reasoning is only available on models that support it (e.g., Claude Opus 4.5, o1). Check `supportsReasoning` in the model listing.
