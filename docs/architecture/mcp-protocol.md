# MCP Protocol Support

## Scope

This document defines Lunaria's integration with the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) as both a **server** (exposing Lunaria's agents, tools, and resources to external MCP clients) and a **client** (aggregating tools from remote MCP servers into Lunaria's agent loop). MCP support enables ecosystem interoperability with Cursor, Claude Desktop, VS Code, Windsurf, and any other MCP-compatible tool.

**Priority:** V1.0 (server), V1.5 (client), V2.0 (WebSocket transport).

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         Lunaria Desktop App                              │
│                                                                          │
│  ┌──────────────────────┐    ┌─────────────────────────────────────────┐ │
│  │  MCP Server           │    │  Tauri Main Process — State Authority   │ │
│  │  (Axum route group)   │    │  (Rust)                                 │ │
│  │  ├─ stdio transport   │    │  ├─ Tool Executor                       │ │
│  │  ├─ SSE transport     │    │  ├─ Agent Orchestrator                  │ │
│  │  └─ WebSocket (V2.0)  │    │  ├─ Session Manager                    │ │
│  └───────┬───────────────┘    │  ├─ Memory Manager                     │ │
│          │ delegates to       │  ├─ MCP Client Manager  ◄── new        │ │
│          ▼                    │  └─ Tool Manager (aggregated tools)     │ │
│  ┌───────────────────────┐    └──────┬─────────────────────────────────┘ │
│  │  Core Managers         │           │                                   │
│  │  (same as system-arch) │           │ MCP client connections            │
│  └────────────────────────┘           ▼                                   │
│                              ┌────────────────────────────┐              │
│                              │  Remote MCP Servers          │              │
│                              │  ├─ Database MCP server      │              │
│                              │  ├─ API MCP server           │              │
│                              │  └─ Custom tool servers      │              │
│                              └────────────────────────────┘              │
└──────────────────────────────────────────────────────────────────────────┘
         ▲ stdio / SSE / WebSocket
         │
    ┌────┴────────────────────────────┐
    │  External MCP Clients            │
    │  Cursor │ Claude Desktop │ VS Code│
    └─────────────────────────────────┘
```

## MCP Server Mode

Lunaria exposes its agents, tools, and resources as an MCP server so that external clients can invoke them without switching context.

### Transports

| Transport | Target | Endpoint | Phase |
|-----------|--------|----------|-------|
| stdio | Local editor integration (Cursor, VS Code) | Launched as child process by client | V1.0 |
| SSE | Web clients, remote MCP clients | `GET /mcp/sse` on Axum server | V1.0 |
| WebSocket | Persistent bidirectional connections | `ws://127.0.0.1:{port}/mcp/ws` | V2.0 |

The SSE and WebSocket transports are mounted as an **Axum route group** on the existing remote access server. When remote access is disabled, the MCP server can still be activated independently in settings for localhost-only access.

### Exposed Capabilities

#### Tools

Lunaria tool definitions are mapped to MCP tool schema at registration time. The mapping is deterministic and lossless.

```rust
/// Lunaria tool definition → MCP tool schema mapping
pub struct McpToolMapping {
    /// Lunaria tool name (e.g., "file_read", "shell_exec")
    pub lunaria_name: String,
    /// MCP tool name (namespaced: "lunaria.file_read")
    pub mcp_name: String,
    /// JSON Schema for tool input parameters
    pub input_schema: serde_json::Value,
    /// Human-readable description for client tool palettes
    pub description: String,
}
```

Exposed tools include all Tool Executor registered tools:

| Tool Category | Examples | MCP Name Prefix |
|---------------|----------|-----------------|
| File operations | read, write, search, list | `lunaria.file.*` |
| Shell execution | exec, background | `lunaria.shell.*` |
| Git operations | status, diff, commit | `lunaria.git.*` |
| Memory | search, observe | `lunaria.memory.*` |
| Session | create, send, list | `lunaria.session.*` |
| Agent | spawn, delegate, status | `lunaria.agent.*` |

#### Resources

MCP resources expose read-only data that clients can reference in prompts.

| Resource URI | Description | MIME Type |
|--------------|-------------|-----------|
| `lunaria://sessions` | Active session list with metadata | `application/json` |
| `lunaria://sessions/{id}/history` | Message history for a session | `application/json` |
| `lunaria://memory/search?q={query}` | Memory observation search results | `application/json` |
| `lunaria://workspace/files` | Workspace file tree | `application/json` |
| `lunaria://workspace/files/{path}` | Individual file content | `text/plain` |
| `lunaria://agents/profiles` | Available agent profiles | `application/json` |

#### Prompts

Agent system prompts are exposed as MCP prompt templates, allowing external clients to reuse Lunaria's agent configurations.

| Prompt Name | Description | Arguments |
|-------------|-------------|-----------|
| `lunaria.agent.default` | Default agent system prompt | `workspace_path`, `context` |
| `lunaria.agent.code_review` | Code review agent prompt | `diff`, `language` |
| `lunaria.agent.planning` | Planning agent prompt | `task_description` |

### Tool Call Flow (Server Mode)

```
External Client (Cursor)
    │
    ├─ MCP tool_call: lunaria.file.read { path: "src/main.rs" }
    │
    ▼
MCP Server (Axum route)
    │
    ├─ Validate auth token
    ├─ Check permission model
    ├─ Map MCP tool name → Lunaria tool name
    │
    ▼
Tool Executor (Tauri main process)
    │
    ├─ Execute tool with permission checks
    ├─ Return result
    │
    ▼
MCP Server
    │
    └─ Return MCP tool_result to client
```

### Endpoint Compatibility

The MCP server listens on `http://127.0.0.1:{port}/mcp` by default. Clients configure this URL in their MCP server list. The port is the same Axum server port used for remote access (randomized per launch, persisted in settings for session continuity).

## MCP Client Mode

Lunaria aggregates tools from external MCP servers, making them available to agents in the native backend's tool loop.

### Connection Lifecycle

```
App Startup
    │
    ├─ Read MCP client config from settings
    ├─ For each configured server:
    │   ├─ Establish transport connection (stdio / SSE / WebSocket)
    │   ├─ Call tools/list to discover available tools
    │   ├─ Register tools in Tool Manager with server namespace
    │   └─ Subscribe to tool list change notifications
    │
    ▼
Runtime (agent loop)
    │
    ├─ Agent requests tool call → Tool Manager resolves tool
    ├─ If tool is remote MCP:
    │   ├─ Forward call to remote server via MCP client
    │   └─ Return result to agent loop
    │
    ▼
Shutdown
    │
    └─ Graceful disconnect from all MCP servers
```

### Tool Discovery and Registration

Remote MCP tools are registered in the Tool Manager with a namespace prefix to avoid collisions with built-in tools:

| Source | Tool Name in Agent Context | Resolution |
|--------|---------------------------|------------|
| Built-in | `file_read` | Local Tool Executor |
| Remote MCP (db-server) | `mcp.db-server.query` | Forward to remote MCP server |
| Remote MCP (api-server) | `mcp.api-server.fetch` | Forward to remote MCP server |

Agents see all tools (local and remote) in a unified tool list. The Tool Manager handles routing transparently.

### Client Configuration

MCP client connections are defined in the settings JSON config:

```jsonc
{
  "mcp": {
    "clients": [
      {
        "name": "db-server",
        "url": "http://localhost:5432/mcp",
        "transport": "sse",
        "auth": { "type": "api_key", "key_ref": "mcp.db-server.key" },
        "enabled": true
      },
      {
        "name": "github-tools",
        "command": "npx @modelcontextprotocol/server-github",
        "transport": "stdio",
        "auth": { "type": "env", "var": "GITHUB_TOKEN" },
        "enabled": true
      }
    ]
  }
}
```

Key fields:

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Display name and namespace prefix for tools |
| `url` | `string?` | Server URL for SSE/WebSocket transports |
| `command` | `string?` | Command to spawn for stdio transport |
| `transport` | `"stdio" \| "sse" \| "websocket"` | Connection transport |
| `auth` | `object` | Auth configuration (see Auth section) |
| `enabled` | `bool` | Enable/disable without removing config |

## Integration Architecture

### Server: Axum Route Group

The MCP server is mounted as a nested route group on the existing Axum server:

```rust
// In Axum router setup
let app = Router::new()
    // Existing routes
    .nest("/sessions", session_routes())
    .nest("/providers", provider_routes())
    .nest("/memory", memory_routes())
    // MCP server routes
    .nest("/mcp", mcp_server_routes())
    .layer(auth_layer);
```

MCP server routes:

| Route | Method | Purpose |
|-------|--------|---------|
| `/mcp/sse` | `GET` | SSE transport endpoint |
| `/mcp/ws` | `GET` | WebSocket transport endpoint (V2.0) |
| `/mcp/health` | `GET` | Server health and capability advertisement |

The stdio transport does not use Axum routes — it runs as a separate binary entry point that the external client spawns as a child process.

### Client: MCP Client Manager

The MCP Client Manager is a new subsystem in the Tauri main process:

| Responsibility | Description |
|----------------|-------------|
| Connection pool | Maintains active connections to configured MCP servers |
| Tool registry | Registers remote tools in the Tool Manager with namespace prefixes |
| Health monitoring | Periodic health checks and automatic reconnection |
| Error isolation | A failing remote server does not crash the agent loop |

### Auth Model

| Method | Use Case | Phase |
|--------|----------|-------|
| API key (header) | Simple server-to-server auth | V1.0 |
| Environment variable | stdio servers inheriting process env | V1.0 |
| Cryptographic identity tokens | Zero-trust device identity | V2.0 |

Server mode: incoming MCP requests are validated against the same auth layer used by the remote access server. API keys are configured per-client in settings.

Client mode: outgoing MCP requests include auth credentials from the connection config. Secrets are stored in the OS keychain via Tauri's secure storage, referenced by `key_ref` in config.

### Rate Limiting and Permissions

**Server mode:**

- Rate limiting per client identity (token bucket, configurable in settings).
- Tool-level permission enforcement — the same permission model used for local tool calls applies to MCP tool calls.
- Read-only resources (`lunaria://` URIs) are not rate-limited.

**Client mode:**

- Per-agent MCP tool access control: agents can be restricted to specific remote MCP servers or specific tools.
- Timeout and retry policy per connection (default: 30s timeout, 3 retries with exponential backoff).
- Tool call results are size-bounded (default: 1MB) to prevent memory exhaustion.

## Configuration

### Settings Surface

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `mcp.server.enabled` | `bool` | `false` | Enable MCP server mode |
| `mcp.server.transports` | `string[]` | `["stdio", "sse"]` | Active server transports |
| `mcp.server.auth.required` | `bool` | `true` | Require auth for incoming MCP requests |
| `mcp.server.auth.keys` | `string[]` | `[]` | Allowed API keys (stored in keychain) |
| `mcp.server.rate_limit.rpm` | `number` | `600` | Requests per minute per client |
| `mcp.clients` | `McpClientConfig[]` | `[]` | List of remote MCP server connections |

### Per-Agent MCP Access Control

Agents can be granted or denied access to specific MCP tools:

```jsonc
{
  "agents": {
    "profiles": [
      {
        "name": "code-assistant",
        "mcp_access": {
          "allow": ["mcp.db-server.*", "mcp.github-tools.*"],
          "deny": ["mcp.db-server.drop_table"]
        }
      },
      {
        "name": "read-only-reviewer",
        "mcp_access": {
          "allow": ["mcp.github-tools.get_*"],
          "deny": ["mcp.*.*"]
        }
      }
    ]
  }
}
```

## Implementation Notes

### SDK Selection

| Language | Package | Use Case |
|----------|---------|----------|
| Rust | `mcp-rust-sdk` | MCP server (Axum integration), MCP client connection management |
| TypeScript | `@modelcontextprotocol/sdk` | Bun daemon MCP tool schema generation (if needed for AI SDK bridge) |

Prefer the Rust SDK for all server and client transport logic since the Tauri main process (Rust) is the state authority. The TypeScript SDK is only used if the Bun daemon needs to participate in MCP tool schema generation for the Vercel AI SDK tool loop.

### Phasing

| Phase | Scope | Depends On |
|-------|-------|------------|
| **V1.0** | MCP server: stdio + SSE transports. Expose tools, resources, and prompts. Auth via API key. | Axum server infrastructure, Tool Executor |
| **V1.5** | MCP client: tool discovery, registration, and forwarding. JSON config. Per-agent access control. | Tool Manager, MCP server (for testing) |
| **V2.0** | WebSocket transport (server + client). Cryptographic identity tokens. Bidirectional streaming. | V1.0 + V1.5 stable |

### Competitive Reference

Osaurus provides full MCP server and client with compatible drop-in endpoints at `http://127.0.0.1:1337` and support for all MCP transports. Lunaria's approach differs in two ways:

1. **Axum-native**: MCP routes are a first-class Axum route group, not a standalone server. This shares the existing auth, rate-limiting, and connection infrastructure.
2. **Rust-first**: Server and client logic live in the Tauri main process (Rust), keeping the state authority boundary clean. Osaurus uses a mixed Node/Rust approach.

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Mount MCP on existing Axum server | Reuse auth, TLS, rate limiting. Single port for all remote access. |
| Namespace remote tools with `mcp.{server}.{tool}` | Avoid name collisions, enable per-server access control. |
| stdio as a separate binary entry point | Clients expect to spawn the MCP server as a child process; Axum server lifecycle is independent. |
| Store secrets in OS keychain | Consistent with existing credential storage; no plaintext keys in config files. |
| Rust SDK for transport logic | State authority stays in Rust; avoids IPC round-trips for MCP protocol handling. |

## Related Documents

| Document | Relationship |
|----------|-------------|
| [system-architecture.md](system-architecture.md) | Process model and Axum server infrastructure that MCP routes are mounted on |
| [agent-backend-interface.md](agent-backend-interface.md) | Tool Executor and agent loop that MCP server exposes and MCP client feeds into |
| [plugin-framework.md](plugin-framework.md) | Plugin-provided tools may also be exposed via MCP server |
| [remote-control-protocol.md](remote-control-protocol.md) | Shared auth and transport infrastructure with remote access |
| [data-model.md](data-model.md) | Settings schema for MCP configuration |

*Last updated: 2025-07-18*
