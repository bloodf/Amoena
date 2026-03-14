# Risk Register & Mitigation Plan

## Overview

This document catalogs all identified risks for the Lunaria project — a universal GUI for AI coding TUIs (Claude Code, OpenCode, Codex CLI, Gemini CLI). Risks were identified through:

- **Metis architectural review** of the initial design
- **Interview process** (21 decisions across 8 rounds)
- **Technology stack analysis** (Tauri 2, React 19, Rust, TypeScript)
- **Operational assessment** (open-source maintenance, CI/CD, certificates)

**Last Updated:** 2026-03-08
**Review Cadence:** Monthly or upon major architecture changes

### Risk Management Approach

Each risk is assessed on three dimensions:

- **Severity**: Critical / High / Medium / Low — worst-case impact on project success
- **Likelihood**: High (>70%) / Medium (30-70%) / Low (<30%) — probability of occurrence
- **Impact**: High / Medium / Low — effect on timeline, quality, or user experience if realized

Risks are reviewed at each development phase gate (MVP → V1 → V2). Mitigations are concrete actions, not aspirational statements. Contingency plans describe what to do if the mitigation fails.

### Severity Matrix

| Likelihood \ Impact | Low | Medium | High | Critical |
|---------------------|-----|--------|------|----------|
| **High**            | Medium | High | Critical | Critical |
| **Medium**          | Low | Medium | High | Critical |
| **Low**             | Low | Low | Medium | High |

### Owner Legend

| Code | Meaning |
|------|---------|
| Core | Core development team |
| Infra | Infrastructure / DevOps |
| Security | Security review team |
| PM | Project management |

---

## Risk Register

