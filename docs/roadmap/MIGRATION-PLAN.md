# Lunaria: Superset Fork Migration Plan

## Executive Summary

Migrate Lunaria from Tauri/Rust to an unbranded Superset (Electron) fork while preserving all unique Lunaria features (Memory, Remote Access, Agent Orchestration, Autopilot, Marketplace, Kanban, Visual Editor, Opinions, Mobile) and maintaining a distinct visual identity. This is a **full platform migration** — not a UI reskin.

**Timeline:** 8 weeks (5 phases)
**Risk Level:** High — platform migration with feature preservation
**License:** Lunaria relicenses to Elastic-2.0 (matching Superset). No managed SaaS offering.
**Upstream Strategy:** Selective sync — track Superset releases, cherry-pick packages/ui and packages/host-service updates.

### Engineering Review Decisions (2026-03-19)

| #   | Decision                 | Choice                                                                                                   |
| --- | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| 1   | License                  | Accept Elastic-2.0 (relicense Lunaria)                                                                   |
| 2   | Upstream tracking        | Selective sync at releases                                                                               |
| 3   | Cloud removal data layer | tRPC subscriptions + @tanstack/react-query (replace Electric SQL)                                        |
| 4   | Process architecture     | Separate lunaria-service daemon (Memory, Remote, Orchestration, Extensions, Autopilot, Kanban, Opinions) |
| 5   | AI runtime               | Keep Mastra for chat, Lunaria orchestration for multi-agent/consensus                                    |
| 6   | Crypto port safety       | Cross-language test vectors (Rust fixtures → TypeScript must match)                                      |
| 7   | Database                 | Single SQLite database — Lunaria tables added as migrations 0037-0043 in local-db                        |
| 8   | Kanban architecture      | Kanban service owns tasks, exposes API for agent claim/update                                            |
| 9   | tRPC organization        | Namespace split — `trpc.lunaria.*` for all Lunaria routers                                               |
| 10  | i18n scope               | Full app i18n — all screens (Superset + Lunaria)                                                         |
| 11  | Task concurrency         | Atomic SQL claim (`UPDATE WHERE claimed_by IS NULL`)                                                     |
| 12  | Cloud removal testing    | Dedicated regression test suite                                                                          |
| 13  | Memory graph rendering   | d3-force + Canvas 2D (Barnes-Hut approximation)                                                          |
| 14  | lunaria-service startup  | Eager load all services                                                                                  |

### Technical Corrections from Deep Research (2026-03-19)

Critical details discovered from comprehensive Superset codebase analysis:

| Item               | Plan Assumed           | Actual (Corrected)                                                     |
| ------------------ | ---------------------- | ---------------------------------------------------------------------- |
| Electron version   | Generic Electron       | Electron **40.2.1**                                                    |
| Tailwind           | v3                     | **v4** (Vite plugin, not PostCSS)                                      |
| Zod                | v3                     | **v4** (breaking API changes)                                          |
| tRPC IPC           | Generic tRPC over HTTP | **trpc-electron** library (direct IPC, no HTTP server needed)          |
| Client state       | React Query only       | **Zustand v5** for local UI state + TanStack Query v5 for server state |
| Terminal renderer  | Basic xterm            | **@xterm/xterm 6.1.0-beta + WebGL addon** (GPU-accelerated)            |
| Terminal isolation | Single node-pty        | **Three-tier**: PTY subprocess → terminal-host daemon → renderer       |
| Rich text (chat)   | Markdown only          | **Tiptap v3** for rich text input                                      |
| Layout system      | Simple splits          | **react-mosaic-component** for tiling + **react-resizable-panels**     |
| Git operations     | Custom                 | **simple-git** library                                                 |
| Code quality       | ESLint + Prettier      | **Biome 2.4.2** (replaces both)                                        |
| Linting/formatting | Need to add            | Already uses Biome — keep it                                           |
| Superset mobile    | None                   | **Has apps/mobile (Expo)** — could study their approach                |
| Per-project config | None                   | **`.superset/config.json`** → becomes `.lunaria/config.json`           |
| Diff rendering     | Custom                 | **@pierre/diffs** library                                              |
| Virtual lists      | None                   | **@tanstack/react-virtual**                                            |
| File icons         | Lucide only            | **material-icon-theme** (generated at build time)                      |
| Streams            | None                   | **@durable-streams/client** for persistent event streaming             |
| Mastra version     | Generic                | **Private fork** (`mastracode-v0.4.0-superset.12`) via GitHub tarball  |

Additional Lunaria details confirmed:

- Rust backend is **4,100+ lines** in `runtime.rs` with **100+ API endpoints**
- UI library has **71 shadcn/ui primitives** + **40+ composites** + **17 screens**
- Agent system uses **mailbox-based** inter-agent communication (not just simple spawning)
- Has **workspace reviews** for merge decision tracking
- Has **pricing cache** for per-model token cost tracking
- **Persona system** is separate from Opinions (agent personality profiles with custom system prompts)
- i18n supports **5 languages**: English, Spanish, French, German, Portuguese

---

## Current State Analysis

### Superset Architecture (Source)

```
LunariaAi/superset (Electron, v1.2.1, 7.4K stars)
├── apps/
│   ├── admin/          — Admin dashboard (Next.js)
│   ├── api/            — Cloud API (Next.js, Neon, Better Auth, Stripe)
│   ├── desktop/        — Electron app (electron-vite, TanStack Router, tRPC)
│   ├── docs/           — Documentation site
│   ├── marketing/      — Marketing site
│   └── web/            — Web client
├── packages/
│   ├── auth/           — Better Auth + Stripe integration
│   ├── chat/           — AI conversations (Mastra, AI SDK, slash commands)
│   ├── db/             — Cloud database (Neon PostgreSQL, Drizzle, 28 migrations)
│   ├── desktop-mcp/    — MCP bridge + Puppeteer browser automation
│   ├── host-service/   — Local HTTP server (terminal, git, chat, PR management)
│   ├── local-db/       — Desktop persistence (SQLite, Drizzle, 36 migrations)
│   ├── macos-process-metrics/ — Native process monitoring
│   ├── mcp/            — MCP protocol support
│   ├── scripts/        — Build/setup scripts
│   ├── shared/         — Shared types and utilities
│   ├── trpc/           — tRPC configuration
│   ├── ui/             — UI components (shadcn/ui + ai-elements)
│   └── workspace-fs/   — Filesystem abstraction (watch, search, client/host)
└── tooling/            — Build tooling
```

