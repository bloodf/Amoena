# Agent Backend Interface

## Purpose

This document defines the backend architecture for Amoena's agent system. The design supports two modes: **wrapper backends** that delegate to external TUI/CLI runtimes, and a **native backend** powered by Amoena's own engine using the Vercel AI SDK. Both modes expose a unified adapter contract for session lifecycle, streaming I/O, tool execution, permission mediation, context management, and observability.

## Language Authority

**Rust structs are the source of truth for the IPC boundary.** TypeScript interfaces are generated from Rust types via `specta` and must not be maintained manually.

### Build Requirements

- `specta` must be listed in `Cargo.toml` with `features = ["typescript"]`.
- A dedicated test (`cargo test --test=generate-types`) regenerates TypeScript bindings from Rust structs.
- CI runs `generate-types` and fails if the generated `.ts` files differ from the committed versions.
- Type mismatches between Rust and TypeScript are a **hard build error**, not a recommendation.

### Workflow

1. Modify the Rust struct.
2. Run `cargo test --test=generate-types` locally.
3. Commit the updated `.ts` bindings alongside the Rust change.
4. CI verifies no drift between Rust and TypeScript.

The TypeScript definitions shown in this document are **generated output** — do not edit them by hand. To change a type, modify the Rust struct and regenerate.

---

## Native Backend

The native backend is Amoena's own agent engine. The Axum runtime owns session state, permissions, tools, and persistence, while a **persistent Bun daemon** (see Bun Daemon Architecture below) handles LLM provider calls through the Vercel AI SDK v5. Results are streamed back through Axum to connected clients over SSE.

### Vercel AI SDK v5 Integration

The native backend uses Vercel AI SDK v5 as its provider abstraction layer through the Bun worker boundary. The two primary entry points are:

- **`streamText()`** -- streaming completions with real-time token delivery. Used for interactive conversations where the user sees tokens as they arrive.
- **`generateText()`** -- single-shot completions for background tasks, tool-heavy workflows, or cases where the full response is needed before acting.

Both functions accept a unified `LanguageModel` interface, making the backend provider-agnostic at the call site.

### Provider Factory Pattern

Each LLM provider is instantiated through a factory function that returns a configured `LanguageModel`:

```ts
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { createMistral } from "@ai-sdk/mistral";

// Each factory returns a provider instance; call it with a model ID to get a LanguageModel.
const anthropic = createAnthropic({ apiKey: resolvedKey });
const model = anthropic("claude-sonnet-4-20250514");

// Usage is identical regardless of provider:
const result = await streamText({ model, messages, tools });
```

New providers are added by installing the corresponding `@ai-sdk/*` package and registering the factory. No changes to core orchestration logic are required.

### Streaming Architecture

The native backend streams responses to clients (desktop, web, mobile) via Server-Sent Events (SSE):

```
Client <--SSE-- Amoena Server <--IPC--> Bun Daemon <--streamText()-- LLM Provider
                     |
                     +--> Tool execution (local)
                     +--> Context management
                     +--> Permission checks
```

SSE event types:

| Event | Payload | Description |
|-------|---------|-------------|
| `token` | `{ text: string }` | Incremental text chunk from the model |
| `tool_call` | `{ id, name, args }` | Model requests tool execution |
| `tool_result` | `{ id, result }` | Tool execution completed |
| `control_request` | `{ requestId, reason }` | Permission approval needed |
| `usage` | `{ promptTokens, completionTokens }` | Token usage for the turn |
| `error` | `{ message, retryable }` | Error during generation |
| `done` | `{}` | Stream complete |

### Bun Daemon Architecture

The native backend delegates LLM provider calls to a **persistent Bun daemon** rather than spawning per-call subprocesses.

#### Lifecycle

| Event | Behavior |
|-------|----------|
| App startup | Tauri main process spawns a single Bun daemon |
| Communication | JSON-RPC 2.0 over Unix socket (macOS/Linux) or named pipe (Windows) |
| State | Holds session streaming state: active context, tool results in flight, token counts |
| Crash recovery | Watchdog restarts the daemon automatically; in-flight streams receive an error event |
| App shutdown | Graceful shutdown signal; daemon exits after draining active streams |