| ID | Risk | Severity | Likelihood | Impact | Mitigation | Contingency | Owner |
|----|------|----------|------------|--------|------------|-------------|-------|
| R1 | TUI API asymmetry — not all TUIs have equally mature structured APIs. Gemini CLI has no programmatic input (PTY-only). | High | High | High | Build TUI Capability Matrix with FULL/PARTIAL/PTY-ONLY tiers. Design adapter interface with graceful degradation. PTY-only TUIs get terminal tab but limited GUI integration. | Demote unstable TUIs to PTY-ONLY mode. Maintain TUI health dashboard showing feature support per version. | Core |
| R2 | OpenCode naming/version confusion — archived Go version (opencode-ai) vs active TypeScript version (anomalyco, 118K★). | Medium | Medium | Medium | Pin all references to anomalyco TypeScript OpenCode. Use `@opencode-ai/sdk/v2`. Add version detection in setup wizard that validates correct binary. | Adapter validates API responses match expected TypeScript version format. Setup wizard shows clear error with correct install instructions. | Core |
| R3 | Plugin security — Obsidian-style same-process model: plugins run in the main renderer and have full access to the Tauri IPC bridge. No process isolation; CSP cannot block direct `invoke()` calls. | Critical | Medium | Critical | Manifest-declared permissions with user approval. Runtime permission checks on sensitive APIs. Tauri capability scoping per webview (primary guard against direct `invoke()` abuse). CSP hardening for XSS escalation paths. Audit logging of all plugin IPC calls. Plugin signing for marketplace trust. | Remote kill-switch to disable compromised plugins. Incident response: revoke signing key, notify users, publish advisory. V2 path: isolated Web Worker or separate WebView per plugin for untrusted plugins. | Security |
| R4 | Monaco Editor requires `unsafe-eval` in CSP for its JavaScript evaluation engine, weakening XSS protections. | High | High | Medium | Scope `unsafe-eval` to dedicated Monaco webview only. Strict CSP everywhere else. Sanitize all content passed to Monaco. Monitor upstream for CSP-compatible alternatives. | Replace Monaco with CodeMirror 6 (no `unsafe-eval` required). Disable Monaco's eval-dependent features and use restricted subset. | Security |
| R5 | Auto-updater signing costs — Apple Developer ($99/yr) + Windows Authenticode ($200-500/yr) = $299-599/year. | Medium | High | Medium | Budget $200-600/year. Use Tauri's built-in updater with Ed25519 signed manifests. For MVP, distribute unsigned with manual install docs. Apply for SignPath Foundation OSS program. | Distribute via Homebrew cask (macOS), winget (Windows), AppImage/Flatpak (Linux) to bypass signing requirements. Provide checksum verification for direct downloads. | Infra |
| R6 | Codex CLI API churn — Rust rewrite will likely change CLI interface, output format, and binary name. OpenAI iterates rapidly without long deprecation cycles. | High | High | High | Abstract behind versioned adapter interface. Pin to known-working Codex CLI version in CI. Monitor GitHub repo for rewrite progress. Support multiple adapter versions simultaneously. | Maintain compatibility shim translating new API to old interface. Demote to PTY-ONLY temporarily while building new adapter. Engage OpenAI community for early API specs. | Core |
| R7 | pnpm workspace issues with Tauri CLI — GitHub #11859 documents dependency resolution failures. | Medium | Medium | Medium | Use bun as package manager (fast installs, native workspace support). The pnpm issue (GitHub #11859) does not affect bun's workspace implementation. bun + Tauri 2 compatibility requires validation before first build (see Feasibility Items in `implementation-roadmap.md`). | Fall back to npm (proven Tauri compatibility, slower). Switch to Yarn 4 with `nodeLinker: node-modules` as second alternative. | Core |
| R8 | Corporate networks block mDNS (UDP port 5353) — breaks automatic device discovery for remote control feature. | Medium | High | Medium | Implement manual IP:port entry as first-class fallback. Generate QR codes with connection URL for mobile pairing. Show both mDNS and manual options prominently in UI. | Default to manual IP entry, make mDNS opt-in. Add local network scan as middle ground. For V2, implement cloud relay (paid feature). | Core |
| R9 | System tray missing on Wayland/i3/sway/Hyprland Linux DEs — `tray-icon` crate depends on platform support. | Medium | Medium | Low | Background daemon fallback: headless process managed via CLI (`lunaria status/show/quit`). Detect tray availability at startup, fall back gracefully. Add "minimize to background" without tray. | Keep window open on affected DEs (no background mode). Document supported DEs. Investigate D-Bus StatusNotifierItem protocol for broader Wayland support. | Core |
| R10 | 4 concurrent TUI processes (up to 8 with dual-mode) exhaust system resources — estimated 900MB-1.85GB RAM total. | High | Medium | High | Process budget: default 2 concurrent TUIs, configurable to 4. Lazy-start on session open. Idle timeout (10 min default) suspends inactive TUIs. Resource monitoring in UI. Single-process mode for low-spec machines. | Aggressive process recycling (2 min idle kill). Single-mode only (no PTY) to halve process count. "Lite mode" with one TUI and minimal UI. Profile and optimize Tauri app footprint. | Core |
| R11 | React 19 stability — ecosystem (libraries, tooling) still catching up. shadcn/ui components may have subtle issues. | Medium | Low | High | Pin React 19 to specific patch version. Run full test suite before each release. Monitor React 19 compatibility tracker. Use StrictMode in development. Disable React Compiler initially, enable incrementally. | Downgrade to React 18 (avoid React 19-only features until ecosystem stabilizes). Pin problematic libraries to React 18-compatible versions. Maintain compatibility matrix. | Core |
| R12 | Tauri 2 breaking changes — relatively new, plugin APIs and capability system may evolve. Community plugins (tauri-plugin-pty v0.2.1) may lag. | High | Medium | High | Pin Tauri 2 to specific minor version. Wrap all Tauri API calls behind `@lunaria/core/platform` abstraction. Contribute upstream fixes for critical plugins. Monthly upgrade checks in CI. | Stay on pinned version until fix available. Fork critical Tauri plugins and maintain patches. Evaluate Electron as fallback if Tauri proves too unstable (significant effort). | Core |
| R13 | Dependency supply chain attacks — 500+ npm packages, 200+ Rust crates, 4 external TUI binaries. | High | Low | Critical | npm audit + cargo audit in CI (fail on critical). Lockfiles with exact versions. Dependabot/Renovate with manual review for majors. Review new deps before adding. Minimize dependency count. | Pin to last known-good version immediately. Audit compromised version. Fork critical unmaintained packages. Notify users via in-app update. Publish security advisory. | Security |
| R14 | Certificate management — annual expiration of code signing certs is single point of failure for release pipeline. | Medium | Medium | High | Calendar reminders 60 days before expiry. Store in secrets manager with expiration tracking. Document renewal process step-by-step. CI pre-release check validates cert expiration. Consider multi-year certs. | Distribute unsigned emergency builds via GitHub Releases. Fast-track renewal (24-48hr). Communicate via GitHub Discussions/Discord. | Infra |
| R15 | CI/CD pipeline complexity — 3 platforms × 2 architectures = 6 build targets. Tauri builds take 5-15 min each. macOS runners cost 10× Linux. | Medium | Medium | Medium | GitHub Actions matrix builds. Cache Rust artifacts (sccache) and node_modules. Staged pipeline: lint/test → build → sign → notarize → publish. PR builds target contributor's platform only. | Reduce matrix (drop less common targets). Self-hosted runners for cost. Incremental builds for changed Rust crates only. Consider Depot/Namespace build service. | Infra |
| R16 | Open-source maintenance burden — 4 TUIs × 3 platforms = 12 test configs. Each TUI release may break its adapter. Community contributions require domain expertise review. | High | High | High | TUI champion per TUI tracking upstream changes. Automated TUI version checking in CI weekly. GitHub issue templates with TUI selection. Support only latest 2 major versions per TUI. Clear contribution guidelines. | Reduce supported TUIs by user demand (prioritize Claude Code + OpenCode). Move less-popular adapters to community-maintained. Plugin-based adapter system for community maintenance. Seek sponsorship/funding. | PM |
| R17 | Vector DB performance at scale — large observation sets with embeddings degrade query latency as the vector index grows beyond memory capacity. | High | Medium | High | Use HNSW index with configurable `ef_construction` and `M` parameters. Implement tiered storage: hot (recent, in-memory) and cold (older, disk-backed). Set observation retention policy with configurable TTL. Benchmark with 100K+ observations during development. | Reduce embedding dimensions (1536 → 768 with re-encoding). Implement index sharding by project/workspace. Offload to external vector DB (Qdrant, Chroma) for power users. Fall back to keyword search when vector search exceeds latency budget. | Core |
| R18 | Agent loop infinite recursion — runaway subagent spawning where agents spawn agents without termination, exhausting tokens, compute, and money. | Critical | Medium | Critical | Hard limit on subagent depth (default: 5 levels). Per-session token budget with automatic halt. Per-session cost ceiling (configurable, default: $10). Subagent spawn rate limit (max 3 per minute per session). `SubagentStart` hook enables external monitoring. | Kill entire agent tree when any limit is breached. Mandatory cooldown period (30s) after forced termination before new session allowed. Audit log of all subagent spawns for post-mortem analysis. Alert user immediately on budget breach. | Core |
| R19 | Memory storage unbounded growth — observations accumulating without bounds, consuming disk space and degrading database performance over time. | High | High | Medium | Configurable retention policy: auto-archive observations older than 90 days. Soft delete with compaction (vacuum) on schedule. Per-project storage quota (default: 500MB). Dashboard showing storage usage breakdown by project. Observation deduplication based on content hash. | Aggressive pruning: delete low-relevance observations (below embedding similarity threshold). Export and archive to external storage. Rebuild SQLite database (VACUUM INTO) when fragmentation exceeds threshold. Alert at 80% quota. | Core |
| R20 | Multi-client server concurrency — desktop, web, and mobile clients connecting simultaneously to the Axum server, causing race conditions in session state and resource contention. | High | Medium | High | Session-level mutex with per-session command serialization. Optimistic concurrency control (etag/revision) for settings mutations. Connection-aware resource budgeting: each client gets fair share of session slots. SSE fan-out with per-client backpressure. Comprehensive integration tests with concurrent client scenarios. | Degrade gracefully: newest connection gets priority, older connections become read-only. Implement connection limits per device (max 2 active connections). Queue commands when contention detected rather than failing. | Core |
| R21 | Subagent context isolation — preventing data leaks between agents running in the same process, where one agent's session data could be read by another agent or plugin. | Critical | Medium | Critical | Each agent session gets a dedicated `PluginContext` with scoped storage path. Session data access requires explicit `sessions.read` permission with session ID filter. Agent memory (observations, concepts) is scoped by session lineage — child agents inherit parent scope but siblings are isolated. No shared mutable state between agent sessions. | Audit log all cross-session data access. Runtime enforcement: any attempt to read another session's data without permission triggers security alert and is blocked. V2: process-level isolation for untrusted agents (separate Tokio runtimes or OS processes). | Security |
| R22 | Permission bypass in agent-to-agent communication — agents delegating tasks to subagents could escalate privileges by having the subagent perform actions the parent is not authorized to do. | Critical | Low | Critical | Capability attenuation: subagents inherit a subset of parent permissions, never more. Permission checks at every tool invocation, not just at agent spawn. `PermissionRequest` hook fires for subagent actions too. Subagent JWT-like capability tokens carry explicit scope limits. Audit trail links subagent actions to parent session for accountability. | Block all subagent tool use until permission model is verified. Require explicit user approval for subagent-initiated sensitive operations (file write, shell exec). Disable subagent spawning entirely as emergency measure. | Security |
| R23 | API key security in credential store — OS keychain vulnerabilities or malware with keychain access could exfiltrate stored provider API keys. | High | Low | Critical | Use OS-native secure storage (macOS Keychain, Windows Credential Manager, libsecret). Encrypt keys at rest with app-specific encryption key derived from hardware-bound secret where available. Never log or display full API keys in UI (mask all but last 4 characters). Clear keys from memory after use (zeroize). Warn users about keychain access permissions. | Support external secret managers (1Password CLI, Bitwarden CLI, HashiCorp Vault) as alternative credential backends. Implement key rotation reminders. Provide "bring your own env var" mode that never stores keys (reads from environment on each launch). | Security |
| R24 | Provider rate limiting — concurrent multi-model queries from parallel agents hitting provider rate limits, causing cascading failures and degraded user experience. | Medium | High | Medium | Per-provider request rate tracking with token bucket algorithm. Automatic backoff and retry with jitter on 429 responses. Queue system for non-urgent requests. Provider-specific rate limit awareness (read `x-ratelimit-*` headers). Display rate limit status in UI. Spread concurrent requests across available providers when possible. | Fail fast with clear error message instead of queuing indefinitely. Implement request prioritization (user-initiated > automated > background). Cache model responses where appropriate to reduce API calls. Suggest upgrading provider tier when rate limits are frequently hit. | Core |
| R25 | CoW clone disk cleanup — orphaned git worktrees and CoW clones accumulating on disk when agent sessions crash or are force-killed without cleanup. | Medium | Medium | Medium | Worktree registry in SQLite tracking all created clones with session association. Cleanup on session end (success or failure) via `WorktreeRemove` lifecycle hook. Periodic background scan (hourly) for orphaned worktrees not associated with any active session. `lunaria cleanup` CLI command for manual orphan removal. Display disk usage per worktree in UI. | Aggressive cleanup: delete any worktree older than 24 hours that has no active session. Limit total worktree disk budget (configurable, default: 5GB). Alert user when worktree disk usage exceeds threshold. Fall back to in-place edits (no cloning) when disk space is critically low. | Core |
| R26 | OAuth token refresh failures — expired sessions and revoked tokens causing silent authentication failures that break active agent sessions mid-execution. | High | Medium | High | Proactive token refresh: refresh tokens 5 minutes before expiry, not on failure. `provider_auth_expiry` notification alerts user before expiry. Retry refresh with exponential backoff (3 attempts). Cache last-known-good credentials for grace period. Health check on session start verifies auth status before beginning work. | Pause agent execution on auth failure with clear "Re-authenticate" prompt. Queue pending work and resume after re-auth. Fall back to alternative provider if available. Store refresh token metadata (expiry, last refresh) for debugging. Provide `lunaria auth status` CLI command for diagnostics. | Core |
| R27 | Cross-ecosystem plugin conflicts — plugins from Claude Code and OpenCode ecosystems registering contradictory handlers for the same hook event, causing silent data loss or duplicate actions. | Medium | Medium | Medium | Plugin Ecosystem Manager enforces namespace isolation per plugin. Conflict detection on hook registration surfaces issues in Settings > Plugins. Events fire handlers in declared priority order (user-configurable). Plugin health dashboard shows per-plugin error rates. | Disable conflicting plugin with lowest priority. Notify user of conflict with resolution options. Emergency: disable all plugins from one ecosystem temporarily. | Core |
| R28 | Local model quality degradation — small local models (0.6B-3B) producing low-quality outputs for system tasks (bad titles, incorrect compaction summaries, miscategorized observations). | Medium | Medium | Low | Quality scoring on local model outputs. Automatic fallback to cloud model when quality drops below threshold. Default routing only assigns local models to simplest tasks. Settings > Providers > Model Routing shows quality metrics. | Disable local model routing for affected task types. Fall back to cloud models for all tasks. Notify user of quality issues with recommended model upgrades. | Core |
| R29 | Agent profile deduplication errors — same logical agent name (e.g., "build") existing in multiple ecosystems with different behavior, causing user confusion or incorrect agent selection. | Low | Medium | Low | Ecosystem source badge on every agent tab. Duplicate detection shows one entry with source selector dropdown. Priority order: custom > plugin > ecosystem default > built-in. Per-ecosystem filtering in AgentTabSwitcher. | Show all duplicates with ecosystem labels instead of deduplicating. Allow users to rename agents to disambiguate. | Core |

