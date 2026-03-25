# Phase 2 — Goal Templates

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

**Project:** Amoena — Multi-agent orchestration platform
**Phase:** 2 (Intelligence Layer)
**Tech stack:** TypeScript, Next.js (App Router), better-sqlite3, Vitest, React
**Branch to create:** `feature/mission-control-templates-reports`
**Same branch as:** `05-shareable-reports.md` — coordinate if running simultaneously

### What Goal Templates are

A "goal" in Amoena is a unit of work containing an ordered list of tasks (the TaskGraph).
Each task has a title, type, description, and suggested agent assignment.

Goal Templates are pre-built goal definitions that let users launch common workflows
with one click instead of manually constructing each task.

The template system:
1. Stores built-in templates as static data (no DB needed for built-ins)
2. Stores user-created custom templates in a `goal_templates` SQLite table
3. When a template is launched, it populates the Mission Control GoalInput and TaskGraph UI

### Database: custom templates table

Add a migration in `apps/dashboard/src/lib/migrations.ts`:

```sql
CREATE TABLE IF NOT EXISTS goal_templates (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL,
  tasks_json   TEXT NOT NULL,   -- JSON string: TemplateTask[]
  is_builtin   INTEGER NOT NULL DEFAULT 0,  -- 0 = user, 1 = builtin
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  workspace_id INTEGER NOT NULL DEFAULT 1
);
```

Do not drop or alter existing tables.

### Database access pattern

```typescript
import { getDatabase } from "@/lib/db";

const db = getDatabase();
const rows = db.prepare("SELECT ...").all() as SomeType[];
```

Use `better-sqlite3` synchronous API — no async/await on DB calls.

### File locations

```
apps/dashboard/src/
  app/api/mission-control/
    templates/route.ts             ← GET list, POST create custom
    templates/[id]/route.ts        ← DELETE custom template
  components/panels/mission-control/
    templates/
      TemplatesPanel.tsx           ← main panel
      TemplateCard.tsx             ← individual template card
      TemplateLauncher.tsx         ← confirm + launch dialog
      CustomTemplateSaveDialog.tsx ← save current tasks as template
      index.ts                     ← re-exports
  lib/
    templates-data.ts              ← built-in template definitions (static)
    template-queries.ts            ← DB queries for custom templates
```

---

## BUILT-IN TEMPLATES

Define these 5 built-in templates in `apps/dashboard/src/lib/templates-data.ts`.
They are static objects — not stored in the database.

### Template 1: Add Test Coverage

```typescript
{
  id: "builtin-add-test-coverage",
  name: "Add Test Coverage",
  description: "Audit current test coverage, write missing unit and integration tests, and verify all tests pass.",
  is_builtin: true,
  tasks: [
    {
      task_id: "coverage-audit",
      title: "Audit current test coverage",
      type: "test",
      description: "Run coverage report, identify files below 80% coverage, output a prioritized list.",
      suggested_agent: "claude-code",
      complexity: "S"
    },
    {
      task_id: "write-unit-tests",
      title: "Write missing unit tests",
      type: "test",
      description: "Write unit tests for all files identified in the audit.",
      suggested_agent: "claude-code",
      complexity: "L"
    },
    {
      task_id: "write-integration-tests",
      title: "Write integration tests for critical paths",
      type: "test",
      description: "Write integration tests for the top 3 critical user flows.",
      suggested_agent: "claude-code",
      complexity: "M"
    },
    {
      task_id: "verify-coverage",
      title: "Verify coverage meets 80% threshold",
      type: "test",
      description: "Run coverage report again, confirm all files >= 80%, fix any remaining gaps.",
      suggested_agent: "claude-code",
      complexity: "S"
    }
  ]
}
```

### Template 2: Update Dependencies

