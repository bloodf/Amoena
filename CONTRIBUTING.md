# Contributing to Amoena

Thank you for your interest in contributing to Amoena! This guide covers everything you need to get started: development setup, project structure, testing, coding standards, and the PR process.

## Prerequisites

- **Node.js** 20+
- **Bun** 1.1+ (via [bun.sh](https://bun.sh))

## Development Setup

```bash
# Clone the repository
git clone https://github.com/AmoenaAi/amoena.git
cd amoena

# Install JavaScript dependencies
bun install

# Build the UI package (required before desktop dev)
cd packages/ui && bun run build && cd ../..

# Run the desktop app in development mode
bun run desktop:dev
```

### Development Commands

| Command                 | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `bun run desktop:dev`   | Start desktop app in dev mode (hot reload)        |
| `bun run desktop:test`  | Run desktop test suite                            |
| `bun run desktop:build` | Production build of the desktop app               |
| `bun run mobile:dev`    | Start mobile app in Expo dev server               |
| `bun run mobile:test`   | Run mobile test suite                             |
| `bun run type-check`    | TypeScript type checking across all packages      |
| `bun run lint`          | ESLint across all packages                        |
| `bun run lint:fix`      | ESLint with auto-fix                              |
| `bun run format`        | Prettier formatting                               |
| `bun run format:check`  | Check Prettier formatting                         |
| `bun run dev:verify`    | Full verification: types + desktop + mobile tests |

## Project Structure

```
amoena/
+-- apps/
|   +-- desktop/                   # Electron desktop application
|   |   +-- src/                   # React frontend + Electron main/preload
|   |   +-- resources/             # Icons, entitlements, sounds
|   |   +-- e2e/                   # Playwright E2E tests
|   +-- mobile/                    # Expo React Native companion app
|       +-- src/                   # Mobile screens and components
+-- packages/
|   +-- ui/                        # Shared React component library
|   |   +-- src/composites/        # High-level UI composites
|   |   +-- src/primitives/        # Low-level UI primitives
|   |   +-- src/screens/           # Full-page screen layouts
|   +-- runtime-client/            # Typed HTTP client for the runtime API
|   +-- tokens/                    # Design tokens (colors, spacing, typography)
|   +-- i18n/                      # Internationalization (5 languages)
+-- docs/                          # VitePress documentation site
+-- scripts/                       # Build and code generation scripts
```

## Running Tests

### TypeScript / UI Tests

```bash
# UI component tests (Vitest)
cd packages/ui
bun run test

# Desktop frontend tests
cd apps/desktop
bun run test

# Mobile tests
cd apps/mobile
bun run test
```

### E2E Tests

```bash
cd apps/desktop
bun run e2e
```

### Smoke Test

```bash
# Quick build verification
bun run desktop:smoke
```

### Full Verification

```bash
# Type check + all test suites
bun run dev:verify
```

## Code Style

### TypeScript / React

- **TypeScript**: Strict mode enabled (`strict: true`)
- **Components**: Functional components with hooks (no class components)
- **Formatting**: Prettier (configured in `prettier.config.js`)
- **Linting**: ESLint with React hooks rules (configured in `eslint.config.js`)
- **Imports**: Named exports preferred over default exports
- **i18n**: All user-facing strings must use the i18n system -- no hardcoded English text in UI components

### File Organization

- **Small, focused files**: 200-400 lines typical, 800 lines maximum
- **One component per file** for React components
- **Co-locate tests**: `foo.ts` alongside `foo.test.ts`
- **Feature-based organization**: Group by domain, not by type

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

<optional body>
```

### Types

| Type       | When to Use                             |
| ---------- | --------------------------------------- |
| `feat`     | New feature                             |
| `fix`      | Bug fix                                 |
| `refactor` | Code restructuring (no behavior change) |
| `docs`     | Documentation only                      |
| `test`     | Adding or updating tests                |
| `chore`    | Build, CI, dependency updates           |
| `style`    | Formatting (no logic change)            |
| `perf`     | Performance improvement                 |
| `ci`       | CI/CD configuration                     |
| `build`    | Build system changes                    |
| `revert`   | Reverting a previous commit             |

### Scopes

| Scope            | Covers                           |
| ---------------- | -------------------------------- |
| `desktop`        | Desktop app (frontend + backend) |
| `mobile`         | Mobile companion app             |
| `ui`             | @lunaria/ui component library    |
| `runtime-client` | @lunaria/runtime-client package  |
| `tokens`         | @lunaria/tokens design tokens    |
| `i18n`           | @lunaria/i18n translations       |
| `backend`        | Backend services                 |
| `docs`           | Documentation                    |
| `ci`             | CI/CD pipelines                  |

Commit messages are enforced by commitlint (configured in `commitlint.config.js`).

## Pull Request Process

1. **Fork** the repository and create a feature branch from `main`
2. **Write tests** for new functionality (aim for 80%+ coverage)
3. **Ensure all checks pass**:
   ```bash
   bun run dev:verify      # Types + tests
   bun run format:check   # Formatting
   bun run lint           # Linting
   ```
4. **Update documentation** if your change affects user-facing behavior
5. **Submit a PR** with a clear description of what changed and why

### PR Checklist

- [ ] Tests added or updated for new functionality
- [ ] No compile warnings (TypeScript `type-check`)
- [ ] i18n keys added for any new UI strings
- [ ] Documentation updated if applicable
- [ ] Commit messages follow conventional commits format
- [ ] PR description explains the "why", not just the "what"

### PR Review

All PRs require at least one review approval. Reviewers look for:

- Correctness and edge case handling
- Test coverage
- Code clarity and maintainability
- Adherence to coding standards
- Security implications (no hardcoded secrets, proper input validation)

## Extension Development

See [docs/user-guide/extensions.md](docs/user-guide/extensions.md) for the full extension development guide. Quick overview:

1. Create an extension manifest (JSON) with your contributions
2. Add UI panels (HTML), commands, hooks, tools, or providers
3. Package as a `.luna` file using the binary format
4. Install via the Extensions panel or `amoena extensions install`

## Reporting Issues

- Use [GitHub Issues](https://github.com/AmoenaAi/amoena/issues) with the provided templates
- Include steps to reproduce
- Attach relevant logs from `~/.amoena/logs/`
- Specify your OS, Amoena version, and provider being used

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.
