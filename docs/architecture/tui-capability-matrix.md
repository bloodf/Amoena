# TUI Capability Matrix

## Implementation Scope by Phase

| Phase | Backends |
|-------|----------|
| MVP | Amoena Native only (no wrappers) |
| V1.0 | + Claude Code (via `--sdk-url`) |
| V1.5 | + OpenCode; evaluate Codex CLI and Gemini CLI |

The capability matrix below documents the full target state. Refer to the [Implementation Roadmap](./implementation-roadmap.md) for phase-specific delivery scope.

---

## Executive Summary

This document compares Claude Code, OpenCode (anomalyco TypeScript CLI), Codex CLI, Gemini CLI, and Amoena Native mode across integration-critical capability dimensions.

Integration mode classification used in this document:

- NATIVE: Amoena's own agentic loop — full control without external process dependency.
- FULL: first-class bidirectional machine control API (request + events + session operations).
- PARTIAL: some structured controls, but missing full lifecycle control or bidirectional parity.
- PTY-ONLY: practical automation depends on terminal control and output parsing, not a full bidirectional control API.

## Scope and Verification Method

Sources were verified from official documentation and official repositories only:

- Claude Code docs: `https://code.claude.com/docs/en/*`
- OpenCode docs: `https://opencode.ai/docs/*` and `https://github.com/anomalyco/opencode`
- Codex docs: `https://developers.openai.com/codex/*` and `https://github.com/openai/codex`
- Gemini docs: `https://github.com/google-gemini/gemini-cli` docs and README

Notes:

- OpenCode references in this file are the anomalyco TypeScript project (`anomalyco/opencode`), not the archived Go project.
- Commands are listed exactly as documented in the sources above.

## Claude Code

### Non-Interactive / SDK Modes

- Non-interactive prompt mode: `claude -p "..."`.
- Structured non-interactive output: `--output-format text|json|stream-json`.
- Stream mode: `claude -p "..." --output-format stream-json --verbose --include-partial-messages`.
- JSON schema output mode: `--json-schema '{...}'` with `--output-format json`.
- Conversation continuation in headless mode: `--continue` and `--resume`.
- Bidirectional SDK endpoint exposure: `--sdk-url` (documented in CLI reference).

### Structured Output Format

- Supports `text`, `json`, and `stream-json` output formats.
- `json` includes result + session metadata.
- `stream-json` is newline-delimited JSON events.
- Supports constrained output via JSON Schema.

### PTY / Terminal Capabilities

- Works interactively in terminal UI and non-interactively with `-p`.
- Supports raw stream-json output suitable for machine parsing.
- ANSI-rendered interactive UX in TTY mode; machine mode avoids PTY dependency.

### Auth Methods

- Browser login flow via `claude` or explicit `claude auth login`.
- Auth management commands:
  - `claude auth login`
  - `claude auth logout`
  - `claude auth status`
- Team and enterprise auth options documented for Claude.ai account, Console, Bedrock, Vertex, and Foundry setups.

### Installation (macOS / Windows / Linux)

- macOS/Linux/WSL native install:
  - `curl -fsSL https://claude.ai/install.sh | bash`
- Windows PowerShell native install:
  - `irm https://claude.ai/install.ps1 | iex`
- Windows CMD native install:
  - `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd`
- Alternative package managers:
  - `brew install --cask claude-code`
  - `winget install Anthropic.ClaudeCode`

### MCP Server Configuration

- CLI entrypoint: `claude mcp ...`
- Add remote HTTP MCP server:
  - `claude mcp add --transport http <name> <url>`
- Add remote SSE MCP server (deprecated transport):
  - `claude mcp add --transport sse <name> <url>`
- Add local stdio MCP server:
  - `claude mcp add --transport stdio <name> -- <command>`
- Manage MCP servers:
  - `claude mcp list`
  - `claude mcp get <name>`
  - `claude mcp remove <name>`

### Skills / Agents / Plugins

- Skills supported (`/skills`, component files, plugin-provided skills).
- Subagents supported (`claude agents`, custom subagent definitions).
- Plugins supported (plugin docs + plugin marketplaces + plugin MCP bundling).
- Hooks supported as first-class lifecycle automation.

### Permission Model

