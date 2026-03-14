# Agents API

Agents are autonomous AI workers that operate within or across sessions. Sub-agents are spawned inside a session, while teams coordinate multiple agents toward a shared goal.

---

## List Session Agents

Returns all agents active in a session, including the root agent and any sub-agents.

```
GET /api/v1/sessions/{sessionId}/agents/list
Authorization: Bearer <token>
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `sessionId` | Session ID |

**Response `200`**

```json
[
  {
    "id": "agent_001",
    "parentAgentId": null,
    "agentType": "orchestrator",
    "model": "claude-sonnet-4-5",
    "status": "active",
    "division": null,
    "collaborationStyle": null,
    "communicationPreference": null,
    "decisionWeight": null
  },
  {
    "id": "agent_002",
    "parentAgentId": "agent_001",
    "agentType": "worker",
    "model": "claude-haiku-4-5",
    "status": "idle",
    "division": "code-review",
    "collaborationStyle": "collaborative",
    "communicationPreference": "async",
    "decisionWeight": 0.5
  }
]
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/agents/list \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
const agents = await client.listSessionAgents(sessionId);
```

---

## Spawn Sub-Agent

Spawns a new sub-agent within a session. The sub-agent operates under the specified parent agent and is constrained to the given tools and step limit.

```
POST /api/v1/sessions/{sessionId}/agents
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "parentAgentId": "agent_001",
  "personaId": null,
  "agentType": "worker",
  "model": "claude-haiku-4-5",
  "requestedTools": ["read_file", "write_file", "run_command"],
  "stepsLimit": 20
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `parentAgentId` | `string` | Yes | ID of the parent agent |
| `personaId` | `string` | No | Optional persona profile ID |
| `agentType` | `string` | Yes | Agent role, e.g. `"worker"`, `"reviewer"` |
| `model` | `string` | Yes | Model identifier |
| `requestedTools` | `string[]` | Yes | Tools the agent is permitted to use |
| `stepsLimit` | `number` | No | Max number of tool-call steps before the agent stops |

**Response `200`** — The spawned `SessionAgent` object

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parentAgentId": "agent_001",
    "agentType": "worker",
    "model": "claude-haiku-4-5",
    "requestedTools": ["read_file", "write_file"],
    "stepsLimit": 10
  }'
```

---

## Create Team

Creates a multi-agent team. Teams coordinate multiple agents with defined roles and a consensus threshold.

```
POST /api/v1/teams
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "name": "code-review-team",
  "divisionRequirements": {
    "roles": ["architect", "reviewer", "tester"],
    "minAgents": 3
  },
  "threshold": 0.67,
  "sharedTaskListPath": "/tmp/team-tasks.json"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Team identifier |
| `divisionRequirements` | `object` | Yes | Division/role requirements for the team |
| `threshold` | `number` | No | Consensus threshold (0.0–1.0). Default: `0.5` |
| `sharedTaskListPath` | `string` | No | Path to shared task list file |

**Response `200`** — Created team object

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/teams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "review-team",
    "divisionRequirements": {"roles": ["reviewer"]},
    "threshold": 0.67
  }'
```

---

## Send Mailbox Message

Sends a message to an agent's mailbox. Mailbox messages are the inter-agent communication channel within a team.

```
POST /api/v1/teams/{teamId}/mailbox
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "sessionId": "sess_abc123",
  "fromAgentId": "agent_001",
  "toAgentId": "agent_002",
  "content": "Please review the changes in src/main.rs",
  "messageType": "task",
  "metadata": {}
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | `string` | Yes | Session context |
| `fromAgentId` | `string` | Yes | Sender agent ID |
| `toAgentId` | `string` | No | Recipient agent ID. `null` = broadcast to team |
| `content` | `string` | Yes | Message body |
| `messageType` | `string` | No | `"task"`, `"info"`, `"result"`, etc. |
| `metadata` | `object` | No | Arbitrary metadata |

**Response `200`** — The sent mailbox message record

---

## List Mailbox Messages

Returns mailbox messages for a team.

```
GET /api/v1/teams/{teamId}/mailbox
Authorization: Bearer <token>
```

**Response `200`** — Array of mailbox message records

---

## Resolve Permission

When the AI requests a permission (e.g., to execute a shell command), the client must resolve it:

```
POST /api/v1/sessions/{sessionId}/permissions
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "requestId": "req_abc123",
  "decision": "approve",
  "reason": "Safe read-only operation"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requestId` | `string` | Yes | Permission request ID (from `permission.requested` SSE event) |
| `decision` | `string` | Yes | `"approve"` or `"deny"` |
| `reason` | `string` | No | Optional explanation |

**Response `204`** — No content

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/permissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req_abc123", "decision": "approve"}'
```
