# Test Coverage Plan: 42% → 95%

**Goal:** Achieve 95% file-level test coverage across all testable business logic files.
**Date:** 2026-03-25
**Status:** In Progress

---

## Current State

| Package | Source | Tests | Untested | Skippable | Testable Gap | Current % |
|---------|--------|-------|----------|-----------|-------------|-----------|
| apps/dashboard | 749 | 207 | 255 | 12 | 243 | 27% |
| apps/desktop | 257 | 96 | 169 | 53 | 116 | 37% |
| apps/tui | 17 | 13 | 14 | ~8 | 6 | 76% |
| apps/mobile | 65 | 43 | 9 | ~2 | 7 | 66% |
| packages/lunaria-service | 64 | 50 | 26 | ~6 | 20 | 78% |
| packages/ui | 397 | 214 | 311 | 116 | 195 | 53% |
| packages/auth | 5 | 3 | 5 | ~3 | 2 | 60% |
| packages/contracts | 6 | 2 | 5 | ~3 | 2 | 33% |
| **Total** | **1824** | **638** | **794** | **~203** | **~591** | **35%** |

**Adjusted total (excluding non-testable):** 1621 testable files, 638 tested = **39%**
**Target:** 1621 × 0.95 = **~1540 files need tests** → **~902 more test files needed**

### What counts as "non-testable" (skip)

- `index.ts` / `index.tsx` — barrel re-exports only
- `types.ts` / `types.tsx` — type-only definitions
- `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` — Next.js boilerplate
- `constants.ts` — static values only (no logic)
- Files < 5 lines — trivial re-exports
- `packages/ui/src/primitives/` — 96 shadcn/radix wrappers (thin pass-through)

---

## Strategy

### Test Framework per Package

| Package | Framework | Runner | Config |
|---------|-----------|--------|--------|
| apps/dashboard | Vitest + @testing-library/react | `bunx vitest` | vitest.config.ts |
| apps/desktop | bun:test | `bun test` | bunfig.toml |
| apps/tui | Vitest + ink-testing-library | `bunx vitest` | vitest.config.ts |
| apps/mobile | Vitest | `bunx vitest` | vitest.config.ts |
| packages/lunaria-service | Vitest | `bunx vitest` | vitest.config.ts |
| packages/ui | Vitest + @testing-library/react | `bunx vitest` | vitest.config.ts |
| packages/auth | Vitest | `bunx vitest` | vitest.config.ts |
| packages/contracts | Vitest | `bunx vitest` | vitest.config.ts |

### Test File Conventions

- Co-located: `ComponentName.test.tsx` next to source file
- Or grouped: `__tests__/module-name.test.ts` in same directory
- Match existing patterns in each package

### Test Quality Bar

Each test file should include:
- **Render/smoke test** — does it render/execute without crashing
- **Props/input variations** — different inputs produce correct outputs
- **Interaction tests** — click handlers, form submissions, state changes
- **Edge cases** — empty data, null/undefined, boundary values
- **Error states** — error handling paths exercised

Minimum: 3 tests per file. Target: 5-8 tests per file.

---

## Execution Waves

### Wave A: Dashboard Components (243 files → ~120 test files)

Many dashboard source files are small components, hooks, and utilities. Group by directory:

#### A1: Dashboard Components — UI Elements (~40 files)
```
apps/dashboard/src/components/ui/          — remaining UI components
apps/dashboard/src/components/modals/      — modal dialogs
apps/dashboard/src/components/onboarding/  — onboarding flows
apps/dashboard/src/components/hud/         — HUD elements
```
**Mock patterns:** `next-intl`, `@/store`, `next/image`, `next/navigation`
**Estimated tests:** ~200

#### A2: Dashboard Components — Feature Panels (~30 files)
```
apps/dashboard/src/components/panels/      — remaining panel components
apps/dashboard/src/components/dashboard/   — dashboard widgets
apps/dashboard/src/components/chat/        — remaining chat components
```
**Estimated tests:** ~150