- Permission modes include `default`, `acceptEdits`, `plan`, `dontAsk`, `bypassPermissions`.
- CLI flags for approval posture include `--permission-mode` and `--dangerously-skip-permissions`.
- Fine-grained allow/ask/deny tool rules with pattern syntax.

### Session Management

- Continue latest session: `claude -c` / `claude --continue`.
- Resume by ID or name: `claude -r <session>` / `claude --resume <session>`.
- Fork on resume: `--fork-session`.
- Session persistence files under `~/.claude` and project session artifacts under `~/.claude/projects/`.

### File / Image / Audio Input

- File and piped content input in headless mode (for example `cat file | claude -p "..."`).
- Supports multimodal workflows through built-in tooling and integrations (for example Chrome/tooling paths) depending on model/tool availability.

### Version and Binary

- Binary name: `claude`.
- Version command: `claude --version`.

### Observability Channels

- Stream output channel: `--output-format stream-json`.
- Hook event channel: hooks reference documents 18 lifecycle events (SessionStart, PreToolUse, PostToolUse, PermissionRequest, SessionEnd, etc.).
- OpenTelemetry channel: enable with `CLAUDE_CODE_ENABLE_TELEMETRY=1` and OTEL exporter env vars.
- Session artifact channel: JSONL/session artifacts in `~/.claude/projects/`.

### Programmatic Control

- Bidirectional control: available via SDK endpoint (`--sdk-url`) and Agent SDK integration paths.
- Supports non-interactive prompt execution, continuation, structured streams, and permission tooling in automation.
- Session continuation and explicit resume supported from CLI and machine flows.

### Usage / Cost Data

- Session-level usage visible via `/cost` and `/stats` in product workflows.
- Headless JSON output includes usage/session metadata.
- Telemetry exports token and cost metrics via OTEL (`claude_code.token.usage`, `claude_code.cost.usage`).
- Session artifacts in `~/.claude/projects/` provide local evidence for reconstruction and auditing.

## OpenCode (anomalyco TypeScript)

### Non-Interactive / SDK Modes

- Non-interactive run mode: `opencode run [message..]`.
- Structured run format: `opencode run --format json "..."`.
- Headless API server mode: `opencode serve`.
- Client SDK modes documented via `@opencode-ai/sdk` and `@opencode-ai/sdk/v2`.
- ACP mode (stdin/stdout nd-JSON): `opencode acp`.

### Structured Output Format

- `opencode run --format json` for raw JSON events.
- Server APIs generated from OpenAPI; SDK uses typed request/response models.
- Event stream endpoint available through SDK event subscribe (`event.subscribe`).

### PTY / Terminal Capabilities

- TUI mode by default: `opencode`.
- Attach mode for remote backend: `opencode attach [url]`.
- Not PTY-bound for automation when using `run`, `serve`, SDK, or ACP.

### Auth Methods

- Provider auth login command:
  - `opencode auth login`
- List configured auth providers:
  - `opencode auth list` / `opencode auth ls`
- Remove provider auth:
  - `opencode auth logout`
- Server basic auth via env vars:
  - `OPENCODE_SERVER_PASSWORD`
  - `OPENCODE_SERVER_USERNAME`

### Installation (macOS / Windows / Linux)

- Install script:
  - `curl -fsSL https://opencode.ai/install | bash`
- Node package managers:
  - `npm install -g opencode-ai`
  - `bun add -g opencode-ai`
  - `pnpm add -g opencode-ai`
  - `yarn global add opencode-ai`
- Homebrew:
  - `brew install anomalyco/tap/opencode`
- Windows package managers:
  - `choco install opencode`
  - `scoop install opencode`
- Linux package managers:
  - `sudo pacman -S opencode`
  - `paru -S opencode-bin`

### MCP Server Configuration

- CLI management:
  - `opencode mcp add`
  - `opencode mcp list` / `opencode mcp ls`
  - `opencode mcp auth [name]`
  - `opencode mcp auth list`
  - `opencode mcp logout [name]`
- Config format in `opencode.json` under `mcp` key.

### Skills / Agents / Plugins

- Local and global skills directories:
  - `.opencode/skills/`
  - `~/.config/opencode/skills/`
- Agents and commands directories:
  - `.opencode/agents/`, `.opencode/commands/`
  - `~/.config/opencode/agents/`, `~/.config/opencode/commands/`
