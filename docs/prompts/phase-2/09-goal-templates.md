# Phase 2 — Prompt 09: Goal Templates

## RALPH LOOP INSTRUCTIONS

You are running in an autonomous loop. These rules are non-negotiable:

1. **Never declare done without evidence.** Every claim of completion must be backed by passing test output or a build log you actually ran. Do not say "this should work" — run it and show the output.
2. **Self-correct on failure.** If a test fails, a type error fires, or a command errors, fix the root cause and re-run. Do not move on with known failures.
3. **No scope reduction.** If something is hard, find a way. Do not silently drop acceptance criteria because they seem difficult.
4. **Iterate until green.** Keep looping — fix, verify, fix, verify — until every acceptance criterion in this document is met. Then stop.
5. **Show your work.** After each significant step, output the verification command and its result.

---

## Component Overview

Build the Goal Templates system — pre-built and user-created templates that let users launch common workflows with one click instead of typing a goal from scratch. The system includes 5 built-in templates, a SQLite table for custom templates, and a UI for browsing, creating, and launching templates.

---

## Repository Context

- **Monorepo root:** `/Users/heitor/Developer/github.com/Amoena/amoena`
- **Database:** `apps/dashboard/src/lib/db.ts`
- **Migrations:** `apps/dashboard/src/lib/migrations.ts` — Phase 1 added `006_mission_control`. Your migration should be the next sequential number.
- **Telemetry (Phase 1):** `apps/dashboard/src/lib/mission-control-telemetry.ts`
- **Mission Control UI (Phase 1):** `apps/dashboard/src/components/panels/mission-control/`
- **Event bus:** `apps/dashboard/src/lib/event-bus.ts`
- **i18n:** `next-intl` v4.8.3
- **Package manager:** Bun
- **Test framework:** Vitest v2.1.5

---

## What to Build

### 1. Migration for `goal_templates` table

### 2. Static built-in templates data

Create `apps/dashboard/src/lib/templates-data.ts`

### 3. Template queries module

Create `apps/dashboard/src/lib/template-queries.ts`

### 4. Template UI components

Create `apps/dashboard/src/components/panels/mission-control/templates/`

### 5. Tests

---

## Migration

Add to `apps/dashboard/src/lib/migrations.ts` with the next sequential ID after the current highest.

**Important:** Read `migrations.ts` first to find the correct number.

```sql
CREATE TABLE IF NOT EXISTS goal_templates (
  id          TEXT    PRIMARY KEY,
  name        TEXT    NOT NULL,
  description TEXT    NOT NULL,
  goal_text   TEXT    NOT NULL,          -- the actual goal description to pre-fill
  category    TEXT    NOT NULL DEFAULT 'custom',  -- built-in | custom
  tags        TEXT    NOT NULL DEFAULT '[]',      -- JSON array of tag strings
  task_hints  TEXT    NOT NULL DEFAULT '[]',      -- JSON array of suggested task decomposition
  options     TEXT    NOT NULL DEFAULT '{}',       -- JSON: { maxConcurrency?, timeoutMs?, preferredAgents? }
  use_count   INTEGER NOT NULL DEFAULT 0,
  last_used_at INTEGER,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_goal_templates_category ON goal_templates(category);
CREATE INDEX IF NOT EXISTS idx_goal_templates_use_count ON goal_templates(use_count DESC);
```

---

## Built-in Templates (templates-data.ts)

```typescript
export interface BuiltInTemplate {
  id: string;
  name: string;
  description: string;
  goalText: string;
  category: "built-in";
  tags: string[];
  taskHints: TaskHint[];
  options: TemplateOptions;
}

export interface TaskHint {
  description: string;
  taskType: string;
  complexity: string;
}

export interface TemplateOptions {
  maxConcurrency?: number;
  timeoutMs?: number;
  preferredAgents?: string[];
}
```

**The 5 built-in templates:**

1. **"Add a Feature"**
   - Goal: "Implement {feature_name}: {feature_description}"
   - Tags: ["feature", "implementation"]
   - Task hints: analysis → implementation → testing → documentation
   - Options: maxConcurrency 3

2. **"Fix a Bug"**
   - Goal: "Fix bug: {bug_description}. Expected: {expected}. Actual: {actual}."
   - Tags: ["bug", "fix"]
   - Task hints: analysis → implementation → testing
   - Options: maxConcurrency 2

3. **"Code Review"**
   - Goal: "Review {scope}: check for security issues, performance problems, and code quality."
   - Tags: ["review", "quality"]
   - Task hints: review (security) → review (performance) → review (quality) → documentation
   - Options: maxConcurrency 3

4. **"Refactor Module"**
   - Goal: "Refactor {module}: improve structure, reduce complexity, maintain behavior."
   - Tags: ["refactoring", "cleanup"]
   - Task hints: analysis → refactoring → testing
   - Options: maxConcurrency 2

5. **"Write Tests"**
   - Goal: "Add comprehensive tests for {module}: unit, integration, edge cases."
   - Tags: ["testing", "coverage"]
   - Task hints: analysis → testing (unit) → testing (integration) → testing (edge cases)
   - Options: maxConcurrency 3

