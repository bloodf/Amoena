# Phase 2 — Shareable Reports

> Paste this entire file into a Codex GUI session. It is self-contained.
> No other files are needed to begin implementation.

---

## RALPH LOOP INSTRUCTIONS

You are operating in **Ralph Mode** — a persistence loop that keeps working until ALL tasks are
verified complete. You do NOT stop when you think you're done. You stop when the EVIDENCE proves
you're done.

### Core Rules

1. **Never declare done without evidence.** After implementing, run the relevant verification
   (tests, build, typecheck) and READ the output. "Should work" is not evidence. Green output is.

2. **Self-correct on failure.** If a test fails, a build breaks, or typecheck errors — FIX IT
   and re-run. Do not ask for help unless you have tried 3 different approaches.

3. **No scope reduction.** Implement ALL acceptance criteria listed below. Do not skip edge cases,
   error handling, or tests.

4. **Track progress.** After completing each criterion, note it as DONE. Log iterations to
   `progress.txt` in your branch root.

5. **Iterate until green.** Loop: IMPLEMENT → VERIFY → FIX → VERIFY → ALL GREEN → DONE.

### Iteration Protocol

```
ITERATION N:
  1. Read the acceptance criteria below
  2. Identify which criteria are NOT yet met
  3. Implement the next unmet criterion
  4. Run verification:
     - npm run build          (must pass)
     - npm run test           (must pass)
     - npx tsc --noEmit       (must pass)
  5. Read the output. If ANY check fails:
     - Diagnose the failure
     - Fix the root cause
     - Go to step 4
  6. Mark criterion DONE
  7. If more criteria remain, go to step 2
  8. If ALL criteria are DONE, proceed to Final Verification
```

### Final Verification

```bash
npm run build
npm run test
npx tsc --noEmit
npm run lint
```

Read EVERY line of output. Only declare complete when all four pass.

### Completion Promise

When truly done, output EXACTLY:

```
RALPH COMPLETE ✓
- All acceptance criteria verified with evidence
- Build: PASS
- Tests: PASS
- TypeScript: PASS
- Files changed: [list]
- Iterations: [N]
```

### Failure Escalation

After hitting the same error 3 times with different approaches, output:

```
RALPH BLOCKED
- Error: [description]
- Attempted: [approach 1], [approach 2], [approach 3]
- Root cause hypothesis: [your best guess]
- Recommended action: [what the human should do]
```

---

## CONTEXT

**Project:** Lunaria — Multi-agent orchestration platform
**Phase:** 2 (Intelligence Layer)
**Tech stack:** TypeScript, Next.js (App Router), better-sqlite3, Vitest, React
**Branch to create:** `feature/mission-control-templates-reports`
**Same branch as:** `03-goal-templates.md` — coordinate if running simultaneously

### What Shareable Reports do

After a goal run completes, users can export a self-contained report of the run for sharing
with teammates, adding to documentation, or archiving. Two formats:

- **HTML**: Single file, inline CSS, no external dependencies. Opens in any browser.
- **Markdown**: GitHub-Flavored Markdown, suitable for GitHub issues, Notion, Confluence.

Critical requirement: **secrets must be scrubbed before export**. The report content passes
through a scrubber that strips API key patterns, .env variable values, and credential file paths
before writing the output.

### Prerequisite: Phase 1 tables

```sql
CREATE TABLE IF NOT EXISTS goal_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_id         TEXT NOT NULL,
  goal_title      TEXT NOT NULL,
  status          TEXT NOT NULL,
  task_count      INTEGER NOT NULL DEFAULT 0,
  tasks_succeeded INTEGER NOT NULL DEFAULT 0,
  total_cost      REAL NOT NULL DEFAULT 0,
  total_duration_ms INTEGER NOT NULL DEFAULT 0,
  started_at      INTEGER NOT NULL,
  completed_at    INTEGER,
  workspace_id    INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS task_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_run_id     INTEGER NOT NULL REFERENCES goal_runs(id),
  task_id         TEXT NOT NULL,
  task_title      TEXT NOT NULL,
  task_type       TEXT NOT NULL,
  agent_id        TEXT NOT NULL,
  status          TEXT NOT NULL,
  duration_ms     INTEGER NOT NULL DEFAULT 0,
  cost            REAL NOT NULL DEFAULT 0,
  complexity      TEXT NOT NULL DEFAULT 'M',
  error_message   TEXT,
  routing_reason  TEXT,          -- why this agent was chosen
  started_at      INTEGER NOT NULL,
  completed_at    INTEGER,
  workspace_id    INTEGER NOT NULL DEFAULT 1
);
```