- Plugin system (local files + npm plugins).
- Event hook system in plugins with broad lifecycle coverage (session, tool, file, permission, message, TUI, command, etc.).

### Permission Model

- Default OpenCode behavior allows operations unless restricted by config.
- Permission policy can be set by tool in `opencode.json`:
  - example: `{ "permission": { "edit": "ask", "bash": "ask" } }`
- Permission request/response exposed in API surface and events.

### Session Management

- CLI session commands:
  - `opencode session list`
  - `opencode session list --format json`
- Continue last session from TUI/CLI flags:
  - `--continue`, `--session`, `--fork`
- SDK/API supports full CRUD:
  - `session.create`, `session.list`, `session.get`, `session.update`, `session.delete`

### File / Image / Audio Input

- CLI supports file attachment in run mode (`--file`).
- SDK and server expose file APIs (`file.read`, `find.text`, `find.files`).
- OpenCode docs explicitly describe image-aware prompt workflows in TUI.

### Version and Binary

- Binary name: `opencode`.
- Version command: `opencode --version` (or `opencode -v`).

### Observability Channels

- REST/OpenAPI channel via `opencode serve`.
- SSE event channel via `event.subscribe()` in SDK/server API.
- Plugin hook/event channel via plugin event hooks.
- Persistent local data channel via SQLite DB (default data path includes `~/.local/share/opencode/opencode.db`; channel-specific DB names may vary by release channel).

### Programmatic Control

- Full bidirectional control via HTTP API + SSE + typed SDK.
- Session CRUD available programmatically.
- Permission request handling exposed as API operation (`postSessionByIdPermissionsByPermissionId`).
- TUI can be programmatically controlled through `/tui` endpoint and SDK `tui.*` operations.

### Usage / Cost Data

- Built-in usage report command:
  - `opencode stats`
- Session export:
  - `opencode export [sessionID]`
- Session persistence and analytics through SQLite (`session` table and related tables in official source).
- Data location rooted in OpenCode data directory (`~/.local/share/opencode/`).

## Codex CLI

### Non-Interactive / SDK Modes

- Interactive mode: `codex`.
- Non-interactive mode: `codex exec "..."`.
- Programmatic app-server mode: `codex app-server`.
- SDK mode: TypeScript SDK (`@openai/codex-sdk`) with `startThread`, `resumeThread`, `run`.

### Structured Output Format

- `codex exec --json` outputs JSONL events (documented in official source comments for exec mode output contract).
- App server protocol uses JSON-RPC 2.0 messages.
- App-server schema generation commands:
  - `codex app-server generate-ts --out DIR`
  - `codex app-server generate-json-schema --out DIR`

### PTY / Terminal Capabilities

- TUI interactive by default.
- App-server supports stdio transport (`stdio://`) and optional websocket transport (`ws://...`, documented as experimental/unsupported).
- Non-interactive `exec` mode avoids PTY dependence.

### Auth Methods

- Primary CLI login command:
  - `codex login`
- Device code login in headless/remote scenarios:
  - `codex login --device-auth`
- CLI also supports API key auth workflows and cached auth session reuse.
- Auth storage controlled by `cli_auth_credentials_store` (`file|keyring|auto`).

### Installation (macOS / Windows / Linux)

- npm install (cross-platform where supported):
  - `npm install -g @openai/codex`
- Homebrew cask option:
  - `brew install --cask codex`
- Official binaries from GitHub Releases for macOS and Linux tarballs.
- Windows support is documented as experimental; recommended path is Windows via WSL2.

### MCP Server Configuration

- MCP in config (`~/.codex/config.toml`) via `mcp_servers.<id>...` keys.
- MCP CLI management is documented in source (`codex mcp list|get|add|remove|login|logout`).
- OAuth callback controls include `mcp_oauth_callback_port` and `mcp_oauth_callback_url`.

### Skills / Agents / Plugins

- Multi-agent and role configuration through `[agents]` settings.
- App-server documents skills APIs/events (`skills/list`, `skills/changed`, remote skill export routes).
- Connector/app integrations documented via app endpoints and config.

### Permission Model

- Approval policy via config key `approval_policy` (`untrusted|on-request|never|reject[...]`).
- Security and sandbox policy exposed through thread/turn settings in app-server (`approvalPolicy`, `sandboxPolicy`).
- Interactive approval model is part of default UX and is configurable.

