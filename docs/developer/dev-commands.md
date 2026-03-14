# Dev Commands

Reference for development scripts and how to verify the dev environment.

## Command Catalog

| Script | Command | Purpose |
|--------|---------|---------|
| `desktop:dev` | `bun run desktop:dev` | Tauri + Vite dev server (http://127.0.0.1:1420) |
| `mobile:dev` | `bun run mobile:dev` | Expo dev server (default port 8081) |
| `docs:dev` | `bun run docs:dev` | VitePress docs dev server |
| `type-check` | `bun run type-check` | TypeScript check for all packages |
| `test` | `bun run test` | Runs `desktop:test` |
| `desktop:test` | `bun run desktop:test` | Cargo + Vitest for desktop |
| `mobile:test` | `bun run mobile:test` | Vitest for mobile |
| `desktop:build` | `bun run desktop:build` | Production Tauri build |
| `desktop:smoke` | `bun run desktop:smoke` | Tauri runtime smoke tests |
| `dev:verify` | `bun run dev:verify` | type-check + desktop:test + mobile:test |

## Prerequisites

- **bun** – `bun install` from repo root
- **Rust / Cargo** – for desktop (Tauri)
- **Node** – for Expo (mobile)

## Verification Checklist

Run from monorepo root:

1. `bun run type-check` – TypeScript compiles for tokens, runtime-client, ui, desktop, mobile
2. `bun run desktop:test` – Cargo + Vitest pass
3. `bun run mobile:test` – Mobile unit tests pass
4. `bun run desktop:dev` – App loads; no Vite pre-transform errors (Ctrl+C when ready)
5. `bun run mobile:dev` – Metro starts; no Babel errors (Ctrl+C when ready)
6. `bun run docs:dev` – Docs load (Ctrl+C when ready)

Or run `bun run dev:verify` for automated type-check and tests.

## Troubleshooting

### Desktop: "Failed to resolve import @/..."

**Cause:** Vite does not read tsconfig paths. The `@` alias must be configured in `apps/desktop/vite.config.ts`.

**Fix:** Ensure `resolve.alias` maps `@` to `packages/ui/src` and `@lunaria/runtime-client` to the runtime-client package.

### Mobile: "Cannot find module 'babel-preset-expo'"

**Cause:** Babel resolves presets from the project context. The preset is a transitive dep of expo but not always resolvable.

**Fix:** Add `babel-preset-expo` explicitly to `apps/mobile/package.json` devDependencies, e.g. `"babel-preset-expo": "~55.0.11"`, then `bun install`.

### Mobile: "Port 8081 is in use"

**Fix:** Run `bun run --cwd apps/mobile start -- --port 8083` (or another free port).