---

## Risk Categories

### TUI Integration Risks

These risks stem from Lunaria's core challenge: wrapping 4 different TUI applications with varying API maturity.

#### R1: TUI API Asymmetry

The four target TUIs have fundamentally different integration capabilities:

| TUI | Structured API | Programmatic Input | Bidirectional Control | Integration Tier |
|-----|---------------|-------------------|----------------------|-----------------|
| Claude Code | WebSocket SDK (`--sdk-url`) | Yes — `user_message`, `control_request` | Full — permissions, interrupt, model switch | FULL |
| OpenCode | REST API (`opencode serve`) + SSE | Yes — `POST /session/:id/message` | Full — abort, permissions, session CRUD | FULL |
| Codex CLI | JSON-RPC 2.0 (`codex app-server`) | Yes — `thread/start` | Moderate — approval, but API in flux | PARTIAL (see note) |
| Gemini CLI | Output only (`-o stream-json`) | No — PTY required for input | None — output observation only | PTY-ONLY |

This asymmetry means the adapter interface must support graceful degradation. Features available with Claude Code's WebSocket SDK (permission approval, model switching, interrupt) simply cannot work with Gemini CLI's PTY-only input.

**Note on Codex CLI (PARTIAL)**: Codex CLI is classified as PARTIAL rather than FULL because its JSON-RPC app-server API is undergoing a Rust rewrite that may significantly change the binary name, CLI flags, output format, configuration locations, and authentication flow. The current Node.js API (`app-server`, `exec --json`) is functional but its stability is uncertain during the rewrite period. FULL classification would require: (1) Rust rewrite completed and API surface stabilized, (2) no breaking changes to `thread/*` and `turn/*` JSON-RPC methods, (3) confirmed continued availability of `codex app-server` as a long-term supported interface.