**Key Superset capabilities we adopt:**

- Electron multi-process architecture (main, terminal-host daemon, pty-subprocess, git-task-worker, host-service)
- tRPC for type-safe IPC (main↔renderer)
- TanStack Router (file-based routing with auth guards)
- shadcn/ui component library + AI-specific elements (30+ components)
- CodeMirror for code viewing/editing
- Drizzle ORM + SQLite for local persistence (36 migrations)
- @parcel/watcher for filesystem monitoring
- @headless-tree for file explorer
- node-pty terminal management via host-service
- Git operations (branches, staging, commits, PR creation)
- Agent presets system (Claude, Codex, Gemini, etc.)
- Workspace sections with drag-and-drop organization
- Resource monitoring (CPU, memory per workspace)
- Auto-update system (electron-builder)

### Lunaria Architecture (Current → Being Migrated)

```
Lunaria/lunaria (Tauri/Rust, MIT)
├── apps/
│   ├── desktop/        — Tauri app (React, React Router)
│   │   └── src-tauri/  — Rust backend (~4,500 lines)
│   │       ├── orchestration.rs    — Multi-agent spawning, tool intersection, consensus
│   │       ├── memory.rs           — Tiered storage (L0/L1/L2), hybrid search, dedup
│   │       ├── remote/mod.rs       — LAN discovery, PIN/QR pairing, E2E encryption
│   │       ├── extensions/format.rs— .luna binary format parser
│   │       ├── terminal.rs         — PTY management with event log
│   │       ├── persistence/        — SQLite models/migrations
│   │       └── ai_workers/         — Child process JSON-RPC bridge
│   └── mobile/         — Expo/React Native app
├── packages/
│   ├── i18n/           — Internationalization
│   ├── runtime-client/ — Tauri IPC abstraction
│   ├── tokens/         — Cross-platform design tokens
│   └── ui/             — Component library (30+ components, Storybook)
└── docs/               — VitePress documentation
```

**Unique Lunaria features NOT in Superset (must preserve):**

1. **Memory System** — Tiered storage (L0 hot/L1 warm/L2 cold), hybrid search (BM25 + cosine via RRF), SHA-256 dedup, Jaccard near-duplicate detection, force-directed graph visualization
2. **Remote Access** — LAN device discovery, PIN/QR code pairing, X25519 ECDH key exchange, XChaCha20-Poly1305 AEAD encryption, JWT token rotation with reuse detection, device revocation
3. **Agent Orchestration** — Multi-agent spawning, hierarchical permission ceiling (ReadOnly < ReadWrite < ShellAccess < Admin), tool intersection, weighted consensus voting
4. **Autopilot** — 6-phase autonomous execution pipeline with phase progression UI
5. **Marketplace** — .luna extension format (magic bytes, manifest, embedded assets), extension discovery/install/lifecycle
6. **Kanban Board** — Task management with drag-and-drop columns
7. **Visual Editor** — Visual workflow/graph editor
8. **Opinions/Personas** — Configurable AI behavior profiles
9. **Mobile App** — Expo/React Native for remote access scenarios
10. **i18n** — Full internationalization system
11. **Design Tokens** — Cross-platform token generation (web + React Native)

---

## Phase 1: Fork & Rebrand (Week 1)

### 1.1 Repository Setup

**Goal:** Create clean Superset fork with all branding replaced

```
Actions:
1. Fork LunariaAi/superset → Lunaria/lunaria-desktop (or new branch in existing repo)
2. Remove cloud-only apps: apps/admin, apps/api, apps/marketing, apps/web
3. Remove cloud packages: packages/auth, packages/db, packages/email
4. Keep: apps/desktop, apps/docs, packages/* (all desktop-relevant)
5. Preserve git history for attribution (Elastic-2.0 compliance)
```

### 1.2 Branding Strip & Replace

**Comprehensive branding replacement checklist (38 items):**

| Category                   | Superset             | Lunaria                          |
| -------------------------- | -------------------- | -------------------------------- |
| Product name               | "Superset"           | "Lunaria"                        |
| Package scope              | `@superset/*`        | `@lunaria/*`                     |
| Deep link protocol         | `superset://`        | `lunaria://`                     |
| CLI command                | `superset`           | `lunaria`                        |
| macOS bundle ID            | `sh.superset.app`    | `com.lunaria.app`                |
| User agent                 | `Superset/x.x.x`     | `Lunaria/x.x.x`                  |
| Auto-updater URL           | superset.sh/releases | lunaria releases URL             |
| electron-builder appId     | `sh.superset.app`    | `com.lunaria.app`                |
| Window title               | "Superset"           | "Lunaria"                        |
| Tray icon/tooltip          | Superset icon        | Lunaria icon                     |
| About dialog               | Superset branding    | Lunaria branding                 |
| Splash screen              | Superset logo        | Lunaria logo                     |
| .desktop file (Linux)      | superset.desktop     | lunaria.desktop                  |
| Windows installer GUID     | Superset GUID        | New Lunaria GUID                 |
| package.json name/desc     | @superset/\*         | @lunaria/\*                      |
| Repository URLs            | LunariaAi/superset | Lunaria/lunaria                  |
| License headers            | Superset             | Lunaria (preserving Elastic-2.0) |
| Onboarding copy            | Superset references  | Lunaria references               |
| Error reporting (Sentry)   | Superset DSN         | Lunaria DSN (or remove)          |
| Analytics (PostHog/Outlit) | Superset project     | Remove or replace                |
| Social meta tags           | Superset OG tags     | Lunaria OG tags                  |
| Keyboard shortcuts help    | Superset references  | Lunaria references               |
| Config directories         | `.superset/`         | `.lunaria/`                      |
| Extension format           | N/A                  | `.luna` files                    |
| Icon assets                | `superset.svg`       | Lunaria magenta icon             |
| Preset icons               | Keep agent icons     | Add Lunaria-specific             |
| favicon                    | Superset favicon     | Lunaria favicon                  |
| Dock icon (macOS)          | Superset.icns        | Lunaria.icns                     |