```typescript
{
  id: "builtin-update-dependencies",
  name: "Update Dependencies",
  description: "Audit outdated packages, update to latest stable versions, fix any breaking changes.",
  is_builtin: true,
  tasks: [
    {
      task_id: "audit-deps",
      title: "Audit outdated dependencies",
      type: "review",
      description: "Run `npm outdated` and `npm audit`, categorize by severity and breaking risk.",
      suggested_agent: "codex",
      complexity: "S"
    },
    {
      task_id: "update-patch-minor",
      title: "Update patch and minor versions",
      type: "code",
      description: "Update all patch and minor version bumps. Run tests after each batch.",
      suggested_agent: "codex",
      complexity: "M"
    },
    {
      task_id: "update-major",
      title: "Update major versions (with migration)",
      type: "refactor",
      description: "Update major version packages one at a time. Apply migration guides. Run tests.",
      suggested_agent: "claude-code",
      complexity: "L"
    },
    {
      task_id: "verify-build",
      title: "Verify build and full test suite pass",
      type: "test",
      description: "Run `npm run build && npm run test`. Fix any remaining issues.",
      suggested_agent: "claude-code",
      complexity: "S"
    }
  ]
}
```

### Template 3: Fix TODO Comments

```typescript
{
  id: "builtin-fix-todos",
  name: "Fix TODO Comments",
  description: "Find all TODO/FIXME/HACK comments in the codebase and resolve them.",
  is_builtin: true,
  tasks: [
    {
      task_id: "scan-todos",
      title: "Scan and categorize all TODOs",
      type: "review",
      description: "Find all TODO, FIXME, HACK comments. Group by severity: must-fix, should-fix, nice-to-have.",
      suggested_agent: "codex",
      complexity: "S"
    },
    {
      task_id: "fix-must-todos",
      title: "Resolve must-fix TODOs",
      type: "code",
      description: "Address all must-fix TODOs. Each resolution must include tests.",
      suggested_agent: "claude-code",
      complexity: "L"
    },
    {
      task_id: "fix-should-todos",
      title: "Resolve should-fix TODOs",
      type: "code",
      description: "Address should-fix TODOs. Skip if implementation would exceed 2h estimate.",
      suggested_agent: "claude-code",
      complexity: "M"
    },
    {
      task_id: "cleanup",
      title: "Remove resolved TODO comments",
      type: "refactor",
      description: "Remove the TODO comment lines for all resolved items. Do not leave empty comments.",
      suggested_agent: "codex",
      complexity: "S"
    }
  ]
}
```

### Template 4: Refactor to TypeScript

```typescript
{
  id: "builtin-refactor-typescript",
  name: "Refactor to TypeScript",
  description: "Convert JavaScript files to TypeScript, add types, enable strict mode.",
  is_builtin: true,
  tasks: [
    {
      task_id: "ts-audit",
      title: "Audit JS files and plan conversion order",
      type: "review",
      description: "List all .js/.jsx files. Order by dependency graph (leaves first). Estimate complexity.",
      suggested_agent: "claude-code",
      complexity: "S"
    },
    {
      task_id: "ts-convert-leaf",
      title: "Convert leaf modules to TypeScript",
      type: "refactor",
      description: "Convert utility files and leaf modules first. Add explicit types to all exports.",
      suggested_agent: "claude-code",
      complexity: "M"
    },
    {
      task_id: "ts-convert-core",
      title: "Convert core modules to TypeScript",
      type: "refactor",
      description: "Convert core business logic files. Resolve type errors incrementally.",
      suggested_agent: "claude-code",
      complexity: "L"
    },
    {
      task_id: "ts-strict",
      title: "Enable strict mode and fix remaining errors",
      type: "refactor",
      description: "Add `\"strict\": true` to tsconfig. Fix all resulting type errors. Zero errors required.",
      suggested_agent: "claude-code",
      complexity: "M"
    }
  ]
}
```

### Template 5: Security Audit

```typescript
{
  id: "builtin-security-audit",
  name: "Security Audit",
  description: "Audit the codebase for common security vulnerabilities and fix critical issues.",
  is_builtin: true,
  tasks: [
    {
      task_id: "sec-scan",
      title: "Run automated security scan",
      type: "review",
      description: "Run `npm audit` and any configured SAST tools. Output a prioritized vulnerability list.",
      suggested_agent: "codex",
      complexity: "S"
    },
    {
      task_id: "sec-deps",
      title: "Fix vulnerable dependencies",
      type: "code",
      description: "Update or replace packages with known CVEs. Prioritize critical and high severity.",
      suggested_agent: "codex",
      complexity: "M"
    },
    {
      task_id: "sec-code",
      title: "Fix code-level vulnerabilities",
      type: "code",
      description: "Address injection, XSS, CSRF, insecure deserialization, and secrets-in-code issues.",
      suggested_agent: "claude-code",
      complexity: "L"
    },
    {
      task_id: "sec-verify",
      title: "Verify all critical issues resolved",
      type: "test",
      description: "Re-run security scan. Write tests that would catch the fixed vulnerabilities in future.",
      suggested_agent: "claude-code",
      complexity: "M"
    }
  ]
}
```

---

## ACCEPTANCE CRITERIA

### AC-1: Templates API — list

`GET /api/mission-control/templates` returns:

```typescript
interface TemplateTask {
  task_id: string;
  title: string;
  type: string;
  description: string;
  suggested_agent: string;
  complexity: "S" | "M" | "L";
}

