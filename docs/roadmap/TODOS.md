# TODOS

## Superset Migration Plan — Engineering Review Items

### TODO-001: Consensus voting edge case — all agents abstain

- **Status:** CLOSED, already satisfied in the current implementation
- **Resolution:** `packages/lunaria-service/src/consensus/voting.ts` returns `Inconclusive` with `weightedScore: null` when total weight is zero, and the regression test lives in `packages/lunaria-service/src/consensus/voting.test.ts`.

- **What:** Handle the case where all agents abstain from a consensus vote (total_weight == 0)
- **Why:** Without handling, weighted average calculation divides by zero. Silent failure in a core orchestration feature.
- **Pros:** Prevents crash, gives users clear feedback ("No agents voted — result inconclusive")
- **Cons:** Minimal — straightforward guard clause
- **Context:** In `amoena-service/orchestration/consensus.ts`, the weighted voting formula is `score = Σ(weight_i * vote_i) / Σ(weight_i)`. When all agents abstain, `Σ(weight_i) = 0`. Should return `ConsensusResult.Inconclusive` and notify user via toast. Test case B2 in test plan.
- **Depends on:** Phase 3 orchestration service implementation
- **Added:** 2026-03-19 via /plan-eng-review

### TODO-002: Autopilot phase timeout watchdog

- **Status:** CLOSED, landed in `f0458d0 fix(autopilot): preserve phase timeout context`

- **Resolution:** The autopilot pipeline now preserves phase-specific timeout context, stores `phaseTimeouts` across phase transitions, and verifies the behavior in the autopilot test suite. See `.sisyphus/evidence/task-8-autopilot-tests.txt` and `.sisyphus/evidence/task-8-autopilot-grep.txt`.

- **What:** Add configurable timeout per autopilot phase with automatic rollback on timeout
- **Why:** If an agent hangs during implementation (infinite loop, network stall, etc.), the autopilot run stalls forever with no user feedback. Users have to manually kill the process.
- **Pros:** Prevents stuck autopilot runs, enables automatic recovery, gives users clear timeout notification
- **Cons:** Needs careful timeout calibration — too short kills legitimate long-running phases, too long defeats the purpose
- **Context:** In `amoena-service/autopilot/phase-runner.ts`, wrap each phase execution in a `Promise.race([phaseExecution, timeoutPromise])`. Default timeout: 10 minutes per phase, configurable in settings. On timeout: rollback current phase changes, set status to `timed_out`, emit notification. Test case B6 in test plan.
- **Depends on:** Phase 3 autopilot engine implementation
- **Added:** 2026-03-19 via /plan-eng-review

### TODO-003: Remote relay graceful disconnection handling

- **Status:** CLOSED, landed across `71aac37 feat(remote-access): close relay disconnect backlog`

- **Resolution:** Relay rooms now track disconnect reasons, heartbeat timeouts surface explicit disconnect state, desktop consumers can subscribe to disconnect events, and the mobile relay client preserves reconnect behavior with reason-aware status changes. See `.sisyphus/evidence/task-9-relay-tests.txt` and `.sisyphus/evidence/task-9-disconnect-state.txt`.

- **What:** Add heartbeat detection, orphaned room cleanup, user notification, and reconnection for WebSocket relay disconnections
- **Why:** When a mobile device loses WiFi mid-relay session, the WebSocket dies silently. Desktop shows stale "connected" state. Orphaned relay rooms leak memory.
- **Pros:** Reliable remote access experience, no memory leaks, users know when devices disconnect
- **Cons:** Adds complexity to relay room lifecycle management
- **Context:** In `amoena-service/remote-access/relay-room.ts`: (1) WebSocket ping/pong every 30s, (2) if 3 pings missed → mark device disconnected → cleanup room, (3) desktop gets toast "Device X disconnected", (4) mobile app attempts reconnection with exponential backoff (1s, 2s, 4s, max 30s). Test case B9 in test plan.
- **Depends on:** Phase 3 remote access service implementation
- **Added:** 2026-03-19 via /plan-eng-review

