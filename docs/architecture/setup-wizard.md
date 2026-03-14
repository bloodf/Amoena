# Setup Wizard

## Purpose

This document defines the first-time setup wizard for Lunaria. The wizard guides users from initial launch through TUI detection, installation, authentication, and default selection so they can start their first AI coding session. The same flow is reusable from Settings when adding TUIs later.

## Wizard State Machine

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Step 1           │────▶│  Step 2           │────▶│  Step 3           │
│  Welcome + Mode   │     │  Provider Auth    │     │  Default Model    │
│  (required)       │     │  (required)       │     │  (required)       │
└─────────────────┘     └─────────────────┘     └──────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Step 7           │◀────│  Step 6           │◀────│  Step 4           │
│  Ecosystem Compat    │     │  Agent Profile    │     │  Agent Backend    │
│  (skippable)      │     │  (required)       │     │  Detection        │
└─────────────────┘     └─────────────────┘     │  (required)       │
                                                  └──────────────────┘
                                                          │
                                                          ▼
                                                  ┌──────────────────┐
                                                  │  Step 5           │
                                                  │  Memory System    │
                                                  │  (required)       │
                                                  └──────────────────┘
```

### Transition Rules

| From | To | Condition | Skip Allowed |
| --- | --- | --- | --- |
| Step 1 (Welcome + Mode) | Step 2 (Provider Auth) | Mode selected (wrapper or native) | No |
| Step 2 (Provider Auth) | Step 3 (Default Model) | At least one provider authenticated | No |
| Step 3 (Default Model) | Step 4 (Agent Backend) | Default model selected | No |
| Step 4 (Agent Backend) | Step 5 (Memory System) | Backend detection complete | Yes — if mode is native (no TUI needed) |
| Step 5 (Memory System) | Step 6 (Agent Profile) | Memory initialization complete | No |
| Step 6 (Agent Profile) | Step 7 (Ecosystem Compat) | Default agent profile configured | No |
| Step 7 (Ecosystem Compat) | Completion | Scan complete or skipped | Yes — if no .claude/ folder detected |

### Back Navigation

Every step supports navigating back to the previous step. State entered in earlier steps is preserved. Navigating back from Step 5 to Step 4 retains detection results. Navigating back from Step 2 to Step 1 preserves mode selection.

### Invariants

- The wizard cannot complete without at least one provider authenticated and a default model selected.
- Step 4 behavior varies by mode: wrapper mode requires at least one TUI backend; native mode skips TUI detection.
- Step 7 is skippable when no `.claude/` folder exists on the filesystem.

## Wizard State Shape

```ts
interface WizardState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  completed: boolean;

  // Step 1 — Welcome + Mode
  locale: string;                        // BCP 47 language tag, e.g. "en-US"
  theme: "light" | "dark" | "system";
  mode: "wrapper" | "native";           // wrapper = TUI backends, native = direct API

  // Step 2 — Provider Authentication
  detectedOs: "macos" | "windows" | "linux";
  detectedEnvVars: Record<string, boolean>;  // e.g. { ANTHROPIC_API_KEY: true, OPENAI_API_KEY: false }
  providerAuthResults: Record<ProviderId, ProviderAuthResult>;

  // Step 3 — Default Model
  defaultModel: ModelSelection | null;

  // Step 4 — Agent Backend Detection
  tuiStatuses: Record<TuiId, TuiDetectionResult>;

  // Step 5 — Memory System
  memoryInitResult: MemoryInitResult;

  // Step 6 — Agent Profile
  defaultAgentProfile: AgentProfileConfig;

  // Step 7 — Ecosystem Compat Scan
  claudeCompatResult: ClaudeCompatResult | null;
}

type ProviderId = "anthropic" | "openai" | "google" | "custom";
type TuiId = "claude-code" | "opencode" | "codex" | "gemini";

interface ProviderAuthResult {
  status: "pending" | "authenticating" | "authenticated" | "failed";
  method: "env_var" | "api_key" | "oauth";
  envVarDetected: boolean;
  errorMessage?: string;
}

interface ModelSelection {
  providerId: ProviderId;
  modelId: string;           // e.g. "claude-sonnet-4-20250514"
  displayName: string;       // e.g. "Claude Sonnet 4"
  source: "models.dev";      // registry source
}

