# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For the full detailed changelog, see [CHANGELOG.md](https://github.com/AmoenaAi/amoena/blob/main/CHANGELOG.md) in the repository root.

## [0.9.0] - 2026-03-24

- Agent prompt quality evaluation via Promptfoo
- Revised agent prompts based on evaluation scores
- Restructured migration plan and roadmap documentation

## [0.8.0] - 2026-03-22

- Expanded desktop and mobile runtime surfaces
- Comprehensive GUI remediation (type fixes, error handling)
- Tauri plugins: system tray, auto-updater, clipboard, deep links, Stronghold, notifications, and more

## [0.7.0] - 2026-03-20

- GitHub Actions CI/CD workflows for build, test, lint, and release
- Issue templates and release automation

## [0.6.0] - 2026-03-19

- VitePress documentation site with full API reference
- 30+ architecture documents covering all subsystems

## [0.5.0] - 2026-03-18

- 267 Rust tests covering all backend subsystems
- Vitest tests for UI components
- Playwright E2E test specifications

## [0.4.0] - 2026-03-17

- Expo React Native companion mobile app for remote access

## [0.3.0] - 2026-03-16

- React desktop frontend with 15 pages (Home, Session, Agents, Autopilot, Marketplace, Memory, Workspaces, Settings, Providers, Remote, Usage, Tasks, Visual Editor, Opinions)
- Command palette, worker bridge, runtime bootstrap

## [0.2.0] - 2026-03-15

- Extension system with `.luna` binary format
- Plugin registry with multi-ecosystem support
- Remote access with QR/PIN device pairing
- Memory system with L0/L1/L2 tiered observations and hybrid search
- Orchestration engine with agent spawning, teams, and consensus
- Hook engine with 23 event types
- Terminal multiplexing
- CLI wrappers for Claude Code, Codex, Gemini, OpenCode

## [0.1.0] - 2026-03-14

- Monorepo initialization with Bun workspaces
- Design token system, i18n framework (5 languages)
- Typed runtime client with 70+ API methods
- UI component library with 30+ composites
- Tauri backend with Axum runtime server (110+ endpoints)
- SQLite persistence with 20+ repository modules
- Provider system (Claude, Codex, Gemini, OpenCode)
- Routing service with adaptive reasoning
- Session management, autopilot, message queue, task management
- Workspace management with merge reviews
- Usage analytics, file operations, CLI binary
