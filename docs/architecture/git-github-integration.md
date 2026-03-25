# Git and GitHub Integration

## Overview

Amoena uses git as the foundation for workspace isolation, change tracking, and collaboration. All agent-initiated changes happen in isolated workspaces backed by git worktrees or CoW clones.

## Workspace Isolation Strategy

Agent sessions operate in isolated workspace directories, never directly on the user's working tree:

| Platform | Primary Method | Fallback |
|----------|---------------|----------|
| macOS (APFS) | CoW clone (`cp -c`) | git worktree |
| Linux (ext4/btrfs) | git worktree | Full copy |
| Windows (NTFS) | git worktree | Full copy |

Each workspace is a full working copy with its own git state. Changes are committed to a feature branch within the workspace before being reviewed and merged.

## Branch Strategy

- Agent sessions create branches named `amoena/<session-id>` in the workspace.
- Users review changes through the merge review UI before accepting into their working tree.
- Direct edits to `main` or the user's current branch are never performed by agents.

## Monorepo Structure

Amoena is a **monorepo** managed by bun workspaces. There are no git submodules.

```
amoena/
├── apps/desktop/     # Tauri desktop application
├── packages/ui/      # Shared design system
├── packages/tokens/  # Design tokens
└── docs/             # Architecture and product documentation
```

Changes to any package are coordinated within the same repository and the same git history.

## GitHub Integration

GitHub integration is used for:

- **Pull request creation:** Agents can create PRs from workspace branches.
- **Issue tracking:** Session goals can reference GitHub issues.
- **CI status:** Build and test results from GitHub Actions are visible in the session workspace.

GitHub features are optional — Amoena works fully offline with local git only.

## Merge Review

See `docs/reference/workspace-merge-review.md` for the full merge review workflow, including conflict resolution and selective acceptance.