#### Why Persistent Daemon

- **Lower latency:** No process startup cost per LLM call (~200ms saved per interaction).
- **State locality:** Active streaming sessions don't need to be serialized/deserialized between calls.
- **Resource efficiency:** Single V8 isolate vs. repeated cold starts.

#### Phase 0 Spike

Phase 0 must validate this architecture by measuring:
- Daemon startup time and steady-state memory overhead
- JSON-RPC round-trip latency vs. per-call subprocess spawn
- Crash recovery time and stream reconnection behavior

If the daemon approach proves problematic (e.g., memory leaks, platform issues), fall back to per-call subprocess spawning with state held in the Rust process.

The Axum server communicates with the Bun daemon through a typed JSON-RPC contract:

| Method | Direction | Description |
|--------|-----------|-------------|
| `stream.start` | Axum → Bun | Start streaming generation for a session |
| `stream.cancel` | Axum → Bun | Cancel active generation |
| `stream.token` | Bun → Axum | Incremental token delivery |
| `stream.tool_call` | Bun → Axum | Tool call request from model |
| `stream.done` | Bun → Axum | Generation complete |
| `embed.generate` | Axum → Bun | Generate embeddings for memory |

### Tool Calling Protocol

The native backend implements the Vercel AI SDK tool calling loop:

1. Model emits `tool_call` events during generation.
2. Backend validates the call against permission rules (see Permission Model).
3. If approved, backend executes the tool and returns the result.
4. Result is fed back to the model as a `tool` message for the next generation step.
5. Loop continues until the model produces a final text response with no tool calls.

Multi-step tool use (agent loops) are bounded by a configurable `maxSteps` parameter (default: 25).

---

## Wrapper Backends

Wrapper backends delegate to external TUI/CLI runtimes. They translate between Amoena's unified adapter contract and the specific transport/protocol of each runtime.

### Supported Runtimes

| Runtime | Transport | API Style | PTY Fallback |
|---------|-----------|-----------|--------------|
| Claude Code | WebSocket (`--sdk-url`) | Bidirectional events | No |
| OpenCode | REST + SSE (`opencode serve`) | REST control + SSE stream | No |
| Codex CLI | JSON-RPC 2.0 (`codex app-server`) | Request/response + notifications | No |
| Gemini CLI | PTY (`-o stream-json`) | Structured output parsing | Yes |
| Native Runtime | IPC to Bun worker + HTTP provider calls | Request/response + SSE stream | No |

### Adapter Contract

All backends (native and wrapper) implement the same trait:

```rust
pub trait AgentBackend {
    fn start_session(&mut self, config: SessionConfig) -> anyhow::Result<Session>;
    fn send_message(
        &mut self,
        session_id: &str,
        message: Message,
    ) -> anyhow::Result<Box<dyn Iterator<Item = StreamEvent>>>;
    fn get_status(&self, session_id: &str) -> SessionStatus;
    fn stop_session(&mut self, session_id: &str) -> anyhow::Result<()>;
    fn get_capabilities(&self) -> BackendCapabilities;

    fn on_permission_request(
        &mut self,
        handler: Box<dyn Fn(PermissionRequest) -> bool + Send + Sync>,
    );
    fn approve(&mut self, request_id: &str) -> anyhow::Result<()>;
    fn deny(&mut self, request_id: &str, reason: Option<&str>) -> anyhow::Result<()>;

    fn attach_file(&mut self, session_id: &str, input: FileInput) -> anyhow::Result<()>;
    fn attach_image(&mut self, session_id: &str, input: ImageInput) -> anyhow::Result<()>;
    fn attach_audio(&mut self, session_id: &str, input: AudioInput) -> anyhow::Result<()>;

    fn subscribe_observability(
        &mut self,
        session_id: &str,
    ) -> anyhow::Result<Box<dyn Iterator<Item = ObservabilityEvent>>>;
    fn collect_usage(&self, session_id: &str) -> anyhow::Result<UsageSnapshot>;
}
```

In addition to raw file/image/audio attachments, user turns may include structured context references:

