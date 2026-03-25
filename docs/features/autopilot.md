# Autopilot Mode

Autopilot enables fully autonomous multi-turn task execution. When active, the AI continues working without waiting for user input between turns, cycling through a structured phase progression until it signals completion or the turn limit is reached.

## Overview

In normal mode the AI waits for a user prompt after every turn. In autopilot mode the runtime automatically re-submits a continuation prompt after each completed turn, allowing the agent to plan, research, implement, verify, and report entirely on its own.

```
User submits task prompt → Autopilot enabled
    ↓
Turn 1: goal_analysis  → AI plans approach
Turn 2: research       → AI reads files, gathers context
Turn 3: implementation → AI writes code, makes changes
Turn 4: verification   → AI tests, validates
Turn N: iteration      → AI fixes issues
Turn N+1: report       → AI summarizes and signals AUTOPILOT_COMPLETE
    ↓
Autopilot stops, session returns to normal mode
```

## Enabling Autopilot

```http
POST /api/v1/sessions/{id}/autopilot
Content-Type: application/json

{
  "enabled": true,
  "maxTurns": 50
}
```

The `maxTurns` parameter defaults to 50 if not specified. The current autopilot state is stored in `session.metadata.autopilot`:

```json
{
  "autopilot": {
    "enabled": true,
    "maxTurns": 50,
    "currentTurn": 0,
    "currentPhase": "goal_analysis",
    "startedAt": "2026-03-14T10:00:00Z"
  }
}
```

Disabling:

```http
POST /api/v1/sessions/{id}/autopilot
{ "enabled": false }
```

## The Six Phases

Autopilot progresses through six phases. The AI is responsible for advancing through them — it determines when a phase is complete and signals the phase in its response:

| Phase | Typical Turn(s) | Description |
|---|---|---|
| `goal_analysis` | 1 | Understand the task, decompose it, plan the approach |
| `research` | 2–3 | Read relevant files, explore the codebase, gather context |
| `implementation` | 4–N | Write code, create/modify files, run commands |
| `verification` | N+1–N+2 | Run tests, validate outputs, check correctness |
| `iteration` | N+3+ | Fix identified issues, re-verify |
| `report` | Final | Summarize all work done and signal completion |

Phase transitions are emitted as SSE events and fire the `AutopilotStoryStart` hook on entry to `goal_analysis` and `AutopilotStoryComplete` on completion.

## Completion Detection

The runtime monitors each assistant response for three stopping conditions:

1. **Completion marker** — The AI includes `AUTOPILOT_COMPLETE` on its own line anywhere in the response. The runtime detects this string, strips it from the displayed message, and halts the autopilot loop.

2. **Turn limit** — If `currentTurn >= maxTurns`, autopilot is automatically disabled and the session returns to normal mode. The AI is not given a chance to finish its report.

3. **User interruption** — Calling `POST /api/v1/sessions/{id}/autopilot { "enabled": false }` or clicking the stop button in the UI halts the loop after the current turn completes.

## Follow-Up Prompt Injection

Between turns the runtime injects a continuation prompt as a user message. The standard follow-up reads:

> Autopilot remains enabled for this session. Continue the task autonomously using the current workspace context and prior results. If the task is complete, begin your response with `AUTOPILOT_COMPLETE` on its own line and then provide the final report.

This message is inserted into the session transcript as a `user` role message so the AI sees it as a new prompt. It does not appear in the UI as a user-authored message — the frontend marks it as `autopilot: true` in the message metadata.

## Hooks

| Event | When | Payload |
|---|---|---|
| `AutopilotStoryStart` | Autopilot begins (`goal_analysis` phase) | `{ sessionId, phase: "goal_analysis", maxTurns }` |
| `AutopilotStoryComplete` | Autopilot finishes (`AUTOPILOT_COMPLETE` detected or turn limit) | `{ sessionId, completedTurns, reason: "marker" \| "turn_limit" }` |

## SSE Events

| Event Type | When |
|---|---|
| `autopilot.phase` | Phase transition detected |
| `autopilot.complete` | Autopilot stopped (any reason) |
| `session.updated` | Session metadata updated with new phase/turn count |

Phase event payload:

```json
{
  "type": "autopilot.phase",
  "sessionId": "...",
  "data": {
    "phase": "implementation",
    "previousPhase": "research",
    "currentTurn": 4
  }
}
```

## Memory Integration

Autopilot sessions benefit directly from the memory system. After each turn:

1. Observations are captured automatically from the AI's response and tool results
2. The session summary is updated (`investigated`, `completed`, `nextSteps`)
3. On the next turn, relevant L0 summaries are injected into the system prompt

This means the AI carries forward a compact record of what it has already done and learned, reducing redundant work across turns.

## Workspace Integration

Autopilot works best when the session has an associated workspace:

```http
POST /api/v1/workspaces
{ "projectPath": "/Users/dev/myproject" }
→ { "id": "ws-uuid", "clonePath": "/amoena/workspaces/ws-uuid", ... }

POST /api/v1/sessions/{id}/autopilot
{ "enabled": true, "workspaceId": "ws-uuid" }
```

All `Bash` tool calls during the autopilot run execute inside the isolated workspace clone. When autopilot completes, the workspace can be reviewed and its changes merged back to the original project.

## Monitoring Progress

Subscribe to SSE events to monitor an autopilot run:

```javascript
const es = new EventSource('/events', {
  headers: { Authorization: `Bearer ${token}` }
});

es.onmessage = ({ data }) => {
  const event = JSON.parse(data);
  if (event.sessionId !== mySessionId) return;

  switch (event.type) {
    case 'message.delta':
      appendToken(event.data.text);
      break;
    case 'autopilot.phase':
      showPhase(event.data.phase, event.data.currentTurn);
      break;
    case 'tool.pending':
      showApprovalDialog(event.data);
      break;
    case 'autopilot.complete':
      showCompletionBanner(event.data.reason);
      break;
  }
};
```

## Best Practices

- **Write specific prompts.** Give the AI a clear, bounded task. Vague prompts lead to unfocused exploration and wasted turns.
- **Set a working directory.** Always associate a session with the relevant project directory or workspace clone.
- **Grant appropriate tool access.** Ensure the session persona has `shell_access` if the task requires running tests or build commands.
- **Review before merging.** Use `POST /api/v1/workspaces/{id}/review` to inspect changes before applying them to the main project.
- **Use hooks for notifications.** Register a `Notification` or `AutopilotStoryComplete` hook to receive a ping when the run finishes.
- **Set a reasonable turn limit.** For well-scoped tasks 20–30 turns is usually sufficient. Increase for complex multi-component refactors.