### 1.3 Theme System Migration

**Goal:** Replace Superset's theme with Lunaria's magenta-centric design system

```
Superset uses shadcn/ui CSS variables → Lunaria tokens already map to same namespace

Bridge approach (no component forks needed):
1. Replace globals.css with Lunaria's color system:
   - --primary: 300 100% 36% (magenta)
   - --background: 270 10% 6% (purple-tinted dark)
   - surface-0 through surface-3 (purple-tinted depth)
   - Agent-specific colors (tui-claude, tui-codex, tui-gemini, tui-opencode)
2. Add Lunaria keyframe animations:
   - pulse-magenta (box-shadow glow, 0-12px blur)
   - shimmer (background-position sweep)
   - waveform (scaleY transform)
3. Replace Inter/system fonts with Lunaria font stack
4. Update tailwind.config.ts to bridge Lunaria tokens → shadcn namespace
```

### 1.4 Remove Cloud Dependencies

**Strip cloud-first features for local-first architecture:**

```
Remove:
- @electric-sql/client, @tanstack/db, @tanstack/electric-db-collection (cloud sync)
- @better-auth/stripe, better-auth (cloud auth)
- @sentry/electron (or replace with local error logging)
- @outlit/browser, @outlit/node (analytics)
- Neon PostgreSQL client
- Upstash Redis/QStash
- Vercel Blob/KV
- Resend email
- Stripe payments
- PostHog analytics

Keep:
- All local packages (local-db, host-service, workspace-fs, chat, ui, etc.)
- OAuth provider auth flows (Google, GitHub) — useful for API key auth
- AI SDK providers (@ai-sdk/anthropic, @ai-sdk/openai)
```

### Phase 1 Deliverable

A buildable, runnable Electron app that is visually Lunaria (magenta theme, Lunaria branding) with all Superset desktop functionality intact but no cloud dependencies.

---

## Phase 2: Monorepo Restructure & Package Integration (Week 2)

### 2.1 Merge Lunaria Packages into Superset Structure

**Goal:** Integrate Lunaria's unique packages alongside Superset's

```
Final packages/ structure:
├── chat/              — FROM SUPERSET (AI conversations, Mastra, slash commands)
├── desktop-mcp/       — FROM SUPERSET (MCP bridge, browser automation)
├── host-service/      — FROM SUPERSET (terminal, git, PR management)
│   └── + memory/      — LUNARIA: memory service integration
│   └── + remote/      — LUNARIA: remote access service
│   └── + extensions/  — LUNARIA: extension lifecycle management
│   └── + orchestration/ — LUNARIA: agent orchestration service
├── i18n/              — FROM LUNARIA (internationalization)
├── local-db/          — FROM SUPERSET (SQLite persistence)
│   └── + Lunaria migrations — memory tables, extensions, remote devices, agents
├── macos-process-metrics/ — FROM SUPERSET (native process monitoring)
├── mcp/               — FROM SUPERSET (MCP protocol)
├── scripts/           — FROM SUPERSET (build scripts)
├── shared/            — FROM SUPERSET (types/utils) + Lunaria shared types
├── tokens/            — FROM LUNARIA (cross-platform design tokens)
├── trpc/              — FROM SUPERSET (tRPC config)
├── ui/                — MERGED (Superset shadcn/ui + ai-elements + Lunaria composites)
└── workspace-fs/      — FROM SUPERSET (filesystem abstraction)
```

### 2.2 Database Schema Merge

**Extend Superset's local-db with Lunaria-specific tables:**

```sql
-- New migrations added to packages/local-db/drizzle/

-- 0037: Lunaria memory system
CREATE TABLE memory_entries (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  embedding BLOB,            -- float32 array for cosine similarity
  content_hash TEXT NOT NULL, -- SHA-256 for exact dedup
  tier INTEGER DEFAULT 0,    -- L0=hot, L1=warm, L2=cold
  access_count INTEGER DEFAULT 0,
  last_accessed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  workspace_id TEXT REFERENCES workspaces(id)
);
CREATE VIRTUAL TABLE memory_fts USING fts5(content, content='memory_entries', content_rowid='rowid');

-- 0038: Lunaria extensions
CREATE TABLE extensions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  manifest TEXT NOT NULL,     -- JSON manifest from .luna file
  installed_at TEXT DEFAULT (datetime('now')),
  enabled INTEGER DEFAULT 1,
  permissions TEXT             -- JSON array of granted permissions
);

-- 0039: Lunaria remote access devices
CREATE TABLE remote_devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  public_key BLOB NOT NULL,   -- X25519 public key
  paired_at TEXT DEFAULT (datetime('now')),
  last_seen_at TEXT,
  revoked INTEGER DEFAULT 0,
  jwt_generation INTEGER DEFAULT 0  -- for rotation/reuse detection
);

-- 0040: Lunaria agent orchestration
CREATE TABLE agent_sessions (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES agent_sessions(id),
  permission_ceiling TEXT NOT NULL, -- ReadOnly|ReadWrite|ShellAccess|Admin
  tools TEXT NOT NULL,              -- JSON array of allowed tools
  status TEXT DEFAULT 'pending',
  consensus_weight REAL DEFAULT 1.0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 0041: Lunaria opinions/personas
CREATE TABLE opinions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  model_preference TEXT,
  temperature REAL DEFAULT 0.7,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 0042: Lunaria kanban
CREATE TABLE kanban_boards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  workspace_id TEXT REFERENCES workspaces(id),
  columns TEXT NOT NULL,      -- JSON array of column definitions
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE kanban_tasks (
  id TEXT PRIMARY KEY,
  board_id TEXT REFERENCES kanban_boards(id),
  column_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,
  agent_session_id TEXT REFERENCES agent_sessions(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- 0043: Lunaria autopilot
CREATE TABLE autopilot_runs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id),
  phase INTEGER DEFAULT 0,   -- 0-5 (6 phases)
  status TEXT DEFAULT 'pending',
  plan TEXT,                  -- JSON execution plan
  results TEXT,               -- JSON phase results
  created_at TEXT DEFAULT (datetime('now'))
);
```

