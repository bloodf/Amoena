# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive v1.0 documentation: user guides, architecture docs, CLI reference
- CONTRIBUTING.md with full development workflow
- This CHANGELOG with retroactive entries for all releases

## [0.9.0] - 2026-03-24

### Added

- **Agent prompt quality**: Promptfoo evaluation framework for agent persona prompts
- **Prompt improvements**: Revised agent prompts based on evaluation scores

### Changed

- Agent orchestrator prompt replaced tmux-based approach with Claude Code agents
- Migration plan and roadmap documentation restructured

## [0.8.0] - 2026-03-22

### Added

- **Desktop runtime surfaces**: Expanded Tauri plugin integration and mobile runtime API
- **GUI remediation**: Comprehensive type fixes across pages and components
- **Tauri plugins**: System tray, frameless window, clipboard, deep links, auto-updater, single instance, window state persistence, Stronghold keychain, notifications, file system, process management, persisted scope

### Fixed

- Type mismatches between UI composites and runtime API
- Provider setup page rendering issues
- Remote access page error handling
- Session workspace hydration race conditions

## [0.7.0] - 2026-03-20

### Added

- **GitHub Actions**: CI/CD workflows for build, test, lint, and release
- **Issue templates**: Bug report and feature request templates
- **Release automation**: Automated Tauri builds for macOS, Windows, and Linux

## [0.6.0] - 2026-03-19

### Added

- **VitePress documentation site**: Full API reference for 15 domains (sessions, agents, extensions, hooks, memory, workspaces, tasks, queue, providers, settings, remote, terminal, plugins, usage, files)
- **Architecture docs**: 30+ architecture documents covering all subsystems
- **Extension docs**: .luna format specification, contribution point reference
- **Feature docs**: Agents, autopilot, memory, providers, routing, sessions, terminal, workspaces

## [0.5.0] - 2026-03-18

### Added

- **Rust test suite**: 267 tests covering all backend subsystems
- **Vitest tests**: UI component and composites tests
- **E2E specs**: Playwright end-to-end test specifications
- Integration tests for orchestration, memory, hooks, extensions, config, workspace lifecycle, terminal, remote access, and CLI parity

## [0.4.0] - 2026-03-17

### Added

- **Expo React Native app**: Companion mobile app for remote access
  - Device pairing via QR code and PIN
  - Remote session viewing and message sending
  - Permission approval from mobile

## [0.3.0] - 2026-03-16

### Added

- **React frontend**: Desktop UI with Vite + React 19 + TypeScript
  - Home page with workspace overview, recent sessions, system health, quick actions
  - Session workspace page with message stream, terminal, and agent panel
  - Agent management page with team stats, consensus meter, communication flow
  - Autopilot page with phase tracker, activity log, story steps
  - Marketplace page with extension browsing and installation
  - Memory browser page for searching and viewing observations
  - Workspace manager page with branch isolation view
  - Provider setup page with model selection and auth flow
  - Remote access page with device pairing
  - Settings page with scoped configuration
  - Usage analytics page with charts and provider breakdown
  - Task board (Kanban) with drag-and-drop
  - Visual editor page
  - Opinions page for team feedback
  - Command palette (Cmd+K)
- **Worker bridge**: Bun subprocess communication (`worker/bridge.ts`)
- **Runtime bootstrap**: Tauri IPC launch context resolution

## [0.2.0] - 2026-03-15

### Added

- **Extension system**: Single `.luna` binary format with manifest-driven contributions
  - Parser and writer for the LUNA binary format (magic bytes, versioned, asset bundling)
  - Extension loader with filesystem discovery
  - Extension manager with activation events, contribution aggregation, panel HTML serving
  - Contribution types: commands, menus, panels, settings, hooks, tools, providers
- **Plugin registry**: Install, execute, toggle, and health-check runtime plugins
  - Plugin ecosystems: Claude Code, OpenCode, Lunaria, Custom
  - Health monitoring with error tracking and latency metrics
- **Remote access**: Device pairing with QR/PIN, LAN discovery, relay protocol
  - Token rotation with family-based revocation
  - Scope-based authorization (read, write, execute)
  - Permission resolution for remote sessions