### Session Management

- CLI resume workflows:
  - `codex resume`
  - `codex resume --last`
  - `codex resume <SESSION_ID>`
  - `codex exec resume --last "..."`
- App-server full session/thread lifecycle methods:
  - `thread/start`, `thread/resume`, `thread/fork`
  - `thread/list`, `thread/read`, `thread/archive`, `thread/unarchive`

### File / Image / Audio Input

- CLI image input:
  - `codex -i screenshot.png "..."`
  - `codex --image img1.png,img2.jpg "..."`
- File and shell tooling available through Codex runtime and app-server operations.

### Version and Binary

- Binary name: `codex`.
- Version check path in official smoke tests uses:
  - `npx -y @openai/codex@<tag> --version`

### Observability Channels

- App-server JSON-RPC event stream over stdio (JSONL) and experimental websocket transport.
- Exec JSONL event stream in `--json` mode.
- Local rollout artifacts recorded as JSONL in `~/.codex/sessions/.../rollout-*.jsonl`.
- Local history JSONL at `~/.codex/history.jsonl`.
- SQLite state DB support documented via config (`sqlite_home` / `CODEX_SQLITE_HOME`) and source components.

### Programmatic Control

- Full bidirectional API via app-server JSON-RPC protocol.
- Session/thread CRUD and lifecycle controls available as methods (`thread/*`, `turn/*`, `command/exec/*`).
- Supports interrupts (`turn/interrupt`), model overrides, sandbox and approval policy control, and event subscriptions via notifications.

### Usage / Cost Data

- Usage metadata appears in finished stream events (`usageMetadata`) and response records.
- Durable local telemetry/session evidence through SQLite state and JSONL rollouts.
- Exportable structured events from `exec --json` for external accounting pipelines.

## Gemini CLI

### Non-Interactive / SDK Modes

- Prompt mode:
  - `gemini -p "..."`
- Structured output mode:
  - `gemini -p "..." --output-format json`
- Streaming structured output mode:
  - `gemini -p "..." --output-format stream-json`
- Headless mode auto-detected in non-TTY environments.

### Structured Output Format

- JSON output includes `response`, `stats`, and optional `error`.
- `stream-json` outputs newline-delimited JSON events for automation.
- Headless docs define stream-json event classes (`init`, `message`, `tool_use`, `tool_result`, `error`, `result`).

### PTY / Terminal Capabilities

- Primary interaction model is terminal-first interactive CLI.
- Non-interactive prompt mode supports script pipelines.
- Full conversational control still centers on CLI session input flow.

### Auth Methods

- OAuth flow via `gemini` startup and "Login with Google".
- API-key auth via environment variable:
  - `GEMINI_API_KEY`
- Vertex auth via environment variables:
  - `GOOGLE_API_KEY`
  - `GOOGLE_GENAI_USE_VERTEXAI=true`
- Optional cloud project variable for licensed org setups:
  - `GOOGLE_CLOUD_PROJECT`

### Installation (macOS / Windows / Linux)

- Run without install:
  - `npx @google/gemini-cli`
- npm global install:
  - `npm install -g @google/gemini-cli`
- Homebrew (macOS/Linux):
  - `brew install gemini-cli`
- MacPorts (macOS):
  - `sudo port install gemini-cli`

### MCP Server Configuration

- Configure MCP in `~/.gemini/settings.json` under `mcpServers`.
- Supports stdio, SSE, and streamable HTTP MCP transports.
- OAuth and auth-provider settings supported for remote MCP servers (`/mcp auth` flow documented).

### Skills / Agents / Plugins

- Gemini CLI supports extensions and custom commands.
- Policy engine is a first-class safety/decision system for tool execution.
- Agent capabilities are present, but not a standalone bidirectional app-server API equivalent to Claude Code/OpenCode/Codex app-server.

### Permission Model

- Approval mode settings (`default`, `auto_edit`, `plan`) in settings.
- Fine-grained policy engine rules with allow/deny/ask semantics.
- Headless mode behavior integrates policy enforcement.

### Session Management

- Checkpointing and restore flow via `/restore`.
- Session retention settings in config (`general.sessionRetention.*`).
- Conversation state and checkpoint data persisted under `.gemini` / `~/.gemini/tmp/<project_hash>/...`.

