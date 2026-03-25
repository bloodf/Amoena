# Architecture Overview

## System Architecture

Amoena is a desktop-first AI development environment built as a Tauri 2 application.

```
┌─────────────────────────────────────────────────┐
│                   Desktop Shell                  │
│              (Tauri 2 + Webview)                 │
├─────────────────────────────────────────────────┤
│                  React 19 UI                     │
│         (TypeScript + Tailwind CSS)              │
├────────────┬─────────────┬──────────────────────┤
│  Runtime   │   i18n      │    Component          │
│  Client    │   Package   │    Library            │
├────────────┴─────────────┴──────────────────────┤
│              REST/SSE API (localhost)             │
├─────────────────────────────────────────────────┤
│               Axum Runtime Server                │
│                   (Rust)                         │
├──────┬──────┬───────┬───────┬───────┬───────────┤
│ AI   │Tool  │Memory │Hook   │Ext.   │Workspace  │
│Worker│Exec. │Service│Engine │Mgr.   │Manager    │
├──────┴──────┴───────┴───────┴───────┴───────────┤
│              SQLite (rusqlite)                    │
└─────────────────────────────────────────────────┘
```

## Core Components

### Runtime Server (Axum)

The Rust backend exposes 110+ REST endpoints and SSE streams via Axum. It starts on a random localhost port and the Tauri shell bootstraps authentication.

Key subsystems:
- **Session Management**: CRUD for sessions with parent/child hierarchy
- **AI Worker Bridge**: Bun subprocess for model inference with streaming
- **Provider Routing**: Intelligent model selection (Claude, Codex, Gemini, OpenCode)
- **Tool Executor**: Permission-brokered tool execution with approval workflows
- **Memory Service**: L0/L1/L2 observation hierarchy with retrieval
- **Hook Engine**: 24 event types with 4 handler types (command, HTTP, prompt, agent)
- **Extension Manager**: .luna single-file format with contribution aggregation
- **Orchestration**: Multi-agent teams, subagents, mailbox communication
- **Workspace Manager**: Git-integrated isolation with merge reviews
- **Remote Access**: Device pairing, LAN discovery, relay protocol

### Data Flow

```
User Input → Session → Message → AI Worker → Tool Calls → Memory → Response
                                     ↓
                              Hook Engine fires
                              at each lifecycle point
```

1. User submits a prompt via the UI
2. Runtime creates a message record and fires `UserPromptSubmit` hook
3. For native sessions, `run_native_turn` sends context to the AI worker
4. AI worker streams tokens back via callback
5. Tool calls are intercepted, permission-checked, and executed
6. `PreToolUse`/`PostToolUse` hooks fire around tool execution
7. Memory observations are captured from the conversation
8. Final response is stored and streamed via SSE

### Extension System

Extensions are packaged as single `.luna` binary files with a magic header (`LUNA`). Each extension declares:
- **Commands**: Actions that can be invoked
- **Menus**: Items injected into UI menus
- **Panels**: HTML/JS UI panels
- **Settings**: Configuration options
- **Hooks**: Event listeners
- **Tools**: Custom tools for AI use
- **Providers**: AI model provider integrations

The `ExtensionManager` discovers, installs, and aggregates contributions from all enabled extensions.

### Plugin vs Extension

| Aspect | Extension (.luna) | Plugin |
|--------|-------------------|--------|
| Format | Single binary file | Installed package |
| UI | Can contribute panels, menus | No UI contributions |
| Scope | Broad (commands, settings, hooks, tools) | Specific (execute actions) |
| Install | Drop file or URL | Registry install |

### Database Schema

SQLite with migration system. Key tables:
- `sessions` — Session records with hierarchy
- `messages` — Conversation messages
- `agents` / `agent_profiles` / `agent_teams` — Multi-agent state
- `hooks` — Registered hook handlers
- `observations` / `embeddings` — Memory system
- `devices` — Remote access paired devices
- `workspaces` — Git workspace state
- `plugins` — Installed plugins
- `tasks` / `pending_approvals` / `tool_executions` — Task and tool state
