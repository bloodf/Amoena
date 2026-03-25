# Multi-Agent Orchestration

Amoena's orchestration system enables AI agents to spawn subagents, form teams, communicate via a structured mailbox, and reach weighted consensus decisions. `OrchestrationService` manages the full lifecycle of agents and teams backed by the SQLite persistence layer.

## Architecture

```
OrchestrationService
├── create_primary_agent()   → Primary agent for a session (loaded from persona)
├── spawn_subagent()         → Child agent inheriting parent's tool ceiling
├── create_team()            → Team of agents with consensus threshold
├── send_mailbox_message()   → Inter-agent communication
└── evaluate_consensus()     → Weighted vote aggregation
```

## Agent Modes

| Mode | Description |
|---|---|
| `primary` | Main agent for a session, loaded from persona profile |
| `subagent` | Child spawned by a primary or another subagent |
| `system` | Internal system agent (compaction, summarization) |

## Agent Lifecycle Status

```
created → preparing → active → running → completed
                   │                   └──→ failed
                   │                   └──→ cancelled
                   └──→ idle (between turns)
                   └──→ paused
                   └──→ stopped
```

## Agent Profiles (Personas)

Every agent is backed by a persona profile that defines its behavior, tool access, and collaboration characteristics:

```rust
pub struct AgentProfileRecord {
    pub id: String,
    pub name: String,
    pub division: String,                // functional area: "engineering", "security", "qa"
    pub system_prompt: String,
    pub tool_access: Vec<String>,        // allowed tool names
    pub permission_config: Value,        // { "permissionLevel": "shell_access" }
    pub collaboration_style: String,     // "cooperative" | "critical" | "advisory"
    pub communication_preference: String, // "concise" | "detailed" | "structured"
    pub decision_weight: f64,            // 0.0–1.0, voting weight in teams
    pub created_at: String,
    pub updated_at: String,
}
```

Bundled personas live in `apps/desktop/resources/agent-personas/` organized by division subdirectory. Each persona is a Markdown file with TOML frontmatter. Custom personas can be registered via the API.

### Listing Profiles

```http
GET /api/v1/agents/profiles
```

### Creating a Custom Profile

```http
POST /api/v1/agents/profiles
{
  "name": "Security Auditor",
  "division": "security",
  "systemPrompt": "You are a security expert focused on identifying vulnerabilities...",
  "toolAccess": ["Read", "Bash", "MemoryExpand"],
  "permissionConfig": { "permissionLevel": "read_only" },
  "collaborationStyle": "critical",
  "communicationPreference": "detailed",
  "decisionWeight": 0.9
}
```

## Primary Agent Creation

Each session starts with a primary agent created from a persona file:

```http
POST /api/v1/sessions/{id}/agents/primary
{
  "personaPath": "resources/agent-personas/engineering/senior-engineer.md",
  "model": "claude-opus-4-5"
}
```

The primary agent's `tool_access` and `permission_config` are read directly from the persona file. The `AgentRecord` is inserted and an `AgentProfileRecord` is upserted so the persona is available for subagent inheritance.

## Spawning Subagents

Subagents are spawned from an existing parent agent. Tool access and permission ceiling are automatically constrained to the intersection of parent and persona capabilities:

```http
POST /api/v1/sessions/{sessionId}/agents/spawn
{
  "parentAgentId": "agent-primary-uuid",
  "personaId": "researcher",
  "agentType": "researcher",
  "model": "claude-sonnet-4-6",
  "requestedTools": ["Read", "MemoryExpand"],
  "stepsLimit": 10
}
```

**Tool intersection logic:**
```
effective_tools = intersect(parent.tool_access, persona.tool_access)
if requestedTools non-empty:
    effective_tools = intersect(effective_tools, requestedTools)

// Then filter by effective permission ceiling:
effective_ceiling = min(parent.permission_ceiling, persona.permission_ceiling)
effective_tools = filter(effective_tools, tool.required_level <= effective_ceiling)
```

This guarantees that no subagent can receive tools or permissions not held by its parent, regardless of what the persona specifies.

**Permission ceilings (ranked lowest to highest):**

| Ceiling | Rank | Shell? | File Write? |
|---|---|---|---|
| `read_only` | 0 | No | No |
| `read_write` | 1 | No | Yes |
| `shell_access` | 2 | Yes | Yes |
| `admin` | 3 | Yes | Yes + system ops |

Response:

```json
{
  "id": "agent-sub-uuid",
  "sessionId": "...",
  "parentAgentId": "agent-primary-uuid",
  "agentType": "researcher",
  "mode": "subagent",
  "model": "claude-sonnet-4-6",
  "toolAccess": ["Read", "MemoryExpand"],
  "permissionConfig": { "permissionLevel": "read_only" },
  "status": "preparing",
  "stepsLimit": 10,
  "division": "research",
  "collaborationStyle": "cooperative",
  "communicationPreference": "concise",
  "decisionWeight": 0.5
}
```

## Teams

Teams group agents for coordinated work toward a shared goal with formal consensus tracking.

### Creating a Team

```http
POST /api/v1/agents/teams
{
  "name": "Auth Refactor Team",
  "divisionRequirements": {
    "engineering": 1,
    "security": 1,
    "qa": 1
  },
  "threshold": 0.6,
  "sharedTaskListPath": "/workspace/tasks/auth-refactor.md"
}
```

- `divisionRequirements` — JSON object describing required roles (informational; not enforced automatically)
- `threshold` — weighted approval fraction (0.0–1.0) required for consensus
- `sharedTaskListPath` — optional path to a shared Markdown task list all agents update

Team status progression:

```
assembling → active → paused → completed
                             └──→ failed
                             └──→ cancelled
                             └──→ disbanded
```

### Listing Teams

```http
GET /api/v1/agents/teams
GET /api/v1/agents/teams/{teamId}
```

## Mailbox Communication

Agents communicate via a persistent mailbox. Messages are typed and carry collaboration metadata:

```http
POST /api/v1/agents/mailbox/send
{
  "sessionId": "...",
  "teamId": "team-uuid",
  "fromAgentId": "agent-security-uuid",
  "toAgentId": "agent-primary-uuid",   // null = broadcast to team
  "content": "Found 2 SQL injection risks in auth.ts lines 45 and 78.",
  "messageType": "message",             // "message" | "decision_request" | "decision_response"
  "metadata": {}
}
```

**Message types:**

| Type | Purpose |
|---|---|
| `message` | General communication |
| `decision_request` | Request a consensus vote |
| `decision_response` | Vote response (metadata: `{ "decision": "approve" | "deny" | "abstain", "requestMessageId": "..." }`) |

### Reading the Mailbox

```http
GET /api/v1/agents/teams/{teamId}/mailbox
```

## Consensus System

Teams make decisions via weighted voting. The consensus threshold is the fraction of total `decision_weight` that must approve.

### Triggering a Decision

1. An agent sends a `decision_request` message
2. Other agents respond with `decision_response` messages containing `approve`, `deny`, or `abstain`
3. `OrchestrationService::evaluate_consensus` aggregates votes:

```rust
let approve_weight: f64 = responses.filter(|m| m.decision == "approve").map(|m| m.decision_weight).sum();
let total_weight: f64 = responses.filter(|m| m.decision != "abstain").map(|m| m.decision_weight).sum();
let passed = (approve_weight / total_weight) > team.threshold;
```

### Mailbox Flags (Blocking Concerns)

When an agent with `collaboration_style = "critical"` sends a decision response, a `MailboxFlag` of type `concern` is automatically created. Consensus cannot be evaluated while open flags exist:

```rust
pub fn evaluate_consensus(&self, team_id: &str, request_message_id: &str) -> Result<Option<bool>> {
    if !self.flags.list_open_for_team(team_id)?.is_empty() {
        return Ok(None);  // blocked by unresolved concerns
    }
    // ... vote aggregation
}
```

### Resolving Flags

```http
PATCH /api/v1/agents/teams/{teamId}/flags/{flagId}
{ "status": "resolved" }
```

### Checking Consensus

```http
GET /api/v1/agents/teams/{teamId}/consensus?requestMessageId={messageId}
```

Response:
```json
{
  "resolved": true,
  "passed": true,
  "approveWeight": 1.4,
  "totalWeight": 1.9,
  "threshold": 0.6,
  "openFlags": 0
}
```

## Hook Events

| Event | When |
|---|---|
| `SubagentStart` | Subagent spawned and status moves to `active` |
| `SubagentStop` | Subagent reaches terminal status |
| `TeammateIdle` | A team member completes its turn and is waiting |
| `TaskCompleted` | A task in the shared task list is marked done |

Hook payloads include `agentId`, `sessionId`, `teamId` where applicable.

## SSE Events

| Event Type | Payload |
|---|---|
| `agent.spawned` | `{ agentId, parentAgentId, mode, division }` |
| `agent.status` | `{ agentId, status, previousStatus }` |
| `agent.message` | `{ agentId, teamId, messageType, content }` |
| `team.consensus` | `{ teamId, requestMessageId, passed, openFlags }` |