```ts
interface ContextReference {
  type: "file_ref" | "folder_ref";
  name: string;
  path: string;
  status?: "modified" | "added" | "deleted" | "renamed";
  previewSnippet?: string;
  itemCount?: number;
  truncated?: boolean;
  inferredTypes?: string[];
}
```

These references are passed through the session contract as first-class context objects. The model sees the reference summary first; full file content is fetched later through tool execution when needed.

### Claude Code Adapter

- Transport: WebSocket SDK endpoint via `--sdk-url` for bidirectional control.
- Event model: `user_message`, `control_request`, and `mcp_*` command events mapped to `StreamEvent`.
- Permissions: surface `control_request` events into `onPermissionRequest`, then call `approve`/`deny`.
- Hooks: normalize Claude Code hooks system (17 events) into `ObservabilityEvent` with hook name as `name`.
- Telemetry: ingest OTEL spans/metrics where enabled and correlate by `sessionId`.
- Usage: aggregate provider usage plus local run metadata into `UsageSnapshot`.

### OpenCode Adapter

- Transport: REST API from `opencode serve` for control plane operations.
- Streaming: SSE stream consumption for incremental `token`, tool, and lifecycle events.
- SDK: support JS integration through `@opencode-ai/sdk/v2` as the primary typed client.
- Permissions: map OpenCode approval/guardrail events to `PermissionRequest` and callback flow.
- Observability: expose SSE + persisted session metadata as `subscribeObservability` stream.
- Usage: collect per-session counters from server responses and provider-side totals.

### Codex Adapter

- Transport: JSON-RPC 2.0 via `codex app-server`.
- Session lifecycle: use `thread/start` for session creation.
- Permissions: map `requestApproval` JSON-RPC notifications to adapter callbacks.
- Streaming: transform JSON-RPC notifications/results into `StreamEvent` sequence.
- Batch execution: support `codex exec --json` for non-interactive structured mode.
- Usage: combine JSON job outputs with provider accounting into `UsageSnapshot`.

### Gemini Adapter

- Constraint: PTY required for full interactive input path; no equivalent bidirectional app API.
- Output: parse `-o stream-json` lines for structured event extraction only.
- Control: input injection goes through PTY write channel (not API method calls).
- Permissions: enforce a wrapper policy engine that intercepts risky actions before PTY send.
- Observability: emit parsed stream-json records plus local PTY lifecycle events.
- Usage: derive coarse usage from output metadata and provider dashboards.

### PTY Fallback Layer

For runtimes that require terminal emulation:

- Runtime backends: `tauri-plugin-pty` (desktop integration) or `portable-pty` (cross-platform Rust core).
- Terminal UI binding: `xterm.js` renders PTY output and forwards user/programmatic input.
- Stream conversion: parse PTY stdout/stderr into structured `StreamEvent` envelopes.
- Control channel: start/resize/write/terminate primitives with heartbeat monitoring.
- Policy hooks: evaluate command text with policy engine before forwarding writes to PTY.

### Dual-Process Model

Use a two-process model to separate deterministic machine control from terminal emulation:

1. **Structured process (`adapterd`)**: owns session state, capability discovery, permissions, observability fanout, and usage accounting.
2. **PTY worker process (`ptyd`)**: owns pseudo-terminal lifecycle, raw IO, terminal resizing, and escape-sequence handling.

Routing:

- If backend capability `bidirectionalApi=true`, route through structured process only.
- If runtime is PTY-bound (e.g. Gemini interactive mode), structured process delegates to PTY worker.
- Both processes publish events to one unified stream so orchestrator logic stays backend-agnostic.

---

## Agent Lifecycle State Machine (MiroFish-inspired)

Agents follow an extended lifecycle state machine inspired by MiroFish's simulation lifecycle patterns. This replaces the simpler `active/idle/completed/failed/cancelled` model with a richer set of states that capture the full agent lifecycle.

### State Diagram

```
created → preparing → active → running ⇄ paused
                        ↓         ↓
                       idle    stopped
                        ↓         ↓
                    completed   failed
                        ↓
                    cancelled
```

### State Definitions

