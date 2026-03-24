# Phase 2 — Prompt 10: Shareable Reports

## RALPH LOOP INSTRUCTIONS

You are running in an autonomous loop. These rules are non-negotiable:

1. **Never declare done without evidence.** Every claim of completion must be backed by passing test output or a build log you actually ran. Do not say "this should work" — run it and show the output.
2. **Self-correct on failure.** If a test fails, a type error fires, or a command errors, fix the root cause and re-run. Do not move on with known failures.
3. **No scope reduction.** If something is hard, find a way. Do not silently drop acceptance criteria because they seem difficult.
4. **Iterate until green.** Keep looping — fix, verify, fix, verify — until every acceptance criterion in this document is met. Then stop.
5. **Show your work.** After each significant step, output the verification command and its result.

---

## Component Overview

Build the Shareable Reports feature — the ability to export run reports as HTML documents, Markdown files, or JSON payloads, with an integrated secret scrubber that redacts API keys, tokens, and other sensitive data before export. This is the final piece that makes Mission Control useful for team collaboration.

---

## Repository Context

- **Monorepo root:** `/Users/heitor/Developer/github.com/Lunaria/lunaria`
- **Run reporter (Phase 1):** `apps/dashboard/src/lib/run-reporter.ts` — exports `RunReport`, `renderMarkdown()`, `generateReport()`
- **Telemetry (Phase 1):** `apps/dashboard/src/lib/mission-control-telemetry.ts`
- **Mission Control UI (Phase 1):** `apps/dashboard/src/components/panels/mission-control/`
- **i18n:** `next-intl` v4.8.3
- **Package manager:** Bun
- **Test framework:** Vitest v2.1.5

---

## What to Build

### 1. Secret scrubber module

Create `apps/dashboard/src/lib/secret-scrubber.ts`

### 2. Report exporter module

Create `apps/dashboard/src/lib/report-exporter.ts`

### 3. Share UI components

Create `apps/dashboard/src/components/panels/mission-control/share/`

### 4. Tests

---

## Secret Scrubber (secret-scrubber.ts)

### Types

```typescript
export interface ScrubResult {
  /** The scrubbed text */
  text: string;
  /** Number of secrets found and redacted */
  redactedCount: number;
  /** Types of secrets found (for reporting) */
  redactedTypes: SecretType[];
}

export type SecretType =
  | "api_key"
  | "bearer_token"
  | "password"
  | "private_key"
  | "connection_string"
  | "aws_key"
  | "github_token"
  | "generic_secret";

export interface ScrubOptions {
  /** Replacement text (default: "[REDACTED]") */
  replacement?: string;
  /** Additional custom patterns to scrub */
  customPatterns?: RegExp[];
  /** Preserve length hint (show "[REDACTED:32chars]" instead of "[REDACTED]") */
  showLengthHint?: boolean;
}
```

### Functions

```typescript
/** Scrub all secrets from a string */
export function scrubSecrets(
  text: string,
  options?: ScrubOptions,
): ScrubResult

/** Scrub all string fields in a RunReport recursively */
export function scrubReport(
  report: RunReport,
  options?: ScrubOptions,
): { report: RunReport; totalRedacted: number; types: SecretType[] }

/** Check if a string contains potential secrets (without scrubbing) */
export function containsSecrets(text: string): boolean
```

### Secret Patterns

The scrubber must detect these patterns (at minimum):

```typescript
const SECRET_PATTERNS: Array<{ type: SecretType; pattern: RegExp }> = [
  // API Keys (generic)
  { type: "api_key", pattern: /\b[A-Za-z0-9_-]{20,}(?:key|api|token|secret)[A-Za-z0-9_-]*\b/gi },

  // Anthropic API key
  { type: "api_key", pattern: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g },

  // OpenAI API key
  { type: "api_key", pattern: /\bsk-[A-Za-z0-9]{20,}\b/g },

  // Bearer tokens
  { type: "bearer_token", pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}\b/g },

  // GitHub tokens
  { type: "github_token", pattern: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b/g },

  // AWS keys
  { type: "aws_key", pattern: /\b(AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { type: "aws_key", pattern: /\b[A-Za-z0-9/+=]{40}\b(?=.*aws)/gi },

  // Private keys (PEM)
  { type: "private_key", pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(RSA\s+)?PRIVATE\s+KEY-----/g },

  // Connection strings
  { type: "connection_string", pattern: /\b(postgres|mysql|mongodb|redis):\/\/[^\s'"]+/g },

  // Generic secrets (key=value patterns)
  { type: "generic_secret", pattern: /(?:password|secret|token|api[_-]?key|auth)\s*[=:]\s*['"]?[A-Za-z0-9._~+/=-]{8,}['"]?/gi },

  // Base64 encoded strings that look like secrets (>40 chars, high entropy)
  { type: "generic_secret", pattern: /\b[A-Za-z0-9+/]{40,}={0,2}\b/g },

  // Google API key
  { type: "api_key", pattern: /\bAIza[A-Za-z0-9_-]{35}\b/g },
];
```

