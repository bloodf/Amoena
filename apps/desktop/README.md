# Lunaria Desktop

Tauri-based desktop application for AI-assisted development. Provides a local runtime, session management, and an extensible plugin platform backed by a Rust core.

## Prerequisites

- Node.js 20+
- [Bun](https://bun.sh)
- Rust (install via [rustup](https://rustup.rs))
- Tauri CLI

## Setup

1. Install JavaScript dependencies from the monorepo root:

   ```sh
   bun install
   ```

2. Install the Tauri CLI:

   ```sh
   cd apps/desktop && cargo install tauri-cli
   ```

## Development

```sh
bun run --cwd apps/desktop tauri dev
```

This starts the Vite dev server and the Tauri shell together with hot-reload enabled.

To run the web frontend in isolation (no Tauri shell):

```sh
bun run --cwd apps/desktop dev:web
```

## Build

```sh
bun run --cwd apps/desktop tauri build
```

Produces a native installer for the current platform.

## Testing

Run all tests (Rust + TypeScript):

```sh
bun run --cwd apps/desktop test
```

Run only Rust tests:

```sh
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

Run only TypeScript/Vitest tests:

```sh
bunx vitest run --root apps/desktop
```

Run end-to-end tests (Playwright):

```sh
bun run --cwd apps/desktop e2e
```

## Type Checking

```sh
bun run --cwd apps/desktop type-check
```

## Architecture

### Frontend

React 19 + React Router 7 frontend, bundled by Vite. Shared UI components come from `@lunaria/ui`; real-time session data flows through `@lunaria/runtime-client`.

### Rust Backend

The Tauri 2 core (`src-tauri/`) handles:

- **Session management** — spawns and supervises CLI processes via `portable-pty`
- **Local database** — SQLite via `rusqlite` for persisting sessions, history, and extension state
- **System tray** — quick-access tray icon using the `tray-icon` Tauri feature
- **Auto-updater** — in-app update delivery via `tauri-plugin-updater`
- **Secure storage** — credentials stored with `tauri-plugin-stronghold` and OS keyring

### Extension System

Extensions are single `.luna` files distributed and loaded at runtime. The plugin platform exposes rich lifecycle hooks so extensions can augment sessions, add commands, and inject UI panels.

### Real-time Communication

An embedded Axum HTTP server streams Server-Sent Events (SSE) to both the local React frontend and the Lunaria Mobile companion app.

### Internationalisation

Full i18n support via `@lunaria/i18n`, covering: English (`en`), German (`de`), Spanish (`es`), French (`fr`), and Brazilian Portuguese (`pt-BR`).

---

[Back to monorepo root](../../README.md)