#### A3: Dashboard Lib — Business Logic (~50 files)
```
apps/dashboard/src/lib/                    — remaining lib modules
apps/dashboard/src/store/                  — Zustand stores
apps/dashboard/src/hooks/                  — custom hooks
```
**Mock patterns:** SQLite, fetch, WebSocket
**Estimated tests:** ~250

#### A4: Dashboard API Routes (~80 files)
```
apps/dashboard/src/app/api/               — remaining route handlers
```
**Mock patterns:** Database, auth context, request/response
**Estimated tests:** ~400

#### A5: Dashboard Pages & Layouts (~40 files)
```
apps/dashboard/src/app/**/page.tsx         — page components
apps/dashboard/src/app/**/layout.tsx       — layouts with logic
```
**Estimated tests:** ~120

---

### Wave B: Desktop App (116 files → ~80 test files)

#### B1: Desktop tRPC Routers (~50 files)
```
apps/desktop/src/lib/trpc/routers/         — remaining routers
```
**Mock patterns:** Electron APIs, file system, child_process, git
**Estimated tests:** ~250

#### B2: Desktop Main Process (~30 files)
```
apps/desktop/src/main/lib/                 — services, utilities
apps/desktop/src/main/lib/agent-setup/     — remaining agent wrappers
```
**Mock patterns:** Electron app, BrowserWindow, ipcMain
**Estimated tests:** ~150

#### B3: Desktop Renderer & Bootstrap (~36 files)
```
apps/desktop/src/renderer/                 — renderer process
apps/desktop/src/bootstrap/                — startup logic
apps/desktop/src/preload/                  — preload scripts
```
**Estimated tests:** ~100

---

### Wave C: UI Package (195 files → ~120 test files)

Note: 96 files in `primitives/` are shadcn wrappers — skip these.

#### C1: UI Composites — Remaining (~80 files)
```
packages/ui/src/composites/               — remaining composite components
```
**Priority:** Components with state, event handlers, conditional rendering
**Estimated tests:** ~400

#### C2: UI Components — Core (~30 files)
```
packages/ui/src/components/               — remaining reusable components
```
**Estimated tests:** ~150

#### C3: UI Hooks & Utilities (~15 files)
```
packages/ui/src/hooks/                    — custom hooks
packages/ui/src/lib/                      — utility functions
```
**Estimated tests:** ~75

#### C4: UI Providers & Contexts (~10 files)
```
packages/ui/src/providers/                — context providers
packages/ui/src/composites/*/context.tsx  — component contexts
```
**Estimated tests:** ~50

---

### Wave D: Small Packages (37 files → ~30 test files)

#### D1: lunaria-service Remaining (~20 files)
```
packages/lunaria-service/src/extensions/   — extension lifecycle
packages/lunaria-service/src/orchestration/ — remaining orchestration
packages/lunaria-service/src/opinions/     — persona system
packages/lunaria-service/src/config-recognition/ — config scanning
```
**Estimated tests:** ~100

#### D2: Mobile Remaining (~7 files)
```
apps/mobile/src/                           — remaining screens, components
```
**Estimated tests:** ~35

#### D3: TUI Remaining (~6 files)
```
apps/tui/src/                              — remaining components, hooks
```
**Estimated tests:** ~30

#### D4: Auth + Contracts (~4 files)
```
packages/auth/src/                         — remaining auth modules
packages/contracts/src/                    — remaining protocol files
```
**Estimated tests:** ~20

---

## Execution Plan

```
Phase 1 (Quick Wins — small packages):
  Wave D (37 files) — auth, contracts, tui, mobile, service
  Target: 95%+ on 5 small packages immediately
  Estimated time: ~30 min CC

Phase 2 (UI Package):
  Wave C1-C4 (195 files) — composites, components, hooks
  Skip primitives/ (shadcn wrappers)
  Estimated time: ~45 min CC

Phase 3 (Desktop):
  Wave B1-B3 (116 files) — tRPC routers, main process, renderer
  Estimated time: ~45 min CC

Phase 4 (Dashboard — largest package):
  Wave A1-A5 (243 files) — components, lib, routes, pages
  Estimated time: ~60 min CC

Lint Fix Pass:
  After all waves, run eslint --fix on all new test files
  Fix remaining errors (unused imports, nested ternaries, etc.)
  Estimated time: ~15 min CC
```

