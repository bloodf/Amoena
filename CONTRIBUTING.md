# Contributing to Lunaria

Thank you for your interest in contributing to Lunaria! This guide will help you get started.

## Prerequisites

- **Rust** 1.75+ (via [rustup](https://rustup.rs))
- **Node.js** 20+
- **Bun** 1.1+ (via [bun.sh](https://bun.sh))
- **Tauri CLI** (`cargo install tauri-cli`)
- **Platform dependencies**: See [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

## Development Setup

```bash
# Clone the repository
git clone https://github.com/LunariaAi/lunaria.git
cd lunaria

# Install JavaScript dependencies
bun install

# Build the UI package
cd packages/ui && bun run build && cd ../..

# Run the desktop app in development
cd apps/desktop && cargo tauri dev
```

## Running Tests

```bash
# Rust tests
cd apps/desktop/src-tauri
cargo test --no-fail-fast -- --test-threads=1

# TypeScript/UI tests
cd packages/ui
bun run test

# E2E tests (requires running app)
cd apps/desktop
bun run test:e2e
```

## Code Style

### Rust
- Follow standard Rust formatting (`cargo fmt`)
- Zero clippy warnings (`cargo clippy`)
- Immutable data patterns preferred

### TypeScript/React
- TypeScript strict mode
- Functional components with hooks
- All UI strings must use i18n (no hardcoded English)

## Pull Request Process

1. Fork the repository and create a feature branch
2. Write tests for new functionality
3. Ensure all tests pass and there are zero compile warnings
4. Update documentation if needed
5. Submit a PR with a clear description

### PR Checklist
- [ ] Tests added/updated
- [ ] No compile warnings (Rust + TypeScript)
- [ ] i18n keys added for any new UI strings
- [ ] Documentation updated if applicable

## Extension Development

See [docs/architecture/plugin-framework.md](docs/architecture/plugin-framework.md) for the extension development guide. Extensions use the `.luna` single-file format.

Quick start:
1. Create an extension manifest (JSON)
2. Add your UI panels, commands, or hooks
3. Package as a `.luna` file
4. Drop into the Extensions panel or install via CLI

## Reporting Issues

- Use GitHub Issues with the provided templates
- Include reproduction steps
- Attach relevant logs from `~/.lunaria/logs/`

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.
