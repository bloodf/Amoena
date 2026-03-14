# Session Workspace

The Session Workspace is Lunaria’s main working view.

## Main Areas

- message timeline
- files tab
- agents tab
- memory tab
- terminal panel
- composer

## File Context Workflow

- open files in preview first
- switch into edit mode explicitly
- drag files into composer as `file_ref`
- drag folders into composer as `folder_ref`
- remove attachments before send

## Multi-Agent Visibility

- see agent hierarchy
- see current task ownership
- see mailbox traffic
- see current tool activity
- drill into subagent detail when needed

## Session Export and Import

Sessions can be exported and imported for backup, sharing, and migration.

### Export Format

Exports use a single `.lunaria-session.zip` archive containing:

| File | Contents |
|------|----------|
| `session.json` | Session metadata: id, title, created/updated timestamps, agent config, provider |
| `transcript.jsonl` | Full message transcript in JSONL format (one event per line) |
| `files/` | Workspace file snapshots referenced by the session |
| `memory.json` | Session-scoped memory observations (not global memory) |

### Export Triggers

- Manual: Session context menu > "Export session"
- Keyboard: platform shortcut from Session Workspace
- CLI: `lunaria session export <session-id> [--output path]`

### Import Validation

On import, Lunaria validates:
1. Archive structure matches expected layout
2. `session.json` schema version is compatible
3. No file path traversal in `files/` entries
4. Transcript events parse as valid JSONL
5. Duplicate session ID check — prompts rename or skip

### Import Behavior

- Creates a new session (new ID) with imported content
- File snapshots are copied into a new workspace directory
- Memory observations are imported as read-only history
- Provider references are resolved against the user's configured providers — missing providers trigger a setup prompt

---

## Reasoning Controls

When the active model supports reasoning:

- provider defaults come from Provider Setup
- composer can override for the current run
- adaptive reasoning remains the recommended default
