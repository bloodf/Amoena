# Documentation Platform Architecture

## Purpose

This document defines Lunaria's **documentation platform**: the documentation site, its information architecture, content sources, developer docs, product docs, and reference-doc generation strategy.

This is a documentation surface, **not** a product web app.

## Scope

In scope:

- static documentation site
- developer documentation
- plugin and extension author documentation
- product/user documentation
- reference documentation sourced from schemas/contracts
- design-system documentation

Out of scope:

- authenticated product experiences
- remote control runtime
- marketplace execution
- any replacement for the desktop or mobile products

## Audiences

The docs platform serves four audiences:

1. **End users**
   - what Lunaria is
   - how desktop works
   - how mobile pairing works
   - how to use sessions, providers, workspaces, and review flows

2. **Plugin / extension authors**
   - manifest schema
   - hooks
   - UI extension APIs
   - testing
   - packaging and release

3. **Core contributors**
   - architecture
   - design system
   - implementation prompts
   - runtime boundaries and invariants

4. **Operators / advanced users**
   - remote access configuration
   - paired-device lifecycle
   - security/trust boundaries
   - future self-hosted relay considerations

## Information Architecture

The docs site should expose these primary sections:

- `/product`
  - desktop overview
  - session workspace
  - providers and models
  - workspaces and review
  - mobile remote access

- `/developer`
  - contributor overview
  - plugin overview
  - plugin manifest
  - plugin hooks
  - plugin UI extensions
  - plugin testing and release

- `/reference`
  - API/event contracts
  - schema references
  - settings key catalog
  - hook event catalog
  - provider/model capability reference

- `/architecture`
  - source-of-truth architecture docs from this repo

- `/design-system`
  - tokens
  - primitives
  - composites
  - theming

- `/prompts`
  - implementation prompt catalog

- `/changelog`
  - release notes
  - breaking changes in docs/contracts

## Content Sources

Source directories in this repo:

- `docs/architecture/`
- `docs/developer/`
- `docs/product/`
- `docs/reference/`
- `docs/design-system/`
- `docs/prompts/`

Reference sources that should be rendered or generated into docs pages:

- Rust/TypeScript shared contracts
- JSON schema definitions
- plugin manifest schema
- settings key catalog
- hook event catalog
- provider model capability metadata

## Site Implementation Direction

Recommended structure:

- `apps/docs/`
- static site only
- MDX/Markdown content from repo docs folders
- generated reference pages from schemas/contracts

Recommended requirements:

- fast local preview
- static export for hosting
- full-text search
- versionless initial release with a future versioning path
- Mermaid support
- code block tabs
- admonitions/callouts
- frontmatter-driven nav metadata

## Content Model

Every docs page should support:

- `title`
- `summary`
- `audience`
- `source_of_truth`
- `updated_at`
- optional `related`

Reference pages should additionally support:

- schema/type name
- generated-from source
- stability level
- compatibility notes

## Plugin / Extension Documentation Requirements

The docs platform must make plugin development possible without reading raw architecture docs first.

Required plugin-dev content:

- plugin overview
- manifest schema
- permissions model
- hook event catalog
- UI extension points
- testing strategy
- packaging/signing/release
- migration/compat notes for Claude/OpenCode ecosystem imports

## Product Documentation Requirements

The docs platform must explain:

- desktop-first runtime model
- native vs wrapper modes
- reasoning controls
- file/folder context attachment behavior
- workspace isolation and merge review
- multi-agent visibility
- mobile pairing and remote access

## Reference Generation

The docs site should generate or sync reference pages from:

- `docs/architecture/data-model.md`
- `docs/architecture/agent-backend-interface.md`
- `docs/architecture/plugin-framework.md`
- `docs/architecture/remote-control-protocol.md`

Generated reference sets should include:

- settings keys
- payload shapes
- event names
- attachment reference schema
- model reasoning capability schema
- workspace merge review schema

## Deployment

The docs site should be deployed as a static documentation property.

Requirements:

- static hosting
- independent from the Lunaria desktop runtime
- independent from the mobile runtime
- no product auth dependency

## Governance

- Architecture docs remain the deepest source of truth.
- Developer/product/reference pages should summarize and reorganize, not redefine.
- If docs site pages conflict with architecture docs, architecture docs win until both are reconciled.
- Prompt docs must stay aligned with architecture docs and major product docs.

## Success Criteria

The documentation platform is complete when:

1. Users can understand the desktop and mobile product behavior without reading raw architecture docs.
2. Plugin authors can build a plugin using the developer docs alone.
3. Core contributors can find schemas/contracts/reference pages without scanning long architecture files.
4. The docs site can be built from the repo as a static property.