interface TuiDetectionResult {
  status: "installed" | "not_installed" | "outdated";
  binaryPath: string | null;
  version: string | null;
  latestVersion: string | null;
  updateAvailable: boolean;
  minimumVersion: string;
}

interface MemoryInitResult {
  status: "pending" | "initializing" | "ready" | "failed";
  sqliteCreated: boolean;
  vectorIndexCreated: boolean;
  tablesCreated: string[];    // e.g. ["observations", "concepts", "embeddings"]
  errorMessage?: string;
}

interface AgentProfileConfig {
  name: string;               // e.g. "Default"
  defaultModel: string;
  systemPromptPath: string | null;
  tools: string[];            // enabled tool IDs
  maxTokens: number;
  temperature: number;
}

interface ClaudeCompatResult {
  claudeFolderDetected: boolean;
  settingsImported: boolean;
  hooksImported: boolean;
  mcpServersImported: boolean;
  importedItems: string[];     // summary of what was imported
  skippedItems: string[];      // items that could not be imported
}
```

## OS Detection Logic

OS detection runs once at wizard start (Step 1 initialization) via the Tauri Rust backend.

### Rust-Side Detection

```rust
pub enum DetectedOs {
    MacOs,
    Windows,
    Linux,
}

pub fn detect_os() -> DetectedOs {
    match std::env::consts::OS {
        "macos" => DetectedOs::MacOs,
        "windows" => DetectedOs::Windows,
        "linux" => DetectedOs::Linux,
        other => {
            tracing::warn!("Unknown OS '{}', defaulting to Linux", other);
            DetectedOs::Linux
        }
    }
}
```

### Frontend Consumption

The detected OS is passed to the React frontend via a Tauri command (`invoke("detect_os")`) and stored in `WizardState.detectedOs`. All subsequent install command selection uses this value.

## Step 1 — Welcome + Mode Explanation

### UI Description

A full-screen welcome card with the Lunaria logo, a brief tagline ("One home for all your AI agents"), and three configuration controls:

1. **Language selector** — dropdown populated from the i18n locale registry. Default is auto-detected from the system locale via `navigator.language` with fallback to `en-US`.
2. **Theme selector** — three-option toggle: Light, Dark, System. Default is System, which reads the OS preference via `prefers-color-scheme`.
3. **Mode selector** — two-option choice with detailed explanation:
   - **Wrapper Mode**: Lunaria wraps installed TUI backends (Claude Code, OpenCode, Codex CLI, Gemini CLI) and provides a unified GUI on top. Requires at least one TUI to be installed.
   - **Native Mode**: Lunaria connects directly to provider APIs (Anthropic, OpenAI, Google) without any TUI backend. Simpler setup, but does not benefit from TUI-specific features (hooks, MCP servers, etc.).

A "Get Started" button advances to Step 2.

### Data Flow

```
User selects locale → store in WizardState.locale → apply i18n bundle
User selects theme  → store in WizardState.theme  → apply CSS theme class
User selects mode   → store in WizardState.mode   → controls Step 4 behavior
User clicks "Get Started" → WizardState.currentStep = 2
```

### Error Handling

| Scenario | Handling |
| --- | --- |
| Locale bundle fails to load | Fall back to `en-US`, show inline warning |
| Theme preference unreadable | Default to "system" with light fallback |

## Step 2 — Provider Authentication

### UI Description

A list of provider authentication cards. The wizard auto-detects existing environment variables and highlights providers that are already configured:

- **Anthropic** — detects `ANTHROPIC_API_KEY`
- **OpenAI** — detects `OPENAI_API_KEY`
- **Google AI** — detects `GOOGLE_API_KEY` or `GEMINI_API_KEY`

Each card shows:

- Provider name and logo
- Detection badge: **Detected** (green, if env var found), **Not Configured** (gray)
- Auth method options: **Enter API Key** (text field) or **OAuth Connect** (browser flow)
- Validation status after key entry (spinner during verification, green check or red error)

### Environment Variable Detection

The wizard scans for known provider environment variables at step initialization:

```rust
pub fn detect_provider_env_vars() -> HashMap<String, bool> {
    let vars = [
        "ANTHROPIC_API_KEY",
        "OPENAI_API_KEY",
        "GOOGLE_API_KEY",
        "GEMINI_API_KEY",
    ];
    vars.iter()
        .map(|&var| (var.to_string(), std::env::var(var).is_ok()))
        .collect()
}
```

When an environment variable is detected, the wizard shows: "Found `ANTHROPIC_API_KEY` in your environment. This key will be used automatically." The user can still override by entering a different key.

### Auth Methods per Provider

| Provider | Method | Flow |
| --- | --- | --- |
| Anthropic | API key (default) | User enters key or env var detected → verify with `GET /v1/models` → store in credential store |
| Anthropic | OAuth | Browser OAuth flow with Anthropic Console → receive token → store |
| OpenAI | API key (default) | User enters key or env var detected → verify with `GET /v1/models` → store in credential store |
| OpenAI | OAuth | Browser OAuth flow with OpenAI Platform → receive token → store |
| Google AI | API key (default) | User enters key or env var detected → verify with model list API → store in credential store |
| Google AI | OAuth | Google OAuth flow → receive token → store |

### Data Flow

```
Wizard enters Step 2
  → Rust backend scans environment variables
  → Results stored in WizardState.detectedEnvVars
  → For each detected env var: auto-populate provider card, run verification
  → User configures additional providers or overrides detected keys
  → On at least one provider authenticated: "Continue" becomes active → Step 3
