# Lunaria CLI

The `lunaria` CLI provides full access to the Lunaria runtime from the terminal. It can connect to a running desktop instance or start its own headless runtime.

## Installation

The CLI is built alongside the desktop app. After building from source:

```bash
cd apps/desktop/src-tauri
cargo build --release --bin lunaria
```

The binary is at `target/release/lunaria`.

## Connection Modes

### Server Mode (Connected to Desktop)

When the desktop app is running, the CLI auto-discovers it via `~/.lunaria/runtime.json` and connects:

```
+----------+    REST/SSE     +---------------------+
| lunaria  | -------------> |  Desktop Runtime     |
|  CLI     |                |  (Axum HTTP server)  |
+----------+                +---------------------+
```

```bash
lunaria health
# Output: Lunaria v0.1.0 — status: ok
```

### Standalone Mode (Headless)

When no desktop instance is found, the CLI starts its own headless runtime:

```bash
lunaria sessions list
# "No running Lunaria instance — starting headless runtime..."
# (runtime starts, command executes, runtime shuts down)
```

### Explicit Connection

Override auto-detection with flags or environment variables:

```bash
lunaria --url http://localhost:3456 --token <token> health

# Or via environment:
export LUNARIA_URL=http://localhost:3456
export LUNARIA_TOKEN=<token>
lunaria health
```

## Global Flags

| Flag        | Env Var         | Description                       |
| ----------- | --------------- | --------------------------------- |
| `--url`     | `LUNARIA_URL`   | Override API base URL             |
| `--token`   | `LUNARIA_TOKEN` | Override auth token               |
| `--json`    |                 | Output raw JSON instead of tables |
| `--verbose` |                 | Show request/response details     |

## Command Reference

### System

```bash
lunaria health              # Check runtime status
lunaria auth <provider>     # Authenticate with a provider (opens browser)
```

### Sessions

```bash
lunaria sessions list                         # List all sessions
lunaria sessions create \
  --working-dir . \
  --tui-type claude-code \
  --provider anthropic \
  --model claude-sonnet-4-20250514                  # Create a session

lunaria sessions delete <id>                  # Delete a session
lunaria sessions message <id> "prompt text"   # Send a message
lunaria sessions transcript <id>              # View full transcript
lunaria sessions children <id>                # List child sessions
lunaria sessions interrupt <id>               # Interrupt a running session
lunaria sessions autopilot <id> --enable      # Enable autopilot
lunaria sessions autopilot <id> --disable     # Disable autopilot
```

### Agents

```bash
lunaria sessions agents list <session-id>     # List agents in session
lunaria sessions agents spawn <session-id> \
  --agent-type planner \
  --model claude-opus-4-20250514 \
  --division engineering                      # Spawn sub-agent
```

### Teams

```bash
lunaria teams create --name "Review Team" --threshold 0.7
lunaria teams mailbox list <team-id>
lunaria teams mailbox send <team-id> \
  --from <agent-id> \
  --content "Looks good to merge"
```

### Tasks

```bash
lunaria tasks list <session-id>
lunaria tasks create <session-id> --title "Implement auth"
lunaria tasks update <session-id> <task-id> --status completed
lunaria tasks delete <session-id> <task-id>
lunaria tasks reorder <session-id> <id1> <id2> <id3>
```

### Message Queue

```bash
lunaria queue list <session-id>
lunaria queue add <session-id> --content "Next: add tests"
lunaria queue edit <session-id> <msg-id> --content "Updated text"
lunaria queue remove <session-id> <msg-id>
lunaria queue reorder <session-id> <id1> <id2>
lunaria queue flush <session-id>
```

### Workspaces

```bash
lunaria workspaces list
lunaria workspaces create --name "feature-x" --root-path /path
lunaria workspaces inspect <id>
lunaria workspaces archive <id>
lunaria workspaces destroy <id>
lunaria workspaces review <id>
```

### Providers

```bash
lunaria providers list
lunaria providers models <provider-id>
lunaria providers test <provider-id>
```

### Extensions

```bash
lunaria extensions list
lunaria extensions install <path-to-luna-file>
lunaria extensions uninstall <extension-id>
lunaria extensions toggle <extension-id> --enable
lunaria extensions toggle <extension-id> --disable
lunaria extensions contributions
```

### Plugins

```bash
lunaria plugins list
lunaria plugins install --url <plugin-url>
lunaria plugins uninstall <plugin-id>
lunaria plugins toggle <plugin-id> --enable
lunaria plugins execute <plugin-id> --action <action>
lunaria plugins health <plugin-id>
```

### Memory

```bash
lunaria memory search "query text"
lunaria memory observe --title "Note" --content "Important detail"
lunaria memory session <session-id>
```

### Hooks

```bash
lunaria hooks list
lunaria hooks register \
  --event SessionStart \
  --handler-type command \
  --config '{"command": "echo session started"}'
lunaria hooks delete <hook-id>
lunaria hooks fire SessionStart --payload '{}'
```

### Usage Analytics

```bash
lunaria usage refresh
lunaria usage list --range 30
lunaria usage daily --range 7
lunaria usage summary
```

### Remote Access

```bash
lunaria remote pair                  # Generate pairing QR/PIN
lunaria remote devices               # List paired devices
lunaria remote revoke <device-id>    # Revoke a device
```

### Settings

```bash
lunaria settings get <key>
lunaria settings set <key> <value>
lunaria settings list
```

### Terminal

```bash
lunaria terminal create --shell zsh --cwd /path
lunaria terminal input <terminal-id> "ls -la"
lunaria terminal resize <terminal-id> --cols 120 --rows 40
lunaria terminal events <terminal-id>
```

### Wrappers

The CLI can manage external AI tool wrappers (Claude Code, Codex CLI, Gemini CLI):

```bash
lunaria wrappers health              # Check wrapper availability
lunaria wrappers run <wrapper> ...   # Run a command through a wrapper
lunaria wrappers chat <wrapper>      # Start interactive chat
lunaria wrappers compare <prompt>    # Compare responses across wrappers
```

## Output Formats

By default, the CLI formats output as human-readable tables. Use `--json` for machine-readable JSON:

```bash
lunaria sessions list --json | jq '.[0].id'
```

## Configuration

The CLI reads configuration from:

1. Command-line flags (highest priority)
2. Environment variables (`LUNARIA_URL`, `LUNARIA_TOKEN`)
3. Runtime discovery file (`~/.lunaria/runtime.json`)
4. Default values (auto-start headless runtime)