### Scrubbing Rules

1. Apply all patterns to the input text
2. For overlapping matches, take the longest match
3. Replace with `options.replacement` (default `"[REDACTED]"`)
4. If `showLengthHint`, replace with `"[REDACTED:{N}chars]"` where N is the original length
5. Track each unique `SecretType` found
6. Return the scrubbed text + metadata

### Deep Report Scrubbing

`scrubReport()` must recursively walk all string fields in the `RunReport` object:
- `goalDescription`
- `taskBreakdown[].description`
- `taskBreakdown[].errorMessage`
- `taskBreakdown[].routingReason`
- `taskBreakdown[].whyThisAgent`
- `routingInsights[].explanation`
- `routingInsights[].improvementHint`
- `issues[].message`
- `mergeInfo` fields

Do NOT scrub non-sensitive fields like `goalId`, `taskId`, `agentType`, `status`, numeric fields.

---

## Report Exporter (report-exporter.ts)

### Types

```typescript
export type ExportFormat = "html" | "markdown" | "json";

export interface ExportOptions {
  /** Format to export */
  format: ExportFormat;
  /** Whether to scrub secrets before export (default: true) */
  scrubSecrets?: boolean;
  /** Include raw JSON in HTML export (default: false) */
  includeRawJson?: boolean;
  /** Custom title override */
  title?: string;
  /** Whether to include the Lunaria branding footer (default: true) */
  includeBranding?: boolean;
}

export interface ExportResult {
  /** The exported content as a string */
  content: string;
  /** MIME type for the content */
  mimeType: string;
  /** Suggested filename */
  filename: string;
  /** Number of secrets scrubbed (0 if scrubbing disabled) */
  secretsRedacted: number;
}
```

### Functions

```typescript
/** Export a run report in the specified format */
export function exportReport(
  report: RunReport,
  options: ExportOptions,
): ExportResult

/** Export to HTML with styled template */
function exportHtml(report: RunReport, options: ExportOptions): string

/** Export to Markdown (uses existing renderMarkdown + scrubbing) */
function exportMarkdown(report: RunReport, options: ExportOptions): string

/** Export to JSON (pretty-printed) */
function exportJson(report: RunReport, options: ExportOptions): string
```

### HTML Template

