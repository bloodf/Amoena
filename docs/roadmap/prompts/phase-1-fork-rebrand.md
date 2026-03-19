# Phase 1: Fork & Rebrand — Agent Prompt

## Mission

Fork superset-sh/superset and transform it into Lunaria. Strip all Superset branding, remove cloud dependencies, apply Lunaria's magenta design system, and produce a buildable Electron app that is visually and functionally Lunaria.

**Duration:** 1 week
**Prerequisite:** None (first phase)
**Deliverable:** Buildable, runnable Electron app with Lunaria branding and zero cloud dependencies

---

## Context

Lunaria is migrating from Tauri/Rust to Electron by forking Superset (superset-sh/superset, Electron v40.2.1, 7.4K stars). This is a strategic fork — Superset becomes Lunaria. There is no side-by-side operation.

### Key Technical Facts

- Superset uses: Bun 1.3.6, Turbo, Biome 2.4.2, electron-vite 4.0, TanStack Router v1, tRPC v11 via trpc-electron, TailwindCSS v4, Zustand v5, TanStack Query v5
- Superset has cloud deps: Electric SQL, Better Auth, Stripe, PostHog, Sentry, Neon PostgreSQL, Upstash, Vercel Blob/KV, Resend
- License: Lunaria adopts Elastic-2.0 (matching Superset)
- Data layer decision: Replace Electric SQL with tRPC subscriptions + @tanstack/react-query

---

## Repository Model

This migration creates a NEW repository from a Superset fork. The relationship:

```
EXISTING (read-only source):
  /Users/heitor/Developer/github.com/Lunaria/lunaria/
  ├── apps/desktop/src-tauri/src/  ← Rust source (to be ported in Phase 3)
  ├── packages/i18n/               ← Copy to new repo in Phase 2
  ├── packages/tokens/             ← Copy to new repo in Phase 2
  └── packages/ui/                 ← Reference for Lunaria components

NEW (your working directory after clone):
  lunaria-desktop/ (cloned from superset-sh/superset)
  ├── apps/desktop/                ← Electron app (being rebranded)
  ├── packages/                    ← Superset packages (being extended)
  └── ...
```

After Phase 1 completes, ALL subsequent phases operate inside the NEW repo (lunaria-desktop/).
The old Lunaria repo is only used as a read-only source for copying assets and reading Rust code.

---

## Execution Rules

1. **Commit after every completed step** — never batch multiple steps into one commit
2. **Use conventional commits**: `feat(lunaria): <step description>`
3. **Run `bun run build` before each commit** — never commit broken code
4. **If a step fails, fix it before moving on** — don't skip and come back later
5. **Read files before editing them** — use the Read tool to understand existing code before making changes

---

## Step-by-Step Instructions

### 1.1 Repository Setup

```bash
# Clone Superset into a new directory
git clone https://github.com/superset-sh/superset.git lunaria-desktop
cd lunaria-desktop

# Remove cloud-only apps
rm -rf apps/admin apps/api apps/marketing apps/web apps/streams apps/electric-proxy

# Remove cloud packages
rm -rf packages/auth packages/db packages/email

# Remove cloud tooling
rm -rf tooling/

# Keep everything else:
# apps/desktop, apps/docs, apps/mobile
# packages/chat, packages/desktop-mcp, packages/host-service, packages/local-db,
# packages/macos-process-metrics, packages/mcp, packages/scripts, packages/shared,
# packages/trpc, packages/ui, packages/workspace-fs
```

### 1.2 Branding Strip & Replace

Perform global find-and-replace across the entire codebase. This is a comprehensive 38-item checklist:

| Find                             | Replace With             |
| -------------------------------- | ------------------------ |
| `"Superset"` (product name)      | `"Lunaria"`              |
| `"superset"` (lowercase)         | `"lunaria"`              |
| `@superset/` (package scope)     | `@lunaria/`              |
| `superset://` (deep link)        | `lunaria://`             |
| `sh.superset.app` (macOS bundle) | `com.lunaria.app`        |
| `com.superset.desktop` (app ID)  | `com.lunaria.desktop`    |
| `superset.sh` (domain)           | Update to Lunaria domain |
| `.superset/` (config dir)        | `.lunaria/`              |
| `Superset/x.x.x` (user agent)    | `Lunaria/x.x.x`          |
| `superset-sh/superset` (repo)    | `Lunaria/lunaria`        |

**Additional branding files to update:**