Note: `error_message` and `routing_reason` columns may not exist if Phase 1 did not add them.
Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` or handle `undefined` values gracefully.

### Database access pattern

```typescript
import { getDatabase } from "@/lib/db";

const db = getDatabase();
const row = db.prepare("SELECT ...").get(id) as SomeType | undefined;
```

### File locations

```
apps/dashboard/src/
  app/api/mission-control/
    runs/[id]/export/route.ts     ← POST to generate export
  lib/
    report-exporter.ts            ← HTML + Markdown generators + scrubber
    secret-scrubber.ts            ← secret detection and replacement
  components/panels/mission-control/
    (no new panel — add Share button to existing RunReport component if it exists,
     or create a standalone ShareButton component)
    share/
      ShareButton.tsx             ← trigger button + format selector dialog
      index.ts                    ← re-exports
```

---

## SECRET SCRUBBING SPECIFICATION

This is the most security-critical part of this feature. Implement it as a pure function
`scrubSecrets(text: string): string` in `apps/dashboard/src/lib/secret-scrubber.ts`.

### Patterns to scrub (replace with `[REDACTED]`)

**API key patterns:**
```
/sk-[A-Za-z0-9]{20,}/g              // OpenAI / Anthropic style keys
/ghp_[A-Za-z0-9]{36}/g             // GitHub personal access tokens
/ghs_[A-Za-z0-9]{36}/g             // GitHub Actions tokens
/glpat-[A-Za-z0-9\-]{20,}/g        // GitLab PATs
/xoxb-[0-9]+-[0-9]+-[A-Za-z0-9]+/g // Slack bot tokens
/xoxp-[0-9]+-[0-9]+-[0-9]+-[A-Za-z0-9]+/g // Slack user tokens
/AKIA[0-9A-Z]{16}/g                 // AWS Access Key IDs
/[0-9a-zA-Z/+]{40}/g               // AWS Secret Access Keys (40-char base64) — only when preceded by "AWS_SECRET" context
```

**Environment variable value patterns** (line-level scrub):
```
// Any line matching: KEY=value where KEY looks like an env var name
/^([A-Z_][A-Z0-9_]*\s*=\s*)(.+)$/gm
// Replace with: KEY=[REDACTED]
// Exception: keep lines where value is clearly non-secret:
//   value is "true", "false", "1", "0", a plain integer, or a relative file path with no slashes at start
```

**Credential file paths:**
```
/\/[^\s]*\/(\.env[^\s]*|credentials|\.aws\/credentials|\.ssh\/[^\s]+|\.netrc)/g
// Replace with: [CREDENTIAL_PATH_REDACTED]
```

**Generic high-entropy strings** (conservative approach — only if clearly a secret):
```
// Bearer token headers:
/(Authorization:\s*Bearer\s+)[^\s]+/gi
// Replace with: Authorization: Bearer [REDACTED]

// Basic auth headers:
/(Authorization:\s*Basic\s+)[^\s]+/gi
// Replace with: Authorization: Basic [REDACTED]
```

### Scrubber contract

```typescript
export interface ScrubResult {
  text: string;
  redaction_count: number;
  patterns_matched: string[];  // which pattern names fired
}

