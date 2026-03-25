# Code Style

## Rust

### Formatting

All Rust code must be formatted with `cargo fmt`:

```bash
cargo fmt --all
```

CI rejects PRs with formatting differences.

### Linting

Zero clippy warnings are required:

```bash
cargo clippy --all-targets --all-features -- -D warnings
```

### Patterns

- **Immutable data** — prefer immutable structs and `Arc<T>` for shared state over `Mutex<RefCell<T>>` where possible.
- **Error handling** — use `anyhow::Result` for application-level errors and `thiserror` for library-level typed errors. Never use `unwrap()` in production code paths; use `?` or explicit `match`.
- **Async** — use `tokio` for async runtime. Prefer `async fn` over manual `Future` implementations.
- **Logging** — use `tracing::info!()`, `tracing::debug!()`, `tracing::error!()`. No `println!` in committed code.
- **Tests** — place unit tests in `#[cfg(test)]` modules in the same file. Integration tests go in `tests/`.

### Naming

Follow [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/):
- Types: `PascalCase`
- Functions and methods: `snake_case`
- Constants: `SCREAMING_SNAKE_CASE`
- Modules: `snake_case`

## TypeScript / React

### Strict Mode

All TypeScript code uses strict mode. `tsconfig.json` sets:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

Never use `any` — use `unknown` with type guards or define proper types.

### Components

- **Functional components only** — no class components.
- **Hooks for state** — use React hooks and Zustand for state management.
- **No mutations** — always create new objects/arrays rather than mutating existing ones. This applies to state updates, event handlers, and utility functions.

```typescript
// Wrong
state.items.push(newItem)

// Correct
setState(prev => ({ ...prev, items: [...prev.items, newItem] }))
```

### i18n — Mandatory

**All user-visible strings must use i18n.** No hardcoded English strings in components.

```tsx
// Wrong
<Button>Save Settings</Button>

// Correct
import { useTranslation } from '@lunaria/i18n'
const { t } = useTranslation()
<Button>{t('settings.save')}</Button>
```

Add translation keys to all 5 language files in `packages/i18n/`:
- `en.json` (source of truth)
- `pt.json`
- `es.json`
- `fr.json`
- `de.json`

Missing translations in non-English locales are acceptable in PRs but must be tracked as issues.

### File Organisation

- **One component per file**
- Files under 800 lines; extract utilities if a file grows beyond this
- Feature-organised, not type-organised:
  - `packages/ui/src/composites/session/` — all session-related composites together
  - Not `packages/ui/src/hooks/` + `packages/ui/src/components/` + `packages/ui/src/utils/` split by type

### Naming Conventions

- Components: `PascalCase` (`SessionComposer.tsx`)
- Hooks: `camelCase` with `use` prefix (`useSessionState.ts`)
- Utilities: `camelCase` (`formatDuration.ts`)
- Stories: `ComponentName.stories.tsx`
- Tests: `ComponentName.test.tsx` or `component-name.test.ts`

### Error Handling

- Never silently swallow errors.
- Use `try/catch` with explicit user-facing error messages for operations that can fail.
- Log detailed context server-side; show friendly messages in the UI.

### Formatting

Amoena uses Biome for formatting and linting:

```bash
# Format
bunx biome format --write .

# Lint
bunx biome check .
```

## Storybook

Every new component requires a Storybook story:

```tsx
// SessionComposer.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { SessionComposer } from './SessionComposer'

const meta: Meta<typeof SessionComposer> = {
  component: SessionComposer,
}
export default meta
type Story = StoryObj<typeof SessionComposer>

export const Default: Story = {}
export const WithAttachments: Story = {
  args: { attachments: [/* ... */] },
}
```

## Testing

See [Development: Running Tests](/contributing/development#running-tests) for commands.

- **Unit tests** — every function with logic gets a unit test.
- **Component tests** — every component gets a Vitest test using `@testing-library/react`.
- **E2E tests** — critical user flows get Playwright coverage.
- **Rust tests** — every repository, handler, and non-trivial utility gets a `#[test]`.

Target: 80% coverage on both Rust and TypeScript.