| State | Description | Transitions To |
|-------|-------------|---------------|
| `created` | Agent record exists but has not been initialized | `preparing` |
| `preparing` | Loading system prompt, resolving tools, setting up workspace | `active`, `failed` |
| `active` | Ready to accept work but not currently generating | `running`, `idle`, `stopped`, `cancelled` |
| `idle` | Temporarily inactive, waiting for external input or scheduled wake | `active`, `stopped`, `cancelled` |
| `running` | Actively generating a response or executing tools | `active`, `paused`, `stopped`, `completed`, `failed` |
| `paused` | Generation suspended by user or system (e.g., permission prompt) | `running`, `stopped`, `cancelled` |
| `stopped` | Gracefully shut down, preserving state for potential resume | `preparing` (resume), `cancelled` |
| `completed` | Finished all assigned work successfully | `cancelled` (cleanup) |
| `failed` | Encountered an unrecoverable error | `preparing` (retry), `cancelled` |
| `cancelled` | Permanently terminated, no resume possible | — (terminal) |

### State Transition Events

Each transition emits an `AgentStatusChanged` event via the SSE stream:

```ts
interface AgentStatusChanged {
  agentId: string;
  sessionId: string;
  previousStatus: AgentStatus;
  newStatus: AgentStatus;
  reason?: string;
  timestamp: string; // ISO 8601
}
```

### Collaboration Metadata (MiroFish + agency-agents inspired)

Each agent profile carries collaboration metadata that informs multi-agent team behavior:

```ts
interface AgentCollaborationMetadata {
  collaborationStyle: 'cooperative' | 'critical' | 'exploratory' | 'directive' | 'supportive';
  communicationPreference: 'concise' | 'detailed' | 'structured' | 'conversational';
  decisionWeight: number; // 0.0–1.0, used for weighted consensus in team decisions
  division?: string;      // organizational category (engineering, design, qa, product, security, devops, ai)
  color?: string;         // hex color for UI display
  emoji?: string;         // emoji badge for visual identification
  vibe?: string;          // short personality descriptor
}
```

**`collaborationStyle`** determines how the agent interacts in team settings:
- `cooperative`: Seeks consensus, builds on others' ideas
- `critical`: Challenges assumptions, identifies risks and edge cases
- `exploratory`: Generates alternatives, investigates unknowns
- `directive`: Takes charge, delegates tasks, drives execution
- `supportive`: Assists other agents, provides context, fills gaps

**`decisionWeight`** is used when agents in a team disagree. The team's consensus mechanism uses weighted voting where each agent's vote is scaled by their `decisionWeight`. Higher weight means more influence on the final decision.

**`division`** organizes agents into functional categories matching common software team structures. This enables filtering, grouping, and role-based task delegation in the Agent Management UI.

### Architectural Inspiration