### 2.3 tRPC Router Extension

**Add Lunaria-specific routers to Superset's tRPC layer:**

```typescript
// apps/desktop/src/lib/trpc/routers/index.ts — extend existing router

// NEW Lunaria routers:
import { memoryRouter } from './memory'; // Memory CRUD, search, graph data
import { remoteAccessRouter } from './remote-access'; // Device pairing, relay, auth
import { orchestrationRouter } from './orchestration'; // Agent spawning, consensus
import { extensionsRouter } from './extensions'; // .luna install, lifecycle, marketplace
import { kanbanRouter } from './kanban'; // Board/task CRUD
import { autopilotRouter } from './autopilot'; // Phase management, execution
import { opinionsRouter } from './opinions'; // Persona CRUD, activation
import { visualEditorRouter } from './visual-editor'; // Graph/workflow state

export const appRouter = router({
  // Existing Superset routers...
  analytics: analyticsRouter,
  auth: authRouter,
  autoUpdate: autoUpdateRouter,
  browser: browserRouter,
  browserHistory: browserHistoryRouter,
  cache: cacheRouter,
  changes: changesRouter,
  chatRuntimeService: chatRuntimeServiceRouter,
  chatService: chatServiceRouter,
  config: configRouter,
  external: externalRouter,
  filesystem: filesystemRouter,
  hostServiceManager: hostServiceManagerRouter,
  hotkeys: hotkeysRouter,
  menu: menuRouter,
  modelProviders: modelProvidersRouter,
  notifications: notificationsRouter,
  permissions: permissionsRouter,
  ports: portsRouter,
  projects: projectsRouter,
  resourceMetrics: resourceMetricsRouter,
  ringtone: ringtoneRouter,
  settings: settingsRouter,
  terminal: terminalRouter,
  uiState: uiStateRouter,
  window: windowRouter,
  workspaceFsService: workspaceFsServiceRouter,
  workspaces: workspacesRouter,

  // NEW Lunaria routers:
  memory: memoryRouter,
  remoteAccess: remoteAccessRouter,
  orchestration: orchestrationRouter,
  extensions: extensionsRouter,
  kanban: kanbanRouter,
  autopilot: autopilotRouter,
  opinions: opinionsRouter,
  visualEditor: visualEditorRouter,
});
```

### 2.4 Lunaria UI Components → Superset UI Package

**Merge strategy for packages/ui:**

```
packages/ui/src/
├── assets/             — SUPERSET (keep) + add Lunaria assets
├── atoms/              — SUPERSET (keep all)
├── components/
│   ├── ai-elements/    — SUPERSET (keep all 30+ AI components)
│   ├── ui/             — SUPERSET shadcn/ui (keep all)
│   ├── mesh-gradient/  — SUPERSET (keep)
│   └── lunaria/        — NEW: Lunaria-specific composites
│       ├── MemoryGraphView.tsx      — Force-directed memory visualization
│       ├── MemoryBrowser.tsx        — Memory search, browse, tier management
│       ├── AgentManagement.tsx      — Multi-agent orchestration UI
│       ├── AgentConsensusView.tsx   — Weighted voting visualization
│       ├── AutopilotPipeline.tsx    — 6-phase progression display
│       ├── AutopilotPhaseCard.tsx   — Individual phase status card
│       ├── MarketplaceGrid.tsx      — Extension cards with .luna badges
│       ├── ExtensionCard.tsx        — Extension detail with permissions
│       ├── KanbanBoard.tsx          — Drag-and-drop columns
│       ├── KanbanColumn.tsx         — Column with task cards
│       ├── KanbanTaskCard.tsx       — Task card with agent link
│       ├── RemoteAccessPanel.tsx    — QR/PIN pairing interface
│       ├── DeviceList.tsx           — Connected devices management
│       ├── VisualEditorCanvas.tsx   — Workflow/graph editor
│       ├── OpinionSelector.tsx      — Persona picker/editor
│       ├── SessionComposer.tsx      — Enhanced message composer
│       ├── MessageTimeline.tsx      — Session message history
│       ├── TerminalPanel.tsx        — Terminal with session tabs
│       ├── CommandPalette.tsx       — Global command palette
│       ├── ProviderLogo.tsx         — AI provider icon renderer
│       └── StatusBar.tsx            — Bottom status with memory widget
```

### Phase 2 Deliverable

Restructured monorepo with all packages in place, database schema extended, tRPC routers defined, and UI component placeholders. Builds successfully but Lunaria-specific features are stubbed.

---

## Phase 3: Core Services Port (Weeks 3-5)

### 3.1 Memory Service (Week 3)

**Port from Rust `memory.rs` (494 lines) → TypeScript in host-service**

```
packages/host-service/src/runtime/memory/
├── index.ts
├── memory-service.ts        — Main service: store, search, tier management
├── embedding.ts             — In-process cosine similarity (no external deps)
├── deduplication.ts         — SHA-256 exact + Jaccard near-duplicate
├── hybrid-search.ts         — BM25 (FTS5) + cosine + RRF fusion
├── tier-manager.ts          — L0/L1/L2 promotion/demotion logic
└── memory-service.test.ts

Key implementation decisions:
- Use FTS5 virtual table in existing SQLite (better-sqlite3)
- Cosine similarity computed in-process (Float32Array dot product)
- RRF formula: score = Σ(1 / (k + rank_i)) where k=60
- Tier promotion based on access_count thresholds
- SHA-256 via Node.js native crypto module
- Jaccard similarity via trigram sets (no external library)
```