- `apps/desktop/electron-builder.ts` — appId, productName, protocols
- `apps/desktop/package.json` — name, productName, description, author
- Root `package.json` — name, description, homepage
- `apps/desktop/src/main/` — window titles, tray tooltips, about dialog
- `apps/desktop/src/renderer/` — all UI references to "Superset"
- `.desktop` file (Linux), installer GUID (Windows)
- Icon assets: replace with Lunaria magenta moon icon (`.icns`, `.ico`, `.svg`, `.png`). For icon assets: generate a simple placeholder magenta moon SVG icon. Use a circle with a crescent cutout in magenta (#B800B8). Convert to .icns (macOS), .ico (Windows), and .png (various sizes: 16, 32, 64, 128, 256, 512, 1024) using the `png2icons` npm package or similar. The exact icon design will be refined later — the goal is a recognizable placeholder that is clearly NOT the Superset icon.
- Favicon, splash screen, dock icon

### 1.3 Remove Cloud Dependencies

**From `apps/desktop/package.json`, remove:**

```
@electric-sql/client
@tanstack/db
@tanstack/electric-db-collection
@tanstack/react-db
@better-auth/stripe
better-auth
@sentry/electron
@outlit/browser
@outlit/node
```

**From root `package.json`, remove resolutions for cloud packages.**

**In source code:**

1. Find all imports of `@electric-sql/*`, `@tanstack/db`, `@tanstack/react-db` in renderer
2. Replace with `@tanstack/react-query` hooks (`useQuery`, `useMutation`, `useQueryClient`)
3. Components that used Electric SQL subscriptions now call tRPC queries with polling or subscriptions
4. Remove Better Auth flows — replace with local API key storage for AI providers
5. Remove Sentry initialization — replace with structured logging to `~/.lunaria/logs/`
6. Remove PostHog/Outlit analytics calls
7. Remove Stripe billing checks/paywalls

**Key files to modify:**

- `apps/desktop/src/renderer/routes/__root.tsx` — remove auth providers
- `apps/desktop/src/renderer/routes/_authenticated/` — remove cloud auth guard (or make it local-only)
- `apps/desktop/src/main/host-service/` — remove cloud API connections
- `packages/host-service/src/providers/auth/` — simplify to local-only
- `packages/host-service/src/providers/model-providers/` — keep local provider, remove cloud

### 1.4 Theme System Migration

**Replace Superset's theme with Lunaria's magenta system:**

Create/update `apps/desktop/src/renderer/styles/globals.css`:

```css
:root {
  --primary: 300 100% 36%; /* magenta */
  --primary-foreground: 0 0% 100%;
  --background: 270 10% 6%; /* deep purple-black */
  --foreground: 0 0% 95%;
  --card: 270 8% 10%; /* surface-0 */
  --card-foreground: 0 0% 95%;
  --muted: 270 8% 14%; /* surface-1 */
  --muted-foreground: 0 0% 60%;
  --accent: 270 8% 18%; /* surface-2 */
  --accent-foreground: 0 0% 95%;
  --border: 270 8% 20%;
  --ring: 300 100% 36%; /* magenta focus ring */

  /* Lunaria-specific tokens */
  --surface-0: 270 8% 10%;
  --surface-1: 270 8% 14%;
  --surface-2: 270 8% 18%;
  --surface-3: 270 8% 22%;
  --tui-claude: 20 70% 60%;
  --tui-codex: 160 70% 40%;
  --tui-gemini: 220 70% 55%;
  --tui-opencode: 0 0% 100%;
}

@keyframes pulse-magenta {
  0%,
  100% {
    box-shadow: 0 0 0px hsla(300, 100%, 36%, 0.3);
  }
  50% {
    box-shadow: 0 0 12px hsla(300, 100%, 36%, 0.6);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes waveform {
  0%,
  100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}
```

### 1.5 Create DESIGN.md

Create `DESIGN.md` at the project root documenting the design system:

- Colors (magenta primary, purple-tinted surfaces, agent colors)
- Typography (system font stack, scale)
- Spacing (Tailwind v4 defaults)
- Animations (pulse-magenta, shimmer, waveform, node-appear, phase-glow)
- Border radius, shadows
- Component patterns

### 1.6 Verify Build

```bash
bun install
bun run build
# Should produce dist/ with runnable Electron app
# Verify: opens with Lunaria branding, no cloud errors in console
```

---

## Acceptance Criteria

- [ ] All references to "Superset" replaced with "Lunaria"
- [ ] Package scope is `@lunaria/*`
- [ ] Deep link protocol is `lunaria://`
- [ ] Config directory is `.lunaria/`
- [ ] All cloud dependencies removed (no Electric SQL, Better Auth, Stripe, etc.)
- [ ] Components that used Electric SQL now use tRPC + react-query
- [ ] Magenta theme applied (primary color, surfaces, animations)
- [ ] Lunaria icon assets in place (icns, ico, svg, png)
- [ ] DESIGN.md created
- [ ] App builds successfully with `bun run build`
- [ ] App launches and displays Lunaria branding
- [ ] No cloud connection errors in console
- [ ] No references to superset.sh, PostHog, Sentry, Stripe in built output

---

## Files to Touch (Estimated)

~50-80 files across branding + cloud removal + theme. The largest effort is the Electric SQL → react-query migration in renderer components.

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

### Cloud Removal Errors

- If imports reference `@electric-sql/*`, `@tanstack/db`, `@tanstack/react-db`, `better-auth`, or `@sentry/*`: remove the import and replace with a stub or alternative
- If a component depends on Electric SQL subscriptions: replace with `useQuery` from `@tanstack/react-query` calling the equivalent tRPC procedure
- If `bun install` fails on resolution: check root package.json `resolutions` field and remove entries for deleted packages
