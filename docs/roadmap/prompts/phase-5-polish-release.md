# Phase 5: Polish, Mobile & Release — Agent Prompt

## Mission

Final polish: update mobile app, wire i18n across all screens, run full test suite, build distribution packages, update documentation.

**Duration:** 1 week
**Prerequisite:** Phase 4 complete (all screens functional)
**Deliverable:** Production-ready Lunaria v1.0.0

## Context

**What is Lunaria?** Lunaria is an Electron desktop application for AI agent orchestration — forked from superset-sh/superset (Electron v40.2.1) and rebranded with a magenta design system. It runs AI coding agents (Claude Code, Codex, Gemini) in managed terminals with unique features: tiered memory system, multi-agent orchestration with consensus voting, 6-phase autopilot pipeline, .luna extension marketplace, remote device access with E2E encryption, kanban task boards that agents can claim, session replay, and visual workflow editing.

**System Architecture:** Two daemon processes run alongside the Electron main process:

- **host-service** (from Superset) — terminals (node-pty), git operations, chat (Mastra), workspace filesystem
- **lunaria-service** (new) — memory, orchestration, remote access, extensions, autopilot, kanban, opinions, CLI integration, replay, diagnostics

Both use a **single SQLite database** (better-sqlite3 + Drizzle ORM) with 43 migrations. The renderer communicates with the main process via **trpc-electron** (direct IPC). Lunaria-specific routers are namespaced under `trpc.lunaria.*`.

**Tech stack:** Bun 1.3.6, Turbo, Biome 2.4.2, React 19.2, TanStack Router v1, TanStack Query v5, Zustand v5, TailwindCSS v4, shadcn/ui, @xterm/xterm with WebGL.

**What "Superset-derived screens" means:** The workspace dashboard, terminal tabs, git changes panel, settings page, and agent preset selector all came from the Superset fork. Lunaria added 11 new screens on top (Memory Graph Home, Memory Browser, Agent Management, Autopilot, Kanban, Marketplace, Remote Access, Visual Editor, Opinions, Session Replay, Diagnostics).

All 15 features are functional after Phases 1-4. This phase is about polish, completeness, and release readiness.

### Architecture Decisions

- Full app i18n — ALL screens (Superset + Lunaria), ~500+ strings
- Mobile app connects to host-service via HTTP/WebSocket
- Cloud removal regression test suite required
- File-based session recordings (~/.lunaria/recordings/, gzip compressed)
- Structured logging to ~/.lunaria/logs/ (rotated, 50MB max)

## Execution Rules

1. **Commit after every completed step** — never batch multiple steps into one commit
2. **Use conventional commits**: `feat(lunaria): <step description>`
3. **Run `bun run build` before each commit** — never commit broken code
4. **If a step fails, fix it before moving on** — don't skip and come back later
5. **Read files before editing them** — use the Read tool to understand existing code before making changes

## Tasks

### Mobile tRPC HTTP Client Setup

In apps/mobile/, create a tRPC client pointing to the desktop host-service:

```typescript
// apps/mobile/src/lib/trpc.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@lunaria/host-service';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `http://${hostIp}:${port}/trpc`, // discovered via mDNS or manual IP entry
    }),
  ],
});
```

For QR code pairing, the QR encodes: `lunaria://pair?host=192.168.1.x&port=3847&pin=123456`
The mobile app scans this with expo-camera, extracts host/port/pin, and calls
`trpc.lunaria.remoteAccess.completePairing.mutate({ pin })`.

### 5.1 Mobile App Update

Update `apps/mobile/` (Expo/React Native):

- Replace runtime-client Tauri IPC → tRPC HTTP client pointing to host-service
- WebSocket connection for real-time terminal streaming
- QR scan pairing via expo-camera
- Add 3 new screens: MemoryBrowserScreen, AgentStatusScreen, AutopilotMonitorScreen
- Apply Lunaria design tokens from packages/tokens

### 5.2 Full App i18n

Wire packages/i18n into ALL screens:

- Extract ~500+ hardcoded English strings from Superset-derived screens
- Wrap in t() calls (react-i18next)
- Organize by screen/component namespace in packages/i18n/locales/en.json
- Lunaria screens: all user-facing strings (search placeholders, tier labels, phase names, etc.)
- Generate translation stubs for es, fr, de, pt

### 5.3 Testing

Run and fix:

- Unit tests: all lunaria-service services (80%+ coverage)
- Cloud removal regression suite: workspace CRUD, settings persistence, project creation, data subscriptions
- Integration tests: tRPC router end-to-end
- E2E tests (Playwright): memory search, agent spawning, autopilot lifecycle, extension install, remote pairing, kanban drag-and-drop, session replay
- Cross-language crypto test vectors

### 5.4 Visual Differentiation Verification

Audit every screen against the checklist:

- Magenta primary color applied
- Purple-tinted surfaces (270 degree hue)
- pulse-magenta, shimmer, waveform animations active
- Lunaria logo in sidebar and about dialog
- No Superset references anywhere
- Memory Graph Home as default view
- StatusBar with Lunaria widgets

### 5.5 Build & Distribution

```bash
bun install
turbo build
# Verify: electron-vite build succeeds
# Package: electron-builder for macOS (DMG), Windows (NSIS), Linux (AppImage)
# Mobile: Expo EAS Build
```

Update auto-updater URLs to Lunaria release server.

### 5.6 Documentation

Update apps/docs/ (rebranded from Superset):

- Getting Started → Lunaria installation
- All Superset feature docs → keep, rebrand
- New pages: Memory System, Agent Orchestration, Autopilot, Extensions, Remote Access, Session Replay
- API Reference → tRPC router docs including lunaria.\* namespace

## Priority Order (if time is constrained)

Must ship (P0):

1. Full i18n string extraction
2. All tests passing at 80%+ coverage
3. Visual audit — zero Superset references
4. Desktop builds for macOS (DMG)

Should ship (P1): 5. Mobile app tRPC migration 6. Windows and Linux builds 7. Documentation updates

Nice to have (P2): 8. Mobile QR pairing flow 9. Translation stubs for 4 non-English languages

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

- [ ] Mobile app connects to host-service and displays sessions
- [ ] i18n: all strings wrapped in t(), 5 language stubs generated
- [ ] Unit tests: 80%+ coverage on lunaria-service
- [ ] Cloud removal regression tests pass
- [ ] E2E tests pass
- [ ] Crypto test vectors pass
- [ ] Visual audit: no Superset references, magenta theme everywhere
- [ ] DMG builds and installs on macOS
- [ ] NSIS installer works on Windows
- [ ] AppImage runs on Linux
- [ ] Documentation updated and builds
- [ ] Version set to 1.0.0
