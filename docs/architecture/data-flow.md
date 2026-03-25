# Data Flow

This page traces the complete lifecycle of a user prompt through the Amoena runtime, from submission to SSE delivery, including the tool call approval loop, memory capture, and hook invocations.

## Native Mode: Full Turn Flow

```
User types prompt → clicks Send
        │
        ▼
POST /api/v1/sessions/{id}/messages
  { "role": "user", "content": "..." }
        │
        ▼
┌───────────────────────────────────────┐
│  auth_middleware validates JWT        │
│  SessionRepository::get → validate    │
│  MessageRepository::insert (user msg) │
└───────────────┬───────────────────────┘
                │
                ▼
POST /api/v1/sessions/{id}/run
        │
        ├──→ HookEvent::UserPromptSubmit fired
        │      (shell commands / webhooks / prompt injections)
        │
        ├──→ Load full transcript from MessageRepository
        │      system prompt + all previous messages
        │
        ├──→ ProviderRoutingService::resolve(RoutingRequest)
        │      → select provider + model + reasoning mode
        │
        ├──→ Update session status → Running
        │
        ▼
BunWorkerBridge::stream_completion_with_handler(StreamRequest)
  {
    providerId, modelId, sessionId,
    apiKey, reasoningMode, reasoningEffort,
    messages: [{ role, content }, ...]
  }
        │
        │  JSON-RPC over stdin/stdout
        ▼
┌───────────────────────────────────────┐
│           Bun AI Worker               │
│  stream.start → stream_id             │
│  → provider SDK streaming call        │
│  ← stream.token { streamId, text }    │
│  ← stream.tool_call { ... }           │
│  ← stream.done { finalText, tokens }  │
└───────────────┬───────────────────────┘
                │
      ┌─────────┼──────────────────────┐
      │         │                      │
      ▼         ▼                      ▼
  stream.token  stream.tool_call   stream.done
      │         │                      │
      │         │                      └──→ Collect final text
      │         │                           UsageAnalyticsRepository::insert
      │         │                           MessageRepository::insert (assistant)
      │         │                           MemoryService::capture
      │         │                           HookEvent::Stop fired
      │         │                           Update session status → Paused
      │         │
      │         ▼
      │   ToolExecutor::execute(context, ToolInput)
      │         │
      │         ├── registry.validate_args()
      │         ├── registry.get(tool_name) → ToolDefinition
      │         ├── effective_permission_mode()
      │         │
      │         ├── ToolPermissionMode::Deny
      │         │     → audit log (Denied)
      │         │     → error propagated to worker
      │         │
      │         ├── ToolPermissionMode::Ask
      │         │     → PendingApprovalRepository::insert
      │         │     → broadcast SSE { type: "tool.pending", requestId }
      │         │     → PermissionBroker::wait_for(request_id) ← blocks here
      │         │           │
      │         │           │  User sees approval dialog in frontend
      │         │           │
      │         │           ▼
      │         │     PATCH /api/v1/tools/approvals/{id}
      │         │       { "decision": "approved" | "denied" }
      │         │           │
      │         │           ▼
      │         │     PermissionBroker::resolve(request_id, resolution)
      │         │           │
      │         │           ▼
      │         │     ToolExecutor::await_and_execute
      │         │       → run_builtin (if approved)
      │         │       → audit log (UserApproved / Denied)
      │         │       → broadcast SSE { type: "tool.resolved" }
      │         │
      │         └── ToolPermissionMode::Allow
      │               → run_builtin immediately
      │               → audit log (Allowed / AutoApproved)
      │
      ▼
  broadcast sse_tx.send(SseEvent { type: "message.delta", ... })
        │
        ▼
GET /events (SSE)
  Frontend EventSource receives delta
  → appends token to message bubble
```

## SSE Event Stream

The frontend opens a persistent SSE connection to `GET /events`. This is a `tokio::sync::broadcast` channel with capacity 1024. Every runtime subsystem sends events to `sse_tx`, and all connected clients receive them.

```
sse_tx.send(event)
    → BroadcastStream subscribers
    → Axum Sse<impl Stream<Item = Event>>
    → text/event-stream to client
```