interface GoalTemplate {
  id: string | number;
  name: string;
  description: string;
  is_builtin: boolean;
  tasks: TemplateTask[];
  created_at?: number;
}

interface TemplatesResponse {
  templates: GoalTemplate[];
}
```

- Returns built-in templates (from static data) merged with user custom templates (from DB)
- Built-ins appear first, sorted by name
- Custom templates appear after, sorted by `created_at DESC`

### AC-2: Templates API — create custom

`POST /api/mission-control/templates` with body `{ name, description, tasks }`:
- Validates: `name` required (non-empty string), `tasks` is non-empty array
- Each task must have: `task_id`, `title`, `type`, `description`, `suggested_agent`, `complexity`
- Stores in `goal_templates` table with `is_builtin = 0`
- Returns 201 with `{ template: GoalTemplate }`
- Returns 400 with `{ error: string }` on validation failure

### AC-3: Templates API — delete custom

`DELETE /api/mission-control/templates/[id]`:
- Only deletes rows with `is_builtin = 0`
- Returns 200 with `{ success: true }` on success
- Returns 404 with `{ error: "Template not found" }` if not found or is builtin
- Returns 400 if `id` is one of the builtin string IDs

### AC-4: TemplateCard renders correctly

`TemplateCard` props:
```typescript
interface TemplateCardProps {
  template: GoalTemplate;
  onLaunch: (template: GoalTemplate) => void;
  onDelete?: (id: string | number) => void;  // only shown for custom templates
}
```

Renders:
- Template name (bold)
- Description (truncated to 2 lines with ellipsis)
- Task count badge: "4 tasks"
- Task type breakdown: small colored badges per unique type (e.g. "2 code", "1 test", "1 review")
- "Launch" button (primary)
- "Delete" button (danger, destructive-confirm before deletion) — only for `!is_builtin`

### AC-5: TemplateLauncher dialog

When "Launch" is clicked, shows a confirmation dialog:
- Title: "Launch [template name]?"
- Shows list of tasks with their type badges and suggested agents
- "Launch Goal" button (primary) — triggers `onLaunch` callback
- "Cancel" button

The dialog does NOT navigate or submit anything itself. It only calls the callback.
The parent `TemplatesPanel` is responsible for populating GoalInput / TaskGraph.

The callback payload shape:
```typescript
interface LaunchPayload {
  goal_title: string;     // template.name
  tasks: TemplateTask[];  // template.tasks
}
```

### AC-6: One-click launch integration

`TemplatesPanel` handles the launch callback by:
1. Emitting a custom DOM event: `new CustomEvent("amoena:load-template", { detail: payload })`
2. The existing Mission Control GoalInput component is expected to listen for this event and
   populate itself. Since GoalInput may not exist yet (Phase 1), implement the event emission
   and document the expected listener interface in a comment.

Do not directly import or call GoalInput — keep coupling loose via the DOM event.

### AC-7: CustomTemplateSaveDialog

`CustomTemplateSaveDialog` props:
```typescript
interface CustomTemplateSaveDialogProps {
  currentTasks: TemplateTask[];
  onSave: (template: GoalTemplate) => void;
  onClose: () => void;
}
```

Renders a dialog with:
- Text input: "Template name" (required)
- Textarea: "Description" (required)
- Read-only task list showing the tasks to be saved
- "Save Template" button — calls `POST /api/mission-control/templates`
- Shows inline error if API returns 400
- Shows loading state during save
- Calls `onSave` with the new template on success

### AC-8: Tests pass

Test file: `apps/dashboard/src/components/panels/mission-control/templates/TemplatesPanel.test.tsx`

Required test cases:
- `renders all 5 built-in templates`
- `renders custom templates after built-ins`
- `TemplateCard shows task count badge`
- `TemplateCard shows delete button only for custom templates`
- `TemplateCard delete requires confirmation`
- `TemplateLauncher shows task list`
- `TemplateLauncher emits amoena:load-template event on confirm`
- `CustomTemplateSaveDialog validates required fields`
- `CustomTemplateSaveDialog calls POST /api/mission-control/templates`
- `API GET returns built-ins merged with custom templates`
- `API POST validates name is required`
- `API POST validates tasks array is non-empty`
- `API DELETE rejects built-in template IDs`

Use Vitest + React Testing Library. Mock `getDatabase()` at the query-function boundary.

### AC-9: TypeScript strict compliance

- No `any` types except raw SQLite row casts
- All props and response interfaces exported from `index.ts`
- `npx tsc --noEmit` passes with zero errors

---

## IMPLEMENTATION NOTES

### Static built-in template data

```typescript
// apps/dashboard/src/lib/templates-data.ts
export const BUILTIN_TEMPLATES: GoalTemplate[] = [
  // ... paste the 5 template objects from the BUILT-IN TEMPLATES section above
];
```

Builtins have string IDs (e.g. `"builtin-add-test-coverage"`).
Custom templates have integer IDs from SQLite autoincrement.

### Template query functions

```typescript
// apps/dashboard/src/lib/template-queries.ts
import { getDatabase } from "@/lib/db";
import { BUILTIN_TEMPLATES } from "./templates-data";

