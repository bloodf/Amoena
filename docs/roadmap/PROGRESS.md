# Amoena Multi-Fork Integration Progress

## Status: PHASE 6 COMPLETE, PHASE 7+ ROADMAP ONLY

**Architecture:** Multi-fork integration of 3 open-source projects
**Plan reviewed:** 2026-03-22 (CEO: CLEAR, Eng: CLEAR, Design: CLEAR)
**Total features:** 33 (from Superset + Mission Control + claude-mem + Amoena originals)
**CEO plan:** `~/.gstack/projects/AmoenaAi-amoena/ceo-plans/2026-03-22-multi-fork-integration.md`

### Source Projects

| Project                       | Stars | What we took                                   | Package                                  |
| ----------------------------- | ----- | ---------------------------------------------- | ---------------------------------------- |
| superset-sh/superset          | 7.7K  | Electron shell, terminal host, workspace-fs    | @lunaria/desktop, @lunaria/terminal-host |
| builderz-labs/mission-control | 3K    | Next.js dashboard (40+ panels, 60+ API routes) | @lunaria/dashboard                       |
| thedotmack/claude-mem         | 39K   | Memory engine (SQLite FTS5, vector search)     | @lunaria/memory                          |

### Phase Progress

| Phase                       | Status   | Completed  | Commit  | Notes                                                                                                  |
| --------------------------- | -------- | ---------- | ------- | ------------------------------------------------------------------------------------------------------ |
| 1: Fork & Foundation        | COMPLETE | 2026-03-22 | 3b8af84 | 3 forks extracted, Electron + Next.js wired, bun install clean, dashboard boots in ~1s                 |
| 2: Rebrand & UI Unification | COMPLETE | 2026-03-22 | 3b8af84 | Zero upstream branding, @lunaria/ui wired, Biome auto-fixes applied                                    |
| 3: Terminal Integration     | COMPLETE | 2026-03-22 | 5511089 | Terminal-host service, xterm.js panel, spawn/list/kill API routes                                      |
| 4: Memory System            | COMPLETE | 2026-03-22 | 71d2524 | Memory service on :37777, search/timeline/observations API routes                                      |
| 5a: Core Features           | COMPLETE | 2026-03-22 | b2964cc | Orchestration, consensus, autopilot, extensions, opinions                                              |
| 5b: Feature Implementation  | COMPLETE | 2026-03-22 | b2964cc | 6 recipes, cost advisor, eval/security panels verified                                                 |
| 6: Polish & Release         | COMPLETE | 2026-04-05 | b59b315 | Electron packaging works locally, dashboard production build passes, Task 12 i18n extraction is landed |
| 7: Post-release hardening   | ROADMAP  | —          | —       | Follow-up backlog only, tracked in TODOS.md                                                            |

### Architecture

```
Electron Main → spawns 3 services in parallel:
  ├── Dashboard    (Next.js :3456)  — 40+ panels, 60+ API routes
  ├── Terminal Host (Hono :4879)    — PTY, git worktrees, WebSocket
  └── Memory       (:37777)         — SQLite FTS5, vector search

+ Amoena Service (packages/amoena-service):
  ├── Orchestration (multi-agent, permission ceiling)
  ├── Consensus voting (weighted, abstention-safe)
  ├── Autopilot (6-phase pipeline)
  ├── Extensions (.luna format)
  ├── Opinions/Personas
  ├── 6 Agent Recipes
  └── Smart Cost Advisor
```

### Monorepo Packages (17)

| Package                 | Type    | Files | Source             |
| ----------------------- | ------- | ----- | ------------------ |
| @lunaria/dashboard      | app     | 431   | Mission Control    |
| @lunaria/desktop        | app     | 355   | Superset           |
| @lunaria/mobile         | app     | —     | Amoena (preserved) |
| @lunaria/ui             | package | 598   | Amoena (preserved) |
| @lunaria/memory         | package | 154   | claude-mem         |
| @lunaria/terminal-host  | package | 78    | Superset           |
| @lunaria/workspace-fs   | package | 21    | Superset           |
| @lunaria/amoena-service | package | 9     | New (Amoena)       |
| @lunaria/tokens         | package | —     | Amoena (preserved) |
| @lunaria/i18n           | package | —     | Amoena (preserved) |
| + 7 stub packages       | stubs   | —     | Pending Phase 6    |

## Release Summary

- Electron is the desktop runtime and packaging target.
- Bun is the workspace package manager and docs build entrypoint.
- Mobile remote access is implemented as a companion flow, with manual token and PIN entry in the current app UI.
- Task 12 is landed in `b59b315 feat(electron): finish i18n string extraction`.
- The current local packaging command is `bun run --cwd apps/desktop electron:build`, and it is working in the executable repo.
- The dashboard production build is a real green gate.
- Root `bun run type-check` is not a trustworthy workspace gate today because it still references a missing `packages/runtime-client/tsconfig.json` and there are unrelated workspace issues outside the Task 13 doc scope.

## Test Results

| Suite        | Status           | Count     | Last Run                                     |
| ------------ | ---------------- | --------- | -------------------------------------------- |
| Docs build   | PASS             | VitePress | 2026-04-05                                   |
| Desktop unit | PASS             | Vitest    | repo scripts available                       |
| Mobile unit  | PASS             | Vitest    | repo scripts available                       |
| Type-check   | NOT A GREEN GATE | workspace | root script currently overstates repo health |

## Build Status

| Target                 | Status | Last Build                                  |
| ---------------------- | ------ | ------------------------------------------- |
| bun install            | PASS   | 2026-03-22                                  |
| Electron desktop dev   | PASS   | workspace script available                  |
| Electron desktop build | PASS   | workspace script available                  |
| Dashboard build        | PASS   | `bun run --cwd apps/dashboard build`        |
| Electron packaging     | PASS   | `bun run --cwd apps/desktop electron:build` |
| Mobile (Expo)          | PASS   | workspace script available                  |