**tRPC router endpoints:**

```typescript
memoryRouter = router({
  store: procedure
    .input(z.object({ content: z.string(), workspaceId: z.string().optional() }))
    .mutation(),
  search: procedure
    .input(
      z.object({ query: z.string(), limit: z.number().default(10), tier: z.number().optional() }),
    )
    .query(),
  getGraph: procedure.input(z.object({ workspaceId: z.string().optional() })).query(), // for force-directed viz
  promote: procedure.input(z.object({ id: z.string(), tier: z.number() })).mutation(),
  delete: procedure.input(z.object({ id: z.string() })).mutation(),
  stats: procedure.query(), // tier distribution, total entries
});
```

### 3.2 Remote Access Service (Week 3-4)

**Port from Rust `remote/mod.rs` (793 lines) → TypeScript in host-service**

```
packages/host-service/src/runtime/remote-access/
├── index.ts
├── remote-access-service.ts  — Main service: discovery, pairing, relay
├── lan-discovery.ts          — Multicast DNS / UDP broadcast for LAN devices
├── pairing.ts                — PIN generation + QR code data
├── crypto.ts                 — X25519 ECDH + XChaCha20-Poly1305 AEAD
├── jwt-manager.ts            — HS256 JWT with rotation + reuse detection
├── relay-room.ts             — WebSocket relay with E2E encryption
├── device-manager.ts         — Device CRUD + revocation
└── remote-access-service.test.ts

Key implementation decisions:
- libsodium-wrappers-sumo for X25519 ECDH and XChaCha20-Poly1305
- jose library for HS256 JWT (matching Rust jsonwebtoken behavior)
- mdns/bonjour for LAN discovery (or manual UDP broadcast)
- WebSocket server for relay (ws package, runs in host-service)
- QR code generation via qrcode package
- JWT rotation: new token on each use, reuse = immediate device revocation
```

### 3.3 Agent Orchestration Service (Week 4)

**Port from Rust `orchestration.rs` (406 lines) → TypeScript in host-service**

```
packages/host-service/src/runtime/orchestration/
├── index.ts
├── orchestration-service.ts  — Agent spawning, lifecycle management
├── permission-broker.ts      — Permission ceiling enforcement
├── tool-registry.ts          — Tool registration + intersection
├── tool-executor.ts          — Tool execution with approval flow
├── consensus.ts              — Weighted voting across agents
├── ai-worker-bridge.ts       — Child process JSON-RPC (reuse existing bridge.ts)
└── orchestration-service.test.ts

Key implementation decisions:
- Permission ceiling: parent always >= child permissions
- Tool intersection: child tools = intersection(parent_tools, requested_tools)
- Consensus voting: weighted sum > threshold = approved
- AI worker bridge: spawn child process, communicate via stdin/stdout JSON-RPC
- Existing Superset chat/Mastra integration as foundation for agent runtime
```

### 3.4 Extension System (Week 4)

**Port from Rust `extensions/format.rs` → TypeScript**

```
packages/host-service/src/runtime/extensions/
├── index.ts
├── extension-service.ts      — Install, uninstall, enable/disable lifecycle
├── luna-parser.ts            — .luna binary format reader (Buffer API)
├── extension-sandbox.ts      — Permission-scoped execution environment
├── marketplace-client.ts     — Extension discovery (future: registry API)
└── extension-service.test.ts

.luna binary format (preserved from Rust):
┌─────────────┬──────────┬────────────────┬─────────────┬──────────┐
│ Magic (4B)  │ Ver (2B) │ Manifest len   │ Manifest    │ Assets   │
│ "LUNA"      │ u16 LE   │ u32 LE         │ JSON        │ blob     │
└─────────────┴──────────┴────────────────┴─────────────┴──────────┘
```

### 3.5 Autopilot Engine (Week 5)

**New TypeScript service (no Rust equivalent — was UI-only)**

```
packages/host-service/src/runtime/autopilot/
├── index.ts
├── autopilot-service.ts      — Phase orchestration engine
├── phases/
│   ├── analyze.ts            — Phase 0: Analyze project/task
│   ├── plan.ts               — Phase 1: Create execution plan
│   ├── implement.ts          — Phase 2: Execute implementation
│   ├── test.ts               — Phase 3: Run tests
│   ├── review.ts             — Phase 4: Self-review
│   └── finalize.ts           — Phase 5: Commit/cleanup
├── phase-runner.ts           — Sequential phase execution with rollback
└── autopilot-service.test.ts
```

### Phase 3 Deliverable

All core services ported to TypeScript and integrated into host-service with tRPC routers. Each service has unit tests. Memory search, remote pairing, agent orchestration, extensions, and autopilot are functional from the main process.

---

## Phase 4: UI Integration & Unique Screens (Weeks 5-7)

### 4.1 Route Structure

**Extend Superset's TanStack Router with Lunaria pages:**

