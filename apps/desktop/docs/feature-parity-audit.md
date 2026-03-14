# Lunaria Feature Parity Audit — 2026-03-14

## CLI Feature Matrix

| Feature | Claude Code | Codex | OpenCode | Gemini | Runtime API | UI Control | Tests |
|---------|:-----------:|:-----:|:--------:|:------:|:-----------:|:----------:|:-----:|
| Health check | Yes | Yes | Yes | Yes | No route | No | wrapper_framework |
| Version detection | `--version` | `--version` | `--version` | `--version` | Via health | No | wrapper_framework |
| Stream text deltas | stream-json | JSON-RPC/text | JSON/text | JSON message | SSE message.delta | MessageTimeline | wrapper_framework |
| Message complete | result event | message.complete | result/text | result class | SSE message.complete | MessageTimeline | wrapper_framework |
| Tool call parsing | Yes | No | No | No | SSE tool.start/result | MessageTimeline | wrapper_framework |
| Usage/tokens | cache-aware | JSON-RPC/zeros | JSON/zeros | prompt/completion | SSE usage | StatusBar, Usage | usage_analytics_e2e |
| Error handling | error event | stderr | stderr | No | SSE error | **No UI** | Partial |
| Persona export | Yes | Degraded | Degraded | Degraded | Via adapter | No | wrapper_framework |
| Interrupt/cancel | Yes | Yes | Yes | Yes | POST interrupt | **No UI** | **No tests** |
| Rate limits | Parsed | N/A | N/A | N/A | Not forwarded | Static | No |
| System prompt | --append-system-prompt | N/A | N/A | N/A | Via persona | No | wrapper_framework |
| Autopilot | Native turn | N/A | N/A | N/A | POST autopilot | AutopilotScreen | session_lifecycle |
| Reasoning mode | Native | N/A | N/A | N/A | POST reasoning | ReasoningControls | provider_reasoning |

## Critical Gaps (Must Fix)

### 1. Permission Approval UI — CRITICAL
- Runtime: `POST /sessions/{id}/permissions` exists. `PermissionBroker::wait_for()` blocks 30s.
- UI: **No approval dialog**. All `Ask` permission mode requests timeout and fail.
- Fix: Add approval/deny dialog listening for SSE `permission.request` events.
- **Status:** DOCUMENTED (see API reference)

### 2. Session Interrupt Button — CRITICAL
- Runtime: `POST /sessions/{id}/interrupt` works correctly.
- UI: **No stop button** in SessionComposer or SessionWorkspace.
- Fix: Add stop button calling interrupt endpoint.
- **Status:** DOCUMENTED (see API reference)

### 3. Hook System Not Wired — HIGH
- Code: Full `HookEngine` with 24 event types, register/fire/import.
- Runtime: Wired into start_runtime with full CRUD routes (`/api/v1/hooks`, `/api/v1/hooks/{id}`, `/api/v1/hooks/fire`).
- **Status:** COMPLETE & DOCUMENTED (see hooks.md and api-reference.md)

### 4. Workspace Routes Missing — HIGH
- Code: Full `WorkspaceManager` with CoW/worktree/full clone. Full `WorkspaceReviewManager`.
- Runtime: Full `/api/v1/workspaces` CRUD routes implemented.
- **Status:** COMPLETE & DOCUMENTED (see api-reference.md)

## Medium Gaps

### 5. Terminal Emulator UI
- Runtime: Full PTY terminal API (5 routes). No UI component renders terminal output.
- **Status:** DOCUMENTED (see api-reference.md Terminal section)

### 6. Mailbox/Consensus UI
- Runtime: Mailbox send/list + consensus evaluation work. No UI for viewing messages or voting.
- **Status:** DOCUMENTED (see api-reference.md Teams & Mailbox section)

### 7. Extension System
- Runtime: Full `.luna` extension format with manifest, embedded assets, handler bytecode.
- Format: Single `.luna` binary with magic bytes, manifest JSON, assets.
- Contributions: commands, menus, panels, settings, hooks, tools, providers.
- **Status:** COMPLETE & DOCUMENTED (see plugins/manifest.md and plugins/ui-extensions.md)

### 8. Queue System
- In-app queue: Messages reorderable, editable, removable.
- CLI queue: Edit + remove only (reorder returns 403).
- Auto-flush support.
- **Status:** COMPLETE & DOCUMENTED (see api-reference.md Message Queue section)

