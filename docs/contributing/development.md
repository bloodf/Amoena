# Development

## Setup

Follow the [Installation guide](/getting-started/installation) to get the project running locally. The short version:

```bash
git clone https://github.com/AmoenaAi/amoena.git
cd amoena
bun install
cd packages/ui && bun run build && cd ../..
cd apps/desktop && cargo tauri dev
```

## Project Structure

```
amoena/
├── apps/
│   ├── desktop/          # Tauri desktop app
│   │   ├── src/          # React 19 frontend
│   │   ├── src-tauri/    # Rust backend (Tauri + Axum)
│   │   ├── worker/       # Bun AI worker (Vercel AI SDK)
│   │   └── e2e/          # Playwright E2E tests
│   └── mobile/           # React Native mobile app
├── packages/
│   ├── ui/               # Shared React component library
│   ├── i18n/             # Translations (en, pt, es, fr, de)
│   ├── runtime-client/   # TypeScript client for the Axum API
│   └── tokens/           # Design tokens
├── docs/                 # This documentation site
└── scripts/              # Build and generation scripts
```

## Running Tests

### Rust Tests

```bash
cd apps/desktop/src-tauri
cargo test --no-fail-fast -- --test-threads=1
```

The Rust test suite covers all backend subsystems: repositories, session management, memory, hooks, agents, tools, and API handlers. Tests must run single-threaded due to SQLite state isolation.

### TypeScript / UI Tests

```bash
# All UI tests (vitest)
cd packages/ui
bun run test

# Watch mode
bun run test -- --watch

# Coverage report
bun run test -- --coverage
```

### E2E Tests (Playwright)

E2E tests require a running Amoena instance:

```bash
# Terminal 1: start the app
cd apps/desktop && cargo tauri dev

# Terminal 2: run E2E suite
cd apps/desktop
bun run test:e2e
```

### Type Checking

```bash
# Check all packages
bun run type-check

# Check a specific package
bunx tsc --noEmit -p packages/ui/tsconfig.json
```

### Full Verification

```bash
# Run everything: type-check + desktop tests + mobile tests
bun run dev:verify
```

## Debugging

### Rust Backend

Add `RUST_LOG=debug` before your command:

```bash
RUST_LOG=debug cargo tauri dev
```

Logs appear in the terminal. For persistent logging, check `~/.amoena/logs/amoena.log`.

Use `tracing::debug!()`, `tracing::info!()`, and `tracing::error!()` in Rust code (not `println!`).

### Bun AI Worker

The worker runs as a Tauri sidecar. To debug it directly:

```bash
cd apps/desktop/worker
RUST_LOG=debug bun run index.ts
```

### React Frontend

Open the Tauri webview DevTools:
- macOS: `⌘⌥I`
- Windows/Linux: `Ctrl+Shift+I`

Or use Tauri's `openDevTools` command in development builds.

The frontend uses Zustand for state. Zustand devtools are enabled in development mode and work with the Redux DevTools browser extension (inside the webview).

### API Playground

Enable `dev.enable_api_playground` in settings to expose an interactive API browser at `http://localhost:{port}/playground`. All 110+ endpoints are documented and testable from the playground.

## Adding a New API Endpoint

1. Add the handler in `apps/desktop/src-tauri/src/api/`
2. Register the route in the Axum router
3. Add the Tauri `invoke` command if the operation also needs to be callable from the webview directly
4. Add a corresponding entry in `packages/runtime-client/` for TypeScript callers
5. Write Rust tests for the handler
6. Document the endpoint in `docs/api/`

## Adding a New UI Component

1. Create the component in `packages/ui/src/components/` or `packages/ui/src/composites/`
2. Write a Storybook story in the same directory (`*.stories.tsx`)
3. Write a Vitest test (`*.test.tsx`)
4. Export from `packages/ui/src/index.ts`
5. Add i18n keys for all user-visible strings to `packages/i18n/`

## Storybook

```bash
cd packages/ui
bun run storybook
```

Storybook runs at `http://localhost:6006`. All components require stories before they can be considered complete.

## Documentation

The docs site is VitePress. To run locally:

```bash
bun run docs:dev
```

Docs are served at `http://localhost:5173`. The agent reference at `/reference/built-in-agents` is auto-generated — run `bun run docs:agents:generate` to refresh it.
