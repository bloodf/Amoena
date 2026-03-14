# CI/CD Pipeline

## Overview

Lunaria uses GitHub Actions for continuous integration and deployment. The pipeline validates code quality, runs tests, and builds release artifacts.

## Pipeline Stages

### On Every PR

| Stage | What it does | Fails on |
|-------|-------------|----------|
| Lint | `clippy` (Rust), TypeScript strict check | Any warning or error |
| Type bindings | `cargo test --test=generate-types` | Drift between Rust and generated `.ts` files |
| Unit tests | `bun test` for UI package | Any test failure |
| Build check | `cargo check` for Tauri backend | Compilation error |
| Storybook build | `bun run build-storybook` | Build failure |

### On Merge to Main

| Stage | What it does |
|-------|-------------|
| All PR checks | Re-run on merged code |
| Integration tests | Longer-running tests that hit real databases |
| Storybook deploy | Deploy Storybook to preview URL |

### On Release Tag

| Stage | What it does |
|-------|-------------|
| All main checks | Full validation |
| Desktop build | Tauri build for macOS (arm64 + x86_64), Linux (x64), Windows (x64) |
| Release artifacts | Upload signed binaries to GitHub Release |
| Auto-update manifest | Update Tauri auto-update endpoint |

## Type Binding Verification

The CI pipeline enforces Rust to TypeScript type safety:

```yaml
# Simplified workflow step
- name: Verify type bindings
  run: |
    cargo test --test=generate-types
    git diff --exit-code packages/ui/src/types/generated/
```

If the generated TypeScript files differ from what's committed, the build fails. Developers must regenerate bindings locally and commit the updated files.

## Local CI Reproduction

Run the same checks locally before pushing:

```bash
# Rust checks
cargo clippy --all-targets -- -D warnings
cargo test --test=generate-types

# TypeScript checks
bun run --cwd packages/ui test

# Storybook build
bun run --cwd packages/ui build-storybook
```

## Secrets Management

| Secret | Purpose | Stored in |
|--------|---------|-----------|
| `TAURI_SIGNING_PRIVATE_KEY` | Sign desktop release binaries | GitHub Secrets |
| `APPLE_CERTIFICATE` | macOS code signing | GitHub Secrets |
| `APPLE_ID` / `APPLE_PASSWORD` | macOS notarization | GitHub Secrets |

No API keys for LLM providers are used in CI. Those are user-provided at runtime.