The extended state machine is inspired by [MiroFish](https://github.com/mirofish/mirofish)'s simulation lifecycle, which models agents through preparation, execution, and reporting phases. The collaboration metadata (`collaborationStyle`, `decisionWeight`) comes from MiroFish's social interaction simulation, while the division taxonomy and visual identity fields (`color`, `emoji`, `vibe`) are adapted from [agency-agents](https://github.com/ruvnet/agent-agents)' persona definitions.

---

## Tool Interface

### Standardized Tool Registration

Tools are registered with the backend through a declarative schema that matches the Claude Code tool system. Each tool declares its name, description, input schema (JSON Schema), and execution handler.

```ts
interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  isReadOnly: boolean;
  isImmediate: boolean;       // executes without model confirmation
  requiresPermission: boolean;
  userFacingName?: string;
}
```

Tool execution flow:

1. Model emits a `tool_call` with `name` and `args`.
2. Backend resolves the tool from the registry by name.
3. Permission check runs against the current permission rules (see below).
4. If approved, the tool's handler is invoked with validated args.
5. Result (or error) is returned to the model as a `tool` role message.

### Built-in Tools

The native backend ships with these built-in tools:

| Tool | Category | Description |
|------|----------|-------------|
| `Read` | File system | Read file contents with line range support |
| `Write` | File system | Create or overwrite a file |
| `Edit` | File system | Apply exact string replacements in a file |
| `MultiEdit` | File system | Apply multiple edits to a single file atomically |
| `Bash` | Execution | Run shell commands with timeout and sandboxing |
| `Glob` | Search | Fast file pattern matching (e.g. `**/*.ts`) |
| `Grep` | Search | Regex content search powered by ripgrep |
| `WebFetch` | Network | Fetch URL content (HTML, JSON, text) |
| `WebSearch` | Network | Search the web and return structured results |
| `Agent` | Orchestration | Spawn a sub-agent for parallel/delegated work |
| `MCP tools` | Extension | Dynamically loaded tools from MCP servers |
| `LSP` | Code intel | Language Server Protocol operations (hover, goto-def, references, diagnostics) |
| `Codesearch` | Search | Semantic code search across the repository |

---

## Permission Model

### Rule Structure

Permissions are expressed as deny/ask/allow rules evaluated in order. Each rule specifies a tool name and optional glob patterns for arguments:

```jsonc
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(npm run *)",
      "Bash(npm test *)",
      "Edit(/src/**/*.ts)",
      "Write(/src/**/*.ts)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Write(/etc/**)"
    ]
  }
}
```

### Mode Presets

| Mode | Behavior |
|------|----------|
| `default` | Read-only tools allowed, write tools require approval |
| `acceptEdits` | File edit/write tools auto-approved, Bash still requires approval |
| `plan` | All tools denied except read-only; model produces a plan only |
| `dontAsk` | All tools auto-approved except explicitly denied rules |
| `bypassPermissions` | All tools auto-approved with no policy checks (development only) |

Legacy ecosystem permission modes are imported through compatibility aliases:

- `manual` -> `default`
- `auto-safe` -> `acceptEdits`
- `yolo` -> `dontAsk`

### Per-Tool Glob Patterns

Glob patterns scope tool permissions to specific arguments:

- `Bash(npm run *)` -- allow any `npm run` subcommand.
- `Edit(/src/**/*.ts)` -- allow edits only to TypeScript files under `/src/`.
- `Write(/tmp/**)` -- allow writes only to temp directory.
- `Bash(git commit *)` -- allow git commits but not other git operations.

Pattern matching uses standard glob syntax. A tool call that does not match any allow pattern falls through to `ask` (user approval required).

---

## Context Management

### Token Budget Tracking

The backend tracks token usage against the model's context window:

- Each message (user, assistant, tool result) is measured in tokens using the provider's tokenizer (or tiktoken as fallback).
- Running total is maintained per session: `usedTokens / maxContextTokens`.
- Tools and system prompts consume a reserved portion of the budget.

### Auto-Compaction

When token usage reaches approximately **95% of the context window**, the backend triggers automatic compaction:

1. Summarize older conversation turns into a compressed representation.
2. Preserve the system prompt, recent turns (last N), and any pinned context.
3. Replace the middle section of the conversation with the summary.
4. Log the compaction event for observability.

Compaction is transparent to the user -- the conversation continues without interruption.

### Fork and Resume

Sessions support forking and resuming:

- **Fork**: create a new session branching from a specific point in an existing conversation. The new session inherits context up to the fork point.
- **Resume**: reconnect to an existing session and continue from where it left off. Session state is loaded from the persisted transcript.

### JSONL Transcript Persistence

All sessions are persisted as JSONL (JSON Lines) files:

```
~/.amoena/sessions/<session-id>.jsonl
```

Each line is a self-contained JSON object representing one event (message, tool call, tool result, compaction marker, metadata update). This format supports:

- Streaming writes (append-only).
- Efficient resume (read and replay).
- Post-hoc analysis and debugging.
- Fork-point identification by line number.

---

## MCP Integration

### Transport Support

The backend connects to MCP (Model Context Protocol) servers over three transport types:

| Transport | Use Case | Connection |
|-----------|----------|------------|
| `stdio` | Local process servers | Spawn child process, communicate over stdin/stdout |
| `http` | Remote HTTP servers | Stateless HTTP POST requests |
| `sse` | Remote streaming servers | Server-Sent Events for bidirectional communication |

MCP server configuration is declared in project config or user settings:

```jsonc
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"],
      "transport": "stdio"
    },
    "remote-tools": {
      "url": "https://mcp.example.com/sse",
      "transport": "sse"
    }
  }
}
```

### Deferred Tool Loading

MCP tools are loaded lazily to keep startup fast:

1. On session start, the backend connects to configured MCP servers and fetches their tool schemas.
2. Tool names and descriptions are registered in the tool registry but handlers are not loaded.
3. When the model first calls an MCP tool, the backend activates the full handler and routes the call to the MCP server.
4. Subsequent calls reuse the active connection.

### Tool Schema Discovery

MCP servers expose their tool schemas via the `tools/list` method. The backend:

- Fetches schemas at connection time.
- Merges MCP tools into the unified tool registry alongside built-in tools.
- Prefixes MCP tool names with the server name to avoid collisions (e.g. `mcp__filesystem__read_file`).
- Re-fetches schemas if the MCP server signals a change via `notifications/tools/list_changed`.

---

## Ecosystem Compatibility Layer

When running in native mode, the backend reads and applies configuration files from **both Claude Code and OpenCode ecosystems** simultaneously. This makes Amoena the only AI tool that can run plugins from both ecosystems (e.g., oh-my-claudecode + oh-my-opencode) at the same time, giving users 100% feature access to every community extension.

### Configuration Files

| File | Location | Ecosystem | Purpose |
|------|----------|-----------|---------|
| `.claude/` | Project root | Claude Code | Project-scoped Claude configuration directory |
| `.claude/agents/` | Project root | Claude Code | Agent persona definitions (Markdown + YAML frontmatter) |
| `CLAUDE.md` | Project root + nested dirs | Claude Code | Project instructions (scoped by directory) |
| `hooks.json` | `.claude/hooks.json` | Claude Code | Lifecycle hooks (pre/post tool execution) |
| `settings.json` | `~/.claude/settings.json` | Claude Code | User-level settings and permission rules |
| `opencode.json` | Project root | OpenCode | Project-level config (providers, agents, MCP servers) |
| `.opencode/` | Project root | OpenCode | OpenCode workspace config and agent definitions |
| `~/.opencode/` | User home | OpenCode | User-level OpenCode settings and agent profiles |

### Plugin Ecosystem Manager

Amoena auto-discovers and manages plugins from both ecosystems:

- **Auto-discovery**: Scans `~/.claude/` for Claude Code plugins (oh-my-claudecode, claude-mem, etc.) and `~/.opencode/` plus `opencode.json` for OpenCode plugins (oh-my-opencode, etc.).
- **Per-plugin enable/disable**: Each plugin can be individually toggled via Settings > Plugins. Users can run oh-my-claudecode and oh-my-opencode simultaneously, or selectively enable specific plugins.
- **Ecosystem-level toggle**: Enable/disable all plugins from a given ecosystem as a group, then fine-tune individual plugins within.
- **Conflict resolution**: When plugins from different ecosystems register handlers for the same Hook Engine event, both handlers fire in declared priority order (configurable in Settings > Plugins > Priority).
- **Plugin isolation**: Each plugin's hooks run in their own context. Failures are logged and do not block other plugins or the agent loop.
- **Plugin health**: Dashboard showing each plugin's status, error count, last event processed, and latency.

### OpenCode Compatibility

OpenCode configuration is loaded alongside Claude Code config:

- **`opencode.json` agents**: Agent definitions (build, plan, general, explore, compaction, title, summary) are imported as Amoena agent profiles. Each agent's model, system prompt, tool access, and permission config are preserved.
- **OpenCode hooks**: OpenCode's event hooks (session lifecycle, tool execution, approval/guardrail events) are normalized to Amoena's Hook Engine format and executed with the same semantics.
- **OpenCode MCP servers**: MCP server configurations from `opencode.json` are merged with Claude Code MCP configs. On conflict (same server name), Claude Code config takes precedence (configurable).
- **Provider config**: Provider overrides in `opencode.json` are imported into Amoena's provider system. Users can use OpenCode's provider setup for initial config, then manage everything from Amoena.

### Agent Profile Aggregation and Tab Switching

Amoena aggregates agent profiles from all sources and exposes them as **tab-switchable agents** — similar to OpenCode's Tab key for cycling between agents:

| Source | Example Agents | Priority |
|--------|---------------|----------|
| Built-in | Build (full access), Plan (read-only), Explore (read-only) | Lowest (defaults) |
| Claude Code `.claude/agents/` | Custom agents defined as Markdown + YAML frontmatter | Medium |
| OpenCode `opencode.json` agents | build, plan, general, explore, compaction, title, summary | Medium |
| oh-my-claudecode catalog | executor, architect, debugger, planner, designer, etc. | Medium |
| oh-my-opencode catalog | OpenCode-specific agent personas | Medium |
| User custom (`~/.amoena/agents/`) | User-defined agents | Highest (overrides) |

**Tab switching behavior**:

- **Keyboard**: `Tab` cycles through enabled agent profiles (matching OpenCode's UX). `Shift+Tab` cycles reverse.
- **Composer UI**: Agent tab bar above the input field shows available agents with active indicator. Click to switch.
- **Mid-session switching**: Changing agent tab preserves conversation history but changes the active system prompt, tool access, and permission config for subsequent turns.
- **Per-ecosystem filtering**: Users can filter the tab bar to show only agents from a specific ecosystem (Claude Code, OpenCode, or custom).
- **Agent deduplication**: When the same logical agent exists in multiple ecosystems (e.g., "build" in both Claude Code and OpenCode), Amoena shows one entry with a source indicator. Users choose which ecosystem's definition to use via Settings.

### CLAUDE.md Processing

The native backend processes `CLAUDE.md` files following these rules:

1. **Directory scoping**: `CLAUDE.md` in a subdirectory applies only when the agent is working within that directory tree.
2. **Merge order**: User global (`~/.claude/CLAUDE.md`) < project root (`./CLAUDE.md`) < subdirectory (`./src/CLAUDE.md`). Later files override earlier ones.
3. **Content injection**: Processed CLAUDE.md content is prepended to the system prompt for each conversation turn.

### @import Syntax

CLAUDE.md files support importing other markdown files:

```markdown
@docs/coding-standards.md
@.claude/rules/security.md
```

Import rules:

- Maximum **5 hops** (import depth) to prevent circular references.
- Imported paths are resolved relative to the importing file's directory.
- Circular imports are detected and skipped with a warning.
- Imported content is inlined at the import location.

### Path-Scoped Rules

Rules files under `.claude/rules/` support YAML frontmatter for path scoping:

```markdown
---
paths:
  - "src/api/**"
  - "src/services/**"
---

# API Guidelines

All API handlers must validate input using zod schemas...
```

Only rules whose `paths` patterns match the current working context are included in the system prompt. Rules without `paths` frontmatter apply globally.

### Auto Memory

The native backend reads and writes to the Claude memory system:

```
~/.claude/projects/<repo-hash>/memory/
```

- **Reads**: On session start, load relevant memory entries and include them in the system prompt context.
- **Writes**: When the model produces `<remember>` tags, persist the content to the memory directory with timestamp and optional priority flag.
- Memory entries are scoped per repository (identified by remote URL hash or directory path hash).

---

## Provider Abstraction

### models.dev Registry

The backend uses [models.dev](https://models.dev) as a model metadata registry:

- **Catalog**: 75+ providers with model IDs, context window sizes, pricing, and capability flags.
- **Auto-refresh**: Registry data is fetched and cached hourly. Stale cache falls back to a bundled snapshot.
- **Model resolution**: When a user specifies a model string (e.g. `claude-sonnet-4-20250514`), the registry resolves it to the correct provider, API endpoint, and capability set.

Capability metadata must include reasoning support so the UI can expose correct controls:

```ts
interface ModelCapabilityMetadata {
  modelId: string;
  providerId: string;
  supportsReasoning: boolean;
  reasoningModes: Array<"off" | "auto" | "on">;
  reasoningEffortSupported: boolean;
  reasoningEffortValues?: Array<"low" | "medium" | "high">;
  reasoningTokenBudgetSupported: boolean;
}
```

### Vercel AI SDK Factories

Each provider is accessed through its Vercel AI SDK factory:

```ts
// Registry lookup returns provider metadata
const meta = registry.resolve("claude-sonnet-4-20250514");
// -> { provider: "anthropic", sdkPackage: "@ai-sdk/anthropic", factory: "createAnthropic" }

// Dynamic import and instantiation
const { createAnthropic } = await import("@ai-sdk/anthropic");
const provider = createAnthropic({ apiKey: resolvedAuth });
const model = provider(meta.modelId);
```

Dynamic provider installation: if the required `@ai-sdk/*` package is not installed, the backend can auto-install it at runtime (with user confirmation in interactive mode).

### Local Model Support

Amoena natively connects to locally-running inference servers for small, fast models ideal for lightweight tasks:

**Supported local runtimes**:

| Runtime | Transport | SDK Package | Auto-detect Port |
|---------|-----------|-------------|-----------------|
| Ollama | HTTP (OpenAI-compatible) | `@ai-sdk/ollama` or `createOpenAI({ baseURL })` | 11434 |
| llama.cpp server | HTTP (OpenAI-compatible) | `createOpenAI({ baseURL })` | 8080 |
| LM Studio | HTTP (OpenAI-compatible) | `createOpenAI({ baseURL })` | 1234 |
| vLLM | HTTP (OpenAI-compatible) | `createOpenAI({ baseURL })` | 8000 |
| Any OpenAI-compatible | HTTP | `createOpenAI({ baseURL })` | User-configured |

**Ideal models for local use**: Qwen 3.5 (0.6B-32B), Phi-4-mini (3.8B), Llama 3.2 (1B-3B), Gemma 3 (1B-4B), DeepSeek-R1-Distill (1.5B-7B).

**Use cases for local models**:
- **System agents**: Title generation, session compaction summaries, observation classification, commit message drafting — tasks where latency matters more than reasoning depth.
- **Simple user tasks**: Code formatting, file renaming, boilerplate generation, regex writing, quick lookups.
- **Offline mode**: Full AI capability without internet. Local models are the only option when disconnected.
- **Privacy**: Sensitive codebases that cannot be sent to cloud APIs. All inference stays on-device.
- **Cost**: Zero marginal cost per token. Ideal for high-volume lightweight operations.

**Configuration** (`amoena.json`):

```json
{
  "providers": {
    "local-ollama": {
      "type": "openai-compatible",
      "baseURL": "http://localhost:11434/v1",
      "models": ["qwen3.5:0.6b", "qwen3.5:7b", "phi4-mini"]
    }
  },
  "modelRouting": {
    "system.title": "local-ollama/qwen3.5:0.6b",
    "system.compaction": "local-ollama/qwen3.5:7b",
    "system.observation": "local-ollama/phi4-mini",
    "default": "anthropic/claude-sonnet-4-20250514"
  }
}
```

**Auto-detection**: On startup, the Provider Manager probes well-known local ports. If a compatible server responds, it's registered as an available provider with its model list. Users can then assign local models to specific task types via the `modelRouting` config or the Provider Setup UI.

### Auth Resolution

API keys and credentials are resolved through a fallback chain:

| Priority | Source | Example |
|----------|--------|---------|
| 0 | No auth (local models) | Ollama, llama.cpp, LM Studio — no key needed |
| 1 | Environment variable | `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` |
| 2 | Credential store | System keychain via `keytar` or OS-native secret store |
| 3 | Config file | `~/.amoena/providers.json` (encrypted at rest) |
| 4 | Interactive setup | Prompt user for key on first use, store in credential store |

Resolution is per-provider. The backend never logs or persists raw API keys outside the credential store. Keys loaded from environment variables are used in-memory only.

```ts
interface AuthResolution {
  provider: string;
  source: "env" | "credential_store" | "config_file" | "interactive";
  apiKey: string;        // resolved key (never logged)
  expiresAt?: string;    // for token-based auth (e.g. OAuth)
}
```