```
apps/desktop/src/renderer/routes/
├── __root.tsx                          — FROM SUPERSET
├── _authenticated/
│   ├── _dashboard/                     — FROM SUPERSET (main workspace view)
│   │   ├── components/
│   │   │   ├── DashboardSidebar/       — EXTEND with Lunaria nav items
│   │   │   └── LunariaSidebarItems/    — NEW: Memory, Agents, Autopilot, etc.
│   │   ├── index.tsx                   — FROM SUPERSET (workspace view)
│   │   └── $workspaceId.tsx            — FROM SUPERSET (workspace detail)
│   ├── memory/                         — NEW: Lunaria Memory Browser
│   │   ├── index.tsx                   — Memory search + graph view
│   │   └── $entryId.tsx                — Memory entry detail
│   ├── agents/                         — NEW: Lunaria Agent Management
│   │   ├── index.tsx                   — Agent list + orchestration
│   │   └── $sessionId.tsx              — Agent session detail + consensus
│   ├── autopilot/                      — NEW: Lunaria Autopilot
│   │   ├── index.tsx                   — Autopilot dashboard
│   │   └── $runId.tsx                  — Run detail with phase pipeline
│   ├── marketplace/                    — NEW: Lunaria Extension Marketplace
│   │   ├── index.tsx                   — Extension grid
│   │   └── $extensionId.tsx            — Extension detail + permissions
│   ├── kanban/                         — NEW: Lunaria Kanban Board
│   │   ├── index.tsx                   — Board view
│   │   └── $boardId.tsx                — Board detail
│   ├── remote/                         — NEW: Lunaria Remote Access
│   │   ├── index.tsx                   — Device list + pairing
│   │   └── pair.tsx                    — QR/PIN pairing flow
│   ├── visual-editor/                  — NEW: Lunaria Visual Editor
│   │   └── index.tsx                   — Graph/workflow canvas
│   ├── opinions/                       — NEW: Lunaria Opinions
│   │   └── index.tsx                   — Persona management
│   └── settings/                       — EXTEND Superset settings
│       ├── index.tsx                   — FROM SUPERSET
│       ├── memory.tsx                  — NEW: Memory settings (tier thresholds)
│       ├── remote.tsx                  — NEW: Remote access settings
│       └── extensions.tsx              — NEW: Extension management
```

### 4.2 Sidebar Navigation Enhancement

**Extend Superset's DashboardSidebar with Lunaria sections:**

```
┌──────────────────────────────┐
│  🌙 Lunaria                 │  ← Lunaria logo + magenta accent
├──────────────────────────────┤
│  WORKSPACES                  │  ← FROM SUPERSET (projects, sections)
│    ├── Project A             │
│    │   ├── workspace-1       │
│    │   └── workspace-2       │
│    └── Project B             │
├──────────────────────────────┤
│  LUNARIA                     │  ← NEW section (magenta indicator pip)
│    ├── 🧠 Memory             │  ← Memory browser + graph
│    ├── 🤖 Agents             │  ← Agent management + orchestration
│    ├── ⚡ Autopilot           │  ← Autopilot runs
│    ├── 📦 Marketplace        │  ← .luna extensions
│    ├── 📋 Kanban             │  ← Task boards
│    ├── 🖼  Visual Editor      │  ← Workflow editor
│    ├── 💡 Opinions           │  ← Persona profiles
│    └── 📱 Remote             │  ← Device pairing
├──────────────────────────────┤
│  SETTINGS                    │  ← FROM SUPERSET (extended)
└──────────────────────────────┘
```

### 4.3 Memory Browser Screen

**Hero feature — force-directed graph is Lunaria's signature:**

```
Layout:
┌─────────────────────────────────────────────────────┐
│  Memory Browser                          [Search 🔍] │
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│  Tier Filter │      Force-Directed Graph            │
│  ○ All       │      (canvas-based, magenta          │
│  ● L0 Hot    │       highlighted connections,        │
│  ○ L1 Warm   │       ambient node drift)             │
│  ○ L2 Cold   │                                       │
│              │                                       │
│  Stats:      │                                       │
│  248 entries │                                       │
│  12 clusters │                                       │
│              │                                       │
├──────────────┼──────────────────────────────────────┤
│              │  Search Results / Recent Entries      │
│  Quick       │  ┌─────────────────────────────────┐ │
│  Actions:    │  │ Entry: "API endpoint for..."    │ │
│  [Add]       │  │ Tier: L0 │ Score: 0.94 │ 3h ago│ │
│  [Import]    │  ├─────────────────────────────────┤ │
│  [Export]    │  │ Entry: "Database schema..."     │ │
│              │  │ Tier: L1 │ Score: 0.87 │ 2d ago│ │
│              │  └─────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────┘
```

### 4.4 Agent Orchestration Screen

```
Layout:
┌─────────────────────────────────────────────────────┐
│  Agent Management                    [+ New Agent]   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Active Sessions (3)                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │ Agent A  │→→│ Agent B  │→→│ Agent C  │            │
│  │ Claude   │  │ Codex    │  │ Gemini   │            │
│  │ Admin    │  │ ReadWrite│  │ ReadOnly │            │
│  │ ● active │  │ ● active │  │ ○ idle   │            │
│  └─────────┘  └─────────┘  └─────────┘             │
│                                                      │
│  Consensus Panel:                                    │
│  ┌──────────────────────────────────────────────┐   │
│  │  Question: "Should we refactor auth module?" │   │
│  │  Agent A (w=1.0): ✅ Yes  │ Agent B (w=0.8): ✅│  │
│  │  Agent C (w=0.5): ❌ No   │ Result: APPROVED   │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓░░░░ 78% consensus               │  │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Permission Hierarchy:                               │
│  Admin → ShellAccess → ReadWrite → ReadOnly          │
│  Current ceiling: ShellAccess                        │
└─────────────────────────────────────────────────────┘
```

### 4.5 Autopilot Screen

