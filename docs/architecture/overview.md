# System Architecture

Amoena is a desktop-first AI development environment built with **Tauri** (Rust backend) and **React** (TypeScript frontend). It orchestrates multiple AI providers and agents through an embedded HTTP runtime.

## High-Level Architecture

```
+-----------------------------------------------------------------------+
|                          Amoena Desktop App                           |
|                                                                        |
|  +-----------------------------+    +-------------------------------+  |
|  |     Frontend (Webview)      |    |      Tauri Backend (Rust)     |  |
|  |                             |    |                               |  |
|  |  React 19 + TypeScript      |    |  +-------------------------+  |  |
|  |  @lunaria/ui components     |    |  |   Axum HTTP Runtime     |  |  |
|  |  @lunaria/runtime-client    |    |  |   REST + SSE API        |  |  |
|  |  @lunaria/tokens            |    |  |   110+ endpoints        |  |  |
|  |  @lunaria/i18n              |    |  +-------------------------+  |  |
|  |                             |    |  |   OrchestrationService  |  |  |
|  |  Pages:                     |    |  |   MemoryService         |  |  |
|  |  - Home                     |    |  |   HookEngine            |  |  |
|  |  - Session Workspace        |    |  |   ExtensionManager      |  |  |
|  |  - Agent Management         |    |  |   RoutingService        |  |  |
|  |  - Autopilot                |    |  |   ConfigService         |  |  |
|  |  - Marketplace              |    |  |   PluginRegistry        |  |  |
|  |  - Memory Browser           |    |  |   WorkspaceService      |  |  |
|  |  - Workspace Manager        |    |  |   RemoteAccessService   |  |  |
|  |  - Settings                 |    |  |   TerminalService       |  |  |
|  |  - Provider Setup           |    |  +-------------------------+  |  |
|  |  - Remote Access            |    |  |   SQLite (persistence)  |  |  |
|  |  - Usage Analytics          |    |  |   Stronghold (secrets)  |  |  |
|  |  - Task Board (Kanban)      |    |  +-------------------------+  |  |
|  |  - Visual Editor            |    |  |   Bun AI Worker Bridge  |  |  |
|  |  - Opinions                 |    |  +-------------------------+  |  |
|  +-----------------------------+    +-------------------------------+  |
|                                                                        |
+-----------------------------------------------------------------------+
         |                                           |
         | Tauri IPC (invoke)                        | HTTP/SSE
         v                                           v
  LaunchContext                              External Clients
  (bootstrap token)                          (CLI, Mobile App)
```

## Component Map

### Apps

| Path           | Technology        | Purpose                                |
| -------------- | ----------------- | -------------------------------------- |
| `apps/desktop` | Tauri + React     | Desktop application (main product)     |
| `apps/mobile`  | Expo React Native | Companion mobile app for remote access |

### Packages

| Path                      | Purpose                                           |
| ------------------------- | ------------------------------------------------- |
| `packages/ui`             | React component library (30+ composites, screens) |
| `packages/runtime-client` | Typed HTTP client for the runtime API             |
| `packages/tokens`         | Design tokens (colors, spacing, typography)       |
| `packages/i18n`           | Internationalization (5 languages)                |

### Backend Modules

All Rust backend code lives in `apps/desktop/src-tauri/src/`:

```
src/
+-- lib.rs                  # Tauri app setup, plugin registration
+-- main.rs                 # Desktop entry point
+-- bin/amoena/            # CLI binary
|   +-- main.rs             # CLI entry, arg parsing (clap)
|   +-- client.rs           # HTTP client for CLI
|   +-- commands/           # Subcommand implementations
|       +-- sessions.rs
|       +-- agents.rs
|       +-- teams.rs
|       +-- tasks.rs
|       +-- extensions.rs
|       +-- memory.rs
|       +-- hooks.rs
|       +-- ... (15 modules)
+-- runtime.rs              # Axum HTTP server, route registration
+-- orchestration.rs        # Agent spawning, teams, mailbox, consensus
+-- memory.rs               # Observation capture, tiered retrieval, embeddings
+-- hooks.rs                # Hook engine (23 event types, 4 handler types)
+-- routing.rs              # Provider/model selection, reasoning mode
+-- extensions/
|   +-- format.rs           # .luna binary format parser/writer
|   +-- loader.rs           # Extension discovery and installation
|   +-- manager.rs          # Extension lifecycle, contributions
|   +-- contributions.rs    # Aggregated contribution types
+-- config/
|   +-- service.rs          # Scoped settings (global, per-tui, per-session)
|   +-- secrets.rs          # Keychain integration via Stronghold
|   +-- paths.rs            # Data directory resolution
|   +-- models.rs           # Configuration types
+-- persistence/
|   +-- database.rs         # SQLite connection management
|   +-- migrations.rs       # Schema migration runner
|   +-- models.rs           # 40+ data model types
|   +-- repositories/       # 20+ repository modules
|       +-- sessions.rs
|       +-- agents.rs
|       +-- messages.rs
|       +-- observations.rs
|       +-- providers.rs
|       +-- ... (15 more)
+-- providers/              # AI provider adapters
+-- plugins/                # Plugin registry and execution
+-- remote/                 # Device pairing, relay, LAN discovery
+-- terminal.rs             # PTY-based terminal multiplexing
+-- workspaces.rs           # Git workspace management
+-- workspace_reviews.rs    # Merge review with consensus
+-- tools.rs                # Tool registry, permission ceilings
+-- persona.rs              # Agent persona profiles
+-- ai_worker.rs            # Bun subprocess bridge for inference
+-- wrappers.rs             # External CLI tool wrappers
+-- logging.rs              # Structured logging (tracing)
+-- menu.rs                 # Native menu bar
+-- tray.rs                 # System tray icon
```

