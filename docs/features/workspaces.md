# Workspaces

Workspaces provide isolated copies of a project directory for AI agents to work in freely, without risk of corrupting the original codebase. `WorkspaceManager` creates these copies using the most efficient strategy available on the current platform and tracks them in SQLite.

## Why Workspaces

Without isolation, every file write and shell command from an AI agent affects the live project. Workspaces solve this by giving each agent (or each session) its own copy of the project to modify. Changes stay contained until you review and approve them.

## Three-Tier Cloning Strategy

`WorkspaceManager::detect_capability` probes the project path and selects the fastest available clone method:

### 1. Copy-on-Write (CoW) — macOS APFS

```rust
WorkspaceCapability::Cow
→ cp -cR <source> <dest>
```

APFS supports copy-on-write clones where unmodified blocks are shared between the original and the clone at the filesystem level. This makes the clone nearly instantaneous and uses minimal disk space until files are modified. `detect_capability` tests this by attempting a small `cp -cR` operation and checking if it succeeds.

**Best for:** macOS development machines with APFS volumes. Clones large projects in under a second.

### 2. Git Worktree — any Git repository

```rust
WorkspaceCapability::Worktree
→ git -C <source> worktree add --detach <dest>
```

Git worktrees create a linked working directory sharing the same `.git` object store. The workspace is checked out at the current `HEAD` commit in a detached state. Changes to the workspace are independent of the main working tree.

**Best for:** Git repositories on non-APFS filesystems (Linux, Windows, non-APFS macOS). Fast setup, lightweight on disk.

### 3. Full Recursive Copy — fallback

```rust
WorkspaceCapability::Full
→ recursive fs::copy
```

When neither CoW nor Git worktrees are available, the directory is copied recursively using Rust's `fs::copy`. This is slower for large projects but works everywhere.

**Best for:** Non-Git directories on non-APFS filesystems.

## Creating a Workspace

```http
POST /api/v1/workspaces
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "projectPath": "/Users/dev/myproject",
  "agentId": "agent-uuid",
  "personaName": "senior-engineer"
}
```

Both `agentId` and `personaName` are optional metadata fields. They link the workspace to the agent that will use it.

Response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "projectId": "a3f1b2c3...",
  "agentId": "agent-uuid",
  "personaName": "senior-engineer",
  "clonePath": "/Users/dev/.config/lunaria/workspaces/550e8400-...",
  "cloneType": "cow",
  "status": "active",
  "createdAt": "2026-03-14T10:00:00Z",
  "runSummary": {}
}
```

The `projectId` is a SHA-256 hash of the absolute `projectPath`, providing a stable identifier for the source project across multiple workspace clones.

## Workspace Lifecycle

```
active ──→ archived (soft delete, data preserved)
       └──→ deleted  (files removed from disk)
```

### Listing Workspaces

```http
GET /api/v1/workspaces
GET /api/v1/workspaces?status=active
```

### Inspecting a Workspace

```http
GET /api/v1/workspaces/{id}
```

Returns the `WorkspaceRecord` plus a file tree of the clone directory.

### Archiving a Workspace

Archive preserves the record in the database and stores a run summary, but signals that the workspace is no longer actively used:

```http
POST /api/v1/workspaces/{id}/archive
Content-Type: application/json

{
  "runSummary": {
    "tasksCompleted": 12,
    "filesModified": ["src/auth.ts", "src/middleware/jwt.ts"],
    "testsPassed": true,
    "notes": "Refactored auth to use JWT with refresh token rotation"
  }
}
```

The `run_summary` JSON is stored on the `WorkspaceRecord` and is available for reporting and workspace review workflows.

### Destroying a Workspace

Destroying removes the clone directory from disk and sets `status = 'deleted'`:

```http
DELETE /api/v1/workspaces/{id}
```

The `WorkspaceRecord` remains in the database with `status = 'deleted'` for audit purposes. The actual directory at `clone_path` is deleted via `fs::remove_dir_all`.

## File Tree Inspection

```http
GET /api/v1/workspaces/{id}/files
```

Returns a JSON file tree of the workspace clone, useful for the frontend file browser to show what the AI agent has been working with:

```json
{
  "workspaceId": "...",
  "clonePath": "/Users/dev/.config/lunaria/workspaces/...",
  "tree": [
    {
      "name": "src",
      "path": "src",
      "type": "directory",
      "children": [
        { "name": "auth.ts", "path": "src/auth.ts", "type": "file", "children": [] },
        { "name": "middleware", "path": "src/middleware", "type": "directory", "children": [...] }
      ]
    }
  ]
}
```

## Workspace Reviews

`WorkspaceReviewManager` provides code review records for workspace changes. A review captures a diff summary, changed file count, conflict count, and team consensus information.

### Creating a Review

```http
POST /api/v1/workspaces/{id}/review
{
  "sourceBranch": "HEAD",
  "targetBranch": "main"
}
```

Response:

```json
{
  "id": "review-uuid",
  "workspaceId": "...",
  "sourceBranch": "HEAD",
  "targetBranch": "main",
  "changedFiles": 3,
  "conflicts": 0,
  "summary": "Added JWT refresh token rotation to auth module",
  "files": [
    { "path": "src/auth.ts", "status": "modified", "additions": 45, "deletions": 12 }
  ],
  "status": "pending",
  "contributingAgents": ["agent-primary-uuid"],
  "teamConsensusScore": 0.0,
  "flaggedDecisions": [],
  "acknowledgedDecisions": [],
  "createdAt": "2026-03-14T10:30:00Z",
  "updatedAt": "2026-03-14T10:30:00Z"
}
```

### Review Status Transitions

```
pending → approved   (human or team consensus)
        → blocked    (unresolved conflicts or concerns)
        → applied    (changes merged to target)
        → dismissed  (review closed without applying)
```

### Approving a Review

```http
PATCH /api/v1/workspaces/{id}/reviews/{reviewId}
{ "status": "approved" }
```

## Git Integration

For Git worktree workspaces, the AI agent's `Bash` tool calls run inside the detached worktree. This means standard Git commands work as expected:

```bash
# Inside the workspace (via Bash tool):
git status
git diff HEAD
git add -A
git commit -m "feat: add JWT refresh token rotation"
```

The commits land in the workspace's detached HEAD history, completely separate from the main branch. When ready, the workspace review system summarizes these commits for human approval before any changes are merged.

## Hook Events

| Event | When |
|---|---|
| `WorktreeCreate` | Workspace successfully created |
| `WorktreeRemove` | Workspace destroyed (files deleted) |

Hook payloads include `workspaceId`, `clonePath`, `cloneType`, and `projectId`.

## Storage Location

Workspace clones are stored under the Lunaria app data directory:

```
~/.config/lunaria/workspaces/{workspace-id}/
```

On macOS this is typically `~/Library/Application Support/lunaria/workspaces/`.

The root path is configurable via the `RuntimePaths::workspace_root` field, which is resolved at startup from the app data directory.
