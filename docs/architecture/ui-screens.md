# UI Screen Inventory

This document provides a comprehensive inventory of all UI screens, overlays, and sub-panels for the Lunaria desktop application (Tauri 2 + React 19). It serves as the authoritative reference for frontend layout, state management, navigation flows, and responsive behavior across all 15 screens.

---

## Navigation Architecture

### Sidebar Rail (Primary Navigation)

The primary navigation is a narrow icon rail on the left edge of the window, always visible. It provides project/session tree navigation, agent team indicators, notification badges, and a per-project mode indicator (wrapper vs native).

- **Collapsed state**: Icon-only rail (~48px wide).
- **Expanded state**: Hover or pin to reveal labels and session tree (~240px wide).
- **Keyboard**: `Cmd+B` toggles expanded/collapsed.

### Command Palette

Accessible from any screen via `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux). See [Screen 10: Command Palette](#10-command-palette) for full details.

### Global Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open Command Palette |
| `Cmd+N` | New Session |
| `Cmd+,` | Open Settings |
| `Cmd+B` | Toggle Sidebar Rail |
| `Cmd+J` | Toggle Terminal Panel |
| `Cmd+Shift+F` | Global Search (Command Palette in search mode) |
| `Cmd+[` / `Cmd+]` | Navigate between open files in side panel |

### Breadcrumb Trails

Breadcrumbs appear at the top of the main content area, below the title bar.

- **Example**: `Home / my-project / Session #42`
- Each segment is a clickable link to its respective screen or context.

---

## Screen Catalog

### 1. Home

**Route**: `/`

**Purpose**: Recent projects, server health overview, open/create projects, and mode selector (wrapper vs native per project).

#### Layout

```text
+------------------------------------------------------------------+
| Title Bar                                              [_][□][x] |
+--------+---------------------------------------------------------+
| Sidebar | [Search Projects...]                    [+ New Project] |
| Rail    |                                                         |
|         | Server Health        Mode Selector                      |
|  [Home] | ┌──────────────┐    ┌────────────────────────────┐      |
|  [Sess] | │ ● All green  │    │ my-app: [Wrapper ▾]       │      |
|  [Agnt] | │ 3 providers  │    │ api-svc: [Native  ▾]      │      |
|  [Mem]  | └──────────────┘    └────────────────────────────┘      |
|  [Mkt]  |                                                         |
|  [Set]  | Recent Projects                                         |
|         | ┌──────────┐ ┌──────────┐ ┌──────────┐                  |
|         | │ my-app   │ │ api-svc  │ │ docs     │                  |
|         | │ 2h ago   │ │ 1d ago   │ │ 3d ago   │                  |
|         | │ Claude   │ │ Codex    │ │ Gemini   │                  |
|         | └──────────┘ └──────────┘ └──────────┘                  |
+--------+---------------------------------------------------------+
```

#### Key Components

- `ProjectCard` -- displays project name, last active time, active provider, and mode badge.
- `ServerHealthIndicator` -- aggregated status of connected providers (green/yellow/red).
- `ModeSelector` -- dropdown per project to choose wrapper (PTY-based TUI passthrough) or native (direct API) mode.
- `Button` (New Project) -- opens project creation dialog.

#### State Management

- **`useProjectStore`** (Zustand): `projects[]`, `recentProjects[]`, `selectedProjectId`, `projectModes: Record<projectId, 'wrapper' | 'native'>`.
- **`useProviderStore`** (Zustand): `providerHealth: Record<providerId, HealthStatus>`.

#### Navigation and Transitions

- **Entry**: Application launch, sidebar rail Home icon.
- **Exit**: Clicking a project card navigates to `/session/:lastSessionId` for that project. "New Project" opens a creation dialog, then redirects to `/session/:newId`.

#### Responsive Behavior

- **Desktop (>1200px)**: 3-column project grid, full server health panel.
- **Tablet (768-1200px)**: 2-column grid, health panel collapses to badge.
- **Compact (<768px)**: Single-column stack, sidebar becomes bottom tab bar.

---

### 2. Session Workspace

**Route**: `/session/:id`

**Purpose**: Primary working view encompassing the message timeline, side panel, terminal, and composer. This is where the user spends the majority of their time.

#### Layout

```text
+--------+-------------------------------+------------------------+
| Sidebar| Message Timeline              | Session Side Panel     |
| Rail   |                               | [Review][Files][Agents]|
|        | ┌───────────────────────────┐  | [Memory]               |
|        | │ User: "Fix the auth bug" │  |                        |
|        | └───────────────────────────┘  | ┌────────────────────┐ |
|        | ┌───────────────────────────┐  | │ src/auth.ts  [M]   │ |
|        | │ Agent: "I'll look at..." │  | │ src/login.ts [A]   │ |
|        | │ [Tool Call: read_file]    │  | │ tests/auth.. [M]   │ |
|        | │ [Thinking...]            │  | └────────────────────┘ |
|        | └───────────────────────────┘  |                        |
|        +-------------------------------+------------------------+
|        | Terminal Panel (collapsible)                             |
|        | ┌─[sh]──[build]──[test]──────────────────────────────┐  |
|        | │ $ npm test                                         │  |
|        | │ PASS src/auth.test.ts                              │  |
|        | └────────────────────────────────────────────────────┘  |
|        +-------------------------------+------------------------+
|        | Session Composer                                         |
|        | ┌────────────────────────────────────────────────────┐  |
|        | │ @src/auth.ts fix the token refresh logic           │  |
|        | │                                    [build▾][plan▾] │  |
|        | │ [Attach] [!shell]  [/cmd]    ████░░ 42k/100k tokens│  |
|        | │ ┌──────────────────────────────────────────┐       │  |
|        | │ │ [Allow] [Deny] write to src/auth.ts      │       │  |
|        | │ └──────────────────────────────────────────┘       │  |
|        | └────────────────────────────────────────────────────┘  |
+--------+---------------------------------------------------------+
```

This screen is composed of four sub-panels, each documented in detail below.

#### Sub-panel: MessageTimeline

The message timeline is the central scrollable area displaying the conversation between the user and AI agent(s).

**Rendering strategy**: Windowed rendering with 10 messages loaded initially. Scrolling up triggers an 8-turn backfill (lazy load older messages). This keeps DOM weight low for long sessions.

**Message types displayed**:
- **User messages**: Plain text with optional file/image attachments.
- **Agent responses**: Streaming text with thinking indicators (animated dots / expandable thinking block). Markdown rendered inline.
- **Tool call cards**: Inline expandable cards showing tool name, parameters, and result. Collapsed by default; click to expand full output.
- **System messages**: Session start, mode changes, agent handoffs rendered as subtle dividers.

**Key components**:
- `MessageBubble` -- polymorphic component rendering user, agent, or system messages.
- `ToolCallCard` -- collapsible card with tool name badge, parameter summary, and result pane.
- `ThinkingIndicator` -- animated indicator during agent reasoning; expandable to show thinking text when available.
- `StreamingRenderer` -- handles incremental text append during streaming responses.
- `VirtualScroller` -- windowed list (based on `react-window` or `@tanstack/virtual`) for efficient rendering.

**State management**:
- **`useSessionStore`** (Zustand): `messages[]`, `isStreaming`, `activeToolCalls[]`, `thinkingState`, `scrollPosition`, `hasMoreHistory`.

#### Sub-panel: SessionSidePanel

A resizable right panel with four tabs: Review, Files, Agents, and Memory.

**Review tab**:
- File diffs for changes made during the session.
- Toggle between unified and split diff views.
- Line-level comment support (click gutter to add comment).
- Components: `DiffViewer` (unified/split modes), `LineCommentInput`, `DiffFileSelector`.