### 9. Session Hierarchy
- Child sessions with parentSessionId support.
- Full tree view (recursive).
- **Status:** COMPLETE & DOCUMENTED (see api-reference.md Session section, /children and /tree routes)

### 10. Task Management
- Create, update, delete, reorder tasks.
- Nested tasks with parent_task_id.
- Status: pending, in_progress, completed, blocked, cancelled.
- **Status:** COMPLETE & DOCUMENTED (see api-reference.md Tasks section)

## Test Coverage Gaps

| Feature | Has Tests | Missing |
|---------|-----------|---------|
| Settings GET/POST | No dedicated | Need round-trip test |
| File tree/content | No | Need CRUD tests |
| Session interrupt | No | Need interrupt mid-generation test |
| Workspace routes | N/A (no routes) | Wire routes first |
| Hook integration | No (not wired) | Wire hooks first |
| Queue ordering | N/A (not built) | Build queue first |
| Session hierarchy | No | Need sub-session browsing test |

## Adapter-Specific Feature Gaps

| Capability | Claude | Codex | OpenCode | Gemini |
|------------|:------:|:-----:|:--------:|:------:|
| Tool call events | Yes | **No** | **No** | **No** |
| Cache tokens | Yes | **No** | **No** | **No** |
| Error normalization | Yes | Exit only | Exit only | **No** |
| Real CLI tested | Yes | Yes | Yes | **Mock only** |

## Implementation Status Summary

### Phase 3: Infrastructure Wiring ✅ COMPLETE
- Hook routes: GET/POST /api/v1/hooks, DELETE /api/v1/hooks/{id}, POST /api/v1/hooks/fire
- 24 hook event types with 4 handler types (command, http, prompt, agent)
- Import from Claude Code and OpenCode configs
- Workspace routes with 3 clone strategies (COW, git worktree, full copy)
- Merge review with consensus scoring

### Phase 4: New Features ✅ COMPLETE
- Message Queue: GET/POST, PUT/DELETE, POST .../reorder, POST .../flush
- CLI queue restrictions (no reorder, returns 403)
- Session Hierarchy: /children and /tree routes (recursive)
- Task Management: Full CRUD with nesting and reordering

### Phase 5: Extension System ✅ COMPLETE
- `.luna` single-file format with embedded manifest and assets
- Extension routes: GET/POST /api/v1/extensions, DELETE, POST .../toggle
- Contributions: commands, menus, panels, settings, hooks, tools, providers
- Install from local path or URL

## Documentation Status

| Component | Docs | API Routes | Status |
|-----------|------|-----------|--------|
| Hooks | ✅ hooks.md | ✅ 4 routes | COMPLETE |
| Extensions | ✅ manifest.md, ui-extensions.md | ✅ 6 routes | COMPLETE |
| Session Hierarchy | ✅ api-reference.md | ✅ 2 routes | COMPLETE |
| Tasks | ✅ api-reference.md | ✅ 5 routes | COMPLETE |
| Queue | ✅ api-reference.md | ✅ 5 routes | COMPLETE |
| Workspaces | ✅ api-reference.md | ✅ 5 routes | COMPLETE |
| Plugins | ✅ README.md | ✅ 3 routes | COMPLETE |
| Memory | ✅ api-reference.md | ✅ 3 routes | COMPLETE |
| Files | ✅ api-reference.md | ✅ 2 routes | COMPLETE |
| Teams | ✅ api-reference.md | ✅ 2 routes | COMPLETE |
| Terminal | ✅ api-reference.md | ✅ 5 routes | COMPLETE |
| Remote | ✅ api-reference.md | ✅ 8 routes | COMPLETE |

## Remaining UI Implementation Gaps

High Priority (for desktop UI team):
1. **Permission Approval UI** — Listen to SSE `permission.request` and show dialog
2. **Session Interrupt Button** — Add stop button in SessionComposer calling POST /interrupt
3. **Terminal Emulator Component** — Render PTY output in UI, wire to terminal routes
4. **Extension Panel Loader** — Load panels from GET /extensions/{id}/panels/{panel_id}

Medium Priority:
5. **Workspace Browser UI** — Browse workspaces, trigger clones, view reviews
6. **Mailbox/Consensus Viewer** — Display team messages, consensus scores
7. **Task Dashboard** — Create, update, view nested tasks
8. **Queue Inspector** — Reorder/edit/remove queued messages before sending

Documentation is complete. API endpoints are fully implemented and documented in `/docs/developer/api-reference.md`.
