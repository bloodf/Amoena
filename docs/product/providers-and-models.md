# Providers And Models

## Provider Support by Phase

| Phase | Providers | Notes |
|-------|----------|-------|
| Phase 0 | Anthropic only | Spike validation |
| MVP | Anthropic only | Single provider, native mode |
| V1.0 | + OpenAI, Google | Multi-provider auth |
| V1.5 | + Mistral, XAI, Cohere; Ollama for system tasks | Local model routing for lightweight tasks |
| V2.0 | Full provider gateway | Optional hosted proxy |

---

Lunaria supports cloud and local model providers.

## Provider Setup

Users can configure:

- API key auth
- OAuth auth
- env-var detection
- local models with no auth

## Local Models

Local models are intended for lightweight tasks such as:

- title generation
- compaction summaries
- observation classification
- commit messages

## Reasoning-Capable Models

For supported models, Lunaria exposes:

- reasoning support badge
- default reasoning mode: `off`, `auto`, `on`
- effort selector when supported
- optional reasoning budget control when supported

## Adaptive Default

`auto` is the recommended default.

It turns reasoning on for:

- planning
- architecture
- debugging
- review
- complex multi-file work

It turns reasoning off for:

- lightweight system tasks
- cheap local-routing tasks
- explicit user override
