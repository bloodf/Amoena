# Plugin and Extension Development Overview

Amoena supports two plugin architectures: **Bun-based plugins** (legacy) and **.luna extensions** (current).

## Plugin Architectures

### Bun Plugins (Legacy)
Loaded at runtime from the `plugins/` directory. Implemented as Bun modules with a `manifest.json` and JavaScript/TypeScript code. These are being phased out in favor of the `.luna` extension system.

### .luna Extensions (Current & Recommended)
Single-file binary format (`.luna`) with embedded manifest, assets, and handler code. This is the direction of the platform.

## What Extensions Can Contribute

- **commands** — CLI-style commands registered with the runtime
- **menus** — Menu items in the UI
- **panels** — Custom UI panels loaded in a sandboxed context
- **settings** — Configuration sections in settings UI
- **hooks** — Event handlers for 24 hook event types
- **tools** — Custom tools available to AI agents
- **providers** — Language model providers

## Core Principles

- **manifest-driven** — All capabilities declared upfront
- **explicit permissions** — Extensions request only what they need
- **process-isolated UI** — Panels run in a sandboxed JavaScript context
- **auditable** — All extension actions logged and traceable
- **composable** — Extensions can build on other extensions

## Compatibility

Amoena can import existing Claude Code and OpenCode plugins and normalize them into the `.luna` format.

## Quick Start

For a **.luna extension**, start with [manifest.md](./manifest.md).
For hook integration, see [hooks.md](./hooks.md).
For UI extensions, see [ui-extensions.md](./ui-extensions.md).
For testing and distribution, see [testing-and-release.md](./testing-and-release.md).
