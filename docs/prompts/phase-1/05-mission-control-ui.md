# Phase 1 — Prompt 05: Mission Control UI

## RALPH LOOP INSTRUCTIONS

You are running in an autonomous loop. These rules are non-negotiable:

1. **Never declare done without evidence.** Every claim of completion must be backed by passing test output or a build log you actually ran. Do not say "this should work" — run it and show the output.
2. **Self-correct on failure.** If a test fails, a type error fires, or a command errors, fix the root cause and re-run. Do not move on with known failures.
3. **No scope reduction.** If something is hard, find a way. Do not silently drop acceptance criteria because they seem difficult.
4. **Iterate until green.** Keep looping — fix, verify, fix, verify — until every acceptance criterion in this document is met. Then stop.
5. **Show your work.** After each significant step, output the verification command and its result.

---

## Component Overview

Build the Mission Control panel — the primary user interface for submitting goals, watching agents execute tasks in real time, and reviewing post-run reports. This is a React panel added to the existing Lunaria dashboard.

The component lives at:

```
apps/dashboard/src/components/panels/mission-control/
```

---

## Repository Context

- **Dashboard:** `apps/dashboard/` — Next.js app with React
- **Existing panels:** `apps/dashboard/src/components/panels/` — many examples to reference for patterns (e.g. `task-board-panel.tsx`, `agent-squad-panel.tsx`)
- **WebSocket infra:** `apps/dashboard/src/lib/websocket.ts`, `websocket-utils.ts`, `use-server-events.ts`
- **Event bus:** `apps/dashboard/src/lib/event-bus.ts`
- **Telemetry readers** (Prompt 03): `apps/dashboard/src/lib/mission-control-telemetry.ts`
- **Reporter** (Prompt 04): `apps/dashboard/src/lib/run-reporter.ts`
- **Design tokens:** See below — JetBrains Mono, 8px grid, agent color palette
- **i18n:** i18n is required. All user-visible strings must use the i18n system already in place in the dashboard. Look at existing panels for the `useTranslation` / `t()` pattern.
- **Package manager:** Bun

---

## Design Tokens

Apply these consistently across all mission control components:

```typescript
// Font
const TERMINAL_FONT = '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace';

// Agent color palette (use as border-left accent on agent panels)
const AGENT_COLORS = {
  "claude-code": "#FF6B35",   // orange
  "codex":       "#00C853",   // green
  "gemini":      "#2196F3",   // blue
  "unknown":     "#9E9E9E",   // gray fallback
} as const;

// Grid unit
const GRID = 8; // px; use multiples: 8, 16, 24, 32, 40, 48

// Status colors
const STATUS_COLORS = {
  completed:       "text-green-400",
  failed:          "text-red-400",
  partial_failure: "text-yellow-400",
  cancelled:       "text-gray-400",
  running:         "text-blue-400",
  pending:         "text-gray-500",
  timed_out:       "text-orange-400",
} as const;
```

Export these from `apps/dashboard/src/components/panels/mission-control/tokens.ts`.

---

## Screen Layout

The panel has three distinct **view states** controlled by a `viewState` prop or internal state machine:

### State 1: pre-run (no active goal)

```
┌────────────────────────────────────────────┐
│         Mission Control                     │
│                                            │
│   ┌────────────────────────────────────┐   │
│   │  What would you like to build?     │   │
│   │  [goal input textarea]             │   │
│   │                          [Launch]  │   │
│   └────────────────────────────────────┘   │
│                                            │
│   Recent runs: [list of last 5 goal runs]  │
└────────────────────────────────────────────┘
```

### State 2: during-run (active goal)

```
┌──────────────────────────────────────────────────────────────┐
│  Goal: "Implement OAuth login flow"       [Cancel]  ⟳ Running│
├──────────────┬───────────────────────────────────────────────┤
│  Task Graph  │  Agent Output                                  │
│  (25% width) │  (60% width)                                  │
│              │  ┌─────────────────────┐  ┌─────────────────┐ │
│  DAG viz     │  │ claude-code         │  │ codex           │ │
│  with status │  │ (orange accent)     │  │ (green accent)  │ │
│  color nodes │  │ [terminal output]   │  │ [terminal out]  │ │
│              │  └─────────────────────┘  └─────────────────┘ │
├──────────────┴───────────────────────────────────────────────┤
│  Status Bar: 3/8 tasks • 2 agents active • $0.0042 • 1m 24s  │
└──────────────────────────────────────────────────────────────┘
```

