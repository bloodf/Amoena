# Tools

The tool system gives AI agents the ability to interact with the file system, execute shell commands, and access memory. Every tool call flows through `ToolExecutor`, which validates arguments, evaluates the permission policy, and either executes the tool, suspends the turn for user approval, or denies the call outright.

## Architecture

```
AI Worker emits stream.tool_call
    ↓
ToolExecutor::execute(context, ToolInput)
    ├── ToolRegistry::validate_args()   — JSON schema validation
    ├── ToolRegistry::get()             — look up ToolDefinition
    ├── effective_permission_mode()     — determine Allow / Ask / Deny
    │
    ├── Deny  → audit log → error to worker
    ├── Ask   → PendingApproval inserted → PermissionBroker::wait_for()
    │              ← user resolves via PATCH /tools/approvals/{id}
    │              → PermissionBroker::resolve() → unblocks turn
    └── Allow → run_builtin() → audit log → result to worker
```

## Built-in Tools

### `echo`

Reflects input text back. Used for testing and prompt injection.

**Input schema:**
```json
{ "text": "string" }
```

**Permission level:** `ReadOnly`

**Requires permission:** No

### `Read`

Reads a file from disk and returns its contents.

**Input schema:**
```json
{ "path": "string" }
```

**Permission level:** `ReadOnly`

**Requires permission:** No

**Output:**
```json
{ "content": "..." }
```

### `Bash`

Executes a shell command using `zsh -lc` in the session's working directory (or workspace clone path). This is the most powerful tool and requires at least `ShellAccess` permission level.

**Input schema:**
```json
{ "command": "string" }
```

**Permission level:** `ShellAccess`

**Requires permission:** Yes (will enter `Ask` mode unless persona ceiling is `ShellAccess` or higher and auto-approve is configured)

**Output:**
```json
{
  "stdout": "...",
  "stderr": "...",
  "status": 0
}
```

Commands run with the login shell environment (`-l` flag) and inherit the user's PATH and environment variables.

### `MemoryExpand`

Retrieves a specific memory tier (L1 or L2) for an observation. The AI model normally only sees L0 compact summaries in its context; it calls `MemoryExpand` to drill into the full content when needed.

**Input schema:**
```json
{
  "observationId": "string",
  "tier": "l1" | "l2"
}
```

**Permission level:** `ReadOnly`

**Requires permission:** No

**Output:**
```json
{
  "content": "...",
  "tier": "l1"
}
```

## ToolDefinition

Each tool is registered in `ToolRegistry` with:

```rust
pub struct ToolDefinition {
    pub name: String,
    pub description: String,
    pub input_schema: Value,       // JSON Schema
    pub required_level: ToolLevel, // ReadOnly | ReadWrite | ShellAccess | Admin
    pub is_read_only: bool,        // hint for permission mode calculation
    pub requires_permission: bool, // triggers Ask mode even when within ceiling
}
```

## Permission Levels

Four levels form a strict ordering:

| Level | Ceiling | Tools allowed |
|---|---|---|
| `ReadOnly` | `ReadOnly`+ | `echo`, `Read`, `MemoryExpand` |
| `ReadWrite` | `ReadWrite`+ | above + file write tools |
| `ShellAccess` | `ShellAccess`+ | above + `Bash` |
| `Admin` | `Admin` | all tools |

The effective ceiling for any agent is the minimum of the parent agent's ceiling and the persona's configured ceiling. This cascades down the agent tree — no subagent can be granted more capability than its parent.

```rust
fn min_ceiling(left: PermissionCeiling, right: PermissionCeiling) -> PermissionCeiling {
    // returns whichever has the lower rank
}
```

## Permission Mode Calculation

`effective_permission_mode` determines whether a tool call proceeds, waits, or is denied:

```rust
pub fn effective_permission_mode(
    session_metadata: &Value,
    tool_name: &str,
    is_read_only: bool,
    required_level: &ToolLevel,
    persona_ceiling: &PermissionCeiling,
) -> Result<ToolPermissionMode>
```

Logic (simplified):

1. If `required_level` exceeds `persona_ceiling` → `Deny`
2. If tool is in the session's auto-approved list → `Allow`
3. If `is_read_only` and session has `autoApproveReadOnly: true` → `Allow`
4. If `requires_permission` is true → `Ask`
5. Otherwise → `Allow`

Session metadata can carry per-session overrides:
```json
{
  "permissions": {
    "autoApproveReadOnly": true,
    "autoApproveList": ["Read", "echo", "MemoryExpand"],
    "denyList": ["Bash"]
  }
}
```

## PendingApproval Flow

When a tool enters `Ask` mode:

1. `PendingApprovalRecord` is inserted with `status = 'pending'`
2. SSE event broadcast: `{ "type": "tool.pending", "requestId": "...", "toolName": "Bash", "input": { "command": "rm -rf ..." } }`
3. AI turn is suspended via `PermissionBroker::wait_for(request_id)` (30-second timeout)
4. Frontend renders approval dialog with tool name and input args
5. User clicks Approve or Deny:

```http
PATCH /api/v1/tools/approvals/{requestId}
{
  "decision": "approved",
  "reason": "Safe command, scoped to workspace"
}
```

6. `PermissionBroker::resolve` delivers resolution to the suspended turn
7. `PendingApprovalRecord` updated with `status`, `resolvedAt`, `decisionReason`
8. SSE event broadcast: `{ "type": "tool.resolved", "requestId": "...", "decision": "approved" }`
9. If approved: `run_builtin()` executes, result returned to worker
10. If denied: error returned to worker, turn continues without tool result

### Timeout Behavior

If no decision arrives within 30 seconds, `wait_for` returns a timeout error. The pending approval record remains with `status = 'pending'` and must be resolved manually or cleaned up on the next session start.

## Listing Pending Approvals

```http
GET /api/v1/tools/approvals?sessionId={id}&status=pending
```

```json
[
  {
    "id": "...",
    "sessionId": "...",
    "toolName": "Bash",
    "input": { "command": "git push origin main --force" },
    "status": "pending",
    "createdAt": "2026-03-14T10:00:10Z",
    "resolvedAt": null,
    "decisionReason": null
  }
]
```

## Tool Execution Audit Log

Every tool execution is written to `tool_executions`:

```http
GET /api/v1/tools/executions?sessionId={id}&limit=50
```

```json
[
  {
    "id": "...",
    "sessionId": "...",
    "agentId": "...",
    "toolName": "Bash",
    "input": { "command": "cargo test --workspace" },
    "output": { "stdout": "test result: ok. 42 passed", "stderr": "", "status": 0 },
    "permissionDecision": "user_approved",
    "durationMs": 3214
  }
]
```

`permissionDecision` values:
- `allowed` — auto-allowed (read-only or in auto-approve list)
- `auto_approved` — within ceiling but flagged, auto-approved by policy
- `user_approved` — user explicitly approved
- `denied` — user denied or ceiling exceeded

## Extension Tools

Extensions can contribute additional tools via the `contributes.tools` array in the extension manifest:

```json
{
  "contributes": {
    "tools": [
      {
        "name": "GitStatus",
        "description": "Run git status in the working directory",
        "handler": "src/tools/git-status.js",
        "inputSchema": {
          "type": "object",
          "properties": {
            "porcelain": { "type": "boolean" }
          }
        }
      }
    ]
  }
}
```

Extension tools are loaded by the plugin system and registered in `ToolRegistry` at extension install time. They follow the same permission model as built-in tools, with `required_level` defaulting to `ReadOnly` unless specified in the manifest.