The HTML export must be a self-contained, styled document:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mission Control Report: {goal_description}</title>
  <style>
    /* Inline CSS — no external dependencies */
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; background: #0f0f0f; color: #e0e0e0; }
    h1 { color: #fff; border-bottom: 2px solid #333; padding-bottom: 12px; }
    .status-completed { color: #4caf50; }
    .status-failed { color: #f44336; }
    .status-partial { color: #ff9800; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { padding: 8px 12px; border: 1px solid #333; text-align: left; }
    th { background: #1a1a1a; }
    .metric-card { display: inline-block; background: #1a1a1a; border-radius: 8px; padding: 16px; margin: 8px; min-width: 150px; }
    .metric-value { font-size: 24px; font-weight: bold; }
    .metric-label { color: #999; font-size: 14px; }
    .agent-claude { border-left: 3px solid #FF6B35; }
    .agent-codex { border-left: 3px solid #00C853; }
    .agent-gemini { border-left: 3px solid #2196F3; }
    .issue-warning { background: #332b00; padding: 8px; border-radius: 4px; margin: 4px 0; }
    .issue-error { background: #330000; padding: 8px; border-radius: 4px; margin: 4px 0; }
    .redacted { background: #440000; color: #ff6666; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #333; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <!-- Rendered report content -->
  <footer>Generated by Lunaria Mission Control • {timestamp}</footer>
</body>
</html>
```

The HTML renderer must include:
- Header with goal description, status badge, duration, cost
- Summary metrics cards
- Agent performance table
- Task breakdown table
- Routing insights (with `couldImprove` highlighted)
- Issues section
- Scrubbed secrets are wrapped in `<span class="redacted">[REDACTED]</span>`

### Filename Generation

```
lunaria-report-{goalId-first8}-{date}.{ext}
e.g. lunaria-report-a1b2c3d4-2026-03-23.html
```

---

## UI Components

### Directory Structure

```
apps/dashboard/src/components/panels/mission-control/share/
  index.tsx                     # SharePanel — main share UI
  ExportButton.tsx             # Export dropdown button
  ExportPreview.tsx            # Preview before export
  SecretWarning.tsx            # Warning when secrets detected
  ShareHistory.tsx             # List of previous exports (optional)
```

### SharePanel (index.tsx)

- Integrated into the post-run report view (Phase 1's RunReport)
- Shows export options and preview

### ExportButton

```typescript
interface ExportButtonProps {
  report: RunReport;
  onExport: (result: ExportResult) => void;
}
```

- Dropdown button with 3 options: "Export HTML", "Export Markdown", "Export JSON"
- Each option triggers the export and calls `onExport`
- If secrets detected, shows `SecretWarning` before proceeding
- Triggers browser download via `URL.createObjectURL` + anchor click

### ExportPreview

```typescript
interface ExportPreviewProps {
  content: string;
  format: ExportFormat;
  onConfirm: () => void;
  onCancel: () => void;
}
```

- Shows a preview of the exported content
- HTML format: rendered in an iframe (sandboxed)
- Markdown format: rendered as `<pre>` block
- JSON format: rendered as syntax-highlighted `<pre>` block
- "Download" and "Cancel" buttons

### SecretWarning

```typescript
interface SecretWarningProps {
  redactedCount: number;
  redactedTypes: SecretType[];
  onProceed: () => void;
  onCancel: () => void;
}
```

- Warning banner: "⚠ {N} potential secrets detected and will be redacted"
- Lists the types of secrets found
- "Proceed with Redaction" (primary) and "Cancel" buttons
- Checkbox: "Don't warn me again" (persisted to localStorage)

---

## Browser Download

Implement a utility for triggering downloads:

```typescript
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
```

---

## i18n Keys

Add under `missionControl.share` namespace:
- `title`: "Share Report"
- `exportHtml`: "Export HTML"
- `exportMarkdown`: "Export Markdown"
- `exportJson`: "Export JSON"
- `preview`: "Preview"
- `download`: "Download"
- `cancel`: "Cancel"
- `secretsDetected`: "{count} potential secrets detected and will be redacted"
- `secretTypes`: "Secret types found"
- `proceedWithRedaction`: "Proceed with Redaction"
- `dontWarnAgain`: "Don't warn me again"
- `exportSuccess`: "Report exported successfully"
- `apiKey`: "API Key"
- `bearerToken`: "Bearer Token"
- `password`: "Password"
- `privateKey`: "Private Key"
- `connectionString`: "Connection String"
- `awsKey`: "AWS Key"
- `githubToken`: "GitHub Token"
- `genericSecret`: "Generic Secret"

---

## Acceptance Criteria

1. **Anthropic key scrubbed:** `scrubSecrets("my key is sk-ant-abc123def456ghi789")` replaces the key with `[REDACTED]`.
2. **OpenAI key scrubbed:** `scrubSecrets("sk-1234567890abcdefghij")` replaces the key.
3. **GitHub token scrubbed:** `scrubSecrets("ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")` replaces the token.
4. **Connection string scrubbed:** `scrubSecrets("postgres://user:pass@host/db")` replaces the URL.
5. **PEM key scrubbed:** Private key blocks are fully redacted.
6. **Report deep scrub:** `scrubReport(report)` scrubs all string fields without modifying numeric or status fields.
7. **HTML export:** `exportReport(report, { format: "html" })` returns a valid HTML document that opens in a browser.
8. **Markdown export:** `exportReport(report, { format: "markdown" })` returns the same Markdown as Phase 1's `renderMarkdown()` but with secrets scrubbed.
9. **JSON export:** `exportReport(report, { format: "json" })` returns pretty-printed JSON with secrets scrubbed.
10. **Filename format:** Follows `lunaria-report-{id8}-{date}.{ext}` pattern.
11. **Secret warning:** When secrets are detected, `SecretWarning` renders before export.
12. **Download triggers:** Clicking "Export HTML" triggers a browser file download.
13. **Fake API key in task title:** Plant `sk-ant-test123456789abcdef` in a task description, export as HTML, verify it appears as `[REDACTED]` in the output.
14. **i18n:** All strings through `t()`.
15. **No TypeScript errors:** Clean build.

---

## Test Requirements

### Scrubber tests (`secret-scrubber.test.ts`)

```
scrubSecrets
  ✓ scrubs Anthropic API key (sk-ant-...)
  ✓ scrubs OpenAI API key (sk-...)
  ✓ scrubs GitHub token (ghp_...)
  ✓ scrubs bearer token
  ✓ scrubs connection string
  ✓ scrubs PEM private key
  ✓ scrubs AWS access key
  ✓ scrubs Google API key (AIza...)
  ✓ scrubs generic key=value secrets
  ✓ handles multiple secrets in one string
  ✓ returns correct redactedCount
  ✓ returns correct redactedTypes (deduplicated)
  ✓ showLengthHint produces "[REDACTED:32chars]"
  ✓ custom replacement text works
  ✓ no false positives on normal text
  ✓ preserves non-secret content unchanged

scrubReport
  ✓ scrubs goalDescription
  ✓ scrubs taskBreakdown[].description
  ✓ scrubs taskBreakdown[].errorMessage
  ✓ does NOT scrub taskId, status, numeric fields
  ✓ returns totalRedacted count

containsSecrets
  ✓ returns true for text with secrets
  ✓ returns false for clean text
```

### Exporter tests (`report-exporter.test.ts`)

```
exportReport
  ✓ HTML format returns valid HTML string
  ✓ HTML contains goal description
  ✓ HTML scrubs secrets by default
  ✓ Markdown format starts with "# Mission Control"
  ✓ JSON format is valid parseable JSON
  ✓ filename follows expected pattern
  ✓ mimeType is correct per format
  ✓ scrubSecrets=false skips scrubbing
```

### Component tests

```
ExportButton
  ✓ renders 3 export options
  ✓ clicking option triggers export

SecretWarning
  ✓ shows redacted count
  ✓ lists secret types
  ✓ proceed button calls onProceed
```

---

## Files to Create

| Path | Purpose |
|---|---|
| `apps/dashboard/src/lib/secret-scrubber.ts` | Secret detection + redaction |
| `apps/dashboard/src/lib/report-exporter.ts` | Multi-format export |
| `apps/dashboard/src/lib/__tests__/secret-scrubber.test.ts` | Scrubber tests |
| `apps/dashboard/src/lib/__tests__/report-exporter.test.ts` | Exporter tests |
| `apps/dashboard/src/components/panels/mission-control/share/index.tsx` | Share panel |
| `apps/dashboard/src/components/panels/mission-control/share/ExportButton.tsx` | Export dropdown |
| `apps/dashboard/src/components/panels/mission-control/share/ExportPreview.tsx` | Preview |
| `apps/dashboard/src/components/panels/mission-control/share/SecretWarning.tsx` | Warning |
| `apps/dashboard/src/components/panels/mission-control/share/__tests__/ExportButton.test.tsx` | Tests |
| `apps/dashboard/src/components/panels/mission-control/share/__tests__/SecretWarning.test.tsx` | Tests |

---

## Verification Commands

```bash
cd apps/dashboard && bun tsc --noEmit
bunx vitest run src/lib/__tests__/secret-scrubber.test.ts
bunx vitest run src/lib/__tests__/report-exporter.test.ts
bunx vitest run src/components/panels/mission-control/share/__tests__

# Smoke test: plant a fake API key and verify scrubbing
grep -rn "sk-ant-" src/lib/__tests__/secret-scrubber.test.ts
```