## Runtime Lifecycle

```
                Desktop Launch
                      |
                      v
          +---------------------+
          | Tauri Builder setup |
          | - Register plugins  |
          | - Build native menu |
          | - Setup system tray |
          +---------------------+
                      |
                      v
          +---------------------+
          | start_runtime()     |
          | - Open SQLite DB    |
          | - Run migrations    |
          | - Start Axum server |
          | - Spawn AI worker   |
          | - Write runtime.json|
          +---------------------+
                      |
                      v
          +---------------------+
          | LaunchContext ready  |
          | - api_base_url      |
          | - bootstrap_token   |
          | - instance_id       |
          +---------------------+
                      |
        +-------------+-------------+
        |                           |
        v                           v
  Frontend (Webview)          CLI / Mobile
  POST /bootstrap/auth        Read runtime.json
  -> authToken                -> connect
```

On close, the window hides to the system tray. On quit, the runtime shuts down gracefully.

## Data Flow

### Session Message Flow

```
User Input
    |
    v
Frontend (React)
    |  POST /api/v1/sessions/{id}/messages
    v
Runtime (Axum)
    |  1. Validate session
    |  2. Route to provider (RoutingService)
    |  3. Check permissions (ToolRegistry)
    v
AI Worker Bridge (Bun subprocess)
    |  4. Call provider API
    |  5. Stream response tokens
    v
SSE Stream -> Frontend
    |  6. Store message (MessageRepository)
    |  7. Capture observations (MemoryService)
    |  8. Fire hooks (HookEngine)
    v
UI Update
```

### Memory Observation Flow

```
Agent Response
    |
    v
MemoryService.capture()
    |  1. Classify category (profile/preference/entity/pattern/tool_usage/skill)
    |  2. Extract concepts from narrative
    |  3. Compute content hash (SHA-256)
    |  4. Check for duplicates (hash match)
    |  5. Check for semantic near-duplicates (Jaccard >= 0.50)
    v
ObservationRepository.insert()
    |  6. Build tiered summaries (L0/L1/L2)
    v
MemoryTierRepository.upsert()
    |
    v (async, if embedding API key available)
BunWorkerBridge.generate_embedding()
    |  7. OpenAI text-embedding-3-small
    v
ObservationEmbeddingRepository.upsert()
```

## Hook Engine

The hook engine fires on 23 lifecycle events. Each hook has a handler type:

| Handler Type | Execution                                   |
| ------------ | ------------------------------------------- |
| `command`    | Runs a shell command via `zsh -lc`          |
| `http`       | POSTs the event payload to a URL            |
| `prompt`     | Returns static text (injected into context) |
| `agent`      | References an agent type to spawn           |

Hook events:

```
SessionStart, SessionEnd, UserPromptSubmit,
PreToolUse, PostToolUse, PostToolUseFailure,
PermissionRequest, SubagentStart, SubagentStop,
Stop, Notification, TeammateIdle, TaskCompleted,
InstructionsLoaded, ConfigChange,
WorktreeCreate, WorktreeRemove, PreCompact,
MemoryObserve, MemoryInject,
AutopilotStoryStart, AutopilotStoryComplete,
ProviderSwitch, ErrorUnhandled
```

Hooks run with a configurable timeout (default 30s) and can be filtered by regex matcher.

## Persistence Layer

All state is stored in a single SQLite database (`~/.amoena/amoena.db`):

```
+-- sessions
+-- messages
+-- agents
+-- agent_profiles
+-- agent_teams
+-- agent_messages (mailbox)
+-- mailbox_flags
+-- observations
+-- memory_tiers (L0/L1/L2)
+-- observation_embeddings
+-- session_summaries
+-- settings
+-- providers
+-- provider_models
+-- provider_credentials
+-- hooks
+-- plugins
+-- extensions (via filesystem)
+-- workspaces
+-- workspace_merge_reviews
+-- tasks
+-- queue_messages
+-- tool_executions
+-- pending_approvals
+-- devices (remote pairing)
+-- usage_analytics
```

Each table has a corresponding repository module in `src/persistence/repositories/` that provides typed CRUD operations.

## Security Model

- **Credentials** are stored in the system keychain via Tauri Stronghold (never in SQLite)
- **Permission ceilings** enforce that sub-agents cannot escalate beyond their parent's access
- **Tool approval** workflows require explicit user consent for sensitive operations
- **Remote access** uses device pairing with token rotation and scope-based authorization
- **Single instance** enforcement prevents multiple desktop instances from running simultaneously

## Cross-Platform Support

| Platform | Runtime    | Frontend     | Distribution          |
| -------- | ---------- | ------------ | --------------------- |
| macOS    | Rust/Tauri | WebKit       | .dmg, Homebrew        |
| Windows  | Rust/Tauri | WebView2     | .msi                  |
| Linux    | Rust/Tauri | WebKitGTK    | .deb, .AppImage       |
| iOS      | Expo RN    | React Native | TestFlight, App Store |
| Android  | Expo RN    | React Native | Play Store            |