### TODO-004: Full app i18n string extraction

- **Status:** CLOSED for the active Electron and Bun product surfaces, landed in `b59b315 feat(electron): finish i18n string extraction`

- **Resolution:** Active desktop, mobile, dashboard, and shared UI surfaces now ship with the Task 12 i18n audit and locale parity gate. This closes the executable repo backlog item for the current Electron and Bun product, while historical migration-plan wording about broader fork-era cleanup remains roadmap context, not an active release blocker. See `.sisyphus/evidence/task-12-i18n-audit.txt` and `.sisyphus/evidence/task-12-i18n-tests.txt`.

- **What:** Wrap all hardcoded English strings across Superset-derived screens in `t()` calls and extract to translation files
- **Why:** User chose full app i18n (not just Amoena screens). Superset has zero i18n — ~500+ strings across 90+ components need extraction.
- **Pros:** Complete internationalization, consistent UX across languages, no half-English/half-translated experience
- **Cons:** Time-consuming mechanical work (~2 hours CC time), translation files need actual translations later
- **Context:** Can be done incrementally: Phase 1 (branding strip) is a natural time to touch every file. Extract strings to `packages/i18n/locales/en.json` organized by screen/component namespace. Use `react-i18next` or equivalent. Superset components in `packages/ui/src/components/ui/` and `apps/desktop/src/renderer/` all need wrapping.
- **Depends on:** Phase 1 completion (files are accessible after fork)
- **Added:** 2026-03-19 via /plan-eng-review

## Superset Migration Plan — CEO Review Expansions

### TODO-005: Session Replay storage cleanup policy

- **Status:** CLOSED, landed in `9143d7b feat(replay): wire retention into settings and diagnostics`

- **Resolution:** Replay retention is now configurable through settings, diagnostics report effective retention and reclaimable storage, and cleanup uses the configured value instead of a fixed default. See `.sisyphus/evidence/task-10-replay-cleanup-tests.txt` and `.sisyphus/evidence/task-10-diagnostics-tests.txt`.

- **What:** Auto-delete old session recordings to prevent disk bloat
- **Why:** Each recording can be 15MB (compressed). 100 sessions = 1.5GB. Users will forget to clean up.
- **Pros:** Prevents disk bloat, users don't have to manage storage manually
- **Cons:** Users might want to keep old recordings — need configurable retention
- **Context:** Recordings stored as gzip-compressed files in `~/.amoena/recordings/`. Add a configurable retention policy (default: 30 days, configurable in settings). Run cleanup on amoena-service startup. Show storage usage in Diagnostics page.
- **Effort:** S (human) → S (CC: ~15 min)
- **Priority:** P2
- **Depends on:** Session Replay implementation (Phase 4-5)
- **Added:** 2026-03-19 via /plan-ceo-review

### TODO-006: CLI output parser versioning

- **Status:** CLOSED, landed in `f42baaa fix(cli-adapters): defer parser version detection`

- **Resolution:** Parser selection now defers version detection until startup output is available, falls back cleanly for unknown versions, and keeps adapter constructors intact after the lazy-parser follow-up fix. See `.sisyphus/evidence/task-11-parser-tests.txt` and `.sisyphus/evidence/task-11-parser-fallback.txt`.

- **What:** Version-detect CLI agents (Claude Code, Codex, Gemini) and select the correct output parser
- **Why:** Agent CLI tools change their output format between versions. A parser built for Claude Code v1.2 may break on v1.3.
- **Pros:** Resilient to agent updates, graceful degradation when format changes
- **Cons:** Maintenance burden — each agent version update may need parser updates
- **Context:** In `amoena-service/cli-integration/parser-registry.ts`, detect agent version from terminal output (e.g., Claude Code prints version on startup). Map version → parser. If unknown version, fall back to raw output mode and log warning.
- **Effort:** M (human) → S (CC: ~30 min)
- **Priority:** P2
- **Depends on:** CLI Deep Integration implementation (Phase 4)
- **Added:** 2026-03-19 via /plan-ceo-review
