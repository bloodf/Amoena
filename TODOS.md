# TODOS

## Lunaria Migration Plan — Engineering Review Items

### TODO-001: Consensus voting edge case — all agents abstain

- **What:** Handle the case where all agents abstain from a consensus vote (total_weight == 0)
- **Why:** Without handling, weighted average calculation divides by zero. Silent failure in a core orchestration feature.
- **Pros:** Prevents crash, gives users clear feedback ("No agents voted — result inconclusive")
- **Cons:** Minimal — straightforward guard clause
- **Context:** In `lunaria-service/orchestration/consensus.ts`, the weighted voting formula is `score = Σ(weight_i * vote_i) / Σ(weight_i)`. When all agents abstain, `Σ(weight_i) = 0`. Should return `ConsensusResult.Inconclusive` and notify user via toast. Test case B2 in test plan.
- **Depends on:** Phase 3 orchestration service implementation
- **Added:** 2026-03-19 via /plan-eng-review

### TODO-002: Autopilot phase timeout watchdog

- **What:** Add configurable timeout per autopilot phase with automatic rollback on timeout
- **Why:** If an agent hangs during implementation (infinite loop, network stall, etc.), the autopilot run stalls forever with no user feedback. Users have to manually kill the process.
- **Pros:** Prevents stuck autopilot runs, enables automatic recovery, gives users clear timeout notification
- **Cons:** Needs careful timeout calibration — too short kills legitimate long-running phases, too long defeats the purpose
- **Context:** In `lunaria-service/autopilot/phase-runner.ts`, wrap each phase execution in a `Promise.race([phaseExecution, timeoutPromise])`. Default timeout: 10 minutes per phase, configurable in settings. On timeout: rollback current phase changes, set status to `timed_out`, emit notification. Test case B6 in test plan.
- **Depends on:** Phase 3 autopilot engine implementation
- **Added:** 2026-03-19 via /plan-eng-review

### TODO-003: Remote relay graceful disconnection handling

- **What:** Add heartbeat detection, orphaned room cleanup, user notification, and reconnection for WebSocket relay disconnections
- **Why:** When a mobile device loses WiFi mid-relay session, the WebSocket dies silently. Desktop shows stale "connected" state. Orphaned relay rooms leak memory.
- **Pros:** Reliable remote access experience, no memory leaks, users know when devices disconnect
- **Cons:** Adds complexity to relay room lifecycle management
- **Context:** In `lunaria-service/remote-access/relay-room.ts`: (1) WebSocket ping/pong every 30s, (2) if 3 pings missed → mark device disconnected → cleanup room, (3) desktop gets toast "Device X disconnected", (4) mobile app attempts reconnection with exponential backoff (1s, 2s, 4s, max 30s). Test case B9 in test plan.
- **Depends on:** Phase 3 remote access service implementation
- **Added:** 2026-03-19 via /plan-eng-review

### TODO-004: Full app i18n string extraction

- **What:** Wrap all hardcoded English strings across Lunaria-derived screens in `t()` calls and extract to translation files
- **Why:** User chose full app i18n (not just Lunaria screens). Lunaria has zero i18n — ~500+ strings across 90+ components need extraction.
- **Pros:** Complete internationalization, consistent UX across languages, no half-English/half-translated experience
- **Cons:** Time-consuming mechanical work (~2 hours CC time), translation files need actual translations later
- **Context:** Can be done incrementally: Phase 1 (branding strip) is a natural time to touch every file. Extract strings to `packages/i18n/locales/en.json` organized by screen/component namespace. Use `react-i18next` or equivalent. Lunaria components in `packages/ui/src/components/ui/` and `apps/desktop/src/renderer/` all need wrapping.
- **Depends on:** Phase 1 completion (files are accessible after fork)
- **Added:** 2026-03-19 via /plan-eng-review

## Lunaria Migration Plan — CEO Review Expansions

### TODO-005: Session Replay storage cleanup policy

- **What:** Auto-delete old session recordings to prevent disk bloat
- **Why:** Each recording can be 15MB (compressed). 100 sessions = 1.5GB. Users will forget to clean up.
- **Pros:** Prevents disk bloat, users don't have to manage storage manually
- **Cons:** Users might want to keep old recordings — need configurable retention
- **Context:** Recordings stored as gzip-compressed files in `~/.lunaria/recordings/`. Add a configurable retention policy (default: 30 days, configurable in settings). Run cleanup on lunaria-service startup. Show storage usage in Diagnostics page.
- **Effort:** S (human) → S (CC: ~15 min)
- **Priority:** P2
- **Depends on:** Session Replay implementation (Phase 4-5)
- **Added:** 2026-03-19 via /plan-ceo-review

### TODO-006: CLI output parser versioning

- **What:** Version-detect CLI agents (Claude Code, Codex, Gemini) and select the correct output parser
- **Why:** Agent CLI tools change their output format between versions. A parser built for Claude Code v1.2 may break on v1.3.
- **Pros:** Resilient to agent updates, graceful degradation when format changes
- **Cons:** Maintenance burden — each agent version update may need parser updates
- **Context:** In `lunaria-service/cli-integration/parser-registry.ts`, detect agent version from terminal output (e.g., Claude Code prints version on startup). Map version → parser. If unknown version, fall back to raw output mode and log warning.
- **Effort:** M (human) → S (CC: ~30 min)
- **Priority:** P2
- **Depends on:** CLI Deep Integration implementation (Phase 4)
- **Added:** 2026-03-19 via /plan-ceo-review