**Files tab**:
- Workspace file tree with AI-modified indicators (badges on files the agent has read, created, or modified).
- Left side is the file/folder tree; right side is a simple preview/editor panel.
- Files open in preview mode first; users can switch to explicit edit mode.
- File actions include preview, edit, attach to chat, reveal in tree, and copy path.
- Dragging a file into the composer attaches a `file_ref`; dragging a folder attaches a `folder_ref` summary rather than recursive raw file bodies.
- Folder drops show a compact attachment card with path, item count, truncation state, and inferred language/type summary.
- Components: `FileTree`, `FileStatusBadge` (read/created/modified/deleted icons), `FilePreview`, `MonacoEditorSurface`, `AttachmentBar`.

**Agents tab**:
- Agent hierarchy visualization (primary agent, sub-agents, team members).
- Per-agent status (idle, thinking, executing, waiting for approval).
- Task assignment list showing which agent owns which task.
- Current tool activity and mailbox messages per agent.
- Click an agent or system event to drill into a subagent detail/timeline panel.
- Components: `AgentHierarchyTree`, `AgentStatusBadge`, `TaskList`, `AgentMailbox`, `SubagentTimelinePanel`.

Subagent detail panel shows:
- agent role and current status
- current assigned task and detail text
- current tool activity
- recent mailbox messages
- current reasoning mode
- permission wait state when blocked

**Memory tab**:
- Relevant observations from the memory system for the current session context.
- Filterable by type (observation, decision, code pattern).
- Click an observation to view full details or jump to the session where it originated.
- Components: `ObservationList`, `ObservationCard`, `MemoryFilterBar`.

**State management**:
- **`useSessionSidePanelStore`** (Zustand): `activeTab`, `panelWidth`, `diffViewMode: 'unified' | 'split'`, `selectedDiffFile`.
- **`useFileTreeStore`** (Zustand): `tree`, `expandedPaths[]`, `aiModifiedFiles: Record<path, 'read' | 'created' | 'modified' | 'deleted'>`.
- **`useAgentStore`** (Zustand): `agents[]`, `agentHierarchy`, `agentTasks[]`.

#### Sub-panel: TerminalPanel

A collapsible bottom panel hosting one or more PTY terminal sessions.

**Features**:
- PTY rendering via **xterm.js** with full ANSI support.
- Sortable tabs via drag-and-drop reorder.
- Background task output streams into dedicated tabs (e.g., `build`, `test`, `dev server`).
- Resize handle on the top edge; collapse/expand via `Cmd+J` or click the handle.

**Key components**:
- `TerminalView` -- xterm.js wrapper with fit addon, search addon, and web links addon.
- `TerminalTabBar` -- sortable tab strip (drag-and-drop via `@dnd-kit/sortable`).
- `TerminalResizeHandle` -- draggable top edge for height adjustment.

**State management**:
- **`useTerminalStore`** (Zustand): `terminals[]`, `activeTerminalId`, `tabOrder[]`, `panelHeight`, `isCollapsed`.

#### Sub-panel: SessionComposer

The input area docked at the bottom of the session workspace.