```
Layout:
┌─────────────────────────────────────────────────────┐
│  Autopilot                           [+ New Run]     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Phase Pipeline:                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Analyze │→│ Plan   │→│Implement│→│ Test   │→ ...  │
│  │  ✅    │ │  ✅    │ │ ● glow │ │  ○     │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                      │
│  Current Phase: Implement (Phase 2/5)                │
│  ┌──────────────────────────────────────────────┐   │
│  │  Progress: ▓▓▓▓▓▓▓▓▓░░░░░░ 62%              │   │
│  │  Files modified: 8                            │   │
│  │  Tests passing: 14/18                         │   │
│  │  Agent: Claude Opus (ShellAccess)             │   │
│  │                                               │   │
│  │  Live output stream...                        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 4.6 Marketplace Screen

```
Layout:
┌─────────────────────────────────────────────────────┐
│  Extension Marketplace              [Search] [Upload]│
├─────────────────────────────────────────────────────┤
│  Categories: [All] [Agents] [Tools] [Themes] [Data] │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 📦 .luna │ │ 📦 .luna │ │ 📦 .luna │            │
│  │ Code     │ │ Memory   │ │ Custom   │            │
│  │ Review   │ │ Exporter │ │ Agent    │            │
│  │ v1.2.0   │ │ v0.8.0   │ │ v2.0.0   │            │
│  │ ⭐ 4.8   │ │ ⭐ 4.2   │ │ ⭐ 4.9   │            │
│  │ [Install]│ │ [Install]│ │ [Manage] │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ ...more  │ │ ...cards │ │ ...here  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────┘
```

### 4.7 Other Lunaria Screens

- **Kanban Board**: Use @dnd-kit (already in Superset deps) for drag-and-drop columns/cards, link tasks to agent sessions
- **Visual Editor**: Use @xyflow/react (React Flow) for node-based workflow graphs
- **Opinions/Personas**: Settings-style page with persona cards, system prompt editor (CodeMirror from Superset), model/temperature selectors
- **Remote Access**: QR code display (qrcode.react), PIN entry, device list with revoke buttons, connection status indicators

### 4.8 StatusBar Enhancement

**Extend Superset's bottom bar with Lunaria widgets:**

```
┌─────────────────────────────────────────────────────┐
│ 🧠 248 memories │ 🤖 3 agents │ ⚡ Autopilot: P2  │ 📱 2 devices │ v1.0.0 │
└─────────────────────────────────────────────────────┘
```

### Phase 4 Deliverable

All Lunaria screens implemented with real tRPC data, integrated into Superset's routing and navigation. Memory graph visualization working. Agent management functional. Autopilot pipeline displayed. Marketplace showing installed extensions. All styled with Lunaria's magenta theme.

---

## Phase 5: Polish, Mobile & Release (Weeks 7-8)

### 5.1 Mobile App Update

**Update Expo app to connect to Electron host-service:**

```
apps/mobile/ (Expo/React Native)
├── Unchanged: navigation, screens, components
├── Updated: runtime-client → point to host-service HTTP/WebSocket
│   - Replace Tauri IPC calls with tRPC client (HTTP)
│   - WebSocket for real-time terminal streaming
│   - Remote access pairing via QR scan (expo-camera)
├── New screens:
│   ├── MemoryBrowserScreen.tsx    — Mobile memory search
│   ├── AgentStatusScreen.tsx      — Agent session monitoring
│   └── AutopilotMonitorScreen.tsx — Autopilot phase tracking
└── Design tokens: shared from packages/tokens (React Native output)
```

### 5.2 i18n Integration

**Wire packages/i18n into all new Lunaria screens:**

```
Scope: All user-facing strings in Lunaria-specific screens
- Memory: search placeholder, tier labels, stats labels
- Agents: permission levels, consensus UI, status labels
- Autopilot: phase names, progress labels
- Marketplace: categories, install/manage buttons
- Remote: pairing instructions, device status
- Opinions: persona labels, temperature descriptions
- Kanban: column headers, task actions
```

### 5.3 Visual Differentiation Checklist

**Ensuring Lunaria is unmistakably NOT a generic Superset clone:**

| Element           | Superset          | Lunaria                                   |
| ----------------- | ----------------- | ----------------------------------------- |
| Color primary     | Blue/neutral      | Magenta (300 100% 36%)                    |
| Surface tint      | Neutral gray      | Purple-tinted (270° hue)                  |
| Logo              | Superset mark     | Lunaria moon mark                         |
| Animations        | Standard          | pulse-magenta, shimmer, waveform          |
| Sidebar sections  | Workspaces only   | Workspaces + Lunaria features             |
| Default view      | Workspace list    | Memory graph + agent status               |
| Status bar        | Basic             | Memory/agent/autopilot widgets            |
| Loading states    | Standard skeleton | Shimmer with magenta gradient             |
| Active indicators | Blue dot          | Magenta glow pip                          |
| Agent badges      | Preset icons      | Magenta-accented preset icons             |
| Extension format  | N/A               | .luna with magenta badge                  |
| Terminal theme    | Superset colors   | Lunaria palette                           |
| Graph viz         | N/A               | Force-directed with magenta connections   |
| Home screen       | Project list      | Live agents + memory insights + autopilot |

### 5.4 Testing Strategy

```
Unit Tests (Vitest):
- Memory service: store, search, dedup, tier promotion
- Remote access: crypto operations, JWT rotation, device management
- Orchestration: permission ceiling, tool intersection, consensus
- Extension parser: .luna format read/write
- Autopilot: phase transitions, rollback

Integration Tests (Vitest):
- tRPC router end-to-end (memory, remote, orchestration, extensions)
- SQLite migration verification
- Host-service startup with all Lunaria services

E2E Tests (Playwright):
- Memory search and graph interaction
- Agent spawning and consensus flow
- Autopilot run lifecycle
- Extension install from .luna file
- Remote device pairing flow
- Kanban board drag-and-drop

Target: 80%+ coverage on all new Lunaria services
```

### 5.5 Build & Distribution

```
Build pipeline:
1. bun install (all workspaces)
2. turbo build (packages → desktop)
3. electron-vite build (compile renderer + main)
4. electron-builder package (DMG/NSIS/AppImage)

