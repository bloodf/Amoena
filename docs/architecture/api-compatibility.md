# API Compatibility Layer

## Scope

This document defines Lunaria's drop-in API compatibility layer — a set of Axum route groups that expose OpenAI, Anthropic, and Ollama-compatible HTTP endpoints on the existing local server. Any application that speaks one of these provider APIs can use Lunaria as its backend without modification. All requests are routed through the provider registry to whichever upstream provider the user has configured.

**Priority**: V1.0

## Motivation

Desktop AI tools, editor extensions, and CLI utilities increasingly expect an OpenAI-compatible local endpoint. By exposing provider-native API surfaces, Lunaria becomes a **local AI gateway** — a single entry point that routes, translates, and augments AI traffic for every tool on the machine. This removes the need for per-tool API key management and enables future capabilities like memory injection, request logging, and cost tracking across all local AI consumers.

## Supported Endpoints

### OpenAI-Compatible

| Method | Path | OpenAI Equivalent | Notes |
|--------|------|-------------------|-------|
| `POST` | `/v1/chat/completions` | Chat Completions | Streaming (SSE) and non-streaming |
| `GET` | `/v1/models` | List Models | Aggregated from all configured providers |
| `POST` | `/v1/embeddings` | Embeddings | Routes to configured embedding provider |

### Anthropic-Compatible

| Method | Path | Anthropic Equivalent | Notes |
|--------|------|----------------------|-------|
| `POST` | `/anthropic/v1/messages` | Messages | Streaming (SSE) and non-streaming |

### Ollama-Compatible

| Method | Path | Ollama Equivalent | Notes |
|--------|------|-------------------|-------|
| `POST` | `/api/chat` | Chat | Streaming (NDJSON) and non-streaming |
| `POST` | `/api/generate` | Generate | Single-turn completion |
| `GET` | `/api/tags` | List Models | Returns all available models in Ollama format |

All path prefixes are supported where applicable (`/v1`, `/api`, `/v1/api`) for maximum client compatibility.

## Request Routing

### Flow

```
Incoming HTTP Request
       │
       ▼
┌─────────────────────┐
│  Identify API Format │  (OpenAI / Anthropic / Ollama based on path prefix)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Request Translator  │  (Normalize to internal ChatRequest)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Model Resolver      │  (Map external model name → provider + model)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Provider Registry   │  (Route to configured upstream provider)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Response Translator │  (Convert internal response → caller's expected format)
└──────────┬──────────┘
           │
           ▼
      HTTP Response
```

### Model Mapping

Callers use the model names they expect (e.g. `gpt-4o`, `claude-sonnet-4-20250514`, `llama3`). Lunaria resolves these through a two-step process:

1. **Alias table**: explicit user-defined mappings from external model names to internal provider + model pairs.
2. **Provider registry fallback**: if no alias exists, the provider registry attempts to match the model name against all configured providers.

If no match is found, the server returns the appropriate error format for the caller's API (e.g. OpenAI `model_not_found`, Anthropic `not_found_error`).

### Streaming Protocols

| API Format | Streaming Transport | Content Type |
|------------|-------------------|--------------|
| OpenAI | SSE (`data: {...}\n\n`) | `text/event-stream` |
| Anthropic | SSE (`event: ...\ndata: {...}\n\n`) | `text/event-stream` |
| Ollama | NDJSON (one JSON object per line) | `application/x-ndjson` |

## Feature Support

| Feature | OpenAI | Anthropic | Ollama |
|---------|--------|-----------|--------|
| Chat completions | ✓ | ✓ | ✓ |
| Streaming | ✓ (SSE) | ✓ (SSE) | ✓ (NDJSON) |
| Function/tool calling | ✓ | ✓ | ✓ |
| Streaming tool call deltas | ✓ | ✓ | — |
| Multi-turn conversations | ✓ | ✓ | ✓ |
| System messages | ✓ | ✓ (system param) | ✓ |
| Embeddings | ✓ | — | — |
| Model listing | ✓ | — | ✓ |

## Architecture

### Axum Integration

The compatibility layer is mounted as route groups on the existing Axum server. No separate port or process is required.

```rust
// Conceptual route mounting — actual impl may vary
let app = existing_router
    .nest("/v1", openai_routes())
    .nest("/anthropic/v1", anthropic_routes())
    .nest("/api", ollama_routes());
```

### Components

| Component | Responsibility |
|-----------|---------------|
| `OpenAiTranslator` | Parse OpenAI request format, produce OpenAI response/SSE chunks |
| `AnthropicTranslator` | Parse Anthropic request format, produce Anthropic response/SSE events |
| `OllamaTranslator` | Parse Ollama request format, produce Ollama NDJSON lines |
| `ModelResolver` | Resolve external model names to internal provider + model via alias table and provider registry |
| `CompatAuthMiddleware` | Validate optional API key on incoming compatibility requests |

