# Event Payloads

These are the main runtime payload families used by desktop and mobile clients.

## Session Message Send

```json
{
  "content": "Review these files",
  "references": [
    {
      "type": "file_ref",
      "name": "auth.ts",
      "path": "src/auth.ts"
    }
  ],
  "reasoningMode": "auto",
  "reasoningEffort": "high"
}
```

## Agent Events

- `agent.status`
- `agent.task`
- `agent.mailbox`
- `agent.tool_activity`

## Workspace Review Events

- `workspace.merge_required`
- `workspace.merge_blocked`

For canonical field definitions, see:
- [docs/architecture/system-architecture.md](../architecture/system-architecture.md)
- [docs/architecture/remote-control-protocol.md](../architecture/remote-control-protocol.md)

## Core Event Payloads

### Session Events

```typescript
// New token from LLM
interface TokenEvent {
  type: "token";
  session_id: string;
  text: string;
}

// Tool call requested by model
interface ToolCallEvent {
  type: "tool_call";
  session_id: string;
  id: string;
  name: string;
  args: Record<string, unknown>;
}

// Tool execution completed
interface ToolResultEvent {
  type: "tool_result";
  session_id: string;
  id: string;
  result: unknown;
  error?: string;
}

// Permission approval needed
interface ControlRequestEvent {
  type: "control_request";
  session_id: string;
  request_id: string;
  tool: string;
  reason: string;
  args_preview: Record<string, unknown>;
}

// Token usage for the turn
interface UsageEvent {
  type: "usage";
  session_id: string;
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens?: number;
  cost_usd?: number;
}

// Stream complete
interface DoneEvent {
  type: "done";
  session_id: string;
}

// Error during generation
interface ErrorEvent {
  type: "error";
  session_id: string;
  message: string;
  retryable: boolean;
}
```

### Agent Events (V1.5+)

```typescript
interface AgentStatusEvent {
  type: "agent.status";
  session_id: string;
  agent_id: string;
  status: "running" | "waiting" | "completed" | "error";
  label: string;
}

interface AgentMailboxEvent {
  type: "agent.mailbox";
  from_agent_id: string;
  to_agent_id?: string;
  message: string;
  timestamp: string;
}
```