Each template has placeholder variables in `{curly_braces}` that the UI replaces before launch.

---

## Template Queries Module (template-queries.ts)

### Types

```typescript
export interface GoalTemplateRow {
  id: string;
  name: string;
  description: string;
  goal_text: string;
  category: "built-in" | "custom";
  tags: string;           // JSON string
  task_hints: string;     // JSON string
  options: string;        // JSON string
  use_count: number;
  last_used_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface ParsedTemplate {
  id: string;
  name: string;
  description: string;
  goalText: string;
  category: "built-in" | "custom";
  tags: string[];
  taskHints: TaskHint[];
  options: TemplateOptions;
  useCount: number;
  lastUsedAt: number | null;
  createdAt: number;
}
```

### Functions

```typescript
/** Seed built-in templates (idempotent — skips if already exist) */
export function seedBuiltInTemplates(db: Database.Database): void

/** List all templates (built-in first, then custom by use_count desc) */
export function listTemplates(
  db: Database.Database,
  options?: { category?: "built-in" | "custom"; tag?: string },
): ParsedTemplate[]

/** Get a single template by ID */
export function getTemplate(
  db: Database.Database,
  templateId: string,
): ParsedTemplate | null

/** Create a custom template */
export function createTemplate(
  db: Database.Database,
  template: Omit<ParsedTemplate, "id" | "useCount" | "lastUsedAt" | "createdAt">,
): string  // returns the new ID

/** Update a custom template (cannot update built-in) */
export function updateTemplate(
  db: Database.Database,
  templateId: string,
  updates: Partial<Pick<ParsedTemplate, "name" | "description" | "goalText" | "tags" | "taskHints" | "options">>,
): void

/** Delete a custom template (cannot delete built-in) */
export function deleteTemplate(
  db: Database.Database,
  templateId: string,
): void

/** Increment use_count and set last_used_at */
export function recordTemplateUse(
  db: Database.Database,
  templateId: string,
): void

/** Extract placeholder variables from a goal text */
export function extractPlaceholders(goalText: string): string[]
// e.g. "Implement {feature_name}" → ["feature_name"]
```

---

## UI Components

### Directory Structure

```
apps/dashboard/src/components/panels/mission-control/templates/
  index.tsx                     # TemplatesPanel — browse + launch
  TemplateCard.tsx             # Single template card
  TemplateGrid.tsx             # Grid of template cards
  TemplateDetail.tsx           # Full template view with launch
  TemplateLauncher.tsx         # Fill placeholders + launch
  TemplateEditor.tsx           # Create/edit custom template
  TemplateSearch.tsx           # Search + filter bar
```

### TemplatesPanel (index.tsx)

- Shows `TemplateSearch` at top with category tabs (All / Built-in / Custom)
- Renders `TemplateGrid` with filtered templates
- "Create Template" button opens `TemplateEditor`

### TemplateCard

```typescript
interface TemplateCardProps {
  template: ParsedTemplate;
  onSelect: (templateId: string) => void;
}
```

- Card showing: name, description (2 lines max), tags as chips, use count, category badge
- Built-in templates have a subtle star icon
- Hover effect: slight elevation
- Click → `onSelect` → opens `TemplateDetail`

### TemplateLauncher

```typescript
interface TemplateLauncherProps {
  template: ParsedTemplate;
  onLaunch: (goalText: string, options: TemplateOptions) => void;
  onCancel: () => void;
}
```

- Extracts placeholders from `goalText` via `extractPlaceholders()`
- Renders a text input for each placeholder variable
- Live preview of the filled goal text
- "Launch" button fires `amoena:load-template` event on the event bus and calls `onLaunch`
- "Cancel" returns to template list

### TemplateEditor

```typescript
interface TemplateEditorProps {
  existing?: ParsedTemplate;    // null for create, populated for edit
  onSave: (template: ParsedTemplate) => void;
  onCancel: () => void;
}
```

- Form fields: name, description, goal text, tags (comma-separated), task hints (add/remove rows)
- Validation: name required (3-50 chars), goal text required (10-2000 chars)
- "Save" creates or updates the template
- Cannot edit built-in templates (editor disabled for built-in)

### TemplateSearch

- Text search across name + description + tags
- Category tabs: All | Built-in | Custom
- Sort: Most Used | Recently Used | Alphabetical

---

## Event Bus Integration

When a template is launched, emit on the event bus:

```typescript
eventBus.broadcast("amoena:load-template", {
  templateId: template.id,
  goalText: filledGoalText,
  options: template.options,
  taskHints: template.taskHints,
});
```

The Mission Control panel's `GoalInput` component should listen for this event and pre-fill the textarea.

---

## i18n Keys

