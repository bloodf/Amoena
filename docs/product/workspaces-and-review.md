# Workspaces And Review

Amoena uses isolated workspaces for parallel and autonomous work.

## Workspace Types

- copy-on-write clones where supported
- git worktrees as fallback
- linked workspaces for coordinated work

## Why Isolation Exists

- parallel agent work
- safer experimentation
- autopilot story isolation
- easier review before apply-back

## Merge / Apply-Back Policy

- never automatic
- always behind a review gate
- conflicts block apply-back
- users can inspect changed files and branch targets before approval

## Recovery

- workspace state is persisted
- orphan cleanup is tracked
- interrupted work can reconnect to existing workspaces
