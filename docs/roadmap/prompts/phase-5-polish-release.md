# Phase 5: Polish, Mobile & Release — Agent Prompt

## Mission

Final polish: update mobile app, wire i18n across all screens, run full test suite, build distribution packages, update documentation.

**Duration:** 1 week
**Prerequisite:** Phase 4 complete (all screens functional)
**Deliverable:** Production-ready Lunaria v1.0.0

## Context

All 15 features are functional. This phase is about polish, completeness, and release readiness.

### Architecture Decisions

- Full app i18n — ALL screens (Superset + Lunaria), ~500+ strings
- Mobile app connects to host-service via HTTP/WebSocket
- Cloud removal regression test suite required
- File-based session recordings (~/.lunaria/recordings/, gzip compressed)
- Structured logging to ~/.lunaria/logs/ (rotated, 50MB max)

## Tasks

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
