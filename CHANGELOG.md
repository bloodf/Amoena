# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-24

### Added

- **@lunaria/contracts**: Shared type system for cross-package type safety with runtime validation
- **CQRS Event-Sourced Engine**: Command/query separation with event stores, projections, and deterministic replay
- **Terminal UI (TUI)**: Standalone and server dual-mode terminal interface with PTY multiplexing
- **Extension Runtime**: Isolated-vm sandboxed execution with single `.luna` file format and manifest-driven contributions
- **Settings Persistence**: Workspace-scoped and global-scoped configuration with migration support
- **Real Gemini Adapter**: Native Google AI model integration with streaming support
- **OAuth Browser Flow**: Provider authentication via browser-based OAuth with token refresh
- **Usage Telemetry & Cost Tracking**: Per-session and aggregate usage metrics across all AI providers
- **Remote Access Relay**: UDP LAN discovery, QR/PIN device pairing, and secure relay protocol
- **Mission Control**: Multi-agent orchestration UI with goal templates, DAG execution, agent leaderboard, run comparison, and shareable reports with secret scrubbing
- **80%+ Test Coverage**: Comprehensive Rust and TypeScript test suites across all packages
- **Full Documentation**: API reference, architecture guides, extension development docs, and getting started tutorials
- **Accessibility (WCAG AA)**: Keyboard navigation, screen reader support, focus management, and color contrast compliance across all UI components

### Changed

- Upgraded from prototype (v0.1.0) to stable release with production-ready APIs
- All public APIs are now considered stable and subject to semantic versioning guarantees

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
