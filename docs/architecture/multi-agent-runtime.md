# Multi-Agent Runtime Architecture

> **Phase Scope:** Multi-agent orchestration is a V1.5 feature. MVP supports single-agent sessions only. V1.0 adds basic subagent spawning (depth 2). Full teams, mailbox messaging, and task lists arrive in V1.5. This document describes the complete V1.5 target architecture.

## Purpose

This document defines subagents, teams, mailbox semantics, and GUI visibility for multi-agent runs.

## Runtime Model

Agents exist in three forms:

- primary
- subagent
- system

Teams coordinate multiple agents over shared task context, but each agent remains permission-scoped.

## Required Agent State

Each visible agent must expose:

- `agentId`
- label
- role
- status
- current task
- current tool activity
- reasoning mode
- permission wait state

## Mailbox Model

Mailbox messages are explicit agent-to-agent messages.

Fields:

- `fromAgentId`
- `toAgentId?`
- `message`
- `timestamp`

Mailbox traffic is visible in the desktop GUI and summarized on mobile.

## GUI Requirements

Desktop:

- hierarchy tree
- live status
- task ownership
- mailbox messages
- tool activity
- subagent drill-in panel

Mobile:

- current active subagent summary
- permission wait state
- no full hierarchy pane in V1.5

## Event Model

Required event families:

- `agent.status`
- `agent.task`
- `agent.mailbox`
- `agent.tool_activity`

## Permission Rule

Subagents may never exceed parent permissions.

## Competitive Reference: Osaurus Work Mode

Osaurus implements an autonomous agent execution model worth studying:

**Work Mode.** The user describes *what* to accomplish, not *how*. The agent autonomously:

- Decomposes the objective into trackable issues
- Executes step-by-step with progress tracking visible in UI
- Runs independent steps in parallel across agents
- Performs file operations and background processing autonomously

**Agent Customization.** Each Osaurus agent carries its own custom prompt set, tool whitelist, memory store, and visual theme. Agents are first-class configurable units, not ephemeral workers.

**Sandbox Execution.** Each agent runs inside an isolated Linux VM:

- Full dev environment (shell, Python, Node.js, compilers)
- Per-agent Linux user and home directory
- `vsock` bridge for communication back to the host

**Key takeaway:** The combination of structured decomposition, parallel execution, and per-agent isolation turns agents into autonomous workers rather than interactive assistants.

## Autonomous Work Mode (Future)

> **Phase Scope:** This feature builds on the V1.5 multi-agent runtime. It requires subagents, teams, and mailbox messaging to be in place before implementation.

Amoena's autonomous work mode adapts the decompose-execute-track pattern to our desktop-first architecture and existing runtime primitives.

### Structured Task Decomposition

The user provides a high-level objective. The primary agent breaks it into a directed acyclic graph of steps:

- Each step has a description, acceptance criteria, estimated scope, and dependency list
- The primary agent acts as planner; subagents act as executors
- Re-planning is allowed mid-run when a step fails or scope changes

### Issue Tracking Integration

Each decomposed step becomes a trackable item inside the workspace:

- Steps surface as items in the existing Kanban and Autopilot screens
- Status transitions (`pending` → `in_progress` → `done` | `failed` | `blocked`) emit `agent.task` events
- Users can pause, reprioritize, or cancel individual steps from the GUI
- Optional sync to external trackers (GitHub Issues, Linear) via workspace integrations

### Parallel Execution

Independent steps run concurrently across subagents:

- The planner agent identifies dependency-free steps and fans them out
- Each executing subagent holds its own mailbox, tool set, and permission scope (existing V1.5 model)
- Teams coordinate shared-context work; the mailbox pattern prevents race conditions on shared state
- Concurrency limit is configurable per-workspace to match hardware constraints

### Progress UI

Visual progress tracking ties into existing desktop GUI components:

- The hierarchy tree (V1.5) extends with per-step status badges and progress bars
- Kanban columns map directly to step status (`pending`, `in_progress`, `done`)
- Autopilot screen shows a timeline view of parallel step execution
- Mobile summary surfaces overall objective progress and permission-blocked steps

### File Operation Safety

Changes are tracked per-step with rollback capability:

- Each subagent operates inside a Copy-on-Write (CoW) workspace clone (see workspace lifecycle docs)
- File mutations are recorded as a per-step changeset
- On step failure, the changeset is discarded without affecting the base workspace
- On step success, the changeset is merged into the base workspace (conflict resolution via planner agent)
- Users can review and cherry-pick individual step changesets before merge

### Relationship to Existing Runtime

This mode composes on top of existing V1.5 primitives rather than replacing them:

| V1.5 Primitive | Role in Autonomous Work Mode |
|---|---|
| Subagent spawning | Each decomposed step runs as a subagent |
| Teams | Coordinate multi-step objectives with shared context |
| Mailbox messages | Step status updates, inter-step data handoff, re-planning signals |
| Permission scoping | Subagents inherit scoped permissions; no step exceeds parent grants |
| `agent.task` events | Drive the progress UI and Kanban integration |
| CoW workspace clones | Provide per-step isolation and safe rollback |

## Acceptance Criteria

- users can see what a subagent is doing
- task handoffs are visible
- mailbox traffic is visible
- permission-blocked subagents are identifiable