**Note:** The remaining ~15% width between Task Graph and Agent Output panels is padding/gutter. Agent panels auto-resize to fill available space divided equally among active agents.

### State 3: post-run (report view)

```
┌──────────────────────────────────────────────────────────────┐
│  Run Report: "Implement OAuth login flow"      [New Goal]     │
├──────────────────────────────────────────────────────────────┤
│  [TabBar: Summary | Tasks | Agents | Routing | Raw JSON]      │
├──────────────────────────────────────────────────────────────┤
│  [Tab Content — rendered from RunReport object]               │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Tree

```
mission-control/
  index.tsx                     # MissionControlPanel — top-level, manages viewState
  tokens.ts                     # Design tokens
  types.ts                      # UI-specific types (events, props, state)
  hooks/
    use-goal-run.ts             # WebSocket subscription + state machine for active run
    use-run-history.ts          # Load recent goal runs from telemetry
  components/
    GoalInput.tsx               # Textarea + Launch button + validation
    TaskGraph.tsx               # DAG visualization (SVG or Canvas)
    AgentPanel.tsx              # Single agent terminal output panel
    AgentPanelGrid.tsx          # Lays out multiple AgentPanel instances
    CostTracker.tsx             # Real-time cost accumulator
    StatusBar.tsx               # Bottom status bar
    RunReport.tsx               # Post-run report viewer
    RunReportTabs.tsx           # Tab bar for report sections
    OnboardingWizard.tsx        # First-time setup when no agents configured
```

---

## WebSocket Protocol

Real-time events arrive over the existing WebSocket connection. Mission Control subscribes to a `mission_control` channel. Event shapes:

```typescript
// Incoming events from server
type MCServerEvent =
  | { type: "task:dispatched"; taskId: string; adapterId: string; routingReason: string }
  | { type: "task:output"; taskId: string; adapterId: string; text: string; timestamp: number }
  | { type: "task:status"; taskId: string; status: TaskStatus }
  | { type: "task:completed"; task: TaskRunRow }
  | { type: "task:failed"; task: TaskRunRow }
  | { type: "goal:status"; goalId: string; status: GoalRunStatus }
  | { type: "goal:completed"; report: RunReport }
  | { type: "goal:cancelled"; goalId: string }
  | { type: "cost:update"; goalId: string; totalUsd: number; byAgent: Record<string, number> }

// Outgoing events to server
type MCClientEvent =
  | { type: "goal:submit"; description: string; options?: GoalOptions }
  | { type: "goal:cancel"; goalId: string }