- **CLI wrappers**: Health check, run, chat, and compare across Claude Code, Codex, Gemini, OpenCode

### Added (Backend Services)

- **Tool execution system**: Permission-brokered tool registry with 4-level ceiling (read_only, read_write, shell_access, admin)
- **Memory system**: L0/L1/L2 tiered observation hierarchy
  - Automatic category classification (profile, preference, entity, pattern, tool_usage, skill)
  - Concept extraction from narratives
  - Content deduplication via SHA-256 hashing
  - Semantic near-duplicate detection (Jaccard similarity >= 0.50)
  - Embedding generation via OpenAI text-embedding-3-small
  - Hybrid search combining FTS5 full-text search with cosine vector similarity
  - Reciprocal Rank Fusion (RRF) scoring for result merging
  - Session summary tracking (request, investigated, learned, completed, next steps)
- **Orchestration**: Agent spawning with persona-based profiles, team creation, mailbox communication, weighted consensus evaluation, mailbox flags
- **Terminal multiplexing**: PTY-based terminal sessions with resize support
- **Hook engine**: 23 event types with 4 handler types (command, HTTP, prompt, agent)
  - Import support for Claude Code hooks.json and OpenCode hooks
  - Configurable timeout and priority per hook
  - Regex-based event matching

## [0.1.0] - 2026-03-14

### Added

- **Monorepo initialization**: Bun workspaces with `apps/*` and `packages/*`
- **Design token system** (`@lunaria/tokens`): Multi-platform token builds (CSS, JSON, native)
  - Lunaria semantic color palette and theme definitions
- **Internationalization** (`@lunaria/i18n`): Framework supporting 5 languages (English, Portuguese, Spanish, French, German)
  - React hooks and native bindings
- **Runtime client** (`@lunaria/runtime-client`): Typed HTTP client with 70+ methods covering all API domains
  - Bearer token auth, SSE stream URLs, error extraction
- **UI component library** (`@lunaria/ui`): 30+ composite components
  - Settings: sidebar, content pane, scoped sections
  - Home: workspaces panel, quick tips, system health, recent sessions, quick actions
  - Tasks: Kanban board with columns and cards
  - Opinions: sidebar, list, add form
  - Composer: input area, toolbar, palette menu, attachment dock, recording
  - Provider setup: API key row, model list, model row
  - Marketplace: toolbar, sidebar, featured section, results grid, item card, detail panel, install review sheet
  - Agents: agent row, detail sheet, management header/tabs, team list pane, team status table, team stats grid, team consensus meter, team communication flow, sub-agent swarm grid
  - Storybook stories for all composites
- **Tauri backend**: Axum-based runtime server with REST + SSE API
  - **Configuration**: Scoped settings (global, per-TUI, per-session), keychain secret storage via Stronghold, data directory resolution
  - **Persistence**: SQLite database with migration system, 20+ repository modules
  - **Provider system**: Claude, Codex, Gemini, and OpenCode adapters with OAuth and API key authentication
  - **Routing service**: Intelligent provider/model selection based on task type, persona, and division. Adaptive reasoning mode (on/off/auto) with configurable effort levels
  - **Session management**: Create, list, delete sessions with parent/child hierarchy. Wrapper mode (Claude Code, Codex, Gemini, OpenCode) and native mode
  - **Autopilot**: Autonomous multi-turn execution with phase tracking, activity log, story steps, run history, and sub-agent spawning
  - **Message queue**: Ordered message queue per session with enqueue, edit, remove, reorder, flush
  - **Task management**: Hierarchical tasks with priority, status tracking, and reordering
  - **Workspace management**: Git-integrated workspaces with branch isolation, merge reviews, contributing agent tracking, and team consensus scoring
  - **Usage analytics**: Token and cost tracking per provider/model with daily aggregation
  - **File operations**: Read, write, and tree listing for workspace files
  - **CLI binary** (`lunaria`): Full command-line interface with 15 subcommand groups, auto-discovery of running desktop instance, headless runtime fallback
  - **Persona profiles**: Agent personality definitions loaded from Markdown files, organized by division
  - **Structured logging**: tracing-based logging with file output
  - **Native menu bar**: macOS/Windows/Linux menu integration
  - **System tray**: Hide-to-tray on close, tray icon with context menu
