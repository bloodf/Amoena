# Configuration

Amoena's configuration is stored in SQLite via a `SettingsRepository` module. Settings are scoped, typed, and managed entirely at runtime — there is no hand-edited config file.

## Settings Scopes

Settings are organised into three scopes:

| Scope         | Description                              |
| ------------- | ---------------------------------------- |
| **Global**    | Apply across all sessions and workspaces |
| **Workspace** | Apply to a specific git workspace        |
| **Session**   | Apply only to a single session           |

When the same key exists at multiple scopes, the narrowest scope wins: Session > Workspace > Global.

## Settings UI

Access settings via:

- **Menu bar** → Settings
- Keyboard shortcut: `⌘,` (macOS) / `Ctrl+,` (Windows/Linux)
- Command palette: `> Open Settings`

The Settings screen organises keys into sections: General, Providers, Memory, Remote Access, Extensions, and Developer.

For the full list of settings keys and their types, see [Reference: Settings Keys](/reference/settings-keys).

## Provider API Keys

API keys are **never stored in the SQLite database**. They are stored in the OS keyring via the `keyring` crate:

- **macOS**: Keychain
- **Linux**: libsecret / GNOME Keyring / KWallet
- **Windows**: Windows Credential Manager

To set a provider API key:

1. Open **Settings → Providers**
2. Select your provider (Claude, Codex, Gemini, OpenCode)
3. Enter your API key and click **Save**

The key is stored immediately in the keyring. Amoena reads it from the keyring at runtime and never writes it to disk.

### Environment Variable Fallback

Amoena also reads API keys from environment variables as a fallback:

| Provider           | Environment Variable           |
| ------------------ | ------------------------------ |
| Claude (Anthropic) | `ANTHROPIC_API_KEY`            |
| OpenAI / Codex     | `OPENAI_API_KEY`               |
| Google Gemini      | `GOOGLE_GENERATIVE_AI_API_KEY` |
| OpenCode           | `OPENCODE_API_KEY`             |

Environment variables are read at startup. Keyring values take precedence over environment variables.

## Default Provider and Model

Set your default provider and model in **Settings → Providers**. These are used when creating a new session unless overridden.

The routing service (`/features/routing`) can automatically select a provider and model based on task type (coding, analysis, creative writing, etc.) and persona configuration.

## Memory Settings

| Setting                    | Default                  | Description                                |
| -------------------------- | ------------------------ | ------------------------------------------ |
| `memory.enabled`           | `true`                   | Enable automatic observation capture       |
| `memory.auto_inject`       | `true`                   | Inject relevant memories into new sessions |
| `memory.l0_retention_days` | `30`                     | Days to retain raw L0 observations         |
| `memory.embedding_model`   | `text-embedding-3-small` | Model used for embedding generation        |

## Remote Access Settings

Remote access is disabled by default. To enable:

1. Open **Settings → Remote Access**
2. Toggle **Enable Remote Server**
3. Configure port (default: randomised per launch) and authentication mode

When enabled, Amoena starts the local remote-access HTTP flow on localhost. Pair a mobile device via the **Remote Access** panel with a QR code or PIN.

See [Features: Remote Access](/features/remote-access) for full documentation.

## Developer Settings

| Setting                     | Description                                  |
| --------------------------- | -------------------------------------------- |
| `dev.log_level`             | Service log level (`info`, `debug`, `trace`) |
| `dev.show_tool_details`     | Show full tool input/output in the UI        |
| `dev.enable_api_playground` | Enable the API playground panel              |

Logs are written to `~/.amoena/logs/amoena.log`.

## Configuration via the API

All settings can be read and written via the REST API:

```http
GET  /api/settings              # List all settings
GET  /api/settings/{key}        # Get a specific setting
PUT  /api/settings/{key}        # Update a setting
DELETE /api/settings/{key}      # Reset to default
```

See [API: Settings](/api/settings) for full endpoint documentation.