Add under `missionControl.templates` namespace:
- `title`: "Goal Templates"
- `builtIn`: "Built-in"
- `custom`: "Custom"
- `all`: "All"
- `createTemplate`: "Create Template"
- `editTemplate`: "Edit Template"
- `deleteTemplate`: "Delete Template"
- `launch`: "Launch"
- `cancel`: "Cancel"
- `save`: "Save"
- `name`: "Name"
- `description`: "Description"
- `goalText`: "Goal Text"
- `tags`: "Tags"
- `taskHints`: "Task Hints"
- `usedCount`: "Used {count} times"
- `neverUsed`: "Never used"
- `searchPlaceholder`: "Search templates..."
- `fillPlaceholders`: "Fill in the details"
- `preview`: "Preview"
- `confirmDelete`: "Delete this template?"
- `cannotEditBuiltIn`: "Built-in templates cannot be edited"

---

## Acceptance Criteria

1. **Migration runs cleanly:** The `goal_templates` table is created with correct schema.
2. **Seed idempotent:** Calling `seedBuiltInTemplates()` twice does not create duplicates.
3. **5 built-in templates:** `listTemplates(db, { category: "built-in" })` returns exactly 5 templates.
4. **Template launch event:** Clicking "Launch" on a template fires `amoena:load-template` event. Verify in DevTools or test.
5. **Placeholder extraction:** `extractPlaceholders("Fix {bug} in {module}")` returns `["bug", "module"]`.
6. **Placeholder filling:** Filling all placeholders enables the Launch button. Unfilled placeholders disable it.
7. **Custom template CRUD:** Create → list → update → delete cycle works for custom templates.
8. **Built-in protection:** Cannot edit or delete built-in templates. UI hides edit/delete buttons.
9. **Use count tracking:** `recordTemplateUse()` increments `use_count` and sets `last_used_at`.
10. **Search:** Typing "bug" in search bar filters to templates containing "bug" in name, description, or tags.
11. **i18n:** All strings through `t()`.
12. **No TypeScript errors:** Clean build.

---

## Test Requirements

### Query tests (`template-queries.test.ts`)

```
seedBuiltInTemplates
  ✓ creates 5 built-in templates
  ✓ idempotent — second call doesn't duplicate

listTemplates
  ✓ returns built-in templates first
  ✓ filters by category
  ✓ filters by tag

createTemplate / updateTemplate / deleteTemplate
  ✓ create returns a valid ID
  ✓ update modifies fields
  ✓ update built-in throws error
  ✓ delete removes custom template
  ✓ delete built-in throws error

recordTemplateUse
  ✓ increments use_count
  ✓ sets last_used_at

extractPlaceholders
  ✓ extracts variables from curly braces
  ✓ returns empty array when no placeholders
  ✓ handles duplicate placeholders (deduplicates)
```

### Component tests

```
TemplateCard
  ✓ renders template name and description
  ✓ shows use count
  ✓ click calls onSelect

TemplateLauncher
  ✓ renders input for each placeholder
  ✓ launch button disabled until all placeholders filled
  ✓ onLaunch called with filled goal text

TemplateEditor
  ✓ renders form fields
  ✓ save button disabled when name is empty
  ✓ edit mode pre-fills fields

TemplateSearch
  ✓ filters templates by text input
  ✓ category tabs filter correctly
```

---

## Files to Create / Modify

| Path | Action |
|---|---|
| `apps/dashboard/src/lib/migrations.ts` | Add `goal_templates` migration |
| `apps/dashboard/src/lib/templates-data.ts` | 5 built-in template definitions |
| `apps/dashboard/src/lib/template-queries.ts` | CRUD + seed functions |
| `apps/dashboard/src/lib/__tests__/template-queries.test.ts` | Query tests |
| `apps/dashboard/src/components/panels/mission-control/templates/index.tsx` | Templates panel |
| `apps/dashboard/src/components/panels/mission-control/templates/TemplateCard.tsx` | Card |
| `apps/dashboard/src/components/panels/mission-control/templates/TemplateGrid.tsx` | Grid |
| `apps/dashboard/src/components/panels/mission-control/templates/TemplateDetail.tsx` | Detail view |
| `apps/dashboard/src/components/panels/mission-control/templates/TemplateLauncher.tsx` | Launcher |
| `apps/dashboard/src/components/panels/mission-control/templates/TemplateEditor.tsx` | Editor |
| `apps/dashboard/src/components/panels/mission-control/templates/TemplateSearch.tsx` | Search |
| `apps/dashboard/src/components/panels/mission-control/templates/__tests__/TemplateCard.test.tsx` | Tests |
| `apps/dashboard/src/components/panels/mission-control/templates/__tests__/TemplateLauncher.test.tsx` | Tests |
| `apps/dashboard/src/components/panels/mission-control/templates/__tests__/TemplateEditor.test.tsx` | Tests |
| `apps/dashboard/src/components/panels/mission-control/templates/__tests__/TemplateSearch.test.tsx` | Tests |

---

## Verification Commands

```bash
cd apps/dashboard && bun tsc --noEmit
bunx vitest run src/lib/__tests__/template-queries.test.ts
bunx vitest run src/components/panels/mission-control/templates/__tests__

# Verify migration number is sequential
grep "id:" src/lib/migrations.ts | tail -5
```
