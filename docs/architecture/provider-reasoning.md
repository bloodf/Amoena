# Provider Reasoning Architecture

## Purpose

This document defines how Amoena models, stores, resolves, and surfaces reasoning-capable model behavior.

## Goals

- support provider-specific reasoning controls without leaking provider quirks into the whole UI
- make per-model defaults explicit
- allow per-turn override
- keep adaptive behavior deterministic

## Capability Model

Each provider/model may expose:

- `supportsReasoning`
- `reasoningModes`
- `reasoningEffortSupported`
- `reasoningEffortValues`
- `reasoningTokenBudgetSupported`

Capability metadata is stored in `provider_models` and returned through provider/model APIs.

## Default Resolution

Reasoning mode resolves in this order:

1. per-turn override
2. per-model default
3. adaptive auto-policy

Effort resolves in this order:

1. per-turn effort override
2. per-model effort default
3. provider/model default selected by Amoena

## Adaptive Auto-Policy

Auto enables reasoning for:

- planning
- architecture
- debugging
- code review
- security review
- ambiguous multi-step refactors
- complex multi-file work

Auto disables reasoning for:

- title generation
- compaction summary
- observation classification
- commit messages
- small formatting/rename work
- cheap local system tasks

## UX Surfaces

Provider Setup:

- per-model reasoning support badge
- default mode selector
- effort selector when supported
- optional token budget control when supported

Composer:

- compact reasoning badge
- per-turn override
- optional effort selection

Timeline:

- reasoning-active state
- thinking state
- reasoning-token usage when available

## Persistence

Per-model defaults are stored in settings keys:

- `providers.reasoning.<provider>/<model>.mode`
- `providers.reasoning.<provider>/<model>.effort`

## Acceptance Criteria

- unsupported models never show reasoning controls
- supported models surface correct defaults
- per-turn override wins over persisted defaults
- adaptive mode is deterministic and testable
