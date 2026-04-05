# Development

## Setup

Follow the [Installation guide](/getting-started/installation) to get the project running locally. The short version:

```bash
git clone https://github.com/AmoenaAi/amoena.git
cd amoena
bun install
cd packages/ui && bun run build && cd ../..
bun run desktop:dev
```

## Project Structure

```
amoena/
├── apps/
│   ├── desktop/          # Electron desktop app
│   │   ├── src/          # React 19 frontend + Electron main/preload
│   │   ├── resources/   # Icons, entitlements, sounds
│   │   └── e2e/          # Playwright E2E tests
│   └── mobile/           # React Native mobile app
├── packages/
│   ├── ui/               # Shared React component library
│   ├── i18n/             # Translations (en, pt, es, fr, de)
│   ├── runtime-client/   # TypeScript client for the local runtime API
│   └── tokens/           # Design tokens
├── docs/                 # This documentation site
└── scripts/              # Build and generation scripts
```

## Running Tests

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
bun run desktop:dev

# Terminal 2: run E2E suite
cd apps/desktop
bun run e2e
```

### Type Checking

```bash
# Root workspace type-check is currently not a reliable green gate.
# Run targeted checks for the packages you changed.
bunx tsc --noEmit -p packages/ui/tsconfig.json

# Check a specific package
bunx tsc --noEmit -p packages/ui/tsconfig.json
```

### Full Verification

```bash
# Run the checks that match your change scope. The root dev:verify script still inherits the unreliable root type-check.
bun run --cwd apps/desktop test
bun run --cwd apps/mobile test
```

## Debugging

### React Frontend

Open the Electron DevTools:

- macOS: `⌘⌥I`
- Windows/Linux: `Ctrl+Shift+I`

The frontend uses Zustand for state. Zustand devtools are enabled in development mode and work with the Redux DevTools browser extension.

### API Playground

Enable `dev.enable_api_playground` in settings to expose an interactive API browser at `http://localhost:{port}/playground`. All 110+ endpoints are documented and testable from the playground.

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
