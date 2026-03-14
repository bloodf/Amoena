# Provider Model Capabilities

Each provider/model summary must include capability metadata needed by the UI and runtime.

## Required Reasoning Fields

- `supportsReasoning`
- `reasoningModes`
- `reasoningEffortSupported`
- `reasoningEffortValues`
- `reasoningTokenBudgetSupported`

## Other Important Capabilities

- context window
- tool support
- vision support
- pricing

## UX Use

These fields drive:

- Provider Setup reasoning defaults
- composer per-turn override
- adaptive reasoning auto-policy
- lightweight local-model routing

See:
- [docs/architecture/agent-backend-interface.md](../architecture/agent-backend-interface.md)
- [docs/architecture/system-architecture.md](../architecture/system-architecture.md)
