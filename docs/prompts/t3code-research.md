# t3code Architecture Research

**Source**: https://github.com/pingdotgg/t3code  
**Fetched**: 2026-03-24  
**Stars**: 7,236 | **Forks**: 1,040 | **License**: MIT  
**Homepage**: https://t3.codes  
**Version**: 0.0.13 (very early WIP, not accepting contributions yet)

---

## Correction: t3code is NOT a TUI

Despite being described as a "TUI-based coding agent" in the research prompt, t3code is a **web GUI** (React/Vite SPA) plus optional **Electron desktop app** that wraps terminal coding agents (Codex CLI, Claude Agent SDK). It is the _opposite_ of a TUI — it provides a visual GUI _over_ CLI agents.

---

## Tech Stack

| Layer          | Technology                                                                   |
| -------------- | ---------------------------------------------------------------------------- |
| Monorepo       | Turborepo + Bun workspaces                                                   |
| Runtime        | Bun 1.3.9 / Node 24+                                                         |
| Language       | TypeScript 5.7 (strict ESM)                                                  |
| Server         | Node.js WebSocket server (Effect-TS, `ws`)                                   |
| Web UI         | React 19, Vite 8, TanStack Router, TanStack Query, Zustand, Tailwind v4      |
| Desktop        | Electron (wraps web app, spawns server as child process)                     |
| Effects/DI     | Effect-TS (effect-smol fork) — functional effect system for all server logic |
| DB             | SQLite via `@effect/sql-sqlite-bun`                                          |
| Terminal embed | xterm.js (`@xterm/xterm`)                                                    |
| Diff rendering | `@pierre/diffs`                                                              |
| Code editor    | Lexical (`@lexical/react`)                                                   |
| Testing        | Vitest, Playwright (browser tests)                                           |
| Linting/Fmt    | oxlint, oxfmt                                                                |
| AI providers   | OpenAI Codex CLI (JSON-RPC over stdio), Anthropic Claude Agent SDK           |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Desktop App (Electron)                                         │
│  apps/desktop/src/main.ts                                       │
│                                                                 │
│  • Spawns `apps/server` as a child process (backendProcess)     │
│  • Hosts BrowserWindow pointing at the web app                  │
│  • IPC channels for: pick-folder, confirm, theme, context-menu, │
│    open-external, menu-action, auto-update                      │
│  • Auto-updater (electron-updater), rotating log files          │
│  • syncShellEnvironment() — syncs user shell $PATH into Electron│
└──────────────────────────┬──────────────────────────────────────┘
                           │ spawns
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Server (Node.js / Bun)    apps/server/src/                     │
│                                                                 │
│  index.ts → Effect CLI → RuntimeLayer                           │
│                                                                 │
│  ┌─────────────────┐   ┌──────────────────────────────────┐    │
│  │  HTTP Server    │   │  WebSocket Server (wsServer.ts)  │    │
│  │  (static SPA)   │   │                                  │    │
│  └─────────────────┘   │  WS_METHODS (RPC):               │    │
│                         │    projects.*, git.*, terminal.* │    │
│                         │    shell.*, server.*             │    │
│                         │                                  │    │
│                         │  ORCHESTRATION_WS_METHODS:       │    │
│                         │    orchestration.getSnapshot     │    │
│                         │    orchestration.dispatchCommand │    │
│                         │    orchestration.getTurnDiff     │    │
│                         │    orchestration.replayEvents    │    │
│                         │                                  │    │
│                         │  WS PUSH channel:                │    │
│                         │    orchestration.domainEvent     │    │
│                         └──────────────────────────────────┘    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  OrchestrationEngine  (CQRS / Event-Sourced)            │   │
│  │                                                          │   │
│  │  Commands → dispatch() → serialized queue → Events       │   │
│  │  Events   → projector.ts → OrchestrationReadModel        │   │
│  │  ReadModel → getSnapshot RPC / push to all WS clients    │   │
│  │                                                          │   │
│  │  OrchestrationReactor → reacts to events, drives         │   │
│  │    ProviderCommandReactor, CheckpointReactor             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Provider Layer                                          │   │
│  │                                                          │   │
│  │  ProviderAdapterRegistry                                 │   │
│  │    ├── CodexAdapter  (JSON-RPC over stdio → codex CLI)   │   │
│  │    └── ClaudeAdapter (@anthropic-ai/claude-agent-sdk)    │   │
│  │                                                          │   │
│  │  ProviderService — routes startSession/sendTurn/         │   │
│  │    interruptTurn/respondToRequest/rollbackThread         │   │
│  │    to the correct adapter by ProviderKind                │   │
│  │                                                          │   │
│  │  ProviderRuntimeIngestion — ingests ProviderRuntimeEvent │   │
│  │    streams and converts to OrchestrationEvents           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Other Services                                          │   │
│  │  • TerminalManager   — node-pty PTY sessions             │   │
│  │  • GitManager        — git operations (worktrees, PR)    │   │
│  │  • CheckpointReactor — git-based checkpointing           │   │
│  │  • SQLite persistence (event store, sessions)            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Agent Processes (children of server):                          │
│  ┌─────────────────────┐  ┌──────────────────────────────────┐  │
│  │ codex app-server    │  │ claude-agent-sdk process         │  │
│  │ (JSON-RPC/stdio)    │  │ (@anthropic-ai/claude-agent-sdk) │  │
│  └─────────────────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           │ WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Web App  apps/web/src/                                         │
│                                                                 │
│  React 19 + Vite + TanStack Router + Zustand                    │
│                                                                 │
│  wsTransport.ts → wsNativeApi.ts → nativeApi.ts                 │
│    (WebSocket client wrapping all RPC calls)                    │
│                                                                 │
│  store.ts (Zustand) — orchestration read model, UI state        │
│  terminalStateStore.ts — xterm.js terminal state               │
│  threadSelectionStore.ts — active thread selection              │
│  composerDraftStore.ts — message composer state                 │
│                                                                 │
│  Key features:                                                  │
│  • Session/thread management UI                                 │
│  • Streaming message rendering (buffered + streaming modes)     │
│  • Approval UI (accept / acceptForSession / decline / cancel)   │
│  • Diff viewer (@pierre/diffs)                                  │
│  • Embedded terminal (xterm.js)                                 │
│  • Checkpoint revert UI                                         │
│  • Git worktree management                                      │
│  • Proposed plan UI (plan mode)                                 │
│  • Drag-and-drop attachments (@dnd-kit)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Patterns Worth Adopting

