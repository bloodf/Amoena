# Contributing Guide

## Source Of Truth Order

1. active architecture docs
2. data model and backend interface contracts
3. developer/product/reference docs
4. implementation prompts

## Before Making Changes

- read the relevant architecture docs
- check prompt catalog for implementation order
- avoid using archived plans as source of truth unless explicitly referenced

## Documentation Rules

- architecture docs define behavior
- reference docs summarize contracts
- developer docs explain implementation
- product docs explain user workflows

## Documentation Checks

Run these before merging documentation or persona-library changes:

```bash
bun run agents:validate
bun run docs:agents:generate
bun run docs:build
```

## Change Rules

- if behavior changes, update docs in the same change
- if schema changes, update reference docs in the same change
- if prompt scope changes, update prompt catalog in the same change