```

### Error Handling

| Scenario | Handling |
| --- | --- |
| Detected env var contains invalid key | Show "Key found in environment but failed validation" with manual entry option |
| API verification request times out | Show timeout message, store key anyway with "Unverified" badge |
| Network error during verification | Show "Network error — key saved, will verify on next launch" |
| Invalid API key format | Show "Invalid key format" with guidance on key structure |
| OAuth browser flow fails | Show manual URL with copy button |
| Rate limit on verification endpoint | Show "Rate limited — key saved, verification will retry later" |

## Step 3 — Default Model Selection

### UI Description

A model browser populated from the [models.dev](https://models.dev) registry, filtered to authenticated providers. The UI shows:

- Provider-grouped model list with search/filter
- Model cards showing: name, context window, pricing tier, capability badges (vision, tools, etc.)
- Reasoning capability badge when supported
- A "Recommended" badge on the suggested default model
- Preview of model capabilities relevant to coding tasks
- Preview of the default reasoning behavior that will be applied for the selected model (`off`, `auto`, `on`)

### Model Registry Integration

The wizard fetches the model catalog from models.dev on step entry:

```rust
pub async fn fetch_model_registry(authenticated_providers: &[ProviderId]) -> Vec<ModelInfo> {
    let response = http_client
        .get("https://models.dev/api/v1/models")
        .timeout(Duration::from_secs(10))
        .send()
        .await;

    match response {
        Ok(resp) => {
            let models: Vec<ModelInfo> = resp.json().await.unwrap_or_default();
            models.into_iter()
                .filter(|m| authenticated_providers.contains(&m.provider_id))
                .collect()
        }
        Err(_) => {
            // Fallback to bundled model list
            load_bundled_model_list(authenticated_providers)
        }
    }
}
```

A bundled model list ships with the app as a fallback when the registry is unreachable. The bundled list is updated with each Lunaria release.

### Data Flow

```
Wizard enters Step 3
  → Fetch model registry (or use bundled fallback)
  → Filter to authenticated providers
  → Pre-select recommended model (claude-sonnet-4-20250514 if Anthropic authenticated)
  → If selected model supports reasoning, pre-select reasoning default = `auto`
  → User confirms or changes selection
  → WizardState.defaultModel = selectedModel
  → User clicks "Continue" → Step 4
