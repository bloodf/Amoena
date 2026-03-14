# File Conflict Resolution

## Overview

Conflicts arise when an agent's workspace changes overlap with the user's working tree. Lunaria resolves conflicts during the merge review phase — never silently.

## When Conflicts Occur

| Scenario | Detection Point |
|----------|----------------|
| User edited a file while agent was working | Merge review |
| Two agents modified the same file in linked workspaces | Workspace sync |
| Agent workspace is stale (long-running session) | Pre-merge check |

## Resolution Flow

### 1. Detection

Before merging agent changes, Lunaria runs:
```
git merge-tree --write-tree <user-branch> <agent-branch>
```

If conflicts exist, the merge review UI shows them instead of auto-merging.

### 2. Presentation

The merge review UI presents conflicts with:
- Three-way diff view (base, user's version, agent's version)
- Per-file accept/reject controls
- Line-level conflict markers for manual resolution

### 3. Resolution Options

| Option | Behavior |
|--------|----------|
| Accept agent's version | Agent's changes replace user's for this file |
| Keep user's version | Agent's changes for this file are discarded |
| Manual merge | Open in editor for line-by-line resolution |
| Accept all non-conflicting | Auto-merge files without conflicts, present only conflicts |

### 4. Post-Resolution

After resolution:
- Resolved files are committed to the user's branch
- The agent workspace is archived or cleaned up
- Resolution decisions are logged for observability

## Prevention

Lunaria reduces conflict likelihood through:
- **Workspace isolation:** Agents never edit the user's working tree directly
- **File locking (advisory):** When a user has a file open in an external editor, warn the agent
- **Stale detection:** Long-running sessions prompt the user to refresh the workspace base

## Edge Cases

- **Binary files:** Cannot be merged. User must choose one version.
- **File renamed by both parties:** Detected via git rename tracking. Present as two separate changes.
- **File deleted by one, modified by other:** Present to user with both options.
