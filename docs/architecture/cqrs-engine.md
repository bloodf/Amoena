# Orchestration Engine

Amoena's orchestration engine manages the lifecycle of AI agents, teams, and their communication. It is implemented as a service layer backed by SQLite repositories, with clear separation between commands (writes) and queries (reads).

> **Note:** The engine uses a command/query separation pattern rather than a full event-sourced CQRS system. State is stored directly in SQLite tables, not rebuilt from an event log.

## Architecture

```
+---------------------------------------------------------------+
|                    OrchestrationService                        |
|                                                                |
|  Commands (writes)              Queries (reads)                |
|  +------------------------+    +---------------------------+  |
|  | create_primary_agent() |    | agents.get()              |  |
|  | spawn_subagent()       |    | agents.list_for_session() |  |
|  | create_team()          |    | teams.get()               |  |
|  | send_mailbox_message() |    | messages.list_for_team()  |  |
|  +------------------------+    | flags.list_open_for_team()|  |
|                                | evaluate_consensus()      |  |
|  Repositories (storage)        +---------------------------+  |
|  +----------------------------------------------------+       |
|  | AgentProfileRepository  | AgentRepository           |       |
|  | AgentTeamRepository     | AgentMessageRepository    |       |
|  | MailboxFlagRepository   |                           |       |
|  +----------------------------------------------------+       |
+---------------------------------------------------------------+
```

Source: `apps/desktop/src-tauri/src/orchestration.rs`

## Commands

### create_primary_agent

Creates the root agent for a session from a **persona profile**.

```
Input:  session_id, persona_path, model
Output: AgentRecord

Flow:
  1. Load PersonaProfile from .md file on disk
  2. Create AgentRecord with mode=Primary, status=Active
  3. Upsert AgentProfileRecord (cached persona data)
  4. Insert into agents table
```

The persona profile defines: name, division, system prompt (body), tools, permissions, collaboration style, communication preference, and decision weight.

### spawn_subagent

Creates a child agent under an existing parent.

```
Input:  SpawnSubagentRequest {
          session_id, parent_agent_id, persona_id,
          agent_type, model, requested_tools, steps_limit
        }
Output: AgentRecord

Flow:
  1. Load parent agent from DB
  2. Resolve persona (from DB or bundled .md files)
  3. Compute effective tools:
     a. Intersect parent tools with persona tools
     b. If requested_tools provided, intersect again
  4. Compute effective permission ceiling:
     a. Parse parent ceiling and persona ceiling
     b. Take the minimum (most restrictive)
  5. Filter tools by ceiling (remove tools above ceiling)
  6. Create AgentRecord with mode=Subagent, status=Preparing
  7. Insert into agents table
```

#### Permission Ceiling Resolution

```
Parent ceiling:  shell_access
Persona ceiling: read_write
                       |
                       v
Effective ceiling: read_write (minimum)
                       |
                       v
Filter tools: remove any tool requiring shell_access or admin
```

The ceiling hierarchy:

```
read_only < read_write < shell_access < admin
```

### create_team

Creates an agent team with consensus requirements.

```
Input:  CreateTeamRequest {
          name, division_requirements, threshold,
          shared_task_list_path
        }
Output: AgentTeamRecord (status=Assembling)
```

The `threshold` (0.0 to 1.0) determines the weighted approval ratio needed for decisions to pass.

### send_mailbox_message

Posts a message to a team's mailbox.

```
Input:  SendMailboxRequest {
          session_id, team_id, from_agent_id,
          to_agent_id (optional), content,
          message_type, metadata
        }
Output: AgentMessageRecord

Flow:
  1. Validate sender exists
  2. Create message record with sender's collaboration_style and decision_weight
  3. If sender's collaboration_style is "critical":
     a. Create MailboxFlagRecord (type="concern", status=Open)
     b. Flag blocks consensus until resolved
  4. Insert message into agent_messages table
```

## Queries

### evaluate_consensus

Evaluates whether a team decision has reached consensus.

```
Input:  team_id, request_message_id
Output: Option<bool>
        - None: not enough votes or open flags
        - Some(true): approved
        - Some(false): rejected

Algorithm:
  1. Check for open flags -> if any, return None (blocked)
  2. Find the DecisionRequest message
  3. Collect all DecisionResponse messages for this request
  4. For each response:
     - Skip "abstain" votes
     - Add decision_weight to total
     - If "approve", add weight to approve sum
  5. If total == 0, return None (no votes yet)
  6. return Some(approve / total > team.threshold)
```

### list_mailbox

Returns all messages for a team, ordered by creation time.

### list_open_flags

Returns unresolved flags for a team. Open flags block consensus evaluation.

## Data Model

### AgentRecord

