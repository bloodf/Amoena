# Monorepo Structure & Workspace Organization

## Overview

Lunaria uses a **single bun-workspace monorepo**.

- The current primary application is `apps/desktop`.
- The future secondary application is `apps/mobile`.
- Shared packages live under `packages/*`.
- There is **no web application** in the active repository plan.

This document describes the structure we should build against in this repo now. It replaces the earlier multi-repo and web-app assumptions.

## Key Decisions

- **Package manager**: bun
- **Workspace model**: single repository with `apps/*` and `packages/*`
- **Desktop first**: `apps/desktop` is the primary product and source of execution
- **Mobile second**: `apps/mobile` will be added to this repo when remote access is implemented
- **Shared packages**: UI, tokens, adapters, and core types live in `packages/*`

## Target Repository Layout

```text
lunaria/
├── package.json
├── bun.lock
├── tsconfig.json
├── scripts/
├── tests/
├── docs/
│   ├── architecture/
│   ├── prompts/
│   └── plans/
├── apps/
│   ├── desktop/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── index.html
│   │   ├── src/
│   │   └── src-tauri/
│   └── mobile/                     # planned, not required before remote/mobile work begins
│       ├── package.json
│       ├── app.json
│       └── src/
└── packages/
    ├── core/
    ├── adapters/
    ├── ui/
    ├── tokens/
    └── i18n/
```

## Current Workspace Rules

### Root `package.json`

The root workspace owns shared scripts and targets all workspaces through:

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

Use the root for:

- `bun run type-check`
- `bun run test`
- `bun run build`
- desktop smoke/build orchestration

### Application Boundaries

#### `apps/desktop`

Owns:

- Tauri shell
- Axum runtime
- desktop React UI
- local SQLite database
- native and wrapper execution

#### `apps/mobile`

Will own:

- React Native app
- paired-device connection state
- remote session UI
- mobile notifications and device registration

It does **not** own:

- provider credentials
- session authority
- tool execution
- persistent runtime state

### Shared Packages

#### `packages/core`

Use for:

- shared domain types
- protocol/event envelopes
- validation helpers
- config schemas

#### `packages/adapters`

Use for:

- adapter capability metadata
- shared runtime contracts
- test fixtures and compatibility helpers

#### `packages/ui`

Use for:

- shared React component primitives and composites
- token-driven styling
- desktop/mobile-compatible visual building blocks where practical

#### `packages/tokens`

Use for:

- color, spacing, typography, motion, and semantic token exports

#### `packages/i18n`

Use for:

- translation resources
- locale helpers

## Build And Tooling Expectations

- Use **bun** for installs, scripts, and tests.
- Keep **TypeScript strict** across all workspaces.
- Prefer **shared types generated from Rust-owned contracts** where the architecture requires them.
- Keep **desktop runtime authority** in Rust/Axum even when frontend or mobile packages share models.

## Desktop Build Flow

```text
packages/* build or type-check
        ↓
apps/desktop frontend build
        ↓
apps/desktop/src-tauri cargo build
        ↓
Tauri bundle / desktop smoke tests
```

## Mobile Build Flow

Mobile work begins only after the desktop remote-access contracts are stable.

```text
packages/core + packages/ui + packages/tokens ready
        ↓
apps/mobile React Native app consumes shared packages
        ↓
paired-device transport and notification integration
        ↓
React Native build / device testing
```

## Development Workflow

### Common Commands

```bash
bun install
bun run type-check
bun run test
bun run build
```

### Desktop

```bash
bun run --cwd apps/desktop dev
bun run desktop:smoke
```

### Mobile

Mobile commands should only be added once `apps/mobile` exists.

## Non-Goals

- No separate web repository
- No TanStack Start app
- No multi-repo/submodule orchestration
- No Turborepo dependency graph assumptions

## Summary

Build against one repo, one workspace graph, one authoritative desktop runtime, and one future mobile client. If a doc assumes web, submodules, or a separate orchestration repo, it is stale.

*Last updated: 2026-03-10*