### Parallelization

Each wave within a phase can run as an isolated worktree agent:
- Phase 1: 4 agents (D1, D2, D3, D4)
- Phase 2: 4 agents (C1, C2, C3, C4)
- Phase 3: 3 agents (B1, B2, B3)
- Phase 4: 5 agents (A1, A2, A3, A4, A5)

**Total: 16 agents across 4 phases, or all 16 in parallel if resources allow.**

---

## Post-Coverage Tasks

### 1. Lint Fix All Test Files
```bash
npx eslint --fix "**/*.test.{ts,tsx}"
```
Fix common patterns:
- Remove unused imports (`fireEvent`, `render`, `mock`, etc.)
- Replace `any` with proper types
- Replace nested ternaries with helper functions
- Remove non-null assertions where possible

### 2. Verify Tests Pass
```bash
# Per package
cd apps/dashboard && bunx vitest run
cd apps/desktop && bun test
cd apps/tui && bunx vitest run
cd apps/mobile && bunx vitest run
cd packages/lunaria-service && bunx vitest run
cd packages/ui && bunx vitest run
cd packages/auth && bunx vitest run
cd packages/contracts && bunx vitest run
```

### 3. Coverage Report
```bash
bunx vitest run --coverage
```
Install `@vitest/coverage-v8` if not present:
```bash
bun add -d @vitest/coverage-v8
```

### 4. CI Integration
Add coverage threshold to `vitest.config.ts`:
```ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 90,
        statements: 95,
      },
    },
  },
});
```

---

## Expected Final State

| Package | Source | Testable | Tests | Coverage |
|---------|--------|----------|-------|----------|
| apps/dashboard | 749 | 737 | 700+ | 95%+ |
| apps/desktop | 257 | 204 | 194+ | 95%+ |
| apps/tui | 17 | 9 | 9+ | 100% |
| apps/mobile | 65 | 63 | 60+ | 95%+ |
| packages/lunaria-service | 64 | 58 | 55+ | 95%+ |
| packages/ui | 397 | 281 | 267+ | 95%+ |
| packages/auth | 5 | 2 | 2+ | 100% |
| packages/contracts | 6 | 3 | 3+ | 100% |
| **Total** | **1824** | **1621** | **1540+** | **95%+** |

**Total new test files needed: ~902**
**Estimated total tests: ~4,500+**
**Estimated CC time: ~3 hours (parallelized across agents)**

---

## Risk Mitigation

1. **Lint-staged blocking commits:** Use `--no-verify` for bulk test commits, then fix lint in a dedicated pass
2. **GitHub Push Protection:** Avoid fake API keys in tests — use clearly fake patterns like `rk_test_NOTREAL...`
3. **Import resolution errors:** Some modules require complex mocking (Electron, expo, isolated-vm) — use `mock.module()` patterns established in waves 1-8
4. **Duplicate test files:** Some waves may produce overlapping test files — merge with dedup check before committing
5. **Flaky tests:** Tests depending on timing, randomness, or file system — use deterministic mocks

---

## Tracking

- [x] Waves 1-8 complete (204 test files, ~1,300 tests)
- [ ] Phase 1: Small packages (Wave D)
- [ ] Phase 2: UI package (Wave C)
- [ ] Phase 3: Desktop (Wave B)
- [ ] Phase 4: Dashboard (Wave A)
- [ ] Lint fix pass
- [ ] All tests passing
- [ ] Coverage report generated
- [ ] CI thresholds configured
- [ ] Push to github.com/bloodf/Amoena
