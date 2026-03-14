# Developer Testing Strategy

## Purpose

Contributor-facing summary of how Lunaria verifies runtime and UI behavior.

## Main Commands

- `bun run type-check`
- `bun run test`
- `bun run build`
- `bun run desktop:smoke`

## Required Mindset

- contract-first
- evidence before claims
- narrow focused tests for changed behavior
- update docs when behavior or contracts change

## Key Risk Areas

- streaming
- permissions
- worktrees
- reasoning resolution
- remote access
- plugin compatibility