**Rich input features**:
- `@file` mentions: Type `@` to get an autocomplete popover of workspace files. Selected files are attached as context.
- `!shell` commands: Type `!` to execute a shell command inline (result appears as a system message).
- Slash command popover: Type `/` to open a filterable command list (e.g., `/clear`, `/model`, `/agent`).
- Attachment buttons: Attach images (paste or click) and files from disk.
- Drag-and-drop: Users can drag files or folders from the Files tab, desktop OS, or editor tabs directly into the composer. Files become `file_ref` attachments; folders become `folder_ref` attachments with manifest/truncation metadata.
- Agent tab switcher: Toggle between agent profiles from all ecosystems (Claude Code agents, OpenCode agents, oh-my-claudecode agents, oh-my-opencode agents, custom agents). `Tab` key cycles forward, `Shift+Tab` cycles reverse (matching OpenCode's UX). Renders as a scrollable tab bar above the input with active indicator, ecosystem source badge, and per-ecosystem filter dropdown. Mid-session switching preserves conversation history but changes the active agent's system prompt, tool access, and permission config.
- Reasoning control: When the active model supports reasoning, show a compact reasoning control with current mode (`off`, `auto`, `on`) and optional effort selector. Per-turn override wins over per-model defaults.

**Permission dock**:
- Inline `[Allow]` / `[Deny]` buttons that appear when the agent requests permission for a privileged action (file write, shell execute, network access).
- Displays the action description and target resource.
- "Remember this choice" checkbox for creating persistent permission rules.

**Token budget bar**:
- Horizontal progress bar showing consumed tokens vs context window limit.
- Color transitions: green (<60%), yellow (60-80%), red (>80%).
- Displays numeric count (e.g., `42k / 100k`).

**Question dock**:
- When the AI agent asks the user a clarifying question, it surfaces as a highlighted card above the input area.
- Quick-reply buttons for common responses (Yes/No/Skip) plus free-text input.

**Key components**:
- `ComposerInput` -- rich textarea with mention/command detection.
- `MentionPopover` -- autocomplete for `@file` mentions.
- `SlashCommandPopover` -- filterable command list.
- `PermissionDock` -- inline allow/deny card.
- `TokenBudgetBar` -- progress bar with color thresholds.
- `QuestionDock` -- highlighted card for agent questions.
- `AgentTabSwitcher` -- scrollable tab bar aggregating agents from all ecosystems (built-in, Claude Code, OpenCode, oh-my-claudecode, oh-my-opencode, custom). Shows ecosystem source badge per agent. Supports `Tab`/`Shift+Tab` keyboard cycling and per-ecosystem filter dropdown.
- `AttachmentBar` -- row of attached files/images with remove buttons.
- `ReasoningControl` -- compact reasoning badge/popover with per-turn override and optional effort selection.

**State management**:
- **`useComposerStore`** (Zustand): `inputText`, `mentions[]`, `attachments[]`, `activeAgentMode`, `pendingPermission`, `pendingQuestion`, `tokenUsage: { used, limit }`, `reasoningOverride`, `reasoningEffortOverride`.

#### Overall Session Workspace State

- **`useSessionStore`** (Zustand): `sessionId`, `projectId`, `messages[]`, `isStreaming`, `mode: 'wrapper' | 'native'`, `activeAgentId`.
- All sub-panel stores are scoped per session via session ID selectors.

#### Navigation and Transitions

- **Entry**: Home screen project card, sidebar rail session tree, Command Palette, or direct URL.
- **Exit**: Sidebar rail navigation to other screens; breadcrumb links back to Home.
- **Internal transitions**: Tab switches within the side panel; terminal tab switches; agent mode switches in composer.

#### Responsive Behavior

- **Desktop (>1200px)**: Full 3-column layout (sidebar rail + timeline + side panel) with bottom terminal and composer.
- **Tablet (768-1200px)**: Side panel collapses to an overlay sheet (swipe or button to reveal). Terminal remains as bottom panel.
- **Compact (<768px)**: Single-column timeline. Side panel and terminal become full-screen sheets accessible via bottom tab bar. Composer remains docked at bottom.

---

### 3. Sidebar Rail

**Route**: Overlay (rendered at application shell level, visible on all screens)

**Purpose**: Project/session tree navigation, agent team indicators, notification badges, and per-project mode indicator.

#### Layout

```text
+--------+
| [Luna] |  <- App logo / Home
|--------|
| [Proj] |  <- Project tree (expandable)
|  ├ my-app [W]
|  │ ├ Session #42 ●
|  │ └ Session #41
|  └ api-svc [N]
|    └ Session #7 ●
|--------|
| [Agnt] |  <- Agent Management (badge: 3 active)
| [Mem]  |  <- Memory Browser
| [Mkt]  |  <- Marketplace
| [Auto] |  <- Autopilot
|--------|
| [Bell] |  <- Notifications (badge: 2)
| [Gear] |  <- Settings
+--------+
```

#### Key Components

- `SidebarRail` -- narrow icon strip with tooltip labels on hover.
- `ProjectTree` -- expandable tree showing projects and their sessions.
- `ModeBadge` -- `[W]` for wrapper, `[N]` for native, displayed next to project name.
- `NotificationBadge` -- red dot with count overlay on icons.
- `AgentTeamIndicator` -- small dot cluster showing active agent count.
- `SessionStatusDot` -- green dot for active sessions, gray for inactive.

#### State Management

- **`useProjectStore`** (Zustand): `projects[]`, `expandedProjectIds[]`.
- **`useNotificationStore`** (Zustand): `unreadCount`, `notifications[]`.
- **`useSidebarStore`** (Zustand): `isExpanded`, `activeSection`.

#### Navigation and Transitions

- Clicking a project expands its session list in-place.
- Clicking a session navigates to `/session/:id`.
- Clicking an icon navigates to the corresponding screen route.
- Hover expands the rail to show labels; click pin icon to lock expanded.

#### Responsive Behavior

- **Desktop / Tablet**: Left-edge rail, always visible.
- **Compact (<768px)**: Transforms into a bottom tab bar with 5 primary icons. Secondary items move into a "More" overflow menu.

---

### 4. Settings

**Route**: `/settings`

**Purpose**: Comprehensive application configuration organized into tabbed categories.

#### Layout

```text
+--------+-------------------+----------------------------------------+
| Sidebar| Settings Nav      | Settings Content                       |
| Rail   |                   |                                        |
|        | > General         | Theme                                  |
|        |   Providers       | ┌──────────────────────────────────┐   |
|        |   Agent Profiles  | │ Color Scheme: [Dark ▾]           │   |
|        |   Memory          | │ Accent Color: [Magenta ●]        │   |
|        |   Permissions     | │ Font Size: [14px ▾]              │   |
|        | > Themes          | │ Font Family: [JetBrains Mono ▾]  │   |
|        |   Plugins         | │ [Preview] [Reset to Default]     │   |
|        |   MCP Servers     | └──────────────────────────────────┘   |
|        |   Ecosystem Compat|                                        |
+--------+-------------------+----------------------------------------+
```

#### Settings Categories

| Category | Content |
|----------|---------|
| **General** | Language, auto-update, telemetry opt-in, default project directory, startup behavior |
| **Providers** | Auth method per provider (OAuth / API key / env var), credential management, model selection defaults. See also [Screen 7: Provider Setup](#7-provider-setup) |
| **Agent Profiles** | Named agent configurations (system prompt, model, temperature, tool permissions). Create/edit/delete/clone profiles |
| **Memory** | Memory system settings: auto-save preferences, retention policies, index rebuild, export/import |
| **Permissions** | Global permission rules, per-project overrides, remembered decisions, trust levels |
| **Themes** | Color scheme, accent color, font, spacing, custom theme JSON import/export, live preview. Integrates with `ThemeEditor` component |
| **Plugins** | Unified plugin manager for both Claude Code and OpenCode ecosystems. Ecosystem-level toggles (enable/disable all Claude Code or all OpenCode plugins as a group). Per-plugin enable/disable toggles, per-plugin settings (rendered via plugin `api.ui.registerSettings`), plugin priority ordering (drag-and-drop), plugin health dashboard (status, error count, latency), update checks. Supports running oh-my-claudecode + oh-my-opencode simultaneously at 100% capability |
| **MCP Servers** | Per-project MCP server configurations (merged from Claude Code + OpenCode configs), connection credentials, diagnostic logs, connection test |
| **Ecosystem Compat** | Ecosystem compatibility settings: Claude Code (CLAUDE.md path overrides, permission mapping, tool aliasing, `.claude/` config) + OpenCode (`opencode.json` import, agent mapping, hook normalization, `.opencode/` config). Per-ecosystem enable toggle. Conflict resolution rules for overlapping configs |

#### Key Components

- `SettingsNav` -- vertical navigation list with section grouping.
- `SettingsForm` -- dynamic form renderer per category.
- `ThemeEditor` -- live preview theme customization (see theming-design-system.md).
- `PluginSettingsHost` -- permission-scoped host container for plugin-contributed settings UI.
- `PluginEcosystemManager` -- grouped view of plugins by ecosystem (Claude Code / OpenCode) with ecosystem-level toggles, per-plugin enable/disable, drag-and-drop priority ordering, and health dashboard.
- `McpServerForm` -- MCP server configuration with connection test button (merged sources from both ecosystems).
- `AgentProfileEditor` -- form for agent profile CRUD with model/temperature/prompt fields. Shows source ecosystem badge.
- `EcosystemCompatSettings` -- dual-pane config for Claude Code and OpenCode compatibility settings with conflict resolution controls.
- `PermissionRuleTable` -- table of saved permission decisions with edit/delete.

#### State Management

- **`useSettingsStore`** (Zustand): `settings: Record<category, Record<key, value>>`, `isDirty`, `activeCategory`.
- **`useThemeStore`** (Zustand): `currentTheme`, `customThemes[]`, `previewTheme`.
- **`usePluginStore`** (Zustand): `installedPlugins[]`, `pluginSettings: Record<pluginId, config>`, `ecosystemToggles: Record<'claude-code' | 'opencode', boolean>`, `pluginPriority: string[]`, `pluginHealth: Record<pluginId, { status, errorCount, lastEvent, latencyMs }>`.

#### Navigation and Transitions

- **Entry**: Sidebar rail gear icon, `Cmd+,`, Command Palette.
- **Exit**: Sidebar rail navigation to other screens. Unsaved changes trigger a confirmation dialog.
- **Deep linking**: `/settings/providers`, `/settings/themes`, etc. map directly to category tabs.

#### Responsive Behavior

- **Desktop**: Two-column (nav + content).
- **Tablet**: Nav collapses to horizontal scrollable tabs above content.
- **Compact**: Full-width single column; nav becomes a dropdown selector.

---

### 5. Agent Management

**Route**: `/agents` or rendered as a panel within the session workspace

**Purpose**: View and manage active agents, teams, task lists, mailbox, and agent hierarchy.

#### Layout

```text
+--------+---------------------------------------------------------+
| Sidebar| Agent Management                                        |
| Rail   |                                                         |
|        | Active Agents                     Agent Hierarchy        |
|        | ┌─────────────────────────┐      ┌──────────────────┐   |
|        | │ Claude (build) ● active │      │ Orchestrator     │   |
|        | │ Claude (plan)  ● idle   │      │ ├─ Builder       │   |
|        | │ Codex (review) ● active │      │ ├─ Planner       │   |
|        | └─────────────────────────┘      │ └─ Reviewer      │   |
|        |                                  └──────────────────┘   |
|        | Task List                                                |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ #1 Fix auth bug        [Builder]  ● in-progress  │    |
|        | │ #2 Write tests         [Builder]  ○ queued       │    |
|        | │ #3 Review PR           [Reviewer] ○ queued       │    |
|        | └───────────────────────────────────────────────────┘    |
|        |                                                         |
|        | Mailbox (inter-agent messages)                           |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ Builder -> Planner: "Auth module ready for review"│    |
|        | │ Reviewer -> Builder: "Found issue in token.ts"    │    |
|        | └───────────────────────────────────────────────────┘    |
+--------+---------------------------------------------------------+
```

#### Key Components

- `AgentList` -- list of active agents with status indicators and provider/model badges.
- `AgentHierarchyTree` -- tree visualization of agent relationships (orchestrator, sub-agents).
- `TaskTable` -- sortable table of tasks with agent assignment, status, and priority.
- `AgentMailbox` -- chronological list of inter-agent messages with sender/receiver labels.
- `AgentProfileBadge` -- compact display of agent name, model, and mode.

#### State Management

- **`useAgentStore`** (Zustand): `agents[]`, `agentHierarchy`, `agentTasks[]`, `mailboxMessages[]`, `selectedAgentId`.

#### Navigation and Transitions

- **Entry**: Sidebar rail agent icon, session side panel Agents tab, Command Palette.
- **Exit**: Clicking a task navigates to the relevant session. Clicking an agent shows detail panel.
- **Panel mode**: When accessed from within a session, renders as a slide-out panel rather than a full page.

#### Responsive Behavior

- **Desktop**: Two-column (agent list + hierarchy on left, tasks + mailbox on right).
- **Tablet**: Single column, stacked sections.
- **Compact**: Accordion-style collapsible sections.

---

### 6. Memory Browser

**Route**: `/memory` or rendered as a panel within the session workspace

**Purpose**: Three-layer search interface for browsing the memory system: index, timeline, and details. Supports filtering by type, concept, date, and session.

#### Layout

```text
+--------+---------------------------------------------------------+
| Sidebar| Memory Browser                                          |
| Rail   |                                                         |
|        | Search & Filters                                        |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ [Search observations...]                          │    |
|        | │ Type: [All▾] Concept: [All▾] Date: [Range▾]      │    |
|        | │ Session: [All▾]                                   │    |
|        | └───────────────────────────────────────────────────┘    |
|        |                                                         |
|        | Index View              Timeline View                    |
|        | ┌──────────────┐       ┌────────────────────────────┐    |
|        | │ Concepts     │       │ ● Mar 10 - auth pattern    │    |
|        | │ ├ auth (12)  │  -->  │ ● Mar 9  - db migration    │    |
|        | │ ├ api (8)    │       │ ● Mar 8  - test strategy   │    |
|        | │ └ deploy (3) │       │ ● Mar 7  - project init    │    |
|        | └──────────────┘       └────────────────────────────┘    |
|        |                                                         |
|        | Detail View                                              |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ Observation: "Auth uses JWT with 15min expiry"    │    |
|        | │ Type: code-pattern | Session: #42 | Mar 10        │    |
|        | │ Context: src/auth.ts:45-62                         │    |
|        | │ [Jump to Session] [Edit] [Delete]                  │    |
|        | └───────────────────────────────────────────────────┘    |
+--------+---------------------------------------------------------+
```

#### Three-Layer Navigation

1. **Index layer**: Browse by concept clusters. Shows concept names with observation counts. Click a concept to drill into its timeline.
2. **Timeline layer**: Chronological list of observations within the selected concept (or globally). Each entry shows date, title, and type badge.
3. **Detail layer**: Full observation content with metadata (type, source session, file references, date). Action buttons for editing, deleting, or jumping to the originating session.

#### Key Components

- `MemorySearchBar` -- full-text search input with debounced query.
- `MemoryFilterBar` -- dropdowns for type, concept, date range, and session filters.
- `ConceptIndex` -- tree/list of concept clusters with counts.
- `ObservationTimeline` -- chronological scrollable list of observations.
- `ObservationDetail` -- expanded card with full content, metadata, and actions.

#### State Management

- **`useMemoryStore`** (Zustand): `observations[]`, `concepts[]`, `filters: { type, concept, dateRange, sessionId }`, `searchQuery`, `selectedObservationId`, `activeLayer: 'index' | 'timeline' | 'detail'`.

#### Navigation and Transitions

- **Entry**: Sidebar rail memory icon, session side panel Memory tab, Command Palette.
- **Exit**: "Jump to Session" navigates to `/session/:id`. Sidebar rail for other screens.
- **Drill-down**: Index -> Timeline -> Detail with back navigation via breadcrumbs.

#### Responsive Behavior

- **Desktop**: Three-layer columns visible simultaneously (index | timeline | detail).
- **Tablet**: Two visible layers; detail opens as overlay.
- **Compact**: Single layer visible with drill-down navigation (back button to return).

---

### 7. Provider Setup

**Route**: `/providers` or rendered as a tab within Settings (`/settings/providers`)

**Purpose**: Per-provider authentication status, OAuth connect flows, API key entry, environment variable auto-detection, credential rotation, model browser with cost/capability info, local model management, and task-based model routing. Supports 75+ cloud providers via models.dev plus local models via Ollama, llama.cpp, LM Studio, and any OpenAI-compatible server.

#### Layout

```text
+--------+---------------------------------------------------------+
| Sidebar| Provider Setup                                          |
| Rail   |                                                         |
|        | Connected Providers                                      |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ Anthropic   [OAuth ●]  claude-4-opus   [Manage]  │    |
|        | │ OpenAI      [API Key ●] gpt-4o         [Manage]  │    |
|        | │ Google      [Env Var ●] gemini-2.5-pro  [Manage]  │    |
|        | └───────────────────────────────────────────────────┘    |
|        |                                                         |
|        | Add Provider                                             |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ [Search 75+ providers...]                          │    |
|        | │ ┌──────────┐ ┌──────────┐ ┌──────────┐           │    |
|        | │ │ Mistral  │ │ Groq     │ │ Together │           │    |
|        | │ │ [Connect]│ │ [Connect]│ │ [Connect]│           │    |
|        | │ └──────────┘ └──────────┘ └──────────┘           │    |
|        | └───────────────────────────────────────────────────┘    |
|        |                                                         |
|        | Model Browser                                            |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ Model           | Context | Input    | Output    │    |
|        | │ claude-4-opus   | 200k    | $15/1M   | $75/1M   │    |
|        | │ gpt-4o          | 128k    | $2.50/1M | $10/1M   │    |
|        | │ gemini-2.5-pro  | 1M      | $1.25/1M | $10/1M   │    |
|        | └───────────────────────────────────────────────────┘    |
+--------+---------------------------------------------------------+
```

#### Auth Methods per Provider

| Method | Flow |
|--------|------|
| **OAuth** | "Connect" button opens browser OAuth flow. Token stored in OS keychain via Tauri secure storage. Refresh handled automatically. |
| **API Key** | Text input with paste support. Key validated on save (test API call). Stored encrypted in OS keychain. |
| **Env Var** | Auto-detected from environment (e.g., `ANTHROPIC_API_KEY`). Status shown as detected/missing. User can override with manual entry. |
| **Local (no auth)** | Auto-detected on well-known ports (Ollama 11434, LM Studio 1234, llama.cpp 8080). "Add Local" button for custom endpoint URL. No API key needed. |

#### Local Models Section

Below "Connected Providers", a dedicated "Local Models" section shows:
- Auto-detected local servers with status (running/offline), endpoint URL, and available model list.
- "Add Local Server" button to configure custom endpoints (URL + optional display name).
- Per-model pull/download button for Ollama (e.g., `ollama pull qwen3.5:0.6b`).
- Model size and estimated speed indicators.

#### Model Routing Section

Below "Model Browser", a "Model Routing" section allows users to assign specific models (cloud or local) to task types:
- Dropdown per task type: `default`, `system.title`, `system.compaction`, `system.observation`, `system.commit_message`, `agent.lightweight`.
- Recommended badge for tasks where local models are sufficient (title, compaction, observation).
- Cost comparison showing estimated savings from routing lightweight tasks to local models.

#### Reasoning Defaults Section

Alongside model routing, each reasoning-capable model exposes:

- reasoning support badge
- default reasoning mode selector: `off`, `auto`, `on`
- effort selector when supported
- optional reasoning budget control when supported by provider/model

These defaults are persisted per provider/model and are applied unless the user overrides them for the current run in the composer.

#### Key Components

- `ProviderCard` -- displays provider name, auth status (green dot = connected, red = disconnected), active model, and manage button.
- `ProviderSearchGrid` -- searchable grid of available providers sourced from models.dev registry.
- `OAuthConnectButton` -- initiates OAuth flow and shows spinner during redirect.
- `ApiKeyInput` -- masked input with reveal toggle and validation indicator.
- `EnvVarDetector` -- shows auto-detected environment variables with status.
- `CredentialRotateButton` -- triggers credential rotation flow with confirmation.
- `ModelBrowser` -- sortable table of models with columns for context window, input cost, output cost, and capabilities.
- `LocalServerCard` -- displays local server status (running/offline), endpoint URL, model list, and pull controls.
- `LocalServerAddForm` -- form for adding custom local endpoints (URL, name, test connection).
- `ModelRoutingTable` -- task type → model assignment table with dropdowns and cost comparison.
- `ModelRoutingRecommendation` -- badge suggesting local models for lightweight tasks with estimated savings.
- `ModelReasoningControls` -- per-model reasoning mode, effort, and optional budget controls shown only when supported.

#### State Management

- **`useProviderStore`** (Zustand): `providers[]`, `providerAuthStatus: Record<providerId, AuthStatus>`, `availableModels[]`, `modelCosts: Record<modelId, CostInfo>`, `localServers: Record<serverId, { url, status, models[] }>`, `modelRouting: Record<taskType, { providerId, modelId }>`, `modelReasoningDefaults: Record<modelKey, { mode: 'off' | 'auto' | 'on'; effort?: 'low' | 'medium' | 'high' }>` .

#### Navigation and Transitions

- **Entry**: Settings Providers tab, sidebar rail (if pinned), Setup Wizard step, Command Palette.
- **Exit**: Back to Settings or sidebar rail navigation.
- **OAuth flow**: Opens system browser for OAuth, returns via deep link (`lunaria://oauth/callback`).

#### Responsive Behavior

- **Desktop**: Provider list + model browser side by side.
- **Tablet / Compact**: Stacked vertically; model browser becomes scrollable table.

---

### 8. Marketplace

**Route**: `/marketplace`

**Purpose**: Discover, install, and manage plugins, themes, agent profiles, and MCP servers from the community registry.

#### Layout

```text
+--------+---------------------------------------------------------+
| Sidebar| Marketplace                          [Search...]        |
| Rail   |                                                         |
|        | [Plugins] [Themes] [Agent Profiles] [MCP Servers]       |
|        |                                                         |
|        | Featured                                                 |
|        | ┌──────────┐ ┌──────────┐ ┌──────────┐                  |
|        | │ Git Lens │ │ Dracula  │ │ Claude   │                  |
|        | │ Plugin   │ │ Theme    │ │ Profile  │                  |
|        | │ ★ 4.8    │ │ ★ 4.9   │ │ ★ 4.7   │                  |
|        | │ [Install]│ │ [Install]│ │ [Install]│                  |
|        | └──────────┘ └──────────┘ └──────────┘                  |
|        |                                                         |
|        | All Plugins (sorted by popularity)                       |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ Plugin Name | Author | Downloads | Rating | [+]  │    |
|        | │ ...         | ...    | ...       | ...    | [+]  │    |
|        | └───────────────────────────────────────────────────┘    |
+--------+---------------------------------------------------------+
```

#### Key Components

- `MarketplaceTabs` -- category tab bar (Plugins, Themes, Agent Profiles, MCP Servers).
- `MarketplaceCard` -- card with name, author, rating, download count, and install button.
- `MarketplaceDetailSheet` -- slide-in panel with full description, screenshots, permissions list, changelog, and install/uninstall button.
- `MarketplaceSearch` -- search input with category-aware filtering.
- `RatingStars` -- star rating display with review count.

#### State Management

- **`useMarketplaceStore`** (Zustand): `listings[]`, `searchQuery`, `activeCategory`, `installedIds[]`, `selectedListingId`.
- **`usePluginStore`** (Zustand): `installedPlugins[]` (shared with Settings).

#### Navigation and Transitions

- **Entry**: Sidebar rail marketplace icon, Command Palette, Settings plugins section "Browse Marketplace" link.
- **Exit**: Install may prompt restart or redirect to Settings for configuration. Sidebar rail for other screens.
- **Detail view**: Clicking a card opens `MarketplaceDetailSheet` as a right-side overlay.

#### Responsive Behavior

- **Desktop**: Grid layout with 3-4 cards per row; detail sheet as right panel.
- **Tablet**: 2 cards per row; detail sheet as full-width overlay.
- **Compact**: Single card per row; detail sheet as full-screen modal.

---

### 9. Setup Wizard

**Route**: `/setup`

**Purpose**: First-run onboarding flow. The canonical step order, state machine, and persistence rules are defined in [`setup-wizard.md`](./setup-wizard.md); this section describes the screen shell only.

#### Layout

```text
+------------------------------------------------------------------+
|                                                                    |
|                    Lunaria Setup  (Step 2 of 7)                    |
|                    ████████░░░░░░░░                                 |
|                                                                    |
|    ┌──────────────────────────────────────────────────────────┐    |
|    │                                                          │    |
|    │  Connect Your AI Providers                               │    |
|    │                                                          │    |
|    │  ┌────────────────────────────────────────────────┐      │    |
|    │  │ Anthropic   [Connect with OAuth]               │      │    |
|    │  │ OpenAI      [Enter API Key]                    │      │    |
|    │  │ Google      [Detected: GOOGLE_API_KEY ✓]       │      │    |
|    │  └────────────────────────────────────────────────┘      │    |
|    │                                                          │    |
|    │  You can add more providers later in Settings.           │    |
|    │                                                          │    |
|    │                              [Back]  [Next →]            │    |
|    └──────────────────────────────────────────────────────────┘    |
|                                                                    |
+------------------------------------------------------------------+
```

#### Wizard Steps

| Step | Title | Content |
|------|-------|---------|
| 1 | Welcome + Mode | Locale, theme, and initial wrapper/native mode selection |
| 2 | Provider Auth | Connect providers via OAuth, API key, or env var detection |
| 3 | Default Model | Pick the default model for the initial profile |
| 4 | Agent Backend Detection | Detect installed wrapper backends, or confirm native mode |
| 5 | Memory System | Initialize SQLite, indices, and degraded-mode fallbacks |
| 6 | Agent Profile | Configure the default agent profile and recommended tool set |
| 7 | Ecosystem Compat | Import `.claude/`, `.opencode/`, hooks, agents, and plugins when present |

#### Key Components

- `WizardStepper` -- progress bar with step labels and navigation.
- `ProviderConnectList` -- reuses components from Provider Setup screen.
- `BackendDetectionGrid` -- wrapper backend detection results and install guidance.
- `MemoryInitProgress` -- database and index initialization state.
- `AgentProfilePresets` -- selectable preset cards (e.g., "Balanced", "Fast", "Thorough").
- `EcosystemImportPreview` -- grouped import summary for Claude Code and OpenCode compatibility.

#### State Management

- **`useSetupWizardStore`** (Zustand): must follow the canonical 7-step `WizardState` contract from [`setup-wizard.md`](./setup-wizard.md) rather than a screen-local ad hoc shape.

#### Navigation and Transitions

- **Entry**: First application launch (auto-redirect if setup not completed), or manually via `/setup`.
- **Exit**: Completing the wizard redirects to Home (`/`). Only ecosystem import is skippable when no compatible config is found.
- **Step navigation**: Back/Next buttons; steps are also clickable in the progress bar for completed steps.

#### Responsive Behavior

- **Desktop**: Centered card (max-width 640px) with comfortable padding.
- **Tablet**: Card expands to full width with side margins.
- **Compact**: Full-screen card, no margins.

---

### 10. Command Palette

**Route**: Overlay (modal, rendered above current screen)

**Purpose**: Universal access point for slash commands, agent commands, memory search, model switching, and navigation.

#### Layout

```text
+------------------------------------------------------------------+
|                                                                    |
|         ┌──────────────────────────────────────────────┐          |
|         │ > search or type a command...                 │          |
|         ├──────────────────────────────────────────────┤          |
|         │ Recent                                        │          |
|         │   /model claude-4-opus                        │          |
|         │   /clear                                      │          |
|         │                                               │          |
|         │ Navigation                                    │          |
|         │   Go to Settings                  Cmd+,       │          |
|         │   Go to Memory Browser                        │          |
|         │   Go to Agent Management                      │          |
|         │                                               │          |
|         │ Commands                                      │          |
|         │   /agent spawn builder                        │          |
|         │   /memory search "auth pattern"               │          |
|         │   /model switch gpt-4o                        │          |
|         │                                               │          |
|         │ Sessions                                      │          |
|         │   my-app / Session #42                        │          |
|         │   api-svc / Session #7                        │          |
|         └──────────────────────────────────────────────┘          |
|                                                                    |
+------------------------------------------------------------------+
```

#### Command Categories

| Category | Examples |
|----------|----------|
| **Navigation** | Go to any screen, jump to session, open project |
| **Slash commands** | `/model`, `/clear`, `/agent`, `/memory`, `/help` |
| **Agent commands** | Spawn agent, switch agent mode, view agent status |
| **Memory search** | Full-text search across observations, jump to result |
| **Model switching** | Quick model change for active session |
| **File navigation** | Open file from workspace, jump to symbol |

#### Key Components

- `CommandPaletteModal` -- centered modal with search input and result list. Uses `Command` component from shadcn/ui (built on cmdk).
- `CommandGroup` -- grouped results by category with section headers.
- `CommandItem` -- individual result row with icon, label, and optional keyboard shortcut badge.
- `CommandSearch` -- input with debounced search across all categories.

#### State Management

- **`useCommandPaletteStore`** (Zustand): `isOpen`, `searchQuery`, `results[]`, `selectedIndex`, `recentCommands[]`.

#### Navigation and Transitions

- **Entry**: `Cmd+K` from any screen, or `/` key when not focused on an input.
- **Exit**: `Esc` to close, selecting a result executes the action and closes the palette.
- **Results**: Navigation items trigger route change. Commands execute inline. Memory results navigate to Memory Browser detail.

#### Responsive Behavior

- **Desktop / Tablet**: Centered modal (max-width 560px) with backdrop blur.
- **Compact**: Full-width modal anchored to top of screen.

---

### 11. Autopilot

**Route**: `/autopilot` or rendered as a panel within the session workspace

**Purpose**: Goal-driven autonomous execution. User inputs a high-level goal, breaks it into user stories, and the system executes them with full progress tracking and crash recovery.

#### Layout

```text
+--------+---------------------------------------------------------+
| Sidebar| Autopilot                                               |
| Rail   |                                                         |
|        | Goal                                                     |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ "Build a REST API with auth, CRUD, and tests"     │    |
|        | │                                        [Execute]  │    |
|        | └───────────────────────────────────────────────────┘    |
|        |                                                         |
|        | User Stories (drag to reorder)                           |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ ≡ 1. Set up project scaffolding         ✓ done    │    |
|        | │ ≡ 2. Implement auth module               ● running │    |
|        | │ ≡ 3. Build CRUD endpoints                ○ queued  │    |
|        | │ ≡ 4. Write integration tests             ○ queued  │    |
|        | │ ≡ 5. Add error handling & validation     ○ queued  │    |
|        | └───────────────────────────────────────────────────┘    |
|        |                                                         |
|        | Execution Progress                                       |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ Story #2: Implement auth module                    │    |
|        | │ ████████████░░░░░░░░ 60%                           │    |
|        | │ Current: Writing JWT middleware                     │    |
|        | │ Files modified: 4 | Tests passing: 12/12           │    |
|        | │                                                     │    |
|        | │ [Pause] [Skip Story] [Abort]                       │    |
|        | └───────────────────────────────────────────────────┘    |
|        |                                                         |
|        | Recovery                                                 |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ ⚠ Story #2 crashed at step 3. [Resume] [Retry]    │    |
|        | └───────────────────────────────────────────────────┘    |
+--------+---------------------------------------------------------+
```

#### Key Components

- `GoalInput` -- text area for high-level goal description with "Execute" button.
- `UserStoryList` -- drag-and-drop reorderable list (via `@dnd-kit/sortable`) of generated user stories.
- `StoryStatusBadge` -- status indicators (done, running, queued, failed, skipped).
- `ExecutionProgressCard` -- real-time progress for the active story showing percentage, current step, file count, test results.
- `CrashRecoveryBanner` -- alert banner for failed stories with Resume/Retry actions.
- `AutopilotControls` -- Pause, Skip, and Abort buttons.

#### State Management

- **`useAutopilotStore`** (Zustand): `goal`, `stories[]`, `storyOrder[]`, `activeStoryId`, `executionProgress: { percentage, currentStep, filesModified, testResults }`, `crashState`, `status: 'idle' | 'running' | 'paused' | 'crashed' | 'complete'`.

#### Navigation and Transitions

- **Entry**: Sidebar rail autopilot icon, Command Palette, or from a session via `/autopilot` command.
- **Exit**: Sidebar rail navigation. Active autopilot continues in background.
- **Session linking**: Clicking a running story opens its associated session workspace.

#### Responsive Behavior

- **Desktop**: Full-width layout with story list and progress side by side.
- **Tablet / Compact**: Stacked vertically; drag handles remain functional on touch.

---

### 12. Opinions

**Route**: `/opinions` or rendered as a panel

**Purpose**: Multi-model query interface. Send the same prompt to multiple models simultaneously and view responses side by side with an optional synthesis view.

#### Layout

```text
+--------+---------------------------------------------------------+
| Sidebar| Opinions                                                |
| Rail   |                                                         |
|        | Query                                                    |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ "What's the best approach for rate limiting?"      │    |
|        | │ Models: [Claude ✓] [GPT-4o ✓] [Gemini ✓]         │    |
|        | │                                          [Ask All] │    |
|        | └───────────────────────────────────────────────────┘    |
|        |                                                         |
|        | Responses (side-by-side)                                 |
|        | ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         |
|        | │ Claude      │ │ GPT-4o      │ │ Gemini      │         |
|        | │             │ │             │ │             │         |
|        | │ Token bucket│ │ Sliding     │ │ Fixed       │         |
|        | │ algorithm   │ │ window with │ │ window with │         |
|        | │ with Redis  │ │ in-memory   │ │ distributed │         |
|        | │ ...         │ │ fallback... │ │ counter...  │         |
|        | └─────────────┘ └─────────────┘ └─────────────┘         |
|        |                                                         |
|        | Synthesis                                                |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ All three models agree on using a token bucket     │    |
|        | │ approach. Key differences: Claude recommends Redis, │    |
|        | │ GPT-4o suggests in-memory fallback, Gemini prefers  │    |
|        | │ distributed counters...                             │    |
|        | └───────────────────────────────────────────────────┘    |
+--------+---------------------------------------------------------+
```

#### Key Components

- `OpinionQueryInput` -- text area with model selector checkboxes and "Ask All" button.
- `ResponseColumn` -- individual model response with streaming support, model badge, and token count.
- `SynthesisCard` -- auto-generated summary comparing and contrasting all responses.
- `ModelSelector` -- checkbox grid of available connected models.

#### State Management

- **`useOpinionsStore`** (Zustand): `query`, `selectedModels[]`, `responses: Record<modelId, { text, isStreaming, tokenCount }>`, `synthesis`, `isGenerating`.

#### Navigation and Transitions

- **Entry**: Sidebar rail or Command Palette. Can also be triggered from a session via `/opinions` command.
- **Exit**: Sidebar rail navigation. Responses are preserved in session history.

#### Responsive Behavior

- **Desktop**: Side-by-side columns (up to 3-4 models visible).
- **Tablet**: 2 columns with horizontal scroll for additional models.
- **Compact**: Stacked vertically with tab-based model switching.

---

### 13. Visual Editor

**Route**: Overlay within the session workspace (`/session/:id` context)

**Purpose**: Preview browser with element selection and describe-to-change functionality. Allows users to visually point at UI elements and describe desired changes in natural language.

#### Layout

```text
+------------------------------------------------------------------+
| Visual Editor                                    [Close] [Detach] |
+------------------------------------------------------------------+
| Toolbar: [← →] [Refresh] [URL: localhost:3000]  [Select Mode ◎]  |
+------------------------------------------------------------------+
|                                                                    |
|   ┌────────────────────────────────────────────────────────────┐  |
|   │                                                            │  |
|   │              Browser Preview (iframe/webview)              │  |
|   │                                                            │  |
|   │         ┌─────────────────────────┐                        │  |
|   │         │  [Selected Element]     │ <-- highlight overlay  │  |
|   │         └─────────────────────────┘                        │  |
|   │                                                            │  |
|   └────────────────────────────────────────────────────────────┘  |
|                                                                    |
| ┌──────────────────────────────────────────────────────────────┐  |
| │ Selected: <button class="btn-primary">Submit</button>        │  |
| │ Describe change: "Make this button larger with rounded       │  |
| │ corners and a green background"                    [Apply]   │  |
| └──────────────────────────────────────────────────────────────┘  |
+------------------------------------------------------------------+
```

#### Key Components

- `BrowserPreview` -- iframe or Tauri webview rendering the target application with injected selection overlay.
- `ElementSelector` -- click-to-select mode that highlights hovered elements and captures the selected element's selector and context.
- `ChangeDescriptionInput` -- text area for natural language change descriptions.
- `PreviewToolbar` -- navigation buttons (back/forward/refresh), URL bar, and select mode toggle.
- `ElementInfoBar` -- displays the selected element's tag, classes, and text content.

#### State Management

- **`useVisualEditorStore`** (Zustand): `isOpen`, `previewUrl`, `selectedElement: { selector, tagName, classes, textContent }`, `changeDescription`, `isApplying`.

#### Navigation and Transitions

- **Entry**: Session workspace toolbar button, Command Palette, or `/visual` command in composer.
- **Exit**: Close button returns to session workspace. Changes are applied via the agent and appear in the session message timeline.
- **Detach**: Can be popped out into a separate window (Tauri multi-window).

#### Responsive Behavior

- **Desktop**: Full overlay with preview taking 70% height, description input taking 30%.
- **Tablet**: Same proportions, slightly reduced padding.
- **Compact**: Not available on compact screens (requires minimum 768px width). Shows informational message suggesting desktop use.

---

### 14. Workspace Manager

**Route**: `/workspaces` or rendered as a panel

**Purpose**: Manage active git worktree clones, linked session groups, disk usage monitoring, and clone/destroy operations.

#### Layout

```text
+--------+---------------------------------------------------------+
| Sidebar| Workspace Manager                        [+ New Clone]  |
| Rail   |                                                         |
|        | Active Workspaces                                        |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ Workspace        | Branch     | Sessions | Disk   │    |
|        | │ my-app           | main       | 3        | 245 MB │    |
|        | │ my-app-feature   | feat/auth  | 1        | 52 MB  │    |
|        | │ api-svc          | main       | 2        | 180 MB │    |
|        | └───────────────────────────────────────────────────┘    |
|        |                                                         |
|        | Linked Groups                                            |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ "Auth Feature" group:                              │    |
|        | │   my-app-feature (feat/auth)                       │    |
|        | │   api-svc-auth (feat/auth-api)                     │    |
|        | │   [Unlink] [Open All]                              │    |
|        | └───────────────────────────────────────────────────┘    |
|        |                                                         |
|        | Disk Usage                                               |
|        | ┌───────────────────────────────────────────────────┐    |
|        | │ Total: 477 MB / 10 GB allocated                    │    |
|        | │ ████░░░░░░░░░░░░░░░░                               │    |
|        | │ [Clean Unused] [Compact]                            │    |
|        | └───────────────────────────────────────────────────┘    |
+--------+---------------------------------------------------------+
```

#### Key Components

- `WorkspaceTable` -- sortable table of active workspaces with branch, session count, and disk usage columns.
- `WorkspaceActions` -- row-level actions: open, destroy (with confirmation), view sessions.
- `LinkedGroupCard` -- displays grouped workspaces with unlink and bulk-open actions.
- `DiskUsageBar` -- progress bar with total usage vs allocated space.
- `CloneDialog` -- modal for creating a new worktree clone (repository URL, branch, target directory).
- `CleanupActions` -- buttons for removing unused worktrees and compacting git objects.
- `MergeReviewCard` -- review gate showing source workspace, target branch, changed files, and conflict status before apply-back.
- `ApplyBackDialog` -- explicit confirmation flow for merge/apply operations.

Merge review behavior:
- apply-back is never automatic
- review card must show changed file count, conflict count, source workspace, target branch, and summary text
- if conflicts exist, the apply action is blocked and the UI offers review/export only

#### State Management

- **`useWorkspaceStore`** (Zustand): `workspaces[]`, `linkedGroups[]`, `diskUsage: { used, allocated }`, `selectedWorkspaceId`, `pendingMergeReviews[]`.

#### Navigation and Transitions

- **Entry**: Sidebar rail (if pinned), Command Palette, or Settings.
- **Exit**: Opening a workspace navigates to its most recent session. Sidebar rail for other screens.
- **Destructive actions**: Destroy workspace shows confirmation dialog with affected session count.

#### Responsive Behavior

- **Desktop**: Full table layout with all columns visible.
- **Tablet**: Table scrolls horizontally; linked groups stack below.
- **Compact**: Card-based layout replacing table rows; swipe actions for destroy/open.

---

### 15. Remote Access

**Route**: `/settings/remote`

**Purpose**: QR code pairing for remote devices, E2E encryption status, active remote session management, and terminal access configuration.

#### Layout

```text
+--------+-------------------+----------------------------------------+
| Sidebar| Settings Nav      | Remote Access                          |
| Rail   |                   |                                        |
|        | ...               | Pair New Device                        |
|        | > Remote Access   | ┌──────────────────────────────────┐   |
|        | ...               | │        ┌──────────┐              │   |
|        |                   | │        │ QR Code  │              │   |
|        |                   | │        │  ▓▓▓▓▓▓  │              │   |
|        |                   | │        │  ▓▓▓▓▓▓  │              │   |
|        |                   | │        └──────────┘              │   |
|        |                   | │  PIN: 482-917        [Refresh]   │   |
|        |                   | │  Expires in: 4:32               │   |
|        |                   | └──────────────────────────────────┘   |
|        |                   |                                        |
|        |                   | E2E Encryption                         |
|        |                   | ┌──────────────────────────────────┐   |
|        |                   | │ Status: ● Active (X25519)       │   |
|        |                   | │ Key fingerprint: a1b2...f8e9     │   |
|        |                   | │ [Rotate Keys] [View Certificate] │   |
|        |                   | └──────────────────────────────────┘   |
|        |                   |                                        |
|        |                   | Active Remote Sessions                 |
|        |                   | ┌──────────────────────────────────┐   |
|        |                   | │ Device      | Connected | Access  │   |
|        |                   | │ iPhone 15   | 2h ago    | Full    │   |
|        |                   | │ iPad Pro    | 5m ago    | Terminal│   |
|        |                   | │         [Disconnect] [Revoke]     │   |
|        |                   | └──────────────────────────────────┘   |
|        |                   |                                        |
|        |                   | Terminal Access                        |
|        |                   | ┌──────────────────────────────────┐   |
|        |                   | │ Allow remote terminal: [On/Off]  │   |
|        |                   | │ Require approval: [On/Off]       │   |
|        |                   | │ Session timeout: [30 min ▾]      │   |
|        |                   | └──────────────────────────────────┘   |
+--------+-------------------+----------------------------------------+
```

#### Key Components

- `PairingQRCode` -- dynamically generated QR code encoding the pairing challenge. Includes PIN display and expiry countdown.
- `EncryptionStatusCard` -- displays E2E encryption status, algorithm (X25519 + ChaCha20-Poly1305), key fingerprint, and rotation controls.
- `RemoteSessionTable` -- table of active remote sessions with device name, connection time, access level, and disconnect/revoke actions.
- `TerminalAccessControls` -- toggle switches for remote terminal access, approval requirements, and session timeout.

#### State Management

- **`useRemoteAccessStore`** (Zustand): `pairingChallenge`, `pairingExpiry`, `encryptionStatus`, `keyFingerprint`, `remoteSessions[]`, `terminalAccessSettings`.

#### Navigation and Transitions

- **Entry**: Settings screen Remote Access category, Command Palette.
- **Exit**: Back to Settings parent. Revoking a device shows confirmation dialog.
- **Pairing flow**: QR code scan on the paired mobile device initiates the remote access pairing flow described in [`remote-control-protocol.md`](./remote-control-protocol.md). Status updates in real time via Axum events.

#### Responsive Behavior

- **Desktop**: Rendered within Settings two-column layout.
- **Tablet**: Same as Settings responsive behavior (tabs above content).
- **Compact**: Full-width single column; QR code and PIN stack vertically.

---

## Responsive Behavior Summary

The application uses Tailwind CSS v4 breakpoints and follows a mobile-aware, desktop-optimized design approach.

| Breakpoint | Width | Layout Strategy |
|------------|-------|-----------------|
| **Desktop** | >1200px | Multi-column layouts fully expanded. Sidebar rail + main content + side panels visible simultaneously. |
| **Tablet** | 768-1200px | Secondary panels collapse to overlays/sheets. Sidebar rail shows icons only. Side panels become tabs or slide-out sheets. |
| **Compact** | <768px | Single-column layout. Sidebar rail becomes bottom tab bar. All secondary panels become full-screen sheets. Command Palette anchors to top. |

### Shared Responsive Patterns

- **Sheet component**: Used consistently for off-canvas panels on tablet/compact. Gesture-dismissible (swipe down/right).
- **Bottom tab bar**: 5 primary items (Home, Sessions, Agents, Memory, Settings). Overflow items in "More" menu.
- **Floating Action Button**: On compact screens, "New Session" becomes a FAB in the bottom-right corner.
- **Adaptive tables**: Tables switch to card-based layouts on compact screens.

---

## Plugin-Contributed Screens

The plugin framework allows third-party extensions to contribute new screens and UI elements via the `api.ui.registerView` method.

### Registration Targets

| Target | Description |
|--------|-------------|
| `sidebar` | Adds an icon to the sidebar rail with a linked panel or page |
| `panel` | Adds a tab to the session side panel |
| `page` | Registers a full-page route (e.g., `/plugins/:pluginId/view`) |
| `decorator` | Adds overlay elements to existing screens (badges, indicators) |
| `settings` | Adds a settings section under Plugins in the Settings screen |
| `composer` | Adds buttons or controls to the session composer |

### Plugin UI Rendering

Plugin-contributed React components are rendered within the host application's layout shell. They receive access to the host's design tokens and component library (shadcn/ui primitives) for visual consistency. They are permission-scoped and audited through the plugin host API, but they are not process-isolated from the main renderer in the current architecture.

### Example: Plugin Settings

```text
Settings > Plugins > Acme Plugin
┌──────────────────────────────────────────┐
│ Acme Plugin Configuration                │
│                                          │
│ API Key: [Enter key...]                  │
│ Enable Feature X: [Toggle]               │
│ Sync Interval: [5 min ▾]                │
│                                          │
│ [Save] [Reset to Defaults]               │
└──────────────────────────────────────────┘
```

---

## Zustand Store Cross-Reference

All frontend state is managed via Zustand stores in the webview process. Stores hydrate from the Axum REST API and stay synchronized via SSE. Tauri commands are reserved for OS-native operations only.

| Store | Key State | Used By Screens |
|-------|-----------|-----------------|
| `useProjectStore` | `projects[]`, `recentProjects[]`, `projectModes` | Home, Sidebar Rail |
| `useSessionStore` | `sessionId`, `messages[]`, `isStreaming`, `mode` | Session Workspace |
| `useProviderStore` | `providers[]`, `providerHealth`, `availableModels[]`, `modelReasoningDefaults` | Home, Provider Setup, Settings |
| `useSettingsStore` | `settings`, `isDirty`, `activeCategory` | Settings |
| `useThemeStore` | `currentTheme`, `customThemes[]` | Settings (Themes) |
| `usePluginStore` | `installedPlugins[]`, `pluginSettings` | Settings (Plugins), Marketplace |
| `useAgentStore` | `agents[]`, `agentHierarchy`, `agentTasks[]`, `mailboxMessages[]`, `activeToolActivity[]` | Agent Management, Session Side Panel |
| `useMemoryStore` | `observations[]`, `concepts[]`, `filters` | Memory Browser, Session Side Panel |
| `useTerminalStore` | `terminals[]`, `activeTerminalId`, `tabOrder[]` | Session Workspace (Terminal Panel) |
| `useComposerStore` | `inputText`, `mentions[]`, `attachments[]`, `tokenUsage`, `reasoningOverride`, `reasoningEffortOverride` | Session Workspace (Composer) |
| `useSessionSidePanelStore` | `activeTab`, `panelWidth`, `diffViewMode` | Session Workspace (Side Panel) |
| `useFileTreeStore` | `tree`, `expandedPaths[]`, `aiModifiedFiles` | Session Workspace (Files Tab) |
| `useMarketplaceStore` | `listings[]`, `searchQuery`, `activeCategory` | Marketplace |
| `useSetupWizardStore` | `currentStep`, `completedSteps[]` | Setup Wizard |
| `useCommandPaletteStore` | `isOpen`, `searchQuery`, `results[]` | Command Palette |
| `useAutopilotStore` | `goal`, `stories[]`, `executionProgress` | Autopilot |
| `useOpinionsStore` | `query`, `selectedModels[]`, `responses` | Opinions |
| `useVisualEditorStore` | `isOpen`, `previewUrl`, `selectedElement` | Visual Editor |
| `useWorkspaceStore` | `workspaces[]`, `linkedGroups[]`, `diskUsage`, `pendingMergeReviews[]` | Workspace Manager |
| `useRemoteAccessStore` | `pairingChallenge`, `remoteSessions[]` | Remote Access |
| `useNotificationStore` | `unreadCount`, `notifications[]` | Sidebar Rail |
| `useSidebarStore` | `isExpanded`, `activeSection` | Sidebar Rail |
