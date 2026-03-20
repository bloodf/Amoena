# Lunaria Migration Progress

## Status: PHASE 1-3C IN PROGRESS

**Plan reviewed:** 2026-03-19 (Eng Review: CLEAR, CEO Review: CLEAR, Design Review: CLEAR)
**Total features:** 15 (10 original + 5 CEO expansions)
**Total decisions locked:** 20
**Estimated timeline:** 8 weeks

| Phase                                   | Status      | Started    | Completed | Agent              | Notes                                                                                                                                                                               |
| --------------------------------------- | ----------- | ---------- | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1: Fork & Rebrand                       | IN PROGRESS | 2026-03-20 | —         | Codex orchestrator | Target repo `../lunaria-desktop`; runtime cloud-data refs are removed, and remaining matches are limited to generated historical DB migration artifacts                             |
| 2: Monorepo Restructure                 | IN PROGRESS | 2026-03-20 | —         | Codex orchestrator | `i18n`, `tokens`, local-db Lunaria schema, trpc namespace, UI routes/screens, and a real `lunaria-service` runtime are in place and serving local health endpoints                  |
| 3A: Memory + Remote Access              | IN PROGRESS | 2026-03-20 | —         | Codex orchestrator | Local memory CRUD/search/graph is wired through desktop tRPC and the Memory screen; remote device registry now works                                                                |
| 3B: Orchestration + Extensions + Kanban | IN PROGRESS | 2026-03-20 | —         | Codex orchestrator | Desktop now consumes shared orchestration/extensions/kanban service logic; deeper consensus and extension metadata tests are in place                                               |
| 3C: Autopilot + CLI + Replay + Opinions | IN PROGRESS | 2026-03-20 | —         | Codex orchestrator | Desktop now consumes shared autopilot/CLI/replay/opinions service logic; autopilot and remote-access service tests are in place                                                     |
| 4: UI Integration (11 screens)          | IN PROGRESS | 2026-03-20 | —         | Codex orchestrator | Diagnostics, replay, marketplace, visual editor, agents, autopilot, kanban, opinions, memory, and remote screens are live and no longer depend on Electric/TanStack runtime queries |
| 5: Polish & Release                     | NOT STARTED | —          | —         | —                  |                                                                                                                                                                                     |

## Test Results

| Suite                    | Status | Coverage | Last Run   |
| ------------------------ | ------ | -------- | ---------- |
| Unit (lunaria-service)   | —      | —        | —          |
| Cloud removal regression | PASS   | —        | 2026-03-20 |
| Integration (tRPC)       | PASS   | —        | 2026-03-20 |
| E2E (Playwright)         | —      | —        | —          |
| Crypto test vectors      | —      | —        | —          |

## Build Status

| Platform         | Status | Last Build |
| ---------------- | ------ | ---------- |
| macOS (DMG)      | PASS   | 2026-03-20 |
| Windows (NSIS)   | —      | —          |
| Linux (AppImage) | —      | —          |
| Mobile (Expo)    | —      | —          |