```

### Error Handling

| Scenario | Handling |
| --- | --- |
| Registry fetch fails | Use bundled model list, show "Using cached model list" notice |
| No models available for authenticated providers | Show error, navigate back to Step 2 |
| Selected model deprecated between fetch and use | Show notice on next launch, prompt re-selection |

## Step 4 — Agent Backend Detection

### UI Description

**In Wrapper Mode:** A grid of TUI status cards (same detection logic as the original wizard), showing installed TUI backends. Each card displays:

- TUI name and icon
- Status badge: **Installed** (green), **Not Installed** (gray), **Outdated** (amber)
- Detected version and binary path
- Install button for missing TUIs

**In Native Mode:** This step shows a confirmation panel: "Native mode selected — Lunaria will connect directly to provider APIs. No TUI backend required." with a "Continue" button.

### Detection Logic (Wrapper Mode)

Detection runs as a Tauri command that executes per-TUI binary lookups from the Rust backend.

#### Binary Lookup per TUI

| TUI | Binary Name | Version Command | Minimum Version |
| --- | --- | --- | --- |
| Claude Code | `claude` | `claude --version` | Defined in capability matrix |
| OpenCode | `opencode` | `opencode --version` | Defined in capability matrix |
| Codex CLI | `codex` | `codex --version` | Defined in capability matrix |
| Gemini CLI | `gemini` | `gemini --version` | Defined in capability matrix |

#### Known Installation Locations per OS

If `which`/`where` fails to find a binary on PATH, the wizard checks known installation locations as a fallback:

| TUI | macOS | Linux | Windows |
| --- | --- | --- | --- |
| Claude Code | `/usr/local/bin/claude`, `~/.claude/bin/claude` | `/usr/local/bin/claude`, `~/.claude/bin/claude` | `%LOCALAPPDATA%\Programs\claude-code\claude.exe`, `%USERPROFILE%\.claude\bin\claude.exe` |
| OpenCode | `/usr/local/bin/opencode`, `~/.local/bin/opencode` | `/usr/local/bin/opencode`, `~/.local/bin/opencode`, `/snap/bin/opencode` | `%APPDATA%\npm\opencode.cmd`, `%LOCALAPPDATA%\Programs\opencode\opencode.exe` |
| Codex CLI | `/usr/local/bin/codex`, `~/.local/bin/codex` | `/usr/local/bin/codex`, `~/.local/bin/codex`, `/snap/bin/codex` | `%APPDATA%\npm\codex.cmd` |
| Gemini CLI | `/usr/local/bin/gemini`, `~/.local/bin/gemini` | `/usr/local/bin/gemini`, `~/.local/bin/gemini`, `/snap/bin/gemini` | `%APPDATA%\npm\gemini.cmd` |

### Data Flow

```
Wizard enters Step 4
  → If mode == "native": show confirmation, skip detection
  → If mode == "wrapper": run TUI detection scan
  → Results stored in WizardState.tuiStatuses
  → User installs missing TUIs or proceeds with detected ones
  → User clicks "Continue" → Step 5
```

### Error Handling

| Scenario | Handling |
| --- | --- |
| No TUIs found in wrapper mode | Show guidance: "Install at least one TUI backend, or go back and select Native mode" |
| `which`/`where` command not found | Treat TUI as not installed, log warning |
| Version command times out (>5s) | Treat as installed with unknown version, show amber badge |
| All detection fails | Offer to switch to native mode |

## Step 5 — Memory System Initialization

### UI Description

An initialization progress panel showing the memory system setup:

- SQLite database creation progress
- Vector index initialization progress
- Table creation checklist (observations, concepts, embeddings, sessions, etc.)
- Overall status: initializing spinner or green checkmark

This step runs automatically on entry. The user waits for completion (typically 1-3 seconds) before proceeding.

### Initialization Logic

```rust
pub async fn initialize_memory_system(data_dir: &Path) -> MemoryInitResult {
    let db_path = data_dir.join("lunaria.db");

    // 1. Create SQLite database
    let db = SqlitePool::connect(&format!("sqlite:{}?mode=rwc", db_path.display())).await?;

    // 2. Run schema migrations
    let tables = vec![
        "observations", "concepts", "embeddings", "sessions",
        "session_messages", "notification_log", "settings",
        "device_registry", "agent_profiles",
    ];
    sqlx::migrate!("./migrations").run(&db).await?;

    // 3. Initialize vector index for semantic search
    let vector_index_path = data_dir.join("vectors.idx");
    let vector_index = VectorIndex::create(&vector_index_path, 1536)?; // OpenAI embedding dimension

    MemoryInitResult {
        status: "ready",
        sqlite_created: true,
        vector_index_created: true,
        tables_created: tables,
        error_message: None,
    }
}
```

### Data Flow

```
Wizard enters Step 5
  → Run initialize_memory_system()
  → Stream progress events to frontend
  → On success: WizardState.memoryInitResult.status = "ready"
  → User clicks "Continue" → Step 6
