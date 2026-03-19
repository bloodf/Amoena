# Phase 2: Monorepo Restructure & Package Integration — Agent Prompt

## Mission

Integrate Lunaria's unique packages into the Superset-forked monorepo. Extend the database schema, define tRPC routers, and merge UI components. The app should build with all package placeholders in place.

**Duration:** 1 week
**Prerequisite:** Phase 1 complete (fork is rebranded, builds, no cloud deps)
**Deliverable:** Restructured monorepo that builds with Lunaria DB migrations, tRPC router stubs, and UI component placeholders

## Context

The fork from Phase 1 is a working Lunaria-branded Electron app with Superset's desktop functionality. Now we add Lunaria's unique infrastructure.

### Architecture Decisions (from eng review)

- Single SQLite database — Lunaria tables as migrations 0037-0043 in packages/local-db
- tRPC namespace split — all Lunaria routers under `trpc.lunaria.*`
- Separate lunaria-service daemon process (Memory, Remote, Orchestration, Extensions, Autopilot, Kanban, Opinions)
- Kanban service owns tasks, exposes API for agent claim/update (atomic SQL: UPDATE WHERE claimed_by IS NULL)
- Cross-daemon communication via WebSocket subscription

### Existing Database Schema Reference

The existing Superset local-db has these tables (your new migrations extend this schema):

- `projects` — git repos opened in the app (mainRepoPath, color, defaultBranch)
- `worktrees` — git worktrees within projects (path, branch, gitStatus JSON)
- `workspaces` — active workspaces (type, portBase, sectionId, isUnread)
- `workspace_sections` — organizational groups within a project
- `settings` — singleton settings row (JSON fields for presets, hotkeys, etc.)

Your new Lunaria migrations (0037-0043) add tables that reference `workspaces(id)` via foreign keys.
The `workspace_id` column in memory_entries, kanban_boards, and autopilot_runs uses this FK.

## Execution Rules

1. **Commit after every completed step** — never batch multiple steps into one commit
2. **Use conventional commits**: `feat(lunaria): <step description>`
3. **Run `bun run build` before each commit** — never commit broken code
4. **If a step fails, fix it before moving on** — don't skip and come back later
5. **Read files before editing them** — use the Read tool to understand existing code before making changes

## Step-by-Step Instructions

### 2.1 Add Lunaria Packages

Copy from the original Lunaria repo into the fork:

- `packages/i18n/` — Internationalization (5 languages)
- `packages/tokens/` — Cross-platform design tokens

### 2.2 Database Schema

Add 7 new Drizzle migrations to `packages/local-db/drizzle/`:

- 0037: memory_entries table + memory_fts FTS5 virtual table
- 0038: extensions table
- 0039: remote_devices table
- 0040: agent_sessions table
- 0041: opinions table
- 0042: kanban_boards + kanban_tasks tables
- 0043: autopilot_runs table

Add corresponding Drizzle schema types in `packages/local-db/src/schema/`:

- lunaria.ts — all Lunaria table definitions
- Update index.ts to export Lunaria schemas
- Update relations.ts with foreign key relationships

### 2.3 Create lunaria-service Scaffold

The lunaria-service runs as a Hono HTTP server on a dynamic port. The desktop main process
spawns it as a child process (similar to how Superset spawns host-service).

package.json for @lunaria/lunaria-service:

```json
{
  "name": "@lunaria/lunaria-service",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.ts",
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.14.0",
    "better-sqlite3": "^12.0.0",
    "drizzle-orm": "^0.40.0"
  }
}
```

Create `packages/lunaria-service/` as a new package:

```
packages/lunaria-service/
├── package.json         — @lunaria/lunaria-service
├── tsconfig.json
├── src/
│   ├── index.ts         — Service entry point (Hono HTTP server)
│   ├── memory/          — Memory service (stub)
│   ├── orchestration/   — Agent orchestration (stub)
│   ├── remote-access/   — Remote access (stub)
│   ├── extensions/      — Extension system (stub)
│   ├── autopilot/       — Autopilot engine (stub)
│   ├── kanban/          — Kanban/task service (stub)
│   ├── opinions/        — Opinions/personas (stub)
│   ├── cli-integration/ — CLI output parser (stub)
│   ├── replay/          — Session replay (stub)
│   └── diagnostics/     — Health/diagnostics (stub)
```