| Field                      | Type                   | Description                          |
| -------------------------- | ---------------------- | ------------------------------------ |
| `id`                       | `String` (UUID)        | Unique agent identifier              |
| `session_id`               | `String`               | Parent session                       |
| `parent_agent_id`          | `Option<String>`       | Parent agent (null for primary)      |
| `agent_type`               | `String`               | Persona type (e.g., "code-reviewer") |
| `mode`                     | `AgentMode`            | `primary`, `subagent`, or `system`   |
| `model`                    | `String`               | AI model identifier                  |
| `system_prompt`            | `Option<String>`       | System prompt from persona           |
| `tool_access`              | `Vec<String>`          | Allowed tool names                   |
| `permission_config`        | `JSON`                 | Permission level configuration       |
| `status`                   | `AgentLifecycleStatus` | Current lifecycle state              |
| `steps_limit`              | `Option<i64>`          | Max steps before auto-stop           |
| `division`                 | `Option<String>`       | Organizational division              |
| `collaboration_style`      | `Option<String>`       | How agent interacts in teams         |
| `communication_preference` | `Option<String>`       | Communication style                  |
| `decision_weight`          | `Option<f64>`          | Voting weight in consensus (0-1)     |

Source: `apps/desktop/src-tauri/src/persistence/models.rs`

### AgentTeamRecord

| Field                   | Type                  | Description                     |
| ----------------------- | --------------------- | ------------------------------- |
| `id`                    | `String` (UUID)       | Team identifier                 |
| `name`                  | `String`              | Team display name               |
| `shared_task_list_path` | `Option<String>`      | Path to shared task file        |
| `status`                | `TeamLifecycleStatus` | Team lifecycle state            |
| `division_requirements` | `JSON`                | Required divisions for the team |
| `threshold`             | `f64`                 | Consensus threshold (0.0 - 1.0) |

### AgentMessageRecord

| Field                 | Type                 | Description                                               |
| --------------------- | -------------------- | --------------------------------------------------------- |
| `id`                  | `String` (UUID)      | Message identifier                                        |
| `team_id`             | `String`             | Team this message belongs to                              |
| `from_agent_id`       | `String`             | Sender agent                                              |
| `to_agent_id`         | `Option<String>`     | Recipient (null = broadcast)                              |
| `content`             | `String`             | Message body                                              |
| `message_type`        | `MailboxMessageType` | `message`, `decision_request`, `decision_response`        |
| `collaboration_style` | `String`             | Sender's collaboration style                              |
| `decision_weight`     | `f64`                | Sender's voting weight                                    |
| `metadata`            | `JSON`               | Type-specific data (e.g., `requestMessageId`, `decision`) |
| `created_at`          | `String`             | ISO 8601 timestamp                                        |
| `read_at`             | `Option<String>`     | When the message was read                                 |

### MailboxFlagRecord

| Field        | Type                | Description                       |
| ------------ | ------------------- | --------------------------------- |
| `id`         | `String` (UUID)     | Flag identifier                   |
| `message_id` | `String`            | The message that raised this flag |
| `team_id`    | `String`            | Team scope                        |
| `session_id` | `String`            | Session scope                     |
| `flag_type`  | `String`            | Flag category (e.g., `"concern"`) |
| `status`     | `MailboxFlagStatus` | `open` or `resolved`              |

## Lifecycle State Machines

### Agent Lifecycle

```
            +----------+
            | Created  |
            +-----+----+
                  |
                  v
            +----------+
            | Preparing|
            +-----+----+
                  |
                  v
            +----------+     +---------+
            |  Active  |<--->| Paused  |
            +-----+----+     +---------+
                  |
                  v
            +----------+
            | Running  |
            +--+--+--+-+
               |  |  |
          +----+  |  +----+
          v       v       v
     +---------+ +------+ +----------+
     |Completed| |Failed| |Cancelled |
     +---------+ +------+ +----------+
```

### Team Lifecycle

```
     +------+     +----------+     +--------+
     | Idle | --> | Assembling| --> | Active |
     +------+     +----------+     +---+----+
                                       |
                                  +----+----+
                                  |         |
                                  v         v
                            +--------+  +--------+
                            | Paused |  |Completed|
                            +--------+  +--------+
                                  |
                        +---------+---------+
                        v                   v
                   +----------+        +---------+
                   | Disbanded|        |  Failed |
                   +----------+        +---------+
```

## Persona Resolution

Personas are loaded from Markdown files in `apps/desktop/resources/agent-personas/`. The directory is organized by division:

```
resources/agent-personas/
+-- engineering/
|   +-- code-writer.md
|   +-- code-reviewer.md
+-- security/
|   +-- security-reviewer.md
+-- qa/
|   +-- test-engineer.md
+-- ...
```

Resolution order:

1. Check `AgentProfileRepository` (database) for a cached profile
2. If not found, scan bundled persona files by filename match
3. If still not found, return error
