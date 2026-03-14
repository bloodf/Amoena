# Settings Key Catalog

These keys are the main fine-grained settings persisted through the `settings` table.

## Reasoning

- `providers.reasoning.<provider>/<model>.mode`
  - values: `off | auto | on`
- `providers.reasoning.<provider>/<model>.effort`
  - values: `low | medium | high`

## Remote Access

- `remote_access.enabled`
- `remote_access.lan.enabled`
- `remote_access.relay.enabled`
- `remote_access.relay.endpoint`

## Workspace Review

- `workspace.merge.review_required`
- `workspace.merge.preserve_on_apply`

## Notifications

- `notifications.muted`
- `notifications.mutedTypes`

For the full config/file-backed settings model, see:
- [docs/architecture/data-model.md](../architecture/data-model.md)

## Core Settings Keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `provider.default` | string | `"anthropic"` | Default LLM provider |
| `provider.anthropic.api_key` | string (keychain) | — | Stored in OS keychain |
| `provider.anthropic.model` | string | `"claude-sonnet-4-20250514"` | Default model for Anthropic |
| `memory.enabled` | boolean | `true` | Enable memory system |
| `memory.injection_budget_kb` | number | `8` | Max memory injection per turn (KB) |
| `memory.embedding_model` | string | `"auto"` | `"auto"`, `"nomic-embed-text"`, or `"text-embedding-3-small"` |
| `workspace.isolation_method` | string | `"auto"` | `"auto"`, `"cow"`, `"worktree"`, `"copy"` |
| `workspace.cleanup_on_close` | boolean | `true` | Delete workspace on session close |
| `permissions.default_file_read` | string | `"allow"` | Default permission for file reads |
| `permissions.default_file_write` | string | `"ask"` | Default permission for file writes |
| `permissions.default_shell` | string | `"ask"` | Default permission for shell execution |
| `session.transcript_format` | string | `"jsonl"` | Transcript persistence format |
| `ui.theme` | string | `"system"` | `"light"`, `"dark"`, `"system"` |
| `ui.reduced_motion` | boolean | `false` | Disable animations |
| `remote.enabled` | boolean | `false` | Enable remote access server |
| `remote.port` | number | `0` | Port for remote access (0 = random) |
| `logging.level` | string | `"info"` | Log level: error, warn, info, debug, trace |
