# Amoena Multi-Fork Integration Progress

## Status: PHASE 6 (POLISH) IN PROGRESS

**Architecture:** Multi-fork integration of 3 open-source projects
**Plan reviewed:** 2026-03-22 (CEO: CLEAR, Eng: CLEAR, Design: CLEAR)
**Total features:** 33 (from Superset + Mission Control + claude-mem + Amoena originals)
**CEO plan:** `~/.gstack/projects/AmoenaAi-amoena/ceo-plans/2026-03-22-multi-fork-integration.md`

### Source Projects

| Project | Stars | What we took | Package |
| --- | --- | --- | --- |
| superset-sh/superset | 7.7K | Electron shell, terminal host, workspace-fs | @lunaria/desktop, @lunaria/terminal-host |
| builderz-labs/mission-control | 3K | Next.js dashboard (40+ panels, 60+ API routes) | @lunaria/dashboard |
| thedotmack/claude-mem | 39K | Memory engine (SQLite FTS5, vector search) | @lunaria/memory |

### Phase Progress

| Phase | Status | Completed | Commit | Notes |
| --- | --- | --- | --- | --- |
| 1: Fork & Foundation | COMPLETE | 2026-03-22 | 3b8af84 | 3 forks extracted, Electron + Next.js wired, bun install clean, dashboard boots in ~1s |
| 2: Rebrand & UI Unification | COMPLETE | 2026-03-22 | 3b8af84 | Zero upstream branding, @lunaria/ui wired, Biome auto-fixes applied |
| 3: Terminal Integration | COMPLETE | 2026-03-22 | 5511089 | Terminal-host service, xterm.js panel, spawn/list/kill API routes |
| 4: Memory System | COMPLETE | 2026-03-22 | 71d2524 | Memory service on :37777, search/timeline/observations API routes |
| 5a: Core Features | COMPLETE | 2026-03-22 | b2964cc | Orchestration, consensus, autopilot, extensions, opinions |
| 5b: Feature Implementation | COMPLETE | 2026-03-22 | b2964cc | 6 recipes, cost advisor, eval/security panels verified |
| 6: Polish & Release | IN PROGRESS | — | — | Tests, CI/CD, packaging, documentation |

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

| Package | Type | Files | Source |
| --- | --- | --- | --- |
| @lunaria/dashboard | app | 431 | Mission Control |
| @lunaria/desktop | app | 355 | Superset |
| @lunaria/mobile | app | — | Amoena (preserved) |
| @lunaria/ui | package | 598 | Amoena (preserved) |
| @lunaria/memory | package | 154 | claude-mem |
| @lunaria/terminal-host | package | 78 | Superset |
| @lunaria/workspace-fs | package | 21 | Superset |
| @lunaria/amoena-service | package | 9 | New (Amoena) |
| @lunaria/tokens | package | — | Amoena (preserved) |
| @lunaria/i18n | package | — | Amoena (preserved) |
| + 7 stub packages | stubs | — | Pending Phase 6 |

## Test Results

| Suite | Status | Count | Last Run |
| --- | --- | --- | --- |
| MC unit tests (ported) | PENDING | 282 | — |
| MC E2E tests (ported) | PENDING | 295 | — |
| amoena-service unit | IN PROGRESS | ~25 | 2026-03-22 |
| @lunaria/ui unit | PASS | ~50 | 2026-03-20 |

## Build Status

| Target | Status | Last Build |
| --- | --- | --- |
| bun install | PASS | 2026-03-22 |
| Next.js dashboard dev | PASS (~1s) | 2026-03-22 |
| Electron packaging | PENDING | — |
| Mobile (Expo) | PASS | 2026-03-20 |