```

### WS Reconnection + State Rehydration

When the WebSocket disconnects and reconnects:
1. Re-subscribe to the `mission_control` channel
2. If an active `goalId` is in local state, call `GET /api/mission-control/goal/:goalId` to rehydrate task statuses
3. Re-render the task graph and agent output panels from the rehydrated state
4. Continue receiving live events from the reconnection point onward

Do not lose the terminal output buffer on reconnect — keep accumulated output in React state.

---

## Component Specifications

### GoalInput.tsx

```typescript
interface GoalInputProps {
  onSubmit: (description: string, options: GoalOptions) => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

interface GoalOptions {
  maxConcurrency?: number;   // default 3
  timeoutMs?: number;        // default 300_000
}
```

- Textarea: `rows=3` initial, auto-grows to `rows=8` max
- Validation: minimum 10 characters, maximum 2000 characters
- Character count shown when > 1800 characters
- `[Launch]` button disabled while `isSubmitting` or description < 10 chars
- Keyboard shortcut: `Cmd/Ctrl + Enter` submits
- Advanced options collapse (hidden by default, revealed by "Options ▾" link): shows concurrency slider (1–5) and timeout selector (1m / 5m / 15m / 30m / custom)

### TaskGraph.tsx

```typescript
interface TaskGraphProps {
  tasks: TaskRunRow[];
  onTaskClick: (taskId: string) => void;
}
```

Render a minimal DAG visualization:
- Each task is a node: rectangle with task type label and status color
- Edges: arrows from dependency to dependent
- Node color: matches `STATUS_COLORS[task.status]` (border or background fill)
- Nodes labeled with shortened task ID + task type (e.g. "impl-1")
- Clicking a node calls `onTaskClick` — highlights the corresponding AgentPanel
- Implementation approach: SVG is preferred; use absolute positioning as fallback
- The graph must re-layout when new tasks appear (new nodes added during run)
- For the purposes of Phase 1, a left-to-right layered layout is sufficient (no force-directed required)
- Show a loading skeleton when `tasks.length === 0`

### AgentPanel.tsx

```typescript
interface AgentPanelProps {
  adapterId: string;          // "claude-code" | "codex" | "gemini"
  taskId: string;
  taskDescription: string;
  status: TaskStatus;
  outputLines: OutputLine[];  // accumulated from task:output events
  isHighlighted: boolean;     // true when selected via TaskGraph click
}

interface OutputLine {
  text: string;
  timestamp: number;
  type: "stdout" | "stderr";
}
```

- Header: agent name (from `adapterId`), colored dot matching `AGENT_COLORS[adapterId]`, status badge, task description (truncated at 60 chars)
- Body: scrollable terminal output area using `font-family: TERMINAL_FONT`
- Auto-scroll to bottom as new lines arrive; stop auto-scroll if user manually scrolls up; resume on new output if user scrolls back to bottom
- Stderr lines displayed in `text-red-400`
- Empty state: "Waiting for output..." in muted text
- Max 5000 lines buffered; drop oldest lines if over limit

### AgentPanelGrid.tsx

```typescript
interface AgentPanelGridProps {
  panels: AgentPanelProps[];
  highlightedTaskId: string | null;
}
```

- Lays out `AgentPanel` instances side by side
- 1 panel → full width
- 2 panels → 50% each
- 3 panels → ~33% each
- 4+ panels → 2-column grid
- All panels equal height within the grid area

### CostTracker.tsx

```typescript
interface CostTrackerProps {
  totalUsd: number;
  byAgent: Record<string, number>;
  isRunning: boolean;
}
```

- Shows `$X.XXXX` formatted total
- Breakdown tooltip on hover: per-agent cost table
- Pulses when `isRunning` (CSS animation, subtle)

### StatusBar.tsx

Shows in during-run state:
- Tasks progress: `X/Y tasks`
- Active agents count: `N agents active`
- Total cost: from `CostTracker`
- Elapsed time: live-updating timer (tick every second via `setInterval`)
- On hover over elapsed time: show start time in tooltip

### RunReport.tsx

```typescript
interface RunReportProps {
  report: RunReport;
  onNewGoal: () => void;
}
```

Renders tabs: Summary | Tasks | Agents | Routing | Raw JSON

**Summary tab:** key metrics in a card grid (total tasks, status breakdown, total cost, duration)

**Tasks tab:** table of all tasks with columns: description, type, complexity, agent, status, duration, cost, attempts

**Agents tab:** table per agent: assigned, completed, failed, avg duration, total cost, success rate

**Routing tab:** for each task, show decision + explanation. Highlight `couldImprove=true` rows in yellow.

**Raw JSON tab:** `<pre>` block with `JSON.stringify(report, null, 2)`, copy-to-clipboard button

### OnboardingWizard.tsx

Shown when `isAvailable()` returns false for all adapters (no agents configured).

Steps:
1. Welcome: "Set up your first AI agent"
2. Choose provider: Claude / Codex / Gemini (radio)
3. Enter API key / configure credentials
4. Test connection (calls server to verify)
5. Done — transition to `pre-run` state

The wizard does not handle actual credential storage — on "Save", it emits an `onConfigureAgent` callback with `{ provider, credential }` and the parent handles persistence.

---

## Interaction State Matrix

Every component must handle all of these states without crashing:

| Component | loading | empty | error | success | partial |
|---|---|---|---|---|---|
| GoalInput | spinner on button | default state | shows error message | disabled (run active) | — |
| TaskGraph | skeleton nodes | "No tasks yet" | "Failed to load graph" | renders DAG | partial nodes rendered |
| AgentPanel | "Waiting for output..." | "Waiting for output..." | stderr in red | normal output | mixed stdout+stderr |
| CostTracker | shows `$0.0000` | shows `$0.0000` | — | correct total | — |
| RunReport | — | "No tasks in this run" | "Report unavailable" | full report | partial tasks shown |

---

## Audio Feedback

Audio is **on by default**, toggled in a settings dropdown within the panel header.

```typescript
interface AudioSettings {
  enabled: boolean;           // default: true
  terminalClicks: boolean;    // subtle click per output line; default: true
  completionChime: boolean;   // chime when goal completes; default: true
}
```

- Store `AudioSettings` in `localStorage` under `"lunaria.missionControl.audio"`
- Terminal click: use `AudioContext` to generate a 2ms, 440Hz sine burst at 0.02 gain
- Completion chime: use `AudioContext` to play a short ascending 3-note sequence (440→554→659Hz, 80ms each, 0.1 gain)
- Wrap all `AudioContext` calls in try/catch — audio must never crash the UI

---

## Color Mode

- Use `prefers-color-scheme` media query via Tailwind's `dark:` variant
- The dashboard already has dark mode — follow existing panel patterns
- Agent color accents (`AGENT_COLORS`) remain the same in both modes (they're already saturated enough)

---

## Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Desktop (`≥1280px`) | Full split layout: Goal Bar + Task Graph left 25% + Agent Output right 60% |
| Tablet (`768–1279px`) | Goal Bar full width on top; below: horizontal strip of agent panels; Task Graph collapsed to dropdown |
| Mobile (`<768px`) | Tabbed view: [Goal] [Agents] [Graph] [Report] tabs; each tab full width |

Use Tailwind responsive prefixes. Do not use `window.innerWidth` in React render — use CSS classes only.

---

## Accessibility

- All interactive elements reachable via `Tab` key in logical order
- `GoalInput` textarea: `aria-label="Goal description"`, `aria-describedby` pointing to char count
- `[Launch]` button: `aria-busy="true"` when `isSubmitting`
- Task graph nodes: `role="button"`, `aria-label="Task: <description>, status: <status>"`
- Agent panel output area: `role="log"`, `aria-live="polite"`, `aria-label="<agentId> output"`
- Status transitions announced via a visually-hidden live region: `aria-live="assertive"` for task failures, `aria-live="polite"` for completions
- All interactive elements: minimum 44×44px touch target
- Color is never the sole means of conveying information — status icons accompany status colors
- WCAG AA contrast ratio for all text on background combinations

---

## First-Time Experience

On mount, check if any adapters are configured (call `GET /api/mission-control/adapters/available`). If the response is `{ available: [] }` (empty), render `OnboardingWizard` instead of the normal panel.

---

## Acceptance Criteria

1. **Three view states:** Panel renders correctly in `pre-run`, `during-run`, and `post-run` states with no TypeScript errors or React key warnings.
2. **Goal submission:** Typing a goal and clicking Launch emits `goal:submit` over WebSocket. Button disabled while submitting. Cmd/Ctrl+Enter submits.
3. **Validation:** Submit button remains disabled for inputs under 10 characters. Error message shown when attempting submit with empty input.
4. **Task graph:** Renders a node per task, colored by status. Dependencies shown as edges. Clicking a node highlights the correct AgentPanel.
5. **Agent output streaming:** `task:output` WebSocket events append lines to the correct `AgentPanel`. Auto-scroll works. Manual scroll-up pauses auto-scroll.
6. **Cost tracker:** Updates on `cost:update` events. Shows `$0.0000` when no tasks have run.
7. **Status bar:** Shows correct task count, active agent count, and elapsed time. Timer ticks every second.
8. **WS reconnect:** After simulated disconnect + reconnect, panel rehydrates task states from API and continues displaying output.
9. **Post-run report:** All 5 tabs render without error. Routing tab highlights `couldImprove=true` rows.
10. **Audio:** Default-on audio setting respected from localStorage. Click and chime play on appropriate events. Toggling off stops audio immediately.
11. **Responsive:** On mobile viewport (< 768px), tabbed layout renders. Task graph accessible via "Graph" tab.
12. **Accessibility:** All panel inputs/buttons are keyboard-accessible. Agent output areas have correct ARIA roles.
13. **OnboardingWizard:** Shown when no adapters available. Wizard steps render in order. Step 4 (test connection) calls the API.
14. **No prop drilling beyond 2 levels:** Use React context or hooks to share active run state across TaskGraph, AgentPanelGrid, and CostTracker.

---

## Test Requirements

Location: `apps/dashboard/src/components/panels/mission-control/__tests__/`

Use React Testing Library + vitest (follow existing test patterns in the dashboard).

```
GoalInput.test.tsx
  ✓ renders textarea and launch button
  ✓ submit button disabled when input < 10 chars
  ✓ submit button enabled when input >= 10 chars
  ✓ onSubmit called with description on button click
  ✓ onSubmit called on Cmd+Enter
  ✓ shows char count when > 1800 chars

TaskGraph.test.tsx
  ✓ renders a node per task
  ✓ completed task node has green color class
  ✓ failed task node has red color class
  ✓ clicking a node calls onTaskClick with correct taskId
  ✓ renders loading skeleton when tasks is empty array

AgentPanel.test.tsx
  ✓ renders agent name in header
  ✓ shows correct status badge
  ✓ renders output lines in order
  ✓ stderr lines have red text class
  ✓ shows "Waiting for output..." when outputLines is empty

RunReport.test.tsx
  ✓ renders all 5 tabs
  ✓ Summary tab shows correct task counts
  ✓ Routing tab highlights couldImprove rows
  ✓ Raw JSON tab shows stringified report
  ✓ "No tasks in this run" shown for empty task list

use-goal-run.test.ts
  ✓ subscribes to mission_control WebSocket channel on mount
  ✓ task:output event appends to correct panel's output
  ✓ goal:completed event transitions to post-run state
  ✓ goal:cancelled event transitions to post-run state

OnboardingWizard.test.tsx
  ✓ renders welcome step initially
  ✓ Next navigates to provider selection step
  ✓ onConfigureAgent called with provider and credential on finish
```

---

## Dependencies on Other Components

- **Prompt 03 (Telemetry):** Imports `GoalRunRow`, `TaskRunRow`, `AgentPerformanceRow` types for display
- **Prompt 04 (Reporter):** Imports `RunReport` type for post-run report rendering
- **Prompt 01 (CLI Adapters):** Imports `AgentCapability` type for OnboardingWizard provider selection
- **Existing dashboard infra:** `use-server-events.ts` for WebSocket; existing Tailwind config; existing i18n setup

---

## What This Provides to Other Components

- The primary user surface for all Mission Control functionality
- Exposes `MissionControlPanel` as the default export from `index.tsx` to be registered in the dashboard's panel registry

---

## Files to Create

| Path | Purpose |
|---|---|
| `apps/dashboard/src/components/panels/mission-control/index.tsx` | Top-level panel |
| `apps/dashboard/src/components/panels/mission-control/tokens.ts` | Design tokens |
| `apps/dashboard/src/components/panels/mission-control/types.ts` | UI-specific types |
| `apps/dashboard/src/components/panels/mission-control/hooks/use-goal-run.ts` | WS + state machine |
| `apps/dashboard/src/components/panels/mission-control/hooks/use-run-history.ts` | Recent runs |
| `apps/dashboard/src/components/panels/mission-control/components/GoalInput.tsx` | Goal entry |
| `apps/dashboard/src/components/panels/mission-control/components/TaskGraph.tsx` | DAG viz |
| `apps/dashboard/src/components/panels/mission-control/components/AgentPanel.tsx` | Agent terminal |
| `apps/dashboard/src/components/panels/mission-control/components/AgentPanelGrid.tsx` | Panel layout |
| `apps/dashboard/src/components/panels/mission-control/components/CostTracker.tsx` | Cost display |
| `apps/dashboard/src/components/panels/mission-control/components/StatusBar.tsx` | Bottom status |
| `apps/dashboard/src/components/panels/mission-control/components/RunReport.tsx` | Report viewer |
| `apps/dashboard/src/components/panels/mission-control/components/RunReportTabs.tsx` | Tab bar |
| `apps/dashboard/src/components/panels/mission-control/components/OnboardingWizard.tsx` | First-time setup |
| `apps/dashboard/src/components/panels/mission-control/__tests__/GoalInput.test.tsx` | Tests |
| `apps/dashboard/src/components/panels/mission-control/__tests__/TaskGraph.test.tsx` | Tests |
| `apps/dashboard/src/components/panels/mission-control/__tests__/AgentPanel.test.tsx` | Tests |
| `apps/dashboard/src/components/panels/mission-control/__tests__/RunReport.test.tsx` | Tests |
| `apps/dashboard/src/components/panels/mission-control/__tests__/use-goal-run.test.ts` | Hook tests |
| `apps/dashboard/src/components/panels/mission-control/__tests__/OnboardingWizard.test.tsx` | Tests |

---

## Verification Commands

```bash
# Type check dashboard
cd apps/dashboard && bun tsc --noEmit

# Run all mission control tests
bun test src/components/panels/mission-control/__tests__

# Check i18n: no raw string literals in JSX (all text must go through t())
grep -n '"[A-Z][a-z]' src/components/panels/mission-control/components/GoalInput.tsx
# Should return only token values and non-UI strings

# Check no window.innerWidth usage
grep -rn "window\.innerWidth" src/components/panels/mission-control/
# Should return nothing
```
