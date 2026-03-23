# Lunaria

The AI Agent Operating System. Run, monitor, remember, orchestrate, evaluate, and evolve AI coding agents — all from one desktop app.

## What is Lunaria?

Lunaria is a desktop IDE that orchestrates AI coding agents (Claude, Codex, Gemini, and more) with persistent memory, real-time evaluation, and an extension ecosystem. Each agent runs in an isolated git worktree so they never interfere with each other.

Built by merging three battle-tested open-source projects:
- **[Mission Control](https://github.com/builderz-labs/mission-control)** — 40+ dashboard panels, agent orchestration
- **[Superset](https://github.com/superset-sh/superset)** — Electron shell, terminal management, git worktrees
- **[claude-mem](https://github.com/thedotmack/claude-mem)** — Persistent memory with FTS5 + vector search

## Features

**Agent Management**
- Run 10+ agents simultaneously in isolated git worktrees
- Agent presets for Claude, Codex, Gemini, and any CLI agent
- Real-time terminal monitoring with xterm.js WebGL
- Weighted consensus voting for multi-agent decisions

**Persistent Memory**
- SQLite FTS5 full-text search + vector embeddings
- Progressive disclosure (10x token savings)
- Memory graph visualization
- Automatic session compression

**Orchestration**
- 6-phase autopilot pipeline (analyze, plan, implement, test, review, merge)
- 6 built-in agent recipes (PR review, bug fix, feature, refactor, tests, docs)
- Smart cost advisor with model routing suggestions
- .luna extension format + marketplace

**Dashboard**
- 44 panels: agents, tasks, cost tracking, security audit, eval framework
- Memory Spotlight (Cmd+K global search)
- Session replay with timeline scrubbing
- Agent personality studio (SOUL editor)

**Security & Observability**
- Security posture scoring (0-100) with secret detection
- 4-layer eval framework (output, trace, component, drift)
- Cost tracking per model with trend analysis
- Secret scrubber in memory pipeline

## Quick Start

```bash
# Prerequisites: Node.js 22+, Bun 1.1+, Git

# Clone and install
git clone https://github.com/YOUR_ORG/lunaria.git
cd lunaria
bun install

# Start the dashboard
bun run dashboard:dev

# Open http://localhost:3456
```

## Architecture

```
Electron Main
  ├── Dashboard (Next.js :3456) — 44 panels, 147 API routes
  ├── Terminal Host (Hono :4879) — PTY, git worktrees, WebSocket
  └── Memory Service (:37777) — SQLite FTS5, vector search
```

### Monorepo Structure

```
lunaria/
├── apps/
│   ├── dashboard/      Next.js 16 dashboard (from Mission Control)
│   ├── desktop/        Electron shell (from Superset)
│   └── mobile/         Expo/React Native companion
├── packages/
│   ├── ui/             Component library (70+ primitives, 29 components)
│   ├── memory/         Memory engine (from claude-mem)
│   ├── terminal-host/  Terminal daemon (from Superset)
│   ├── lunaria-service/  Orchestration, autopilot, extensions, recipes
│   ├── tokens/         Design tokens
│   ├── i18n/           Internationalization (10 languages)
│   └── ...             14 more packages
├── scripts/            Smoke tests, utilities
└── docs/               145-page VitePress documentation
```

## Development

```bash
# Dashboard dev server
bun run dashboard:dev

# Run tests (1,020 total)
cd packages/lunaria-service && bunx vitest run  # 125 tests
cd apps/dashboard && bunx vitest run            # 895 tests

# Electron build
cd apps/desktop && npx electron-vite build

# Production dashboard build
cd apps/dashboard && bunx next build

# Smoke test (requires dashboard running on :3456)
LUNARIA_LOCAL_MODE=true bun run scripts/smoke-test.ts
```

## Environment

Create `.env` in the project root:

```env
LUNARIA_DASHBOARD_PORT=3456
LUNARIA_TERMINAL_HOST_PORT=4879
LUNARIA_MEMORY_PORT=37777
LUNARIA_LOCAL_MODE=true
NODE_ENV=development
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop | Electron 40, electron-vite |
| Dashboard | Next.js 16, React 19, Tailwind |
| Terminal | xterm.js WebGL, node-pty, Hono |
| Memory | SQLite FTS5, vector embeddings |
| State | Zustand 5, TanStack Query |
| Testing | Vitest, Playwright |
| Build | Bun, Turborepo, Biome |

## i18n

10 languages: English, Spanish, French, German, Portuguese, Japanese, Korean, Chinese, Russian, Arabic.

## License

MIT
