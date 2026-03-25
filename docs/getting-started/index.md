# Overview

Amoena is a desktop-first AI development environment built for software engineers who want deep, persistent, multi-agent AI assistance integrated directly into their workflow.

## What is Amoena?

Amoena is a native desktop application (macOS, Windows, Linux) that combines:

- **A local AI runtime** — Axum-based server exposing 110+ REST and SSE endpoints, running entirely on your machine.
- **A React 19 frontend** — high-performance webview shell with a full component library, Storybook, and i18n support for 5 languages.
- **Dual execution modes** — Native mode (Amoena's own agentic loop via Vercel AI SDK) and Wrapper mode (GUI shell around Claude Code, Codex CLI, Gemini CLI, or OpenCode).
- **Deep memory** — L0/L1/L2 observation hierarchy backed by SQLite and LanceDB vector search.
- **Multi-agent orchestration** — subagent spawning, team formation, mailbox-based communication, and Autopilot for autonomous task execution.
- **Full extensibility** — single `.luna` binary extensions with manifest-driven contributions and rich lifecycle hooks.

## Core Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | [Tauri 2](https://v2.tauri.app) (Rust) |
| Backend runtime | Axum (Rust), SQLite, LanceDB |
| AI worker | Bun subprocess + Vercel AI SDK |
| Frontend | React 19, TypeScript, Zustand, Tailwind v4 |
| Package manager | Bun 1.1+ |
| Testing | Rust `cargo test`, Vitest, Playwright |
| i18n | 5 languages (en, pt, es, fr, de) |

## How It Works

Amoena runs as a **multi-process system**:

1. **Tauri Main Process (Rust)** — the state authority. Hosts all core managers: Provider Manager, Memory Manager, Agent Orchestrator, Workspace Manager, Tool Executor, Hook Engine, Session Manager, Autopilot Engine. Manages the SQLite database and communicates with the webview via zero-copy `invoke()` calls.

2. **Webview (React 19)** — the UI. Uses Tauri `invoke()` for all local operations and subscribes to Tauri events for real-time updates (streaming session output, agent progress, permission requests).

3. **Bun AI Worker** — a persistent daemon that handles Vercel AI SDK interactions: provider streaming, embeddings, and model factory calls. The Tauri process remains state authority; Bun is a computation worker.

4. **Remote Access Server (Axum)** — activated only when remote access is enabled. Proxies requests from paired mobile/remote clients to the same core managers.

5. **Child Processes (Wrapper Mode)** — per-session child processes for Claude Code, OpenCode, Codex CLI, or Gemini CLI, managed by the Session Manager.

## What You Can Do

- **Create AI sessions** in native or wrapper mode, with streaming output, tool execution, and full message history.
- **Build with multiple AI providers** — Claude, Codex, Gemini, OpenCode — with intelligent routing based on task type and persona.
- **Use the memory system** — observations are automatically captured and retrieved across sessions using embedding-based search.
- **Orchestrate multi-agent workflows** — spawn subagents, form teams, run Autopilot for fully autonomous task execution.
- **Manage git workspaces** — branch-isolated workspaces with merge review and conflict resolution.
- **Control remotely** — pair your mobile device via QR code or PIN for remote session access over LAN or relay.
- **Write extensions** — add commands, UI panels, hooks, tools, and custom providers using the `.luna` format.

## Next Steps

- [Installation](/getting-started/installation) — prerequisites and setup
- [Quick Start](/getting-started/quickstart) — your first session in 5 minutes
- [Configuration](/getting-started/configuration) — providers, settings, and secrets

## Existing Documentation

The `docs/` directory also contains in-depth technical material:

- [Architecture](/architecture/system-architecture) — process model, subsystems, security
- [Product docs](/product/) — user-facing feature walkthroughs
- [Developer docs](/developer/) — plugin authoring, adapter guide, CI/CD
- [API Reference](/developer/api-reference) — full endpoint catalogue
- [Reference](/reference/) — settings keys, event payloads, model capabilities
