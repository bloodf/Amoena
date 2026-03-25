# Testing And Quality Strategy

## Purpose

This document defines the minimum verification strategy for Amoena across runtime, UI, mobile, docs, and extension surfaces.

## Test Layers

- unit tests
- integration tests
- desktop render/runtime tests
- mobile transport tests
- contract/reference drift checks
- docs-site build checks

## Critical Areas

- provider capability metadata
- reasoning resolution
- `file_ref` / `folder_ref` behavior
- worktree merge review
- subagent event visibility
- pairing/auth/refresh/revocation
- relay encryption boundaries

## Required Verification Classes

### Contracts

- schema drift checks
- Rust/TS contract alignment
- reference-doc drift checks

### Runtime

- session creation
- streaming
- tool execution
- permissions
- workspaces
- merge-review state

### UI

- reasoning controls
- file tree drag/drop
- attachment rendering
- subagent visibility
- merge-review visibility

### Mobile

- pairing
- LAN mode
- relay mode
- token refresh
- permission resolution

## Docs Quality

- docs site build
- broken-link checks
- architecture-to-reference consistency
- prompt catalog consistency

## Acceptance Criteria

- every new architecture feature lands with at least one verification path
- no contract is changed without corresponding docs/reference update

## Test Categories by Layer

### Unit Tests

| Layer | Tool | Location | What to test |
|-------|------|----------|-------------|
| UI components | bun test + Testing Library + happy-dom | `*.test.tsx` co-located | Rendering, user interactions, state changes |
| Rust core | `cargo test` | `tests/` in src-tauri | Business logic, type conversions, error handling |
| Utilities | bun test | `*.test.ts` co-located | Pure functions, formatters, validators |

### Integration Tests

| Layer | Tool | What to test |
|-------|------|-------------|
| IPC boundary | Tauri test harness | Invoke commands produce correct responses |
| Database | `cargo test` with real SQLite | Migrations, queries, concurrent access |
| Bun daemon | bun test with mock socket | JSON-RPC protocol, error handling |

### End-to-End Tests

| Scope | Tool | What to test |
|-------|------|-------------|
| Desktop app | Tauri WebDriver / Playwright | Full user flows: create session, send message, receive response |
| Storybook | Chromatic (optional) | Visual regression across all components |

## Test Conventions

- **Co-located tests:** Test files live next to the code they test (`Component.tsx` → `Component.test.tsx`).
- **No mocking internals:** Mock at system boundaries (provider API, file system), not internal modules.
- **Test behavior, not implementation:** Use Testing Library queries (`getByRole`, `getByText`), never `querySelector` or component internals.
- **Deterministic:** No tests that depend on timing, network, or random values without explicit seeding.

## Coverage Targets

| Package | Line Coverage Target | Notes |
|---------|---------------------|-------|
| packages/ui | 80% | Focus on interactive components |
| src-tauri (Rust) | 70% | Focus on business logic, skip boilerplate |
| Generated types | 0% | Don't test generated code |

## CI Integration

See `docs/developer/ci-cd.md` for how tests run in the CI pipeline.