export function scrubSecrets(input: string): ScrubResult {
  // Apply all patterns in order
  // Return scrubbed text + metadata
}
```

The scrubber must be a pure function with no side effects. It does not read from the filesystem
or database.

---

## REPORT DATA SHAPE

Define in `apps/dashboard/src/lib/report-exporter.ts`:

```typescript
export interface ReportData {
  goal: {
    id: string;
    title: string;
    status: string;
    task_count: number;
    tasks_succeeded: number;
    total_cost: number;
    total_duration_ms: number;
    started_at: number;      // unix epoch
    completed_at: number;    // unix epoch
  };
  tasks: Array<{
    task_id: string;
    title: string;
    type: string;
    agent_id: string;
    status: string;
    duration_ms: number;
    cost: number;
    complexity: string;
    routing_reason?: string;
    error_message?: string;
    started_at: number;
    completed_at?: number;
  }>;
  generated_at: string;  // ISO timestamp of export
  lunaria_version: string;
}
```

---

## ACCEPTANCE CRITERIA

### AC-1: Export API endpoint

`POST /api/mission-control/runs/[id]/export` with body `{ format: "html" | "markdown" }`:

- Fetches the goal run and all task runs from the DB
- Passes all text content through `scrubSecrets`
- Generates the export using `generateHtmlReport` or `generateMarkdownReport`
- Returns:
  ```typescript
  {
    filename: string;      // e.g. "lunaria-report-goal-title-2026-03-23.html"
    content: string;       // the full file content
    format: "html" | "markdown";
    redaction_count: number;
  }
  ```
- Returns 404 `{ error: "Run not found" }` if the run ID does not exist
- Returns 400 `{ error: "Invalid format" }` if format is not "html" or "markdown"

Filename sanitization: replace spaces and special characters in goal title with hyphens,
lowercase, max 50 chars.

### AC-2: HTML report generation

`generateHtmlReport(data: ReportData): string` returns a complete HTML document string.

Structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lunaria Report — [goal title]</title>
  <style>/* ALL CSS INLINE HERE — no external stylesheets, no CDN links */</style>
</head>
<body>
  <!-- Header: Lunaria wordmark, goal title, generated date -->
  <!-- Summary card: status, tasks succeeded/total, total cost, total duration -->
  <!-- Timeline: task list with agent, status, duration, cost per row -->
  <!-- Footer: "Generated by Lunaria" + timestamp -->
</body>
</html>
```

Requirements:
- Zero external URLs (no CDN CSS, no Google Fonts, no external images)
- All CSS in a single `<style>` block in `<head>`
- Dark color scheme matching Lunaria dashboard: `#111827` body bg, `#1f2937` card bg,
  `#f9fafb` primary text, `#9ca3af` secondary text
- Task status icons: use HTML entities or inline SVG — not emoji (for email compatibility)
  - success: `&#10003;` (checkmark)
  - failed: `&#10007;` (cross)
  - skipped: `&#8854;` (circled minus)
- Agent routing reason shown in a collapsible `<details>` element per task (if present)
- Cost formatted as "$0.0034", duration as "1.2s" or "340ms"

### AC-3: Markdown report generation

`generateMarkdownReport(data: ReportData): string` returns a GitHub-Flavored Markdown string.

Structure:
```markdown
# Lunaria Run Report: [goal title]

**Status:** completed
**Generated:** 2026-03-23 14:32 UTC
**Run duration:** 4m 12s
**Total cost:** $0.0234

## Summary

| Metric | Value |
|--------|-------|
| Tasks succeeded | 8/10 |
| Total cost | $0.0234 |
| Duration | 4m 12s |
| Success rate | 80% |

## Task Breakdown

| Task | Type | Agent | Status | Duration | Cost |
|------|------|-------|--------|----------|------|
| Write unit tests | test | claude-code | ✓ success | 45s | $0.004 |
| ... | | | | | |

## Agent Routing

> **write-unit-tests:** Assigned to claude-code because task type is "test" and claude-code
> has 94% success rate on test tasks.

[Generated by Lunaria]
```

- GFM tables with pipe syntax
- Routing reasons in a blockquote section (only if at least one task has routing_reason)
- Error messages shown for failed tasks in a code block under the task row

### AC-4: Secret scrubbing is applied

The export API must call `scrubSecrets` on the generated report content before returning it.
The `redaction_count` from the scrub result must be included in the API response.

Test with planted secrets (see AC-8 test cases).

### AC-5: ShareButton component

`ShareButton` props:
```typescript
interface ShareButtonProps {
  runId: number;
  goalTitle: string;
  className?: string;
}
```

Renders:
- A "Share" or "Export" button (outline style)
- On click: opens a small popover/dialog with two options:
  - "Export as HTML" (with download icon)
  - "Export as Markdown" (with download icon)
- On format selection:
  - Calls `POST /api/mission-control/runs/[runId]/export`
  - Shows loading state ("Generating...")
  - On success: triggers browser file download using `URL.createObjectURL` + `<a download>`
  - On error: shows inline error message "Export failed, please try again"
- Loading and error states are visible — do not silently fail

### AC-6: Filename is sanitized

