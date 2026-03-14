# Lunaria

[![CI](https://github.com/LunariaAi/lunaria/actions/workflows/ci.yml/badge.svg)](https://github.com/LunariaAi/lunaria/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Lunaria** is a desktop-first AI development environment with a paired mobile client for remote control. It provides a fully extensible platform for AI-assisted software development with multi-agent orchestration, intelligent memory, and deep workspace integration.

## Features

- **Multi-Provider AI**: Route between Claude, Codex, Gemini, and OpenCode with intelligent model selection
- **Multi-Agent Orchestration**: Spawn subagents, form teams, and coordinate via mailbox communication
- **Extension System**: Single `.luna` binary format with manifest-driven contributions (commands, menus, panels, settings, hooks, tools, providers)
- **Hook Engine**: 24 event types with command, HTTP, prompt, and agent handlers for automation
- **Memory System**: L0/L1/L2 observation hierarchy with embedding-based retrieval
- **Workspace Management**: Git-integrated workspaces with branch isolation and merge reviews
- **Autopilot Mode**: Autonomous multi-turn task execution with phase tracking
- **Tool Execution**: Permission-brokered tool system with approval workflows
- **Remote Access**: Pair your mobile device via QR/PIN for remote session control
- **Terminal Multiplexing**: Built-in PTY-based terminal sessions
- **i18n**: 5 languages (English, Portuguese, Spanish, French, German)
- **110+ REST/SSE Endpoints**: Complete API for programmatic access
- **267+ Rust Tests**: Comprehensive backend test coverage

## Quick Start

### Prerequisites

- [Rust](https://rustup.rs) 1.75+
- [Node.js](https://nodejs.org) 20+
- [Bun](https://bun.sh) 1.1+
- [Tauri CLI](https://v2.tauri.app/start/prerequisites/) and platform dependencies

### Build & Run

```bash
# Install dependencies
bun install

# Run in development mode
bun run desktop:dev

# Run tests
bun run test
```

### Rust Tests

```bash
cd apps/desktop/src-tauri
cargo test --no-fail-fast -- --test-threads=1
```

## Core Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Tauri 2 |
| Backend Runtime | Rust + Axum |
| Database | SQLite (rusqlite) |
| AI Worker | Bun subprocess |
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS |
| Editor | Monaco |
| Terminal | xterm.js |
| Mobile | React Native (Expo) |

## Repository Structure

```text
.
├── apps/
│   ├── desktop/           # Tauri + Vite desktop shell and Rust runtime
│   └── mobile/            # React Native (Expo) mobile remote client
├── docs/                    # VitePress documentation site
│   ├── api/               # REST/SSE API reference
│   ├── architecture/      # Architecture deep dives
│   ├── extensions/        # Extension development guide
│   ├── features/          # Feature documentation
│   ├── getting-started/   # Quick start and setup
│   └── plugins/           # Plugin development guide
├── packages/
│   ├── i18n/              # Internationalization (5 languages)
│   ├── runtime-client/    # TypeScript HTTP client for the runtime API
│   ├── tokens/            # Design tokens with multi-platform builds
│   └── ui/                # React component library + Storybook
└── scripts/               # Build and code generation scripts
```

## Extension Development

Lunaria is designed to be fully extensible. Extensions use the `.luna` single-file binary format and can contribute:

- **Commands** and **menu items**
- **UI panels** (HTML/JS)
- **Settings** and **configuration options**
- **Hook handlers** for lifecycle events
- **Custom tools** for AI use
- **Provider integrations**

Get started with the boilerplate repos:
- [extension_boilerplate](https://github.com/LunariaAi/extension_boilerplate) — Multi-framework UI extensions (React, Vue, Svelte, Angular, Solid, Preact)
- [plugin_boilerplate](https://github.com/LunariaAi/plugin_boilerplate) — Backend plugins with hooks and lifecycle events

## Documentation

- [Getting Started](docs/getting-started/index.md)
- [Architecture](docs/architecture/index.md)
- [Extensions](docs/extensions/index.md)
- [Plugins](docs/plugins/index.md)
- [API Reference](docs/api/index.md)
- [Features](docs/features/index.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, testing, and PR guidelines.

## License

[MIT](LICENSE)
