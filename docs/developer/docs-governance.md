# Docs Governance

Lunaria documentation is maintained like product infrastructure, not as a one-off writing exercise.

## Ownership Rules

- Architecture docs define system behavior and technical invariants.
- Developer docs explain implementation workflows for contributors and extension authors.
- Product docs explain user-visible behavior and workflows.
- Reference docs summarize schemas, keys, payloads, and generated contract views.

## Source Of Truth Mapping

- `docs/architecture/` is the deepest technical source of truth.
- `docs/reference/` should mirror architecture-backed contracts.
- `docs/developer/` should explain how to build against those contracts.
- `docs/product/` should explain how the product behaves from the user perspective.
- `docs/prompts/` should stay aligned with both architecture and shipped implementation status.

## Update Rules

- If runtime behavior changes, update architecture and user/developer/reference docs in the same change.
- If a schema or payload changes, update reference docs in the same change.
- If prompt scope or completion state changes, update `docs/prompts/STATUS.md` in the same change.
- If a built-in agent persona changes, rerun the agent-reference generator and validation checks.

## Generated Content

Generated docs must be traceable:

- Built-in agent reference pages are generated from `apps/desktop/resources/agent-personas/`.
- Agent export validation is enforced through `scripts/export-agents.ts --validate-only`.
- Docs site builds should regenerate generated reference pages before static export.

## Validation Workflow

Recommended checks:

```bash
bun run agents:validate
bun run docs:agents:generate
bun run docs:build
```

## Persona Vocabulary

Built-in agent personas use these controlled division names:

- `engineering`
- `design`
- `qa`
- `product`
- `security`
- `devops`
- `ai`

Each persona must also define its division color token in frontmatter so generated references and exports stay consistent.

## Retirement And Archival

- Remove or rewrite stale content rather than layering contradictory notes on top.
- If a page is intentionally obsolete, replace it with a short redirect/retirement note.
- Product or implementation assumptions that no longer match architecture should be treated as bugs.