```

### Error Handling

| Scenario | Handling |
| --- | --- |
| SQLite creation fails (permissions) | Show path and error, suggest alternative data directory |
| Migration fails | Show migration error, offer "Retry" and "Reset Database" options |
| Vector index creation fails | Show error, proceed without vector search (degraded mode) |
| Disk space insufficient | Show "Insufficient disk space" with space requirements (~50MB minimum) |

## Step 6 — Default Agent Profile Configuration

### UI Description

A configuration form for the default agent profile:

- **Profile name** — text input, default: "Default"
- **Default model** — pre-populated from Step 3, changeable
- **System prompt** — optional text area or file path selector for custom system instructions
- **Enabled tools** — checklist of available tools (file read/write, shell, web search, etc.)
- **Reasoning behavior** — inherited from the selected model's per-model default, with inline explanation when reasoning is supported
- **Max tokens** — slider with recommended defaults per model
- **Temperature** — slider (0.0 - 1.0), default: 0.7

A "Use Recommended Settings" button auto-fills all fields with sensible defaults based on the selected model.

### Data Flow

```
Wizard enters Step 6
  → Pre-populate defaults based on Step 3 model selection
  → User configures or accepts defaults
  → WizardState.defaultAgentProfile = configured values
  → User clicks "Continue" → Step 7
```

### Error Handling

| Scenario | Handling |
| --- | --- |
| System prompt file not found | Show error, clear path, allow empty |
| Invalid temperature/max tokens values | Clamp to valid range, show inline warning |

## Step 7 — Ecosystem Compat Scan

### UI Description

The wizard scans for existing `.claude/` and `.opencode/` folders and `opencode.json` in the user's home/project directory and offers to import settings from both ecosystems:

- **Detection panel**: Shows which ecosystems were found (Claude Code, OpenCode, or both), with a summary of importable items per ecosystem
- **Import checklist** (grouped by ecosystem, all checked by default):
  - **Claude Code** (if `.claude/` found):
    - `settings.json` — user preferences, permissions, model defaults
    - `hooks.json` — hook configurations (converted to Lunaria hook engine format)
    - `CLAUDE.md` — project instructions (copied to Lunaria's instruction system)
    - `.claude/agents/` — agent definitions imported as Lunaria agent profiles
    - MCP server configurations — imported into Lunaria's MCP registry
  - **OpenCode** (if `opencode.json` or `.opencode/` found):
    - `opencode.json` agents — agent definitions (build, plan, explore, etc.) imported as agent profiles
    - `opencode.json` providers — provider overrides imported into Lunaria's provider system
    - `opencode.json` hooks — event hooks normalized to Lunaria hook engine format
    - `opencode.json` MCP servers — merged into Lunaria's MCP registry
  - **Plugins** (auto-discovered):
    - oh-my-claudecode (if installed) — agent catalog, hooks, MCP tools
    - oh-my-opencode (if installed) — agent catalog, hooks
    - claude-mem (if installed) — memory observer hooks
    - Other detected plugins from either ecosystem
- **Plugin enable/disable**: Per-plugin checkboxes to select which plugins to activate
- **Local model detection**: Auto-detected local inference servers (Ollama, LM Studio, llama.cpp) shown with model list and option to assign to lightweight system tasks
- **Preview panel**: Shows a diff of what will be imported from each ecosystem
- **Skip button**: "Skip — I'll configure manually"

### Scan Logic

```rust
pub async fn scan_claude_compat(home_dir: &Path) -> ClaudeCompatResult {
    let claude_dir = home_dir.join(".claude");
    if !claude_dir.exists() {
        return ClaudeCompatResult {
            claude_folder_detected: false,
            ..Default::default()
        };
    }

    let mut result = ClaudeCompatResult {
        claude_folder_detected: true,
        ..Default::default()
    };

    // Scan settings.json
    if claude_dir.join("settings.json").exists() {
        result.imported_items.push("settings.json".to_string());
        result.settings_imported = true;
    }

    // Scan hooks.json — convert to Lunaria plugin hook format
    if claude_dir.join("hooks.json").exists() {
        result.imported_items.push("hooks.json".to_string());
        result.hooks_imported = true;
    }

    // Scan for MCP server configurations
    let settings_path = claude_dir.join("settings.json");
    if let Ok(settings) = read_json::<ClaudeSettings>(&settings_path) {
        if !settings.mcp_servers.is_empty() {
            result.imported_items.push(format!("{} MCP servers", settings.mcp_servers.len()));
            result.mcp_servers_imported = true;
        }
    }

    result
}
```

### Hook Import Translation

Claude Code hooks are translated to Lunaria's plugin hook format during import:

| Claude Code Format | Lunaria Plugin Format |
| --- | --- |
| `{"PreToolUse": [{"command": "npx lint"}]}` | `{"event": "PreToolUse", "handler": {"type": "command", "command": "npx lint"}}` |
| `{"PostToolUse": [{"command": "echo done"}]}` | `{"event": "PostToolUse", "handler": {"type": "command", "command": "echo done"}}` |

The translated hooks are registered as a built-in "Claude Code Compat" plugin.

### Data Flow

```
Wizard enters Step 7
  → Run scan_claude_compat()
  → If .claude/ not found: show "No Claude Code configuration detected" with "Finish Setup" button
  → If .claude/ found: show import checklist
  → User selects items to import (or clicks "Skip")
  → Run import for selected items
  → WizardState.claudeCompatResult = scan/import results
  → User clicks "Finish Setup" → Completion
