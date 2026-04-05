# Overview

Amoena is a desktop-first AI development environment built for software engineers who want deep, persistent, multi-agent AI assistance integrated directly into their workflow.

## What is Amoena?

Amoena is a native desktop application (macOS, Windows, Linux) that combines:

- **A local AI runtime**, exposed to the Electron app over a local HTTP API and SSE streams.
- **A React 19 frontend**, running inside the Electron shell with shared UI components and i18n support.
- **Dual execution modes**, native agent workflows and wrapper sessions around Claude Code, Codex CLI, Gemini CLI, or OpenCode.
- **Deep memory**, with SQLite-backed storage and vector-assisted retrieval.
- **Multi-agent orchestration**, including subagents, teams, mailbox flows, and Autopilot.
- **Full extensibility**, through the `.luna` extension format.

## Core Stack

| Layer           | Technology                                 |
| --------------- | ------------------------------------------ |
| Desktop shell   | Electron, electron-vite                    |
| Backend runtime | Bun services, Hono endpoints, SQLite       |
| AI worker       | Bun subprocess + Vercel AI SDK             |
| Frontend        | React 19, TypeScript, Zustand, Tailwind v4 |
| Package manager | Bun 1.1+                                   |
| Testing         | Vitest, Playwright                         |
| i18n            | 5 languages (en, pt, es, fr, de)           |

## How It Works

Amoena runs as a **multi-process system**:

1. **Electron main process** hosts the desktop shell, preload bridge, and service startup.

2. **Renderer UI (React 19)** talks to the local runtime through the launch-context bootstrap flow and subscribes to SSE streams for live updates.

3. **Bun-backed services** handle orchestration, memory, terminal hosting, and other runtime work.

4. **Remote access services** activate when pairing is enabled and proxy approved requests from mobile clients.

5. **Child processes** run wrapper-mode agents such as Claude Code, OpenCode, Codex CLI, or Gemini CLI.

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