All translators share the same internal `ChatRequest` / `ChatResponse` types and route through the existing **Provider Manager** and **Provider Registry** in the Tauri main process. No provider logic is duplicated.

### Relationship to Existing Subsystems

```
┌──────────────────────────────────────────────────────────┐
│  Axum Server                                             │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  OpenAI       │  │  Anthropic   │  │  Ollama      │  │
│  │  Route Group  │  │  Route Group │  │  Route Group │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └────────┬────────┴────────┬────────┘           │
│                  │                 │                     │
│                  ▼                 ▼                     │
│         ┌──────────────┐  ┌──────────────┐              │
│         │ Model        │  │ Compat Auth  │              │
│         │ Resolver     │  │ Middleware   │              │
│         └──────┬───────┘  └──────────────┘              │
│                │                                         │
│                ▼                                         │
│  ┌─────────────────────────────────┐                     │
│  │  Provider Manager / Registry    │  (existing)         │
│  └─────────────────────────────────┘                     │
│                │                                         │
│                ▼                                         │
│  ┌─────────────────────────────────┐                     │
│  │  Bun Daemon (Vercel AI SDK v5)  │  (existing)         │
│  └─────────────────────────────────┘                     │
└──────────────────────────────────────────────────────────┘
```

## Configuration

Configuration lives in the global settings object managed by the Settings Manager.

```jsonc
{
  "apiCompat": {
    "enabled": true,
    "formats": {
      "openai": true,
      "anthropic": true,
      "ollama": true
    },
    "auth": {
      "requireApiKey": false,
      "apiKey": null           // generated on first enable if null
    },
    "modelAliases": {
      "gpt-4": { "provider": "anthropic", "model": "claude-sonnet-4-20250514" },
      "gpt-4o": { "provider": "openai", "model": "gpt-4o" },
      "llama3": { "provider": "ollama", "model": "llama3:latest" }
    }
  }
}
```

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `apiCompat.enabled` | `boolean` | `true` | Master toggle for all compatibility endpoints |
| `apiCompat.formats.<name>` | `boolean` | `true` | Enable/disable individual API format groups |
| `apiCompat.auth.requireApiKey` | `boolean` | `false` | Require `Authorization: Bearer <key>` on incoming requests |
| `apiCompat.auth.apiKey` | `string \| null` | `null` | API key for incoming requests; auto-generated on first enable |
| `apiCompat.modelAliases` | `Record<string, { provider, model }>` | `{}` | Explicit model name → provider mapping overrides |

The compatibility layer runs on the same port as the main Axum server. No separate port configuration is needed.

## Error Handling

Each translator produces errors in the caller's expected format:

| API Format | Error Shape |
|------------|------------|
| OpenAI | `{ "error": { "message": "...", "type": "...", "code": "..." } }` |
| Anthropic | `{ "type": "error", "error": { "type": "...", "message": "..." } }` |
| Ollama | `{ "error": "..." }` |

Provider-level errors (rate limits, auth failures, model not found) are translated to the appropriate status code and error type for the caller's API format.

## Use Cases

| Use Case | Description |
|----------|------------|
| Editor AI backends | Use Lunaria as the backend for VS Code Continue, Cursor-compatible extensions, or any editor that targets an OpenAI-compatible endpoint. |
| Local AI gateway | Route all local AI traffic through a single gateway with unified provider management, key rotation, and cost visibility. |
| Provider testing | Switch between providers without changing client configuration — update the model alias and the same endpoint returns responses from a different upstream. |
| Memory injection (future) | Intercept API calls and inject relevant memory context before forwarding to the upstream provider. |
| Request logging (future) | Log all AI API traffic for debugging, cost tracking, and audit purposes. |

## Security Considerations

- The compatibility endpoints are **localhost-only** by default, bound to `127.0.0.1`.
- Optional API key auth prevents unauthorized local processes from consuming provider quota.
- When remote access is enabled, compatibility endpoints are **not** exposed through the remote relay unless explicitly configured.
- Model alias resolution never leaks upstream API keys to callers.

## Related Documents

| Document | Relationship |
|----------|-------------|
| [system-architecture.md](system-architecture.md) | Axum server process model and REST surface that this layer extends. |
| [agent-backend-interface.md](agent-backend-interface.md) | Provider abstraction and registry that this layer routes through. |
| [remote-control-protocol.md](remote-control-protocol.md) | Remote access model; compatibility endpoints are isolated from remote relay by default. |
| [implementation-roadmap.md](implementation-roadmap.md) | V1.0 delivery target for this feature. |

*Last updated: 2025-07-18*