```

### Completion

After Step 7, the wizard shows a completion summary:

- **Mode**: Wrapper or Native
- **Providers**: Authenticated providers with model counts
- **Default Model**: Selected model name
- **Agent Backend**: Detected TUIs (wrapper mode) or "Direct API" (native mode)
- **Memory**: Database status
- **Agent Profile**: Profile name and key settings
- **Ecosystem Import**: Summary of imported items per ecosystem (Claude Code, OpenCode)
- **Plugins**: Enabled plugins from both ecosystems
- **Local Models**: Detected local servers and assigned tasks (if any)

A "Start First Session" button closes the wizard and opens the main view.

### Persistence

On completion, the wizard writes its results to the Lunaria configuration store:

```ts
interface LunariaConfig {
  setupComplete: boolean;
  locale: string;
  theme: "light" | "dark" | "system";
  mode: "wrapper" | "native";
  defaultModel: ModelSelection;
  providers: Record<ProviderId, { method: string; verified: boolean }>;
  installedTuis: Record<TuiId, { binaryPath: string; version: string }>;  // wrapper mode
  defaultAgentProfile: AgentProfileConfig;
  ecosystemImport: {
    claudeCode: boolean;
    openCode: boolean;
    importedItems: string[];
  };
  enabledPlugins: string[];       // plugin IDs enabled during setup
  localServers: Array<{           // detected local inference servers
    url: string;
    name: string;
    models: string[];
  }>;
  modelRouting: Record<string, {  // task → model assignments
    providerId: string;
    modelId: string;
  }>;
}
```

On subsequent launches, Lunaria checks `setupComplete`. If `false` or missing, the wizard runs. If `true`, the app launches directly to the main view.

### Error Handling

| Scenario | Handling |
| --- | --- |
| Config persistence fails | Retry write, show error with "Try Again" button; wizard state is held in memory |
| First session creation fails | Show error dialog with adapter error message, offer "Retry" or "Open Settings" |
| Ecosystem import partially fails | Show imported items with green checks per ecosystem, failed items with red marks and error details |
| Local model server unreachable | Show detected port as "offline" with retry button; allow manual endpoint entry |

## Settings Re-Entry Flows

### "Add Provider" Flow

The "Add Provider" flow in Settings reuses wizard Step 2 (Provider Authentication) in a modal dialog, scoped to unconfigured providers.

### "Add TUI Backend" Flow (Wrapper Mode)

The "Add TUI" flow in Settings reuses wizard Step 4 (Agent Backend Detection) in a modal dialog, scoped to uninstalled TUI backends.

### "Re-run Ecosystem Import" Flow

Users can re-run the ecosystem compat scan (Step 7) from Settings at any time to pick up new `.claude/` or `.opencode/` configurations, discover newly installed plugins, or detect newly running local model servers.

### Entry Points

1. **Settings → Providers → "Add Provider" button** — opens the Provider Auth modal
2. **Settings → Agent Backends → "Add TUI" button** — opens the TUI Detection modal (wrapper mode only)
3. **Settings → Import → "Import from Claude Code" button** — opens the Ecosystem Compat modal
4. **Session view → Model selector → "Add Provider" link** — opens the Provider Auth modal

### Differences from First-Time Wizard

| Aspect | First-Time Wizard | Settings Re-Entry |
| --- | --- | --- |
| Welcome + mode step | Shown | Skipped (mode already set) |
| Model selection step | Shown | Skipped (existing default preserved) |
| Memory initialization | Shown | Skipped (already initialized) |
| Agent profile step | Shown | Skipped (existing profile preserved) |
| Completion step | Full summary | Brief success toast notification |
| Scope | All providers/TUIs | Only unconfigured items shown |
| UI container | Full-screen overlay | Modal dialog within Settings |
| State persistence | Creates initial config | Merges into existing config |

### Error Handling

All error handling from the corresponding wizard steps applies identically in the Settings re-entry flow. Additional handling:

| Scenario | Handling |
| --- | --- |
| All providers already configured | Show "All providers are already configured" message with close button |
| All TUIs already installed (wrapper mode) | Show "All supported TUIs are already configured" message with close button |
| Config merge conflict | Last-write-wins with backup of previous config |

## Cross-Cutting Concerns

### Network Connectivity

The wizard checks network connectivity before Steps 3 and 4. If offline:

- Step 3: Disable install buttons, show "No internet connection" banner with retry
- Step 4: Disable browser-login methods, allow only pre-entered API keys

### Telemetry

The wizard emits anonymous setup telemetry events (if user opts in during Step 1 or via a separate privacy prompt):

- `wizard_started` — OS, locale
- `wizard_step_completed` — step number, duration
- `tui_detected` — TUI ID, version, status
- `tui_installed` — TUI ID, method, success/failure
- `tui_authenticated` — TUI ID, method, success/failure
- `wizard_completed` — total duration, TUI count

### Accessibility

- All wizard steps are keyboard-navigable with visible focus indicators
- Status badges use both color and icon/text for colorblind accessibility
- Progress bars include ARIA labels with percentage
- Error messages are announced via ARIA live regions
- The wizard respects reduced-motion preferences for animations

### Responsive Layout

- The wizard is designed for the desktop window (minimum 800×600)
- Cards reflow from grid to stack on narrow windows
- Install command text is horizontally scrollable in constrained widths

## Adapter Initialization on Completion

When the user clicks "Start First Session" after completing the wizard, Lunaria initializes the appropriate adapter based on the selected mode:

```ts
// Pseudocode for first session initialization
const mode = wizardState.mode; // "wrapper" or "native"
const model = wizardState.defaultModel;
const profile = wizardState.defaultAgentProfile;

