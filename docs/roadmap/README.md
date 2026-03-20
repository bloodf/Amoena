# Lunaria Migration Roadmap

This folder contains the complete plan, prompts, and tracking for migrating Lunaria from Tauri/Rust to an Electron-based architecture by forking [superset-sh/superset](https://github.com/superset-sh/superset).

The roadmap is written for the Codex GUI app. The current `lunaria` repo is the source/reference repo. The Superset migration target lives in a sibling workspace, defaulting to `../lunaria-desktop`.

## Documents

| File                                     | Purpose                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| [MIGRATION-PLAN.md](./MIGRATION-PLAN.md) | Master plan with all 20 locked decisions from eng, CEO, and design reviews |
| [TODOS.md](./TODOS.md)                   | 6 tracked items for implementation-time resolution                         |
| [PROGRESS.md](./PROGRESS.md)             | Live progress tracker updated by orchestrator                              |

## Agent Prompts

Self-contained prompts for Codex GUI orchestration. Each has full context, step-by-step instructions, and acceptance criteria.

| Prompt                                                                       | Phase | Duration | Description                                                                        |
| ---------------------------------------------------------------------------- | ----- | -------- | ---------------------------------------------------------------------------------- |
| [orchestrator.md](./prompts/orchestrator.md)                                 | All   | 8 weeks  | Master prompt for the Codex GUI leader; coordinates phases and bounded subagents   |
| [phase-1-fork-rebrand.md](./prompts/phase-1-fork-rebrand.md)                 | 1     | 1 week   | Fork Superset, strip branding, remove cloud deps, apply magenta theme              |
| [phase-2-monorepo-restructure.md](./prompts/phase-2-monorepo-restructure.md) | 2     | 1 week   | DB migrations, tRPC routers, lunaria-service scaffold, UI placeholders             |
| [phase-3-core-services.md](./prompts/phase-3-core-services.md)               | 3     | 3 weeks  | Port Memory, Remote Access, Orchestration, Extensions, Autopilot + 5 more services |
| [phase-4-ui-integration.md](./prompts/phase-4-ui-integration.md)             | 4     | 2 weeks  | Build 11 screens with live data, Memory Graph Home as default                      |
| [phase-5-polish-release.md](./prompts/phase-5-polish-release.md)             | 5     | 1 week   | Mobile app, full i18n, testing, build distribution, docs                           |

## Quick Start

```bash
# In the Codex GUI app:
# "Read docs/roadmap/prompts/orchestrator.md and begin Phase 1."
# The orchestrator will prepare ../lunaria-desktop as the Superset fork workspace.
```

## Review History

- **Engineering Review:** 2026-03-19 — CLEARED (14 decisions, 3 critical gaps tracked)
- **CEO Review:** 2026-03-19 — CLEARED, SELECTIVE EXPANSION (5 expansions accepted)
- **Design Review:** 2026-03-19 — CLEARED, 9/10 (8 design decisions added)