export function getAllTemplates(workspaceId = 1): GoalTemplate[] {
  const db = getDatabase();
  const custom = db
    .prepare("SELECT * FROM goal_templates WHERE workspace_id = ? AND is_builtin = 0 ORDER BY created_at DESC")
    .all(workspaceId) as RawTemplateRow[];
  const parsed = custom.map(parseTemplateRow);
  return [...BUILTIN_TEMPLATES, ...parsed];
}

export function createTemplate(
  data: { name: string; description: string; tasks: TemplateTask[] },
  workspaceId = 1
): GoalTemplate {
  const db = getDatabase();
  const now = Math.floor(Date.now() / 1000);
  const result = db.prepare(
    "INSERT INTO goal_templates (name, description, tasks_json, is_builtin, created_at, updated_at, workspace_id) VALUES (?, ?, ?, 0, ?, ?, ?)"
  ).run(data.name, data.description, JSON.stringify(data.tasks), now, now, workspaceId);
  // return the created template
}

export function deleteTemplate(id: number, workspaceId = 1): boolean {
  const db = getDatabase();
  const result = db.prepare(
    "DELETE FROM goal_templates WHERE id = ? AND workspace_id = ? AND is_builtin = 0"
  ).run(id, workspaceId);
  return result.changes > 0;
}
```

### Styling conventions

Match existing dashboard panels: Tailwind CSS, `bg-gray-900` background,
`border-gray-700` borders, `text-gray-100` primary text, `text-gray-400` secondary.
Template cards: `rounded-lg border border-gray-700 p-4 hover:border-gray-500 transition-colors`.
Built-in badge: `bg-blue-900/40 text-blue-300 text-xs px-2 py-0.5 rounded`.
Task type badges: use consistent colors: `code`=blue, `test`=green, `review`=yellow,
`refactor`=purple, `docs`=gray.

### No new dependencies

Do not add new npm packages. Use only what is already installed:
React, Tailwind, better-sqlite3, Vitest, React Testing Library.

---

## VERIFICATION COMMANDS

```bash
# From repo root
npm run build
npm run test -- --testPathPattern=templates
npx tsc --noEmit
npm run lint
```

All must pass before declaring complete.
