# Getting Started

This guide walks you through installing Amoena, connecting your first AI provider, and running your first session.

## Prerequisites

- **macOS** 13+ (Apple Silicon or Intel), **Windows** 10+, or **Linux** (Ubuntu 22.04+, Fedora 38+)
- At least one AI provider account: [Anthropic](https://console.anthropic.com/), [OpenAI](https://platform.openai.com/), or [Google AI](https://aistudio.google.com/)

## Installation

### macOS

Download the `.dmg` from the [Releases](https://github.com/AmoenaAi/amoena/releases) page, open it, and drag **Amoena** to your Applications folder.

Alternatively, install via Homebrew:

```bash
brew install --cask amoena
```

### Windows

Download and run the `.msi` installer from the Releases page. Amoena installs to `%LOCALAPPDATA%\Amoena` and adds itself to the Start Menu.

### Linux

Download the `.AppImage` or `.deb` package from the Releases page:

```bash
# Debian / Ubuntu
sudo dpkg -i amoena_*.deb

# AppImage (any distro)
chmod +x Amoena-*.AppImage
./Amoena-*.AppImage
```

### CLI Only (Headless)

If you built from source, the `amoena` CLI binary is available at `apps/desktop/src-tauri/target/release/amoena`. It can run without the desktop GUI by starting a headless runtime automatically.

```bash
amoena health
```

## First Run

When Amoena launches for the first time, the **Setup Wizard** guides you through:

1. **Theme selection** -- light, dark, or system-matched
2. **Provider authentication** -- connect at least one AI provider
3. **Workspace configuration** -- choose a default working directory

The desktop app starts an embedded Axum HTTP server (the "runtime") that exposes a REST + SSE API on a local port. The frontend communicates with this runtime via `@lunaria/runtime-client`.

### Runtime Bootstrap Flow

```
+-------------------+       invoke        +-------------------+
|   React Frontend  | ------------------> |   Tauri Backend    |
|   (Vite + React)  |                     |   (Rust runtime)   |
+-------------------+                     +-------------------+
        |                                         |
        | POST /api/v1/bootstrap/auth             |
        |---------------------------------------->|
        |                                         |
        | { authToken, sseBaseUrl, instanceId }    |
        |<----------------------------------------|
        |                                         |
        | All subsequent API calls use authToken  |
        +---------------------------------------->+
```

## Configuring a Provider

Navigate to **Settings > Providers** or run:

```bash
amoena auth anthropic
```

This opens your browser to authenticate via OAuth. Once complete, Amoena discovers available models and stores credentials securely in your system keychain (via Tauri Stronghold).

Supported providers:

| Provider  | Auth Methods   | Key Models                 |
| --------- | -------------- | -------------------------- |
| Anthropic | OAuth, API key | Claude Opus, Sonnet, Haiku |
| OpenAI    | API key        | GPT-4o, o1, o3             |
| Google    | OAuth, API key | Gemini 2.5 Pro, Flash      |

You can check provider status at any time:

```bash
amoena providers list
```

## Creating Your First Session

A **session** is a conversation with an AI agent. Sessions track messages, tool calls, token usage, and cost.

### From the Desktop UI

1. Click **New Session** on the Home screen
2. Select a provider and model
3. Choose a working directory (the agent's file-system scope)
4. Type your prompt and press Enter

### From the CLI

```bash
# Create a session using Claude
amoena sessions create --working-dir /path/to/project --provider anthropic --model claude-sonnet-4-20250514

# Send a message
amoena sessions message <session-id> "Explain the architecture of this project"

# List all sessions
amoena sessions list
```

### Session Modes

Sessions operate in one of two modes:

- **Wrapper mode** (`--tui-type claude-code | codex | gemini | opencode`) -- Amoena wraps an external CLI tool, proxying its I/O through the runtime. This lets you use Claude Code, Codex CLI, or Gemini CLI with Amoena's UI, memory, and orchestration features.
- **Native mode** (`--tui-type native`) -- Amoena drives the AI provider directly via its own inference pipeline.

## Autopilot Mode

Autopilot lets an agent work autonomously across multiple turns. Enable it from the session view or via the CLI:

```bash
amoena sessions autopilot <session-id> --enable
```

When active, Autopilot:

- Executes multi-turn workflows without manual prompting
- Tracks phases and progress in the Activity Log
- Spawns sub-agents when needed
- Stops when the goal is complete or a step limit is reached

## Keyboard Shortcuts

| Action          | Shortcut |
| --------------- | -------- |
| Command Palette | `Cmd+K`  |
| New Session     | `Cmd+N`  |
| Settings        | `Cmd+,`  |
| Toggle Sidebar  | `Cmd+B`  |

## Data Storage

Amoena stores all data locally:

| What              | Location                         |
| ----------------- | -------------------------------- |
| Database          | `~/.amoena/amoena.db` (SQLite) |
| Logs              | `~/.amoena/logs/`               |
| Extensions        | `~/.amoena/extensions/`         |
| Runtime discovery | `~/.amoena/runtime.json`        |
| Credentials       | System keychain (Stronghold)     |

## Next Steps

- [Orchestration and Agents](../features/agents.md) -- spawn sub-agents and form teams
- [Extensions](./extensions.md) -- install and build `.luna` extensions
- [CLI Reference](./tui.md) -- full CLI command reference
- [Architecture Overview](../architecture/overview.md) -- understand how Amoena works under the hood