**Key concern**: OpenCode SSE generates ~25MB/min with Opus model, requiring careful buffering and backpressure handling.

#### R2: OpenCode Naming/Version Confusion

Two projects share the "OpenCode" name:

| Version | Language | Status | Stars | Maintainer |
|---------|----------|--------|-------|------------|
| opencode-ai | Go | Archived Sep 2025, moved to Crush | — | Charmbracelet |
| anomalyco OpenCode | TypeScript | Active | 118K★ | anomalyco |

Search engines, package registries, and AI assistants may conflate the two. The Go version's documentation still ranks highly in search results. Lunaria targets the active TypeScript version exclusively.

#### R6: Codex CLI API Churn

OpenAI is rewriting Codex CLI in Rust. The current Node.js version's APIs (`app-server`, `exec --json`) may be replaced entirely. OpenAI's track record shows rapid iteration without long deprecation windows (e.g., ChatGPT plugins → GPTs transition, Assistants API v1 → v2).

The Rust rewrite may change:
- Binary name and installation method
- CLI flags and subcommands
- Output format (JSON-RPC → unknown)
- Configuration file locations
- Authentication flow

### Security Risks

These risks relate to the security posture of the application, particularly around plugin execution and CSP.

#### R3: Plugin Security — Obsidian Model

The user chose the Obsidian-style plugin model: plugins are JavaScript that runs directly in the main webview process. This is a deliberate trade-off:

