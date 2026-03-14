# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-14

### Added

- **Runtime Server**: Axum-based REST/SSE runtime with 110+ API endpoints
- **Session Management**: Create, list, delete sessions with parent/child hierarchy
- **AI Worker Bridge**: Bun subprocess for model inference with streaming support
- **Provider System**: Claude, Codex, Gemini, and OpenCode adapter support
- **Multi-Agent Orchestration**: Spawn subagents, form teams, mailbox communication
- **Tool Execution**: Permission-brokered tool system with approval workflows
- **Memory System**: L0/L1/L2 observation hierarchy with embedding-based retrieval
- **Hook Engine**: 23 event types with command, HTTP, prompt, and agent handlers
- **Extension System**: Single `.luna` binary format with manifest-driven contributions (commands, menus, panels, settings, hooks, tools, providers)
- **Plugin Registry**: Install, execute, and manage runtime plugins
- **Workspace Management**: Git-integrated workspaces with branch isolation and merge reviews
- **Remote Access**: Device pairing via QR/PIN, LAN discovery, relay protocol
- **Terminal Multiplexing**: PTY-based terminal sessions with resize support
- **Desktop UI**: React 19 + TypeScript component library with 30+ composites
- **Storybook**: Visual component development and testing
- **i18n**: 5 languages (English, Portuguese, Spanish, French, German)
- **Autopilot Mode**: Autonomous multi-turn task execution with phase tracking
- **Routing Service**: Intelligent provider/model selection based on task type and persona
- **Configuration**: Keyring-based secret storage, scoped settings
- **SQLite Persistence**: Full migration system with 20+ repository modules
- **267 Rust tests** covering all backend subsystems