Each stub exports a service class with empty methods matching the tRPC router endpoints.

### 2.4 tRPC Router Extension

In `apps/desktop/src/lib/trpc/routers/`, create a `lunaria/` namespace directory:

```
routers/lunaria/
├── index.ts          — lunaria sub-router aggregating all below
├── memory.ts         — Memory CRUD, search, graph data (stub procedures)
├── remote-access.ts  — Device pairing, relay, auth (stub)
├── orchestration.ts  — Agent spawning, consensus (stub)
├── extensions.ts     — .luna install, lifecycle (stub)
├── kanban.ts         — Board/task CRUD, agent claim API (stub)
├── autopilot.ts      — Phase management, execution (stub)
├── opinions.ts       — Persona CRUD, activation (stub)
├── visual-editor.ts  — Graph/workflow state (stub)
├── replay.ts         — Session recording/replay (stub)
├── diagnostics.ts    — Service health (stub)
├── cli-integration.ts — CLI parser config (stub)
└── workflow-templates.ts — Autopilot templates (stub)
```

Wire into main router as `lunaria: lunariaRouter`.

### 2.5 UI Components Directory

Create `packages/ui/src/components/lunaria/` with placeholder files for all Lunaria composites:

- MemoryGraphView.tsx, MemoryBrowser.tsx
- AgentManagement.tsx, AgentConsensusView.tsx
- AutopilotPipeline.tsx, AutopilotPhaseCard.tsx
- MarketplaceGrid.tsx, ExtensionCard.tsx
- KanbanBoard.tsx, KanbanColumn.tsx, KanbanTaskCard.tsx
- RemoteAccessPanel.tsx, DeviceList.tsx
- VisualEditorCanvas.tsx
- OpinionSelector.tsx
- SessionReplayView.tsx, ReplayTimeline.tsx
- DiagnosticsPanel.tsx
- WorkflowTemplateSelector.tsx

Each exports a placeholder component that renders its name.

### 2.6 Route Placeholders

Add TanStack Router route files for all Lunaria screens:

```
apps/desktop/src/renderer/routes/_authenticated/
├── memory/index.tsx
├── agents/index.tsx
├── autopilot/index.tsx
├── marketplace/index.tsx
├── kanban/index.tsx
├── remote/index.tsx
├── visual-editor/index.tsx
├── opinions/index.tsx
├── replay/index.tsx
├── diagnostics/index.tsx
```

Each renders the placeholder UI component.

### 2.7 Sidebar Navigation

Extend DashboardSidebar to include Lunaria navigation section with links to all new routes.

## Troubleshooting

### Build Failures

- Run `bunx tsc --noEmit` to find TypeScript errors
- Check for imports from deleted/moved packages
- Run `bun install` to refresh dependencies

### Test Failures

- Isolate: `bun test <specific-file>`
- Read error output carefully — most failures are import/type mismatches
- Fix implementation, not tests (unless tests are wrong)

### Commit Safety

- Commit after EVERY completed step (not at the end)
- Use conventional commits: `feat(lunaria): <description>`
- Run `bun run build` before committing to avoid broken commits
- If build breaks, fix before committing — never commit broken code

## Acceptance Criteria

- [ ] packages/i18n and packages/tokens integrated
- [ ] packages/lunaria-service scaffold created with all service stubs
- [ ] 7 new DB migrations run successfully
- [ ] Drizzle schema types generated
- [ ] tRPC lunaria namespace wired with all stub routers
- [ ] UI component placeholders exist and render
- [ ] Route placeholders navigate correctly
- [ ] Sidebar shows Lunaria navigation section
- [ ] Full monorepo builds with `bun run build`
- [ ] No TypeScript errors