### File / Image / Audio Input

- Image input supported:
  - `gemini -i <image>` (see README examples for multimodal usage).
- File operations are built-in tool capabilities.
- Audio handling appears in model/tool telemetry streams where enabled by model/runtime paths.

### Version and Binary

- Binary name: `gemini`.
- Version command:
  - `gemini --version`
  - (package smoke validation also documented with `npx -y @google/gemini-cli@<tag> --version`)

### Observability Channels

- Stream-json output events in headless mode.
- Internal event model includes rich event taxonomy in source (`GeminiEventType` enum; currently 18 event types in official source).
- OpenTelemetry support documented in detail (`docs/cli/telemetry.md`).
- Local telemetry and checkpoint/session files under `~/.gemini/tmp/...` and configured telemetry output files.

### Programmatic Control

- Programmatic access is available through CLI non-interactive invocation and structured output parsing.
- No first-class bidirectional app-server/session CRUD API equivalent to Claude Code `--sdk-url`, OpenCode REST+SSE control plane, or Codex app-server JSON-RPC.
- Integration mode is therefore PTY/output-driven for full lifecycle control.

### Usage / Cost Data

- Usage data fields are present in response usage metadata (`usageMetadata`) and telemetry (`input_token_count`, `output_token_count`, totals).
- Stream and telemetry outputs can be exported to local files and OTEL backends.
- Billing/cost interpretation depends on auth mode/provider tier and external billing system.

## Comparison Matrix (Y / N / PARTIAL)

| Capability | Amoena Native | Claude Code | OpenCode | Codex CLI | Gemini CLI |
| --- | --- | --- | --- | --- | --- |
| Non-interactive mode | Y (API-driven) | Y (`claude -p`) | Y (`opencode run`) | Y (`codex exec`) | Y (`gemini -p`) |
| Structured streaming output | Y (SSE) | Y (`stream-json`) | Y (JSON + SSE) | Y (`exec --json` JSONL) | Y (`--output-format stream-json`) |
| Bidirectional API endpoint | Y (built-in Axum) | Y (`--sdk-url`) | Y (`opencode serve` + SDK) | Y (`codex app-server`) | N |
| Session CRUD via API | Y | PARTIAL | Y | Y | N |
| Session resume in CLI | N/A (UI-driven) | Y | Y | Y | PARTIAL |
| Permission approval APIs | Y (built-in) | Y | Y | Y | PARTIAL |
| Model switching from control plane | Y (multi-provider) | Y | Y | Y | PARTIAL |
| Interrupt/cancel control | Y | Y | Y (`turn/interrupt`) | Y (`turn/interrupt`) | PARTIAL |
| MCP server configuration | Y (managed) | Y | Y | Y | Y |
| Skills / agents / plugins ecosystem | Y (plugin framework) | Y | Y | PARTIAL | PARTIAL |
| PTY required for full integration | N | N | N | N | Y |
| OpenTelemetry support | PLANNED | Y | PARTIAL | PARTIAL | Y |
| Hooks / event interception | Y (hooks engine) | Y (hooks) | Y (plugin events/hooks) | PARTIAL | PARTIAL (policy/hooks) |
| Durable local usage artifacts | Y (SQLite + JSONL) | Y (session files) | Y (SQLite) | Y (SQLite + JSONL) | Y (usage metadata + telemetry/session files) |
| Built-in usage/cost command | Y (dashboard) | PARTIAL | Y (`opencode stats`) | PARTIAL | PARTIAL |
| Exact per-OS install commands documented | N/A (bundled) | Y | Y | PARTIAL (Windows via WSL guidance) | Y |
| Auth command path documented | N/A (UI-driven) | Y | Y | Y | PARTIAL (flow + env vars) |

## Integration Mode Classification

- NATIVE: Amoena Native.
- FULL: Claude Code, OpenCode.
- PARTIAL: Codex CLI.
- PTY-ONLY: Gemini CLI.

Rationale:

