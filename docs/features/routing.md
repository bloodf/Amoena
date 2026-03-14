# Provider Routing

`ProviderRoutingService` selects the AI provider, model, reasoning mode, and reasoning effort for each turn. It combines explicit request overrides, persona preferences, stored settings, and task-type heuristics to produce a `RoutingDecision` — without requiring the caller to specify every parameter.

## Architecture

```
RoutingRequest
  ├── providerId?          explicit override
  ├── modelId?             explicit override
  ├── taskType             e.g. "planning", "debugging", "small-rename"
  ├── agentState           Active | Running (others rejected)
  ├── turnReasoningMode?   per-turn override: Off | Auto | On
  ├── turnReasoningEffort? per-turn override: Low | Medium | High
  └── persona
        ├── preferredModel?
        ├── division         "security" | "qa" | "engineering" | ...
        └── decisionWeight   float, carried through to the decision
          ↓
ProviderRoutingService::resolve()
          ↓
RoutingDecision
  ├── providerId
  ├── modelId
  ├── reasoningMode     Off | Auto | On
  ├── reasoningEffort?  Low | Medium | High (None if mode is Off)
  └── decisionWeight
```

## Agent State Guard

Routing is only valid when the agent is in an actionable state. If `agentState` is anything other than `Active` or `Running`, `resolve` returns `RoutingError::InvalidAgentState`. This prevents routing decisions for paused, stopped, or failed agents.

## Model Selection — Priority Order

`select_model` picks from the registered `ProviderModelRecord` list using this priority cascade:

1. **Persona preferred model** — if `persona.preferredModel` is set and exists in the registry, use it unconditionally.

2. **Explicit model + provider** — if `modelId` is specified in the request, find a record matching `modelId` (and `providerId` if also specified).

3. **Division-based reasoning preference** — agents in the `"security"` or `"qa"` division automatically receive a reasoning-capable model if one is available, regardless of what was requested.

4. **Provider-scoped fallback** — if only `providerId` is specified (no `modelId`), pick the first model for that provider.

5. **Global fallback** — the first model in the full registry list.

```rust
// Division routing example:
if matches!(request.persona.division.as_str(), "security" | "qa") {
    if let Some(model) = models.iter().find(|m| m.supports_reasoning) {
        return Ok(model);
    }
}
```

## Reasoning Mode Resolution

`resolve_reasoning_mode` determines whether extended thinking is enabled for this turn. Resolution priority:

1. **Per-turn override** (`turnReasoningMode` in the request) — highest priority
2. **Stored setting** — `providers.reasoning.{providerId}/{modelId}.mode` in the settings table (scope: `global`)
3. **Adaptive heuristic** — determined by `adaptive_reasoning_mode(task_type, division)`

### Adaptive Reasoning Heuristic

```rust
pub fn adaptive_reasoning_mode(task_type: &str, division: &str) -> ReasoningMode {
    // Security and QA divisions always reason
    if matches!(division, "security" | "qa") {
        return ReasoningMode::On;
    }

    // Complex tasks: reasoning enabled
    let on_tasks = ["planning", "architecture", "debugging",
                    "code-review", "security-review", "complex-refactor"];

    // Lightweight tasks: reasoning disabled for speed/cost
    let off_tasks = ["system.title", "system.compaction", "system.observation",
                     "commit-message", "small-rename"];

    if on_tasks.iter().any(|t| task_type.contains(t)) {
        ReasoningMode::On
    } else if off_tasks.iter().any(|t| task_type.contains(t)) {
        ReasoningMode::Off
    } else {
        ReasoningMode::Auto
    }
}
```

Reasoning mode `Auto` leaves the decision to the model/provider SDK.

### Model Capability Validation

If a reasoning mode of `On` or `Auto` is requested but the selected model does not have `supports_reasoning = true`, the routing service returns `RoutingError::UnsupportedReasoningModel`. The caller should handle this by either falling back to `Off` or surfacing an error to the user.

## Reasoning Effort Resolution

`resolve_reasoning_effort` is called only when `reasoningMode != Off`. Priority:

1. **Per-turn override** (`turnReasoningEffort` in the request)
2. **Stored setting** — `providers.reasoning.{providerId}/{modelId}.effort`
3. **Default** — `Medium` if `reasoning_effort_supported = true` on the model, `None` otherwise

```rust
if model.reasoning_effort_supported {
    Ok(Some(ReasoningEffort::Medium))
} else {
    Ok(None)
}
```

## Reasoning Modes

| Mode | Description | When to use |
|---|---|---|
| `Off` | No extended thinking | Fast lightweight tasks, commit messages, renames |
| `Auto` | Provider decides | Default for general coding and chat |
| `On` | Extended thinking enabled | Planning, architecture, debugging, security review |

## Reasoning Effort Levels

| Effort | Description |
|---|---|
| `Low` | Minimal reasoning tokens, fastest responses |
| `Medium` | Balanced — default when effort is supported |
| `High` | Deep reasoning, most thorough, highest token cost |

## Per-Turn Overrides

Callers can override routing on a per-turn basis via the run endpoint:

```http
POST /api/v1/sessions/{id}/run
{
  "reasoningMode": "on",
  "reasoningEffort": "high"
}
```

Or explicitly specify provider and model:

```http
POST /api/v1/sessions/{id}/run
{
  "providerId": "anthropic",
  "modelId": "claude-opus-4-5",
  "reasoningMode": "on",
  "reasoningEffort": "high"
}
```

## Stored Reasoning Settings

Default reasoning mode and effort per model can be persisted in the settings table and will apply to all turns using that model unless overridden per-turn:

```http
POST /api/v1/settings
{
  "key": "providers.reasoning.anthropic/claude-opus-4-5.mode",
  "value": "on",
  "scope": "global"
}

POST /api/v1/settings
{
  "key": "providers.reasoning.anthropic/claude-opus-4-5.effort",
  "value": "medium",
  "scope": "global"
}
```

## Routing via API

The routing service is also available as a standalone endpoint for building UI-level model pickers or for debugging routing decisions:

```http
POST /api/v1/providers/route
{
  "taskType": "debugging",
  "agentState": "active",
  "persona": {
    "preferredModel": null,
    "division": "engineering",
    "decisionWeight": 0.5
  }
}
```

Response:

```json
{
  "providerId": "anthropic",
  "modelId": "claude-opus-4-5",
  "reasoningMode": "on",
  "reasoningEffort": "medium",
  "decisionWeight": 0.5
}
```

## RoutingAgentState Values

| State | Routing allowed? |
|---|---|
| `Active` | Yes |
| `Running` | Yes |
| `Paused` | No — returns `InvalidAgentState` |
| `Stopped` | No |
| `Completed` | No |
| `Failed` | No |
| `Cancelled` | No |

## PersonaProfile Integration

`PersonaProfile` converts directly to `RoutingPersonaContext`:

```rust
impl From<&PersonaProfile> for RoutingPersonaContext {
    fn from(persona: &PersonaProfile) -> Self {
        Self {
            preferred_model: persona.preferred_model.clone(),
            division: persona.division.clone(),
            decision_weight: persona.decision_weight,
        }
    }
}
```

This means routing is tightly coupled to the persona loaded for the session. A security auditor persona will always get reasoning enabled. A documentation writer persona with no preferred model will fall through to the global fallback.

## Task Types Reference

Common task type strings used by the runtime:

| Task Type | Routing Effect |
|---|---|
| `planning` | Reasoning `On` |
| `architecture` | Reasoning `On` |
| `debugging` | Reasoning `On` |
| `code-review` | Reasoning `On` |
| `security-review` | Reasoning `On` |
| `complex-refactor` | Reasoning `On` |
| `system.title` | Reasoning `Off` |
| `system.compaction` | Reasoning `Off` |
| `system.observation` | Reasoning `Off` |
| `commit-message` | Reasoning `Off` |
| `small-rename` | Reasoning `Off` |
| anything else | Reasoning `Auto` |

Task types are set by the caller (session handler or agent orchestrator) based on what kind of work is being requested. Extension hooks and custom agents can specify their own task types — unrecognized types default to `Auto`.
