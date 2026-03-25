# Amoena CLI

The `amoena` CLI provides full access to the Amoena runtime from the terminal. It can connect to a running desktop instance or start its own headless runtime.

## Installation

The CLI is built alongside the desktop app. After building from source:

```bash
cd apps/desktop/src-tauri
cargo build --release --bin amoena
```

The binary is at `target/release/amoena`.

## Connection Modes

### Server Mode (Connected to Desktop)

When the desktop app is running, the CLI auto-discovers it via `~/.amoena/runtime.json` and connects:

```
+----------+    REST/SSE     +---------------------+
| amoena  | -------------> |  Desktop Runtime     |
|  CLI     |                |  (Axum HTTP server)  |
+----------+                +---------------------+
```

```bash
amoena health
# Output: Amoena v0.1.0 — status: ok
```

### Standalone Mode (Headless)

When no desktop instance is found, the CLI starts its own headless runtime:

```bash
amoena sessions list
# "No running Amoena instance — starting headless runtime..."
# (runtime starts, command executes, runtime shuts down)
```

### Explicit Connection

Override auto-detection with flags or environment variables:

```bash
amoena --url http://localhost:3456 --token <token> health

# Or via environment:
export AMOENA_URL=http://localhost:3456
export AMOENA_TOKEN=<token>
amoena health
```

## Global Flags

| Flag        | Env Var         | Description                       |
| ----------- | --------------- | --------------------------------- |
| `--url`     | `AMOENA_URL`   | Override API base URL             |
| `--token`   | `AMOENA_TOKEN` | Override auth token               |
| `--json`    |                 | Output raw JSON instead of tables |
| `--verbose` |                 | Show request/response details     |

## Command Reference

### System

```bash
amoena health              # Check runtime status
amoena auth <provider>     # Authenticate with a provider (opens browser)
```

### Sessions

```bash
amoena sessions list                         # List all sessions
amoena sessions create \
  --working-dir . \
  --tui-type claude-code \
  --provider anthropic \
  --model claude-sonnet-4-20250514                  # Create a session

amoena sessions delete <id>                  # Delete a session
amoena sessions message <id> "prompt text"   # Send a message
amoena sessions transcript <id>              # View full transcript
amoena sessions children <id>                # List child sessions
amoena sessions interrupt <id>               # Interrupt a running session
amoena sessions autopilot <id> --enable      # Enable autopilot
amoena sessions autopilot <id> --disable     # Disable autopilot
```

### Agents

```bash
amoena sessions agents list <session-id>     # List agents in session
amoena sessions agents spawn <session-id> \
  --agent-type planner \
  --model claude-opus-4-20250514 \
  --division engineering                      # Spawn sub-agent
```

### Teams

```bash
amoena teams create --name "Review Team" --threshold 0.7
amoena teams mailbox list <team-id>
amoena teams mailbox send <team-id> \
  --from <agent-id> \
  --content "Looks good to merge"
```

### Tasks

```bash
amoena tasks list <session-id>
amoena tasks create <session-id> --title "Implement auth"
amoena tasks update <session-id> <task-id> --status completed
amoena tasks delete <session-id> <task-id>
amoena tasks reorder <session-id> <id1> <id2> <id3>
```

### Message Queue

```bash
amoena queue list <session-id>
amoena queue add <session-id> --content "Next: add tests"
amoena queue edit <session-id> <msg-id> --content "Updated text"
amoena queue remove <session-id> <msg-id>
amoena queue reorder <session-id> <id1> <id2>
amoena queue flush <session-id>
```

### Workspaces

```bash
amoena workspaces list
amoena workspaces create --name "feature-x" --root-path /path
amoena workspaces inspect <id>
amoena workspaces archive <id>
amoena workspaces destroy <id>
amoena workspaces review <id>
```

### Providers

```bash
amoena providers list
amoena providers models <provider-id>
amoena providers test <provider-id>
```

### Extensions

```bash
amoena extensions list
amoena extensions install <path-to-luna-file>
amoena extensions uninstall <extension-id>
amoena extensions toggle <extension-id> --enable
amoena extensions toggle <extension-id> --disable
amoena extensions contributions
```

### Plugins

```bash
amoena plugins list
amoena plugins install --url <plugin-url>
amoena plugins uninstall <plugin-id>
amoena plugins toggle <plugin-id> --enable
amoena plugins execute <plugin-id> --action <action>
amoena plugins health <plugin-id>
```

### Memory

```bash
amoena memory search "query text"
amoena memory observe --title "Note" --content "Important detail"
amoena memory session <session-id>
```

### Hooks

```bash
amoena hooks list
amoena hooks register \
  --event SessionStart \
  --handler-type command \
  --config '{"command": "echo session started"}'
amoena hooks delete <hook-id>
amoena hooks fire SessionStart --payload '{}'
```

### Usage Analytics

```bash
amoena usage refresh
amoena usage list --range 30
amoena usage daily --range 7
amoena usage summary
```

### Remote Access

```bash
amoena remote pair                  # Generate pairing QR/PIN
amoena remote devices               # List paired devices
amoena remote revoke <device-id>    # Revoke a device
```

### Settings

```bash
amoena settings get <key>
amoena settings set <key> <value>
amoena settings list
```

### Terminal

```bash
amoena terminal create --shell zsh --cwd /path
amoena terminal input <terminal-id> "ls -la"
amoena terminal resize <terminal-id> --cols 120 --rows 40
amoena terminal events <terminal-id>
```

### Wrappers

The CLI can manage external AI tool wrappers (Claude Code, Codex CLI, Gemini CLI):

```bash
amoena wrappers health              # Check wrapper availability
amoena wrappers run <wrapper> ...   # Run a command through a wrapper
amoena wrappers chat <wrapper>      # Start interactive chat
amoena wrappers compare <prompt>    # Compare responses across wrappers
```

## Output Formats

By default, the CLI formats output as human-readable tables. Use `--json` for machine-readable JSON:

```bash
amoena sessions list --json | jq '.[0].id'
```

## Configuration

The CLI reads configuration from:

1. Command-line flags (highest priority)
2. Environment variables (`AMOENA_URL`, `AMOENA_TOKEN`)
3. Runtime discovery file (`~/.amoena/runtime.json`)
4. Default values (auto-start headless runtime)