- Amoena Native: built-in agentic loop via Vercel AI SDK with direct provider access, SSE streaming, full session CRUD, memory, hooks engine, and orchestration — no external process dependency.
- Claude Code: bidirectional SDK endpoint + stream-json + hooks + OTEL + persisted session artifacts.
- OpenCode: REST/OpenAPI control plane + SSE event stream + SDK + session CRUD + persistent SQLite.
- Codex CLI: **PARTIAL** — app-server JSON-RPC control plane + session/thread lifecycle APIs + JSONL/SQLite persistence. Classified as PARTIAL because the CLI is undergoing a Rust rewrite (from Node.js) that may substantially change the API surface, binary name, CLI flags, output format, config locations, and authentication flow. The existing APIs are functional but API stability is uncertain until the rewrite stabilizes. Codex CLI would be promoted to FULL when: the Rust rewrite is complete and released, the `codex app-server` interface is declared stable, and the `thread/*`/`turn/*` JSON-RPC methods are confirmed as a long-term supported contract.
- Gemini CLI: strong structured outputs and telemetry, but no equivalent first-class bidirectional app-server/session CRUD API; full orchestration usually requires terminal/process control.

## Programmatic Control Summary

- NATIVE (full internal control):
  - Amoena Native (Vercel AI SDK agentic loop, Axum server, SSE streaming, built-in session/memory/orchestration)
- FULL bidirectional:
  - Claude Code (SDK endpoint and structured programmatic workflows)
  - OpenCode (REST/OpenAPI + SSE + SDK + session CRUD)
- PARTIAL bidirectional:
  - Codex CLI (app-server JSON-RPC over stdio; API in flux due to Rust rewrite; experimental websocket transport)
- PTY/output-driven:
  - Gemini CLI (non-interactive structured output, but no full bidirectional server API)

## Usage / Cost Data Summary

- Claude Code:
  - Session artifacts under `~/.claude/projects/`
  - Stream/json metadata and OTEL metrics (`claude_code.token.usage`, `claude_code.cost.usage`)
- OpenCode:
  - Persistent SQLite at `~/.local/share/opencode/opencode.db` (channel naming can vary)
  - `opencode stats` and session export APIs
- Codex CLI:
  - Rollout JSONL in `~/.codex/sessions/...`
  - History JSONL in `~/.codex/history.jsonl`
  - SQLite state DB (`sqlite_home` / `CODEX_SQLITE_HOME`)
- Gemini CLI:
  - `usageMetadata` in response/stream lifecycle
  - OTEL telemetry with local file/export options
  - Session/checkpoint artifacts under `~/.gemini/tmp/...`

## Source Index

- Claude Code:
  - `https://code.claude.com/docs/en/cli-reference.md`
  - `https://code.claude.com/docs/en/headless.md`
  - `https://code.claude.com/docs/en/setup.md`
  - `https://code.claude.com/docs/en/authentication.md`
  - `https://code.claude.com/docs/en/mcp.md`
  - `https://code.claude.com/docs/en/hooks.md`
  - `https://code.claude.com/docs/en/permissions.md`
  - `https://code.claude.com/docs/en/monitoring-usage.md`
- OpenCode:
  - `https://opencode.ai/docs`
  - `https://opencode.ai/docs/server`
  - `https://raw.githubusercontent.com/anomalyco/opencode/dev/packages/web/src/content/docs/cli.mdx`
  - `https://raw.githubusercontent.com/anomalyco/opencode/dev/packages/web/src/content/docs/sdk.mdx`
  - `https://raw.githubusercontent.com/anomalyco/opencode/dev/packages/web/src/content/docs/plugins.mdx`
  - `https://raw.githubusercontent.com/anomalyco/opencode/dev/packages/web/src/content/docs/config.mdx`
- Codex CLI:
  - `https://developers.openai.com/codex/cli`
  - `https://developers.openai.com/codex/cli/features`
  - `https://developers.openai.com/codex/auth`
  - `https://developers.openai.com/codex/sdk`
  - `https://developers.openai.com/codex/config-reference`
  - `https://raw.githubusercontent.com/openai/codex/main/README.md`
  - `https://raw.githubusercontent.com/openai/codex/main/codex-rs/app-server/README.md`
- Gemini CLI:
  - `https://raw.githubusercontent.com/google-gemini/gemini-cli/main/README.md`
  - `https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/headless.md`
  - `https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/telemetry.md`
  - `https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/tools/mcp-server.md`
  - `https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/reference/configuration.md`
  - `https://raw.githubusercontent.com/google-gemini/gemini-cli/main/packages/core/src/core/turn.ts`
