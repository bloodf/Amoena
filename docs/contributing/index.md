# Contributing to Amoena

Thank you for your interest in contributing to Amoena! This guide will help you get started.

## Prerequisites

| Tool        | Version | Install                          |
| ----------- | ------- | -------------------------------- |
| **Node.js** | 20+     | [nodejs.org](https://nodejs.org) |
| **Bun**     | 1.1+    | [bun.sh](https://bun.sh)         |

## Development Setup

```bash
# Clone the repository
git clone https://github.com/AmoenaAi/amoena.git
cd amoena

# Install JavaScript dependencies
bun install

# Build the UI package
cd packages/ui && bun run build && cd ../..

# Run the desktop app in development
bun run desktop:dev
```

See [Development](/contributing/development) for a full breakdown of the dev workflow, test commands, and debugging.

## Pull Request Process

1. Fork the repository and create a feature branch from `main`
2. Write tests for new functionality (see [testing guidelines](/contributing/development#testing))
3. Ensure the relevant tests and package-level checks for your change pass
4. Update documentation if needed
5. Submit a PR with a clear description referencing any related issues

### PR Checklist

- [ ] Tests added/updated for new behaviour
- [ ] No compile warnings (TypeScript)
- [ ] i18n keys added for any new UI strings (no hardcoded English)
- [ ] Documentation updated if applicable
- [ ] Relevant package checks pass, do not rely on the current root `bun run type-check` as a repo-wide green gate

## Commit Message Format

Amoena uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `ci`, `build`, `revert`

Examples:

```
feat(sessions): add parent session linking
fix(memory): correct embedding batch size for large contexts
docs(api): document SSE event payload shapes
```

## Extension Development

Extensions use the `.luna` single-file binary format. See [Extensions](/extensions/) for the full guide.

Quick start:

1. Create an extension manifest (`manifest.json`)
2. Add your UI panels, commands, hooks, tools, or providers
3. Bundle as a `.luna` file
4. Drop into the Extensions panel or install via `amoena://extension/install?...`

## Reporting Issues

- Use [GitHub Issues](https://github.com/AmoenaAi/amoena/issues) with the provided templates
- Include reproduction steps
- Attach relevant logs from `~/.amoena/logs/`

## Code of Conduct

Please read our [Code of Conduct](https://github.com/AmoenaAi/amoena/blob/main/CODE_OF_CONDUCT.md) before contributing.

## Further Reading

- [Development Setup](/contributing/development) — running tests, debugging, workspace setup
- [Code Style](/contributing/code-style) — TypeScript, i18n, immutability rules
- [Releasing](/contributing/releasing) — release process