Events are filtered client-side by `sessionId`. A 30-second `KeepAlive` ping prevents proxy timeouts.

## Memory Capture Flow

After every AI turn the assistant response is captured as an observation:

```
MemoryService::capture(ObservationInput {
  session_id,
  title,          // extracted from response
  narrative,      // full assistant text
  source: ObservationSource::AssistantResponse,
  facts,          // bullet points extracted
  files_read,     // from tool results
  files_modified, // from tool results
  prompt_number,  // turn index
})
    │
    ├── content_hash computed (SHA-256 of title+narrative+concepts+category)
    ├── duplicate check: latest_by_hash
    ├── near-duplicate check: semantic_similarity >= 0.50 on recent observations
    │
    ├── ObservationRepository::insert
    ├── MemoryTierRepository::upsert (builds L0/L1/L2 synchronously)
    │
    └── (async, background) embed_observation
          → BunWorkerBridge::generate_embedding(text-embedding-3-small)
          → ObservationEmbeddingRepository::upsert
```

## Memory Injection Flow

At the start of a turn, the system prompt is augmented with relevant memories:

```
MemoryService::injection_bundle(worker, api_key, query, max_observations)
    │
    ├── classify_scope(query)
    │     → SessionLocal | Workspace | Global
    │
    ├── hybrid_search(worker, api_key, query, category)
    │     ├── FTS5 search (observations_fts) → ranked results
    │     └── (if results) generate query embedding
    │           → cosine_similarity vs stored embeddings
    │           → RRF fusion: 1/(60 + rank) + vector_score
    │           → re-rank
    │
    ├── take(max_observations)
    ├── extract l0_summary from each MemoryTierRecord
    └── return InjectionBundle { scope, summaries, token_budget_used }
```

The L0 summaries (compact one-line labels) are injected into the system prompt under a `<memory>` block. When the AI wants more detail it calls the `MemoryExpand` tool with `tier: "l1"` or `tier: "l2"`.

## Hook Invocation Flow

```
HookEngine::fire(event, payload)
    │
    ├── HookRepository::list_by_event(event.as_str())
    ├── filter: hook.enabled == true
    └── for each hook:
          match hook.handler_type:
            Command → spawn zsh -lc {command}
                       timeout(hook.timeout_ms)
                       → HookInvocationResult { status, output, error }
            Http    → HTTP POST to url with JSON payload
                       timeout(hook.timeout_ms)
            Prompt  → return handler_config["text"] as output (synchronous)
            Agent   → return handler_config["agentType"] as output (synchronous)
```

Hooks fire asynchronously in sequence (not parallel). Results are returned as `Vec<HookInvocationResult>` and broadcast as SSE `hook.fired` events.

## Wrapper Mode Flow

When `session_mode = 'wrapper'`, the runtime delegates to an external CLI process:

```
POST /api/v1/sessions/{id}/run
    │
    ├── WrapperManager::execute(WrapperExecutionRequest)
    │     → spawn CLI subprocess (claude, opencode, codex, gemini)
    │     → capture stdout/stderr
    │     → normalize events → NormalizedWrapperEvent
    │
    └── broadcast SSE for each normalized event
          → same SSE contract as native mode
```

Wrapper sessions still record messages in SQLite and fire lifecycle hooks. Tool approval is handled by the CLI subprocess itself; the runtime observes decisions through stdout parsing.

## Workspace-Scoped Session Flow

When a session is associated with a workspace:

```
POST /api/v1/workspaces
  { "projectPath": "/Users/dev/myproject", "agentId": "..." }
    │
    ├── WorkspaceManager::detect_capability(project_path)
    │     macOS APFS → Cow (cp -cR)
    │     Git repo   → Worktree (git worktree add --detach)
    │     Otherwise  → Full (recursive copy)
    │
    ├── WorkspaceManager::create → WorkspaceRecord
    └── WorkspaceRecord.id stored on session as workspace_id

Session turn execution:
    ToolExecutionContext.working_dir = workspace.clone_path
    → all Bash tool calls run inside the isolated workspace
    → file reads/writes are scoped to the clone
```
