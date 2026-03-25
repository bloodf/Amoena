# Quick Start

This guide walks you through your first session in Amoena from launch to a working AI interaction.

## 1. Launch Amoena

Start the app. On first launch, the **Setup Wizard** runs automatically:

1. **Backend step** — choose Native mode (Amoena's built-in agentic loop) or select a Wrapper (Claude Code, Codex CLI, Gemini CLI, OpenCode).
2. **Provider step** — pick your default AI provider and enter your API key. Keys are stored in the OS keyring; they are never written to disk in plaintext.
3. **Model step** — select the default model for your provider.
4. **Profile step** — optional name and persona configuration.
5. **Memory step** — configure observation capture (enabled by default).

## 2. Create a Session

From the main workspace, click **New Session** (or press `⌘N` / `Ctrl+N`).

A session is an AI conversation context. Each session has:

- An isolated message history persisted to SQLite
- Its own tool permission state
- Optional workspace association (git branch)
- Optional parent session (for subagent hierarchies)

### Session Modes

| Mode | Description |
|------|-------------|
| **Native** | Amoena's own agentic loop via Vercel AI SDK. Full control: subagents, memory injection, hooks, autopilot. |
| **Wrapper** | Amoena acts as a GUI shell around an external CLI tool (Claude Code, Codex, Gemini CLI, OpenCode). |

Both modes produce the same message timeline UI and write to the same persistence layer.

## 3. Send a Message

Type in the composer at the bottom of the session workspace and press `Enter` or click **Send**.

The AI response streams in real-time via Server-Sent Events. You'll see:

- **Text blocks** — the model's prose response
- **Tool use blocks** — when the model invokes a tool (file read, shell command, etc.)
- **Tool result blocks** — the output returned to the model after execution

## 4. Approve Tool Execution

When the AI requests to use a tool (e.g., read a file, run a shell command), a **permission dialog** appears. You can:

- **Allow once** — approve for this invocation only
- **Allow always** — remember the permission for this session
- **Deny** — block the tool use and return an error to the model

Tool permissions are scoped per-session and persist for the session lifetime. You can review and revoke permissions from the session side panel.

## 5. View the Message Timeline

The **Message Timeline** in the centre panel shows the full conversation history, including:

- User messages
- Assistant text and thinking blocks
- Tool invocations and their results
- Agent status events (for native multi-agent sessions)

## 6. Use the Memory System

Amoena automatically captures observations from your sessions. The **Memory** tab in the side panel shows recent observations tagged by tier:

| Tier | Description |
|------|-------------|
| **L0** | Raw observations (tool outputs, code snippets) |
| **L1** | Summarised facts extracted from L0 |
| **L2** | High-level abstractions and preferences |

Memory is retrieved via embedding-based search and injected into new sessions automatically based on relevance.

## 7. Open a Workspace

Link your session to a git repository via the **Workspaces** panel. Amoena creates a dedicated branch for the session's work. When the session ends, you can:

- Review the diff in the **Merge Review** panel
- Merge, discard, or export the changes

## 8. Next Steps

- [Configuration](/getting-started/configuration) — set up multiple providers, scoped settings, keyring
- [Features: Sessions](/features/sessions) — full session lifecycle documentation
- [Features: Multi-Agent](/features/agents) — subagents, teams, and autopilot
- [Extensions](/extensions/) — add custom commands, panels, and tools