if (mode === "wrapper") {
  // Use TUI backend adapter
  const adapterKind = detectBestTui(wizardState.tuiStatuses); // e.g. "claude-code"
  const config: SessionConfig = {
    adapter: adapterKind,
    model: model.modelId,
    cwd: getDefaultWorkingDirectory(),
    env: getStoredCredentials(adapterKind),
    profile,
  };
  const adapter = createAdapter(adapterKind);
  const session = await adapter.startSession(config);
} else {
  // Native mode: use the native runtime backend
  const config: SessionConfig = {
    adapter: "native",
    model: model.modelId,
    provider: model.providerId,
    cwd: getDefaultWorkingDirectory(),
    env: getStoredCredentials(model.providerId),
    profile,
  };
  const adapter = createAdapter("native");
  const session = await adapter.startSession(config);
}
```

The `createAdapter` factory selects the concrete adapter implementation:

**Wrapper mode adapters:**

- `claude-code` → Claude Code Adapter (WebSocket SDK endpoint)
- `opencode` → OpenCode Adapter (REST API + SSE)
- `codex` → Codex Adapter (JSON-RPC app-server)
- `gemini` → Gemini Adapter (PTY wrapper)

**Native mode backend:**

- `native` → Lunaria native runtime (provider-backed agent loop)

Each backend's transport and capabilities are documented in the agent backend interface. The wizard ensures all prerequisites (binary on PATH for wrapper mode, valid API credentials for native mode) are met before reaching this initialization point.