The filename returned by the API must:
- Be lowercase
- Contain only `a-z`, `0-9`, and `-`
- Start with `lunaria-report-`
- Include the goal title (sanitized) and date
- End with `.html` or `.md`
- Not exceed 80 characters total

Example: `lunaria-report-add-test-coverage-2026-03-23.html`

### AC-7: Tests pass

Test files:
- `apps/dashboard/src/lib/secret-scrubber.test.ts`
- `apps/dashboard/src/lib/report-exporter.test.ts`
- `apps/dashboard/src/components/panels/mission-control/share/ShareButton.test.tsx`

Required test cases for `secret-scrubber.test.ts`:
- `scrubs OpenAI-style sk- API keys`
- `scrubs GitHub personal access tokens (ghp_)`
- `scrubs GitHub Actions tokens (ghs_)`
- `scrubs AWS Access Key IDs (AKIA...)`
- `scrubs Slack bot tokens (xoxb-)`
- `scrubs env var values: API_KEY=abc123`
- `does NOT scrub non-secret env vars: PORT=3000, DEBUG=true`
- `scrubs .env file paths`
- `scrubs .ssh credential paths`
- `scrubs Bearer authorization headers`
- `scrubs Basic authorization headers`
- `returns correct redaction_count`
- `returns names of patterns that matched`
- `handles empty string input`
- `handles string with no secrets (returns unchanged)`

Required test cases for `report-exporter.test.ts`:
- `generateHtmlReport returns a complete HTML document`
- `generateHtmlReport includes goal title in <title>`
- `generateHtmlReport includes all tasks in timeline`
- `generateHtmlReport formats cost as $X.XXXX`
- `generateHtmlReport formats duration as Xs or Xms`
- `generateHtmlReport includes routing reasons in <details>`
- `generateMarkdownReport returns valid markdown string`
- `generateMarkdownReport includes GFM table for task breakdown`
- `generateMarkdownReport includes routing section when routing_reason present`
- `generateMarkdownReport omits routing section when no routing_reason`
- `both generators handle tasks with undefined routing_reason and error_message`

Required test cases for `ShareButton.test.tsx`:
- `renders Export button`
- `shows format options on click`
- `calls POST /api/mission-control/runs/[id]/export with correct format`
- `shows loading state while exporting`
- `triggers file download on success`
- `shows error message on API failure`

### AC-8: TypeScript strict compliance

- No `any` types except raw SQLite row casts
- `scrubSecrets` is typed with `ScrubResult` return type (no `any`)
- All props and interfaces exported from appropriate `index.ts` files
- `npx tsc --noEmit` passes with zero errors

---

## IMPLEMENTATION NOTES

### Report exporter module structure

```typescript
// apps/dashboard/src/lib/report-exporter.ts

import { scrubSecrets, ScrubResult } from "./secret-scrubber";

export function generateHtmlReport(data: ReportData): string {
  const raw = buildHtmlString(data);
  const { text } = scrubSecrets(raw);
  return text;
}

export function generateMarkdownReport(data: ReportData): string {
  const raw = buildMarkdownString(data);
  const { text } = scrubSecrets(raw);
  return text;
}

// Keep builders as separate private functions for testability
function buildHtmlString(data: ReportData): string { ... }
function buildMarkdownString(data: ReportData): string { ... }
```

### File download in browser

```typescript
function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

### Duration formatting

```typescript
function formatDurationMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return `${m}m ${rem}s`;
}
```

### Cost formatting

```typescript
function formatCost(cost: number): string {
  if (cost === 0) return "$0.00";
  if (cost < 0.001) return `$${cost.toFixed(6)}`;
  if (cost < 0.01)  return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}
```

### Styling conventions

`ShareButton` follows existing panel UI: Tailwind CSS, `bg-gray-900` background,
`border-gray-700` border. Button: `px-3 py-1.5 text-sm border border-gray-600 rounded-md
hover:border-gray-400 transition-colors`.

### No new dependencies

Do not add new npm packages. Use only what is already installed:
React, Tailwind, better-sqlite3, Vitest, React Testing Library.
The HTML and Markdown generators use only template strings — no templating libraries.

---

## VERIFICATION COMMANDS

```bash
# From repo root
npm run build
npm run test -- --testPathPattern="report-exporter|secret-scrubber|ShareButton"
npx tsc --noEmit
npm run lint
```

All must pass before declaring complete.
