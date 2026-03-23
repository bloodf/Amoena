# Architecture Overview

Lunaria is a multi-process AI development environment composed of a native desktop shell, local runtime server, and extensible plugin system.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Tauri Desktop Shell (macOS, Windows, Linux)                 │
├─────────────────────────────────────────────────────────────┤
│ • React 19 UI (Webview)                                     │
│ • Session Manager & Workspace Control                       │
│ • Memory & Agent Orchestration                              │
│ • Plugin Lifecycle Engine                                   │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
      ┌──────▼──────┐              ┌─────────▼────────┐
      │ Bun AI      │              │ Remote Access    │
      │ Worker      │              │ Server (Axum)    │
      │ • Streaming │              │ • QR/PIN pairing │
      │ • Embeddings│              │ • LAN relay      │
      └─────────────┘              └──────────────────┘
```

## Package Structure (18 Packages)

| Layer | Package | Purpose |
|-------|---------|---------|
| Desktop | `desktop` | Tauri shell + React UI |
| Backend | `runtime` | Axum server + core managers |
| Memory | `memory` | Observation hierarchy + embeddings |
| Agents | `agents` | Multi-agent orchestration + Autopilot |
| Tools | `tools` | Tool execution sandbox |
| Extensions | `extensions` | Plugin framework + lifecycle |
| Providers | `providers` | Claude, Codex, Gemini, OpenCode adapters |
| Utils | `shared`, `types`, `config` | Common types + configuration |

## Data Flow

```
User Input (Chat, Tool Execution, Commands)
    ↓
Session Manager (Tauri)
    ↓
Agent Orchestrator (Route to provider + context)
    ↓
Memory System (Retrieve observations + context)
    ↓
Bun AI Worker (Stream responses via Vercel SDK)
    ↓
Tool Executor (Sandbox execution with safety checks)
    ↓
Workspace Manager (Git integration + merge review)
    ↓
Output Streamed to UI via Tauri Events
```

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Desktop Shell | Tauri 2 (Rust) |
| Frontend | React 19, TypeScript, Zustand, Tailwind v4 |
| Backend | Axum (Rust), SQLite, LanceDB |
| AI SDK | Vercel AI SDK, Bun |
| Extensibility | Manifest-driven plugin system |
| Testing | Vitest, Playwright, Cargo test |
| i18n | 5 languages (en, pt, es, fr, de) |

## Core Subsystems

- **Provider Manager** — Route to Claude, Codex, Gemini, OpenCode with model selection
- **Memory Manager** — L0/L1/L2 observations with embedding-based search
- **Agent Orchestrator** — Spawn teams, coordinate via mailbox, run Autopilot
- **Workspace Manager** — Branch-isolated workspaces with merge conflict resolution
- **Tool Executor** — Sandbox execution with capability checking and error recovery
- **Hook Engine** — Extensibility points: pre/post hooks for all operations
- **Remote Access** — QR/PIN pairing for mobile device control

See [full architecture docs](/architecture/) for system design, security model, and data consistency.
