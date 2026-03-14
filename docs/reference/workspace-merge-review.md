# Workspace Merge Review

Lunaria never auto-merges isolated workspaces back into the main workspace.

## Review Payload

```json
{
  "workspaceId": "wrk_auth-review",
  "sourceBranch": "feat/auth-review",
  "targetBranch": "main",
  "changedFiles": 4,
  "conflicts": 0,
  "summary": "Manual review required before applying the workspace back to main."
}
```

## Rules

- apply-back is never automatic
- conflicts block apply-back
- review must show:
  - source workspace
  - target branch
  - changed file count
  - conflict count
  - per-file diff summary

See:
- [docs/architecture/system-architecture.md](../architecture/system-architecture.md)
- [docs/architecture/remote-control-protocol.md](../architecture/remote-control-protocol.md)
- [docs/architecture/data-model.md](../architecture/data-model.md)
