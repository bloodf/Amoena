# Providers

The provider system manages connections to AI model APIs. `ProviderRegistryService` maintains a registry of known providers and their available models, handles API key storage via the OS keychain, and exposes health and capability metadata used by the routing system.

## Supported Providers

| Provider ID | Type | Auth |
|---|---|---|
| `anthropic` | cloud | API key |
| `openai` | cloud | API key |
| `google` | cloud | API key / OAuth |
| `opencode` | cloud | API key |
| `local` | local | none |

Wrapper adapters extend the list with CLI-based providers:

| TUI Type | CLI Executable |
|---|---|
| `claude-code` | `claude` |
| `opencode` | `opencode` |
| `codex` | `codex` |
| `gemini` | `gemini` |

## Provider Record

```json
{
  "id": "anthropic",
  "name": "Anthropic",
  "npmPackage": "@anthropic-ai/sdk",
  "providerType": "cloud",
  "baseUrl": null,
  "authType": "apikey",
  "authStatus": "connected",
  "modelCount": 5,
  "lastRefreshedAt": "2026-03-14T09:00:00Z",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

`authStatus` reflects whether the provider currently has valid credentials:
- `connected` — valid API key present in keychain
- `disconnected` — no credentials stored
- `expired` — OAuth token has expired

## Provider Models

Each provider exposes its models with full capability metadata:

```json
{
  "providerId": "anthropic",
  "modelId": "claude-opus-4-5",
  "displayName": "Claude Opus 4.5",
  "contextWindow": 200000,
  "inputCostPerMillion": 15.00,
  "outputCostPerMillion": 75.00,
  "supportsVision": true,
  "supportsTools": true,
  "supportsReasoning": true,
  "reasoningModes": ["off", "auto", "on"],
  "reasoningEffortSupported": true,
  "reasoningEffortValues": ["low", "medium", "high"],
  "reasoningTokenBudgetSupported": false,
  "discoveredAt": "2026-01-01T00:00:00Z",
  "refreshedAt": "2026-03-14T09:00:00Z"
}
```

### Listing Models for a Provider

```http
GET /api/v1/providers/{id}/models
```

### Listing All Providers

```http
GET /api/v1/providers
```

## API Key Management

API keys are stored in and retrieved from the OS keychain — never in the SQLite database. The keychain service name is `"lunaria"` with the provider ID as the account:

```http
POST /api/v1/settings
{
  "key": "providers.anthropic.apiKey",
  "value": "sk-ant-...",
  "scope": "global"
}
```

Internally this triggers `KeyringSecretStore::set("anthropic", key)`. On retrieval the key is loaded from the keychain and passed to the Bun worker in memory for the duration of the request.

The provider's `authStatus` is updated to `connected` when a valid key is stored and to `disconnected` when deleted.

## Health Checks

Provider health is checked on demand and reflected in `authStatus`. A health check makes a minimal API call (e.g., list models) to verify the key is valid and the provider is reachable.

```http
POST /api/v1/providers/{id}/health
```

Response:

```json
{
  "providerId": "anthropic",
  "status": "connected",
  "latencyMs": 142,
  "checkedAt": "2026-03-14T10:00:00Z"
}
```

## Provider Capabilities

The `ProviderModelRecord` flags are used throughout the system:

| Field | Used By |
|---|---|
| `supportsReasoning` | Routing — selects reasoning-capable model for security/QA divisions |
| `supportsTools` | Worker — enables tool call parsing |
| `supportsVision` | Message construction — attaches image attachments |
| `reasoningEffortSupported` | Routing — passes effort parameter to worker |
| `reasoningTokenBudgetSupported` | Routing — passes token budget to worker |
| `contextWindow` | Compaction — triggers summarization near limit |

## Adding a New Cloud Provider

To add a new cloud provider:

1. Insert a `ProviderRecord` via the API or directly in the database
2. Add the provider's npm package to the Bun worker's dependencies
3. Implement a provider adapter in `apps/desktop/worker/providers/`
4. Register the adapter in the worker's provider registry

For a provider extension via `.luna` file, declare it in `contributes.providers`:

```json
{
  "contributes": {
    "providers": [
      {
        "id": "my-provider",
        "name": "My Provider",
        "handler": "src/provider.js"
      }
    ]
  }
}
```

The handler file exports an object conforming to the provider adapter interface, which the Bun worker dynamically loads.

## Provider Routing

Model selection for each AI turn is handled by `ProviderRoutingService`. See [Routing](routing.md) for full details. The short version:

```
RoutingRequest {
  providerId?,   // explicit override
  modelId?,      // explicit override
  taskType,      // e.g. "planning", "debugging", "small-rename"
  agentState,    // must be Active or Running
  reasoningMode?, reasoningEffort?,
  persona: {
    preferredModel?,  // from persona profile
    division,         // e.g. "security", "qa", "engineering"
    decisionWeight
  }
}
  ↓
RoutingDecision {
  providerId, modelId,
  reasoningMode, reasoningEffort,
  decisionWeight
}
```

Priority order for model selection:
1. Persona's `preferredModel` (if available in registry)
2. Explicit `modelId` + `providerId` from request
3. Reasoning-capable model for `security` or `qa` divisions
4. Any model from the requested `providerId`
5. First available model in the registry

## Usage Analytics

Every AI turn records token usage and cost:

```json
{
  "id": "...",
  "sessionId": "...",
  "provider": "anthropic",
  "model": "claude-opus-4-5",
  "inputTokens": 12450,
  "outputTokens": 3821,
  "cost": 0.4741,
  "timestamp": "2026-03-14T10:00:05Z"
}
```

Query usage:

```http
GET /api/v1/usage?from=2026-03-01&to=2026-03-14&provider=anthropic
```