| Aspect | Obsidian Model (Chosen) | Isolated Webview Model (Alternative) |
|--------|------------------------|--------------------------------------|
| **Performance** | Excellent — no IPC overhead | Moderate — cross-webview messaging |
| **API Access** | Full — can call any exposed API | Limited — only message-passing API |
| **Developer Experience** | Simple — standard DOM/JS APIs | Complex — async message protocols |
| **Security** | Weak — shared privilege space | Strong — process-level isolation |
| **Ecosystem Growth** | Fast — low barrier to entry | Slow — higher development effort |
| **Precedent** | Obsidian (millions of users) | VS Code (extension host process) |

**Why this is critical**: In Tauri's architecture, the webview has access to IPC commands that bridge to the Rust backend. A malicious plugin could:

1. Read/write arbitrary files via Tauri's fs plugin
2. Execute shell commands via Tauri's shell plugin
3. Exfiltrate data via network requests
4. Access other TUI sessions' data

**CVE reference**: CVE-2024-35222 (Tauri path traversal) demonstrates that Tauri's security surface is non-trivial and has had real vulnerabilities.

**Mitigations are layered, not singular**:

- **Layer 1 — Manifest permissions**: Plugins declare capabilities (`fs.read`, `fs.write`, `network`, `shell.execute`, `sessions.read`, `sessions.write`). Users approve at install time.
- **Layer 2 — Runtime permission checks**: Wrap sensitive APIs with runtime validation, not just install-time consent.
- **Layer 3 — Tauri capability scoping**: Use Tauri 2's granular capability system to limit IPC commands available per window/webview.
- **Layer 4 — CSP restrictions**: Lock down `connect-src`, block `unsafe-eval` (except isolated Monaco webview), and disallow inline scripts. **Important**: CSP cannot prevent plugins from calling `invoke()` directly — `invoke()` is a JavaScript function call, not a network request, and is not subject to CSP. CSP limits XSS escalation paths but is not a substitute for process isolation.
- **Layer 5 — Audit logging**: Log all plugin IPC calls for forensic review. Flag anomalous patterns (bulk file reads, unexpected network connections).
- **Layer 6 — Plugin signing**: Require marketplace plugins to be signed. Warn prominently on unsigned plugins.

**Upgrade path**: If the threat landscape demands it, migrate to isolated webview per plugin (VS Code model). This is a significant architectural change but preservable as a future option by designing the plugin API as message-passing from day one, even if the current implementation uses direct calls.

#### R4: Monaco CSP — unsafe-eval

Monaco Editor's JavaScript evaluation engine requires `unsafe-eval` in the Content Security Policy. This is a well-known limitation (Monaco GitHub issues). The risk is that `unsafe-eval` opens the door to XSS attacks if an attacker can inject content into the Monaco context.

Mitigation focuses on isolation: run Monaco in a dedicated webview with its own CSP, separate from the main application webview. This contains the `unsafe-eval` blast radius. The main application webview retains strict CSP with no `unsafe-eval`.

### Infrastructure Risks

These risks relate to build, distribution, networking, and platform support.

#### R5: Auto-Updater Signing Costs

| Platform | Certificate | Cost/Year | Provider |
|----------|------------|-----------|----------|
| macOS | Apple Developer Program | $99 | Apple |
| Windows | Authenticode (OV) | $200-500 | DigiCert, Sectigo, SSL.com |
| Linux | N/A (AppImage/Flatpak) | $0 | N/A |
| **Total** | | **$299-599** | |

Without signing, macOS shows "unidentified developer" and Windows shows SmartScreen warnings. Both significantly reduce installation success rates for non-technical users.

**Note**: SignPath Foundation offers free code signing for qualifying open-source projects, which could eliminate the Windows cost entirely.

#### R7: Package Manager Workspace Compatibility