### 1. CQRS + Event Sourcing for Agent Orchestration

The `OrchestrationEngine` uses a strict command → event → read-model pipeline:

- All mutations go through typed `OrchestrationCommand` dispatch
- Commands are serialized through an internal queue and deduplicated via receipt IDs
- Persisted `OrchestrationEvent` stream is the source of truth
- `projector.ts` folds events into `OrchestrationReadModel` (pure function, immutable updates)
- Read model is pushed to all WebSocket clients on every change

This makes the system auditable, replayable, and safe under concurrent agent activity.

### 2. Provider Adapter Pattern with Typed Interface

`ProviderAdapterShape<TError>` defines a complete, provider-agnostic interface:

- `startSession`, `sendTurn`, `interruptTurn`, `respondToRequest`, `respondToUserInput`
- `stopSession`, `listSessions`, `readThread`, `rollbackThread`, `stopAll`
- `streamEvents: Stream<ProviderRuntimeEvent>` — canonical event stream

Both `CodexAdapter` (JSON-RPC/stdio) and `ClaudeAdapter` (SDK) implement this interface. Adding a new agent is purely additive.

### 3. Schema-First Contracts Package

`packages/contracts` contains Effect Schema definitions for:

- All WebSocket RPC method names and request/response shapes
- All orchestration events, commands, and read-model types
- Provider kinds, approval policies, sandbox modes, runtime modes
- Terminal, git, keybinding event types

The contracts package is **schema-only — no runtime logic**. Both server and web import from it, ensuring wire protocol and domain types are always in sync.

### 4. Codex App Server Integration (JSON-RPC over stdio)

For Codex, the server spawns `codex app-server` per provider session and communicates over JSON-RPC via stdin/stdout. Key details from `codexAppServerManager.ts`:

- Each session is a `ChildProcessWithoutNullStreams` with a readline interface
- Pending requests tracked in a `Map<PendingRequestKey, PendingRequest>` with timeouts
- Approval requests tracked separately in `pendingApprovals` and `pendingUserInputs` maps
- `nextRequestId` counter per session

### 5. Effect-TS for Server-Side Dependency Injection

All server services use `ServiceMap.Service` from Effect for DI:

```ts
export class ClaudeAdapter extends ServiceMap.Service<ClaudeAdapter, ClaudeAdapterShape>()(
  't3/provider/Services/ClaudeAdapter',
) {}
```

The runtime layer is composed in `index.ts` via `Layer.provideMerge` chains. This makes testing straightforward (swap layers) and eliminates class-based DI boilerplate.

### 6. Desktop = Electron Shell Spawning a Node Server

The desktop app (`apps/desktop`) is a thin Electron wrapper:

- `main.ts` spawns the server binary as a child process with `backendProcess`
- Communicates via IPC channels for native OS concerns (folder picker, confirm dialog, theme, context menu, auto-update)
- The BrowserWindow points to the local server's HTTP endpoint
- `syncShellEnvironment()` copies the user's shell `$PATH` into Electron's environment (critical for finding agent CLIs)

### 7. Approval / Permission System

`ProviderApprovalDecision` has four values: `accept | acceptForSession | decline | cancel`
`ProviderApprovalPolicy` has four levels: `untrusted | on-failure | on-request | never`
`ProviderSandboxMode`: `read-only | workspace-write | danger-full-access`

These map to interactive approval requests that the UI must handle before the agent can continue.

### 8. Git Worktree-Based Checkpointing

The `CheckpointReactor` uses git worktrees as checkpoint snapshots, enabling:

- Per-turn revert (`rollbackThread`)
- Diff rendering between checkpoints
- The `OrchestrationThread` read model carries `OrchestrationCheckpointSummary[]`
- Max 500 checkpoints per thread, max 2,000 messages per thread

### 9. xterm.js Embedded Terminal

Rather than building their own terminal component, t3code embeds xterm.js directly in the React app, with `node-pty` on the server side providing PTY sessions over WebSocket. This gives users a real interactive terminal within the agent GUI.

---

## The TUI↔GUI Bridge (What t3code Actually Solves)

t3code's insight: CLI coding agents are powerful but have poor UX for:

- Multi-session management (parallel agents)
- Approval flows (CLI is blocking; GUI can be non-blocking)
- Diff/checkpoint review
- Progress visualization across threads

The bridge is the **WebSocket protocol**: agent CLI output → server ingestion → orchestration events → WebSocket push → React UI. The terminal is still available (xterm.js) but agent interaction is mediated through structured events.

---

## Community Discussion: TUI as Transitional Phase

GitHub Issue #511 captures an important design question the t3code team is grappling with:

> "The current wave of agent-first TUI experiences is probably a transitional phase, not the final form. What I want most is: understanding what the agent is doing, why it is doing it, seeing progress across multiple tasks, reviewing results at the right level of abstraction before drilling down into code."

The issue frames two possible directions:

- **A**: Polished GUI wrapper around agent CLIs (better threading, remote access, approvals, diffs, session management)
- **B**: New primary surface for agent work (multi-agent parallel work as first-class UI concept, plan/rationale/progress surfaces, checkpoints/review/revert as core interactions)

t3code is currently executing direction A while designing toward B.

---

## What Lunaria (Electron + Next.js) Could Learn

Lunaria is already an Electron + web app for multi-agent orchestration, which means t3code and Lunaria share the same fundamental architecture. The key lessons:

| t3code Pattern                                     | Lunaria Application                                                                                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| CQRS/Event-Sourced orchestration engine            | Apply to Lunaria's mission-control run/agent tracking — commands in, events out, read model projected                                          |
| `packages/contracts` schema-only package           | Lunaria likely already has contracts — ensure they are schema-only with no runtime logic                                                       |
| `ProviderAdapterShape` typed interface             | Lunaria's agent adapters (Claude Code, Codex, etc.) should implement a uniform interface covering session, turn, interrupt, approval, rollback |
| Approval policy system (4 levels, 4 sandbox modes) | Lunaria's permission UX should offer the same granularity — not just on/off                                                                    |
| Git worktree checkpointing per agent turn          | Lunaria could adopt checkpoint-per-turn with revert capability                                                                                 |
| `syncShellEnvironment()` in Electron main          | Critical: Lunaria must sync shell $PATH so agent CLIs are discoverable                                                                         |
| xterm.js embedded terminal over PTY/WebSocket      | Add embedded terminal to Lunaria's agent sessions                                                                                              |
| `backendProcess` pattern (Electron spawns server)  | Lunaria may already do this — verify child process lifecycle (restart on crash, port negotiation)                                              |
| Effect-TS DI via ServiceMap.Service                | Applicable if Lunaria adopts Effect; otherwise use equivalent layered DI                                                                       |
| Command deduplication via receipt IDs              | Prevent duplicate agent actions when network is unreliable                                                                                     |

---

## Sources

- [t3code GitHub repo](https://github.com/pingdotgg/t3code)
- [t3code documentation](https://pingdotgg-t3code.mintlify.app/introduction)
- [Issue #511: What should the best UI for coding agents optimize for after the TUI phase?](https://github.com/pingdotgg/t3code/issues/511)
- [Codex App Server docs](https://developers.openai.com/codex/sdk/#app-server)
- [CodexMonitor reference implementation (Tauri)](https://github.com/Dimillian/CodexMonitor)