Distribution:
- macOS: DMG + auto-update (Lunaria update server)
- Windows: NSIS installer + auto-update
- Linux: AppImage + .deb
- Mobile: Expo EAS Build → TestFlight/Play Store
```

### 5.6 Documentation Update

```
apps/docs/ (from Superset, rebranded):
- Getting Started → Lunaria installation
- Features → All Superset features + Lunaria unique features
- Memory System → Tier architecture, search, graph viz
- Agent Orchestration → Multi-agent, permissions, consensus
- Autopilot → Phase pipeline, configuration
- Extensions → .luna format, marketplace, development guide
- Remote Access → Pairing, security, mobile app
- API Reference → tRPC router documentation
```

### Phase 5 Deliverable

Production-ready Lunaria v1.0.0 with all features functional, mobile app updated, i18n wired, tests passing at 80%+, and distribution packages building for all platforms.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        LUNARIA DESKTOP                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    RENDERER PROCESS                       │   │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │TanStack │  │ shadcn/ui│  │ Lunaria  │  │ AI SDK   │ │   │
│  │  │ Router  │  │ + AI elm │  │ Screens  │  │ React    │ │   │
│  │  └────┬────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  │       │              tRPC Client                         │   │
│  └───────┼──────────────────────────────────────────────────┘   │
│          │ IPC                                                   │
│  ┌───────┼──────────────────────────────────────────────────┐   │
│  │       ▼         MAIN PROCESS                              │   │
│  │  ┌─────────┐  ┌──────────────────────────────────────┐   │   │
│  │  │ tRPC    │  │         HOST SERVICE                  │   │   │
│  │  │ Server  │  │  ┌──────┐ ┌────────┐ ┌──────────┐   │   │   │
│  │  │         │  │  │Memory│ │Orchestr│ │ Remote   │   │   │   │
│  │  │ Superset│  │  │System│ │ation   │ │ Access   │   │   │   │
│  │  │ Routers │  │  └──────┘ └────────┘ └──────────┘   │   │   │
│  │  │    +    │  │  ┌──────┐ ┌────────┐ ┌──────────┐   │   │   │
│  │  │ Lunaria │  │  │Extens│ │Autopilot│ │Terminal  │   │   │   │
│  │  │ Routers │  │  │ions  │ │Engine  │ │ (node-pty)│   │   │   │
│  │  └─────────┘  │  └──────┘ └────────┘ └──────────┘   │   │   │
│  │               │  ┌──────┐ ┌────────┐ ┌──────────┐   │   │   │
│  │  ┌─────────┐  │  │ Git  │ │ Chat   │ │Workspace │   │   │   │
│  │  │local-db │  │  │ Ops  │ │(Mastra)│ │   FS     │   │   │   │
│  │  │(SQLite) │  │  └──────┘ └────────┘ └──────────┘   │   │   │
│  │  │ Drizzle │  └──────────────────────────────────────┘   │   │
│  │  └─────────┘                                              │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────┐  ┌──────────────────────────────────┐  │
│  │  MOBILE APP (Expo)  │  │  AI WORKERS (child processes)    │  │
│  │  HTTP/WS → host-svc │  │  bridge.ts → Claude/Codex/etc   │  │
│  └─────────────────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Risk Assessment

| Risk                                 | Probability | Impact   | Mitigation                                                  |
| ------------------------------------ | ----------- | -------- | ----------------------------------------------------------- |
| Elastic-2.0 license compliance       | Medium      | Critical | Legal review before fork; never offer as managed service    |
| Superset API breaking changes        | Medium      | High     | Pin specific commit/tag; track upstream selectively         |
| FTS5 tokenizer compatibility         | Low         | Medium   | Test with Superset's better-sqlite3 build early (Phase 2)   |
| node-pty native compilation          | Low         | Medium   | electron-rebuild, same as Superset already does             |
| libsodium WASM load time             | Low         | Low      | Lazy-load on first remote access use                        |
| Memory graph performance (>1K nodes) | Medium      | Medium   | Canvas-based rendering, spatial indexing, culling           |
| Mobile app auth with host-service    | Medium      | Medium   | Reuse Superset's auth patterns, add mDNS discovery          |
| Upstream merge conflicts             | High        | Medium   | Selective cherry-picking, not continuous rebase             |
| Extension sandbox security           | Medium      | High     | Process isolation, capability-based permissions             |
| Build size increase                  | Medium      | Low      | Tree-shake unused Superset code, lazy-load Lunaria features |

---

## Success Criteria

1. **Functional parity**: All Superset desktop features work under Lunaria branding
2. **Unique features**: All 10 Lunaria-specific features (Memory, Remote, Agents, Autopilot, Marketplace, Kanban, Visual Editor, Opinions, Mobile, i18n) are functional
3. **Visual identity**: No one looking at Lunaria would mistake it for Superset — magenta theme, unique screens, custom animations
4. **Test coverage**: 80%+ on all new Lunaria services
5. **Build success**: DMG, NSIS, AppImage all build and install cleanly
6. **Mobile**: Expo app connects to desktop host-service for remote operations
7. **Performance**: App startup < 3s, memory graph renders 500+ nodes at 60fps
8. **No cloud dependency**: Runs entirely offline with all features functional

---

## Effort Estimation by Phase

| Phase                   | Duration    | Complexity | Primary Work                                         |
| ----------------------- | ----------- | ---------- | ---------------------------------------------------- |
| 1: Fork & Rebrand       | 1 week      | Medium     | Branding, theme, cloud removal                       |
| 2: Monorepo Restructure | 1 week      | High       | Schema merge, router extension, UI merge             |
| 3: Core Services Port   | 3 weeks     | Very High  | Memory, Remote, Orchestration, Extensions, Autopilot |
| 4: UI Integration       | 2 weeks     | High       | 8 new screens, navigation, graph viz                 |
| 5: Polish & Release     | 1 week      | Medium     | Mobile, i18n, testing, distribution                  |
| **Total**               | **8 weeks** |            |                                                      |

---

## What Makes Lunaria Unique (Not a Clone)

1. **Memory-First AI**: No other tool has tiered memory with force-directed graph visualization as a core feature
2. **Agent Orchestration with Consensus**: Multi-agent spawning with permission hierarchies and weighted voting — beyond simple "run multiple terminals"
3. **Autopilot Pipeline**: 6-phase autonomous execution with visual phase progression
4. **Extension Ecosystem**: .luna binary format with sandboxed execution — a real platform, not just an app
5. **Remote Access**: Secure device pairing with E2E encryption for mobile monitoring
6. **Opinions/Personas**: Configurable AI behavior profiles that shape interactions
7. **Mobile Companion**: Expo app for on-the-go monitoring and remote control
8. **Visual Workflow Editor**: Node-based graph for designing agent workflows
9. **Magenta Identity**: Purple-tinted surfaces, magenta accents, custom animations — visually unmistakable
10. **Local-First with Power**: All of Superset's terminal/workspace power without cloud dependency
