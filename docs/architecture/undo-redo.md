# Undo/Redo System

## Overview

Lunaria provides undo/redo at two levels: workspace-level (git-based) and UI-level (editor state).

## Workspace-Level Undo

Agent changes are applied as git commits within isolated workspaces. Undo is git revert:

| Operation | Undo Mechanism |
|-----------|---------------|
| File edit by agent | `git revert <commit>` in workspace |
| File creation | `git revert` removes the file |
| Multiple changes | Revert to any checkpoint commit |
| Accepted merge | User's own git history (standard git revert) |

### Checkpoints

The workspace manager creates checkpoint commits at:
- Before each tool execution batch
- At story boundaries (autopilot mode)
- On explicit user checkpoint request

Users can browse checkpoints and revert to any point.

## UI-Level Undo

Editor operations (Monaco/CodeMirror) use the editor's built-in undo stack:
- Standard Cmd+Z / Ctrl+Z behavior
- Per-editor-tab undo history
- Undo stack is session-local (not persisted across restarts)

## Session-Level Undo

Sessions themselves are not undoable — once a message is sent and a response is generated, the conversation history is append-only. Users can:
- Start a new session with the same project context
- Fork a session from a previous checkpoint (V1.0+)

## Non-Goals

- Undo of provider API calls (tokens are consumed)
- Undo of permission decisions (can be changed going forward)
- Collaborative undo (single-user desktop app)