Tauri CLI has documented issues with pnpm workspaces (GitHub #11859). The CLI fails to resolve workspace dependencies correctly in some configurations, leading to build failures.

The decision to use **bun** instead of pnpm is a direct response to this risk. bun provides fast installs and native workspace support without the pnpm-specific Tauri compatibility issues. However, bun + Tauri 2 compatibility has not been fully validated yet (see Feasibility Items in `implementation-roadmap.md`). If bun proves incompatible, the fallback is npm (proven Tauri compatibility, slower).

#### R8: Corporate Network mDNS Blocking

mDNS (multicast DNS) uses UDP port 5353 and multicast group 224.0.0.251. Corporate firewalls routinely block:

- Multicast traffic (mDNS, SSDP)
- UDP on non-standard ports
- Bonjour/Avahi services

This means the remote control feature's automatic device discovery will not work in many professional environments — precisely where developers use AI coding tools most.

#### R9: System Tray on Wayland/i3

The system tray (notification area / status notifier) has inconsistent support across Linux:

| DE/WM | System Tray Support |
|-------|-------------------|
| GNOME (Wayland) | Removed in GNOME 3.26, requires extension |
| KDE Plasma (Wayland) | Full support via SNI |
| i3/sway | Requires external tray (e.g., waybar) |
| Hyprland | Requires waybar or similar |
| XFCE | Full support |
| MATE/Cinnamon | Full support |

Impact is rated Low because: (1) Linux desktop users are a minority of the target audience, (2) affected users are technically sophisticated and can use CLI fallback, (3) the core app functionality is unaffected — only background mode is impacted.

### Resource Risks

#### R10: Concurrent TUI Process Resource Exhaustion

Worst-case resource consumption with all 4 TUIs in dual-mode (structured API + PTY):

| Component | RAM (est.) | Processes |
|-----------|-----------|-----------|
| Tauri app (Rust + Webview) | 200-400 MB | 1 |
| Claude Code (×2: SDK + PTY) | 200-400 MB | 2 |
| OpenCode (×2: REST + PTY) | 150-300 MB | 2 |
| Codex CLI (×2: app-server + PTY) | 200-400 MB | 2 |
| Gemini CLI (PTY only) | 100-200 MB | 1 |
| Monaco Editor instances | 50-150 MB | N/A (in-webview) |
| **Total** | **900 MB - 1.85 GB** | **8** |

On a 16GB machine this is manageable. On an 8GB machine with other applications running, this could cause swapping and degraded performance. The process budget system (default 2 concurrent TUIs) is the primary mitigation.

### Technology Risks

#### R11: React 19 Stability

React 19 is the first major React release in over 2 years. Key concerns:

- React Compiler is opt-in but may have edge cases with complex component patterns
- `use()` hook and other new APIs have limited ecosystem testing in Tauri webview contexts
- Some popular libraries (date pickers, rich text editors) may lag in React 19 support
- shadcn/ui is React 19 compatible but individual components may have subtle issues
- React Compiler's automatic memoization may interact unexpectedly with Tauri's IPC bridge

Likelihood is Low because React 19 has been stable since late 2024 and the ecosystem has largely caught up by 2026.

#### R12: Tauri 2 Breaking Changes

Tauri 2 represents a major architectural shift from Tauri 1. Key Tauri plugins Lunaria depends on:

| Plugin | Maintainer | Risk Level |
|--------|-----------|------------|
| `tauri-plugin-sql` | Tauri team | Low — official |
| `tauri-plugin-notification` | Tauri team | Low — official |
| `tauri-plugin-updater` | Tauri team | Low — official |
| `tauri-plugin-pty` | Community | High — v0.2.1, may lag |
| `tray-icon` | Tauri team | Medium — platform-dependent |

Community-maintained plugins (especially `tauri-plugin-pty`) are the highest risk — they may not keep pace with Tauri core updates.

#### R13: Dependency Supply Chain

The project has a large dependency surface:

- **npm**: React, shadcn/ui, Zustand, react-i18next, Monaco, xterm.js, and transitive dependencies (likely 500+ packages)
- **Cargo**: Tauri, portable-pty, tray-icon, serde, tokio, and transitive dependencies (likely 200+ crates)
- **External binaries**: Claude Code, OpenCode, Codex CLI, Gemini CLI (not bundled, but invoked)

A compromised package at any level could affect all Lunaria users. The npm ecosystem has seen multiple supply chain attacks (event-stream, ua-parser-js, colors.js).

### Agent Runtime Risks

These risks stem from Lunaria's multi-agent architecture where agents spawn subagents, accumulate memory, and operate with delegated permissions.

#### R17: Vector DB Performance at Scale

As users accumulate observations over weeks and months of use, the vector index grows. HNSW indexes perform well up to ~100K vectors in memory, but beyond that, query latency increases and memory usage becomes significant. A power user with multiple projects could easily exceed this threshold within a few months of active use.

The primary concern is semantic search latency during agent context assembly — if observation retrieval takes >500ms, it noticeably degrades the agent response experience.

#### R18: Agent Loop Infinite Recursion

Multi-agent architectures are vulnerable to unbounded recursion: an agent spawns a subagent to handle a subtask, that subagent spawns another, and so on. Without hard limits, this can consume thousands of dollars in API tokens in minutes. The risk is amplified by autopilot-style workflows where agents operate with minimal human oversight.

Real-world precedent: Claude Code's own subagent system includes depth limits and cost caps precisely because this failure mode was observed during development.

#### R19: Memory Storage Unbounded Growth

Every agent session generates observations (code patterns, decisions, errors, concepts). Without retention policies, the SQLite database and vector index grow monotonically. On a developer machine with limited SSD space, this can become a significant resource concern — especially when multiple projects are active.

#### R20: Multi-Client Server Concurrency

When the Axum server handles simultaneous connections from desktop, web, and mobile clients, session state mutations can race. Two clients sending messages to the same session, or one client modifying settings while another reads them, creates classic concurrent access problems that are difficult to test comprehensively.

#### R21: Subagent Context Isolation

Agents running in the same process share the Tokio runtime and can potentially access each other's in-memory state if isolation boundaries are not strictly enforced. A malicious or buggy plugin could read observations or session data from another user's agent session.

#### R22: Permission Bypass in Agent-to-Agent Communication

When Agent A delegates a task to Agent B, Agent B should not be able to perform actions that Agent A is not authorized to do. Without capability attenuation (where child permissions are always a subset of parent permissions), a subagent becomes a privilege escalation vector.

### Credential and Auth Risks

#### R23: API Key Security in Credential Store

Provider API keys are high-value targets — a leaked Anthropic or OpenAI key can be used to run arbitrary model queries at the key owner's expense. OS keychains are generally secure, but malware with user-level permissions can often access keychain entries on macOS (with a prompt) and Linux (without a prompt, depending on the secret service implementation).

#### R26: OAuth Token Refresh Failures

OAuth tokens have finite lifetimes and can be revoked server-side at any time. When a token expires mid-session, the agent loses the ability to make API calls. If the refresh token is also expired or revoked, the user must re-authenticate manually — which interrupts automated workflows and can cause data loss if the agent was mid-operation.

### Infrastructure Risks (Continued)

#### R24: Provider Rate Limiting

Running multiple agents in parallel (e.g., team mode with 3 Claude agents and 2 OpenAI agents) can quickly exhaust provider rate limits. Anthropic's rate limits are per-API-key, so all agents sharing a key compete for the same quota. Rate limit errors cascade: one agent's retry storm can starve other agents of quota.

#### R25: CoW Clone Disk Cleanup

Copy-on-write clones and git worktrees are created for isolated agent workspaces. When agents crash, are force-killed, or the app exits unexpectedly, these clones remain on disk. Over time, orphaned clones accumulate and consume significant disk space — each clone can be tens of MB to several GB depending on the repository size.

### Operational Risks

#### R14: Certificate Management

Code signing certificates are a single point of failure for the release pipeline:

- Expired certificate → users can't install updates
- Compromised certificate → attacker can sign malicious updates
- Lost certificate → must re-establish trust chain with new certificate

The Apple Developer Program also requires annual renewal of the developer account itself, not just the certificate.

#### R15: CI/CD Pipeline Complexity

The build matrix is substantial:

| Platform | Architecture | Signing | Notarization | Format |
|----------|-------------|---------|--------------|--------|
| macOS | x64 | Yes | Yes (Apple) | .dmg |
| macOS | ARM64 | Yes | Yes (Apple) | .dmg |
| Windows | x64 | Yes | No | .msi/.exe |
| Windows | ARM64 | Yes | No | .msi/.exe |
| Linux | x64 | No | No | .AppImage/.deb |
| Linux | ARM64 | No | No | .AppImage/.deb |

Each build takes 5-15 minutes. Full matrix: 30-90 minutes. macOS notarization adds 5-10 minutes. GitHub Actions costs for macOS runners are 10× Linux runners.

#### R16: Open-Source Maintenance Burden

Maintaining a project that wraps 4 external tools creates a multiplicative maintenance burden:

- Each TUI release may break its adapter
- Bug reports must be triaged per TUI
- Documentation must cover 4 different setup flows
- Testing must cover 4 × 3 platform combinations = 12 test configurations
- Community contributions may be TUI-specific, requiring domain expertise to review

#### R27: Cross-Ecosystem Plugin Conflicts

Running plugins from both Claude Code and OpenCode ecosystems simultaneously creates conflict risks:

- Two plugins may register handlers for the same hook event with contradictory behavior (e.g., one auto-approves a tool, another blocks it)
- Plugin state namespaces could collide if not properly scoped by ecosystem
- MCP server configs imported from both ecosystems may reference the same server with different credentials

**Mitigation**: Plugin Ecosystem Manager enforces namespace isolation per plugin, runs conflict detection on hook registration, and surfaces conflicts in Settings > Plugins with resolution controls. Events fire handlers in declared priority order (user-configurable). Plugin health dashboard shows per-plugin error rates.

**Likelihood**: Medium. **Impact**: Medium. **Owner**: Plugin Ecosystem Manager.

#### R28: Local Model Quality Degradation

Small local models (0.6B-3B parameters) may produce low-quality outputs for tasks assigned via model routing:

- Title generation may produce generic or incorrect titles
- Compaction summaries may lose critical context
- Observation classification may miscategorize events

**Mitigation**: Quality scoring on local model outputs using a simple heuristic (length, relevance keywords, format validity). If quality drops below threshold, automatic fallback to cloud model for that task type. Users can override routing per task type. Default routing only assigns local models to the simplest tasks (title generation, commit messages). Settings > Providers > Model Routing shows quality metrics per task/model pair.

**Likelihood**: Medium. **Impact**: Low (graceful fallback to cloud). **Owner**: Provider Manager.

#### R29: Agent Profile Deduplication Errors

When the same logical agent (e.g., "build") exists in multiple ecosystems, deduplication logic may incorrectly merge distinct agents or show confusing duplicates:

- Claude Code's "build" agent and OpenCode's "build" agent have different system prompts and tool access
- Plugin-contributed agents (oh-my-claudecode's "executor" vs oh-my-opencode's equivalent) may overlap
- User expectations may vary on which ecosystem's agent takes precedence

**Mitigation**: Agent Profile Aggregator shows ecosystem source badge on every agent tab. When duplicates detected, shows one entry with source selector dropdown rather than auto-merging. Priority order: custom > plugin > ecosystem default > built-in. Users choose preferred definition in Settings > Agent Profiles. Per-ecosystem filtering in the AgentTabSwitcher allows hiding agents from specific ecosystems.

**Likelihood**: Low. **Impact**: Low. **Owner**: Agent Orchestrator.

---

## Risk Monitoring

### Review Cadence

| Phase | Frequency | Focus |
|-------|-----------|-------|
| MVP Development | Weekly | R1, R6, R7, R10, R12, R18, R19 (active development risks) |
| V1 Development | Bi-weekly | R3, R5, R14, R15, R21, R22, R23 (security and release risks) |
| V2+ Maintenance | Monthly | R6, R11, R12, R16, R17, R20, R24, R25, R26, R27, R28, R29 (ecosystem, plugin, and scale risks) |

### Risk Indicators (Early Warning Signs)

| Risk | Indicator | Monitoring Method |
|------|-----------|-------------------|
| R1 | TUI adapter test failures | CI test suite per TUI |
| R3 | Security vulnerability reports | GitHub Security Advisories, CVE feeds |
| R5 | Certificate expiration approaching | Calendar alerts at 90, 60, 30 days |
| R6 | Codex CLI release notes mention breaking changes | GitHub watch on openai/codex repo |
| R10 | User reports of high memory usage | In-app telemetry (opt-in), GitHub issues |
| R12 | Tauri release notes mention breaking changes | GitHub watch on tauri-apps/tauri repo |
| R13 | npm audit / cargo audit findings | CI pipeline checks on every build |
| R16 | Issue backlog growing, PR review time increasing | GitHub project metrics |
| R17 | Vector search latency exceeding 500ms p95 | In-app performance metrics, benchmark suite |
| R18 | Subagent spawn depth exceeding 3 levels in production | Agent runtime telemetry, depth counter |
| R19 | SQLite database size exceeding 200MB per project | Periodic storage usage scan, user reports |
| R20 | Race condition errors in concurrent client tests | Integration test suite with parallel clients |
| R21 | Cross-session data access attempts in audit log | Runtime audit log analysis, security alerts |
| R22 | Subagent performing actions outside parent scope | Permission check failure logs, audit trail |
| R23 | Keychain access errors or credential corruption reports | User bug reports, credential health check |
| R24 | Provider 429 responses exceeding 5% of requests | Per-provider rate limit tracking dashboard |
| R25 | Orphaned worktree disk usage exceeding 1GB | Background cleanup scan metrics |
| R26 | OAuth refresh failure rate exceeding 1% | Auth health check on session start, failure logs |
| R27 | Cross-ecosystem plugin conflicts causing silent data loss or duplicate actions | Plugin conflict detection tests, event handler audit logs |
| R28 | Local model inference quality too low for assigned tasks (bad titles, incorrect compaction) | Quality scoring on local model outputs, fallback to cloud threshold |
| R29 | Agent profile deduplication logic incorrectly merging distinct agents from different ecosystems | Agent profile integration tests with overlapping names across ecosystems |

### Escalation Path

1. **Low/Medium risks**: Tracked in GitHub Issues, addressed in normal sprint planning
2. **High risks**: Discussed in weekly team sync, assigned owner with deadline
3. **Critical risks**: Immediate response — stop feature work, address the risk, communicate to users if needed

---

## Appendix: Risk Heat Map

```
                    LIKELIHOOD
                Low         Medium        High
           ┌───────────┬───────────┬───────────┐
  Critical │ R13,R22   │ R3,R18   │           │
           │           │ R21      │           │
           ├───────────┼───────────┼───────────┤
  High     │ R11,R23   │ R10,R12  │  R1, R6   │
  SEVERITY │           │ R17,R20  │  R19      │
           │           │ R26      │           │
           ├───────────┼───────────┼───────────┤
  Medium   │           │ R2,R7,R9 │  R5, R8   │
           │           │ R14,R15  │  R16,R24  │
           │           │ R25      │           │
           ├───────────┼───────────┼───────────┤
  Low      │           │           │           │
           └───────────┴───────────┴───────────┘
```

**Priority Quadrant** (High Severity x High Likelihood): R1, R6, R16, R19 — these require the most attention and proactive mitigation.

**Watch List** (Critical Severity): R3, R13, R18, R21, R22 — low/medium likelihood but catastrophic if realized. Mitigations must be robust.

**New Risks** (R17-R26): Agent runtime, credential security, and infrastructure risks added to reflect the multi-agent architecture pivot and memory system design.

---

## Appendix: Risk Response Types

- **Avoid**: Eliminate the risk by changing the approach
- **Mitigate**: Reduce likelihood or impact through proactive measures
- **Transfer**: Shift risk to a third party (insurance, outsourcing)
- **Accept**: Acknowledge the risk and prepare contingency plans

All risks in this register use **Mitigate** as the primary response, with **Accept** + contingency plans for residual risk. R3 (Plugin Security) and R4 (Monaco CSP) are explicitly **Accepted** risks per user decision, with layered mitigations to reduce impact. R18 (Agent Loop) and R22 (Permission Bypass) use **Mitigate** with hard enforcement limits rather than soft guidance.

---

## Risk Review Log

| Date | Reviewer | Changes |
|------|----------|---------|
| 2026-03-08 | Initial | Created risk register with 10 core risks + 3 technology risks + 3 operational risks |
| 2026-03-10 | Architecture Pivot | Added 10 new risks (R17-R26) for agent runtime, credential security, and infrastructure concerns: vector DB performance, agent loop recursion, memory growth, multi-client concurrency, subagent isolation, permission bypass, API key security, provider rate limiting, CoW clone cleanup, OAuth refresh failures. Updated heat map, monitoring indicators, and review cadence. |
