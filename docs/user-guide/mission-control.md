# Mission Control

Mission Control is Amoena's orchestration layer for managing AI agents, teams, and autonomous workflows. It provides visibility into agent activity, team consensus, and task progress.

## Overview

```
+---------------------------------------------------------------+
|                      Mission Control                           |
|                                                                |
|  +------------------+  +------------------+  +---------------+ |
|  |  Agent Manager   |  |  Team Dashboard  |  |  Task Board   | |
|  |  - Spawn agents  |  |  - Mailbox       |  |  - Kanban     | |
|  |  - Set personas  |  |  - Consensus     |  |  - Priority   | |
|  |  - View status   |  |  - Flags         |  |  - Hierarchy  | |
|  +------------------+  +------------------+  +---------------+ |
|                                                                |
|  +------------------+  +------------------+  +---------------+ |
|  |  Autopilot       |  |  Usage Analytics |  |  Workspaces   | |
|  |  - Phase tracker |  |  - Token costs   |  |  - Branches   | |
|  |  - Activity log  |  |  - Provider stat |  |  - Reviews    | |
|  |  - Story steps   |  |  - Daily trends  |  |  - Merge      | |
|  +------------------+  +------------------+  +---------------+ |
+---------------------------------------------------------------+
```

## Agent Management

### Spawning Agents

Agents are created within a session. Each agent has a **persona** that defines its system prompt, tool access, permission level, collaboration style, and decision weight.

```bash
# Spawn a sub-agent in an existing session
amoena sessions agents spawn <session-id> \
  --agent-type code-reviewer \
  --model claude-sonnet-4-20250514 \
  --division qa
```

From the UI, navigate to the **Agents** page to spawn, inspect, and manage agents.

### Agent Hierarchy

Agents form a tree rooted at the **primary agent** (the one created when you start a session). Sub-agents inherit tool access from their parent, scoped down by the persona's permissions.

```
Primary Agent (admin)
  +-- Code Writer (read_write)
  |     +-- Test Runner (read_only)
  +-- Security Reviewer (read_only)
```

Permission inheritance follows a **minimum ceiling** rule: a sub-agent can never have more permissions than its parent. The effective tool list is the intersection of the parent's tools and the persona's tools, filtered by the lowest permission ceiling.

### Permission Levels

| Level          | Can Do                                  |
| -------------- | --------------------------------------- |
| `read_only`    | Read files, search, analyze             |
| `read_write`   | Read + write files, edit code           |
| `shell_access` | Read + write + execute shell commands   |
| `admin`        | Full access including system operations |

### Agent Lifecycle

```
Created -> Preparing -> Active -> Running -> Completed
                          |                     |
                          +-> Paused -> Active   |
                          |                     |
                          +-> Stopped           |
                          +-> Failed            |
                          +-> Cancelled         +
```

## Teams and Consensus

Teams group multiple agents for collaborative work. Each team has a **consensus threshold** that determines when decisions are approved.

### Creating a Team

```bash
amoena teams create \
  --name "Architecture Review" \
  --threshold 0.7
```

### Mailbox Communication

Agents communicate through a team mailbox. Messages can be:

- **Message** -- general communication between agents
- **DecisionRequest** -- an agent proposes a decision for the team
- **DecisionResponse** -- an agent votes on a pending decision

```bash
# Send a message to the team
amoena teams mailbox send <team-id> \
  --from <agent-id> \
  --content "I recommend extracting this into a separate module"

# View mailbox
amoena teams mailbox list <team-id>
```

### Consensus Evaluation

When a `DecisionRequest` is submitted, team members respond with `DecisionResponse` messages. Each response carries the agent's `decisionWeight` (0.0 to 1.0). The decision passes when:

```
sum(approve_weights) / sum(all_weights) > threshold
```

Agents with a `critical` collaboration style automatically raise a **mailbox flag** when they send messages. Flags block consensus until resolved.

### Collaboration Styles

Each agent persona defines a collaboration style that affects team dynamics:

| Style         | Behavior                                         |
| ------------- | ------------------------------------------------ |
| `cooperative` | Works with the team, weighs in when asked        |
| `autonomous`  | Works independently, reports results             |
| `critical`    | Challenges assumptions, raises flags on concerns |
| `advisory`    | Provides guidance, defers final decisions        |

## Autopilot

Autopilot enables autonomous multi-turn execution. When enabled on a session, the agent:

1. Receives a goal
2. Breaks it into phases
3. Executes each phase, potentially spawning sub-agents
4. Tracks progress via **story steps** and an **activity log**
5. Completes or stops when the step limit is reached

### Monitoring Autopilot

From the UI, the Autopilot page shows:

- **Current phase** and overall state
- **Activity log** with timestamped actions and their status
- **Story steps** with token usage per step
- **Run history** with duration and outcome
- **Sub-agents** spawned during the run

```bash
# Check autopilot status
amoena sessions autopilot <session-id>

# Enable autopilot
amoena sessions autopilot <session-id> --enable

# Disable autopilot
amoena sessions autopilot <session-id> --disable
```

## Task Board

The Kanban-style task board tracks work items within sessions:

```bash
# Create a task
amoena tasks create <session-id> --title "Refactor auth module"

# Move task to in-progress
amoena tasks update <session-id> <task-id> --status in_progress

# List all tasks
amoena tasks list <session-id>
```

Tasks support:

- **Hierarchical nesting** (parent/child tasks)
- **Priority levels** (numeric, higher = more urgent)
- **Status tracking**: `pending`, `in_progress`, `completed`, `blocked`, `cancelled`
- **Reordering** for custom sort within a status column

## Routing

The **Provider Routing Service** selects the optimal provider and model for each agent turn. Routing considers:

1. **Persona preferred model** -- if the persona specifies a model, use it
2. **Explicit request** -- if the user specifies a provider/model, use it
3. **Division affinity** -- security and QA divisions prefer reasoning-capable models
4. **Adaptive reasoning** -- task type determines reasoning mode:
   - `on` for planning, architecture, debugging, code review, security review
   - `off` for system tasks (titles, compaction, observations)
   - `auto` for everything else

### Reasoning Effort

When reasoning is enabled and the model supports it, effort can be `low`, `medium`, or `high`. The default is `medium`. Override per-turn:

```bash
amoena sessions message <session-id> "Review this PR" \
  --reasoning-mode on \
  --reasoning-effort high
```

## Usage Analytics

Track token consumption and cost across all providers:

```bash
# Refresh usage data from provider APIs
amoena usage refresh

# View daily aggregates
amoena usage daily --range 30

# View per-provider summary
amoena usage summary
```

The Usage page in the desktop UI shows charts for daily token consumption, cost breakdown by provider, and per-session drill-down.

## Workspaces

Workspaces provide Git-integrated isolated environments for agent work:

```bash
# Create a workspace
amoena workspaces create --name "feature-auth" --root-path /path/to/project

# Inspect workspace (see changed files)
amoena workspaces inspect <workspace-id>

# Request merge review
amoena workspaces review <workspace-id>
```

Workspace merge reviews track:

- Changed files and conflict count
- Contributing agents
- Team consensus score
- Flagged and acknowledged decisions
