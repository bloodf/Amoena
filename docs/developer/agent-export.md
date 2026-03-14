# Agent Export

Lunaria ships a persona export pipeline in `scripts/export-agents.ts`. It converts built-in agent personas from `apps/desktop/resources/agent-personas/` into formats consumed by external coding tools.

## Purpose

- keep the built-in agent library as the single source of truth
- export compatible agent definitions for external tools
- validate persona schema before publishing or consuming exported artifacts

## Supported Formats

- `claude-code`
- `cursor`
- `aider`
- `windsurf`
- `gemini-cli`
- `opencode`

## Run the Pipeline

```bash
bun run scripts/export-agents.ts --format claude-code --output dist/agents
```

Export every supported format:

```bash
bun run scripts/export-agents.ts --format all --output dist/agents
```

Validate personas only:

```bash
bun run scripts/export-agents.ts --validate-only
```

## Format Notes

### Claude Code

- output shape: Markdown files with YAML frontmatter
- target directory: `.claude/agents/`

### Cursor

- output shape: `.cursorrules`-style persona markdown

### Aider

- output shape: markdown with configuration block and persona body

### Windsurf

- output shape: `.windsurfrules`-compatible markdown

### Gemini CLI

- output shape: `AGENTS.md`-style persona markdown

### OpenCode

- output shape: JSON agent entries in `agents.json`

## Add a New Export Target

1. Add a new formatter to `scripts/export-agents.ts`.
2. Register the target in the `ExportFormat` union.
3. Teach the orchestrator how to write output for that format.
4. Verify the new format with a local export run.

## Persona Schema Validation

The export script validates required frontmatter fields before writing output. Invalid personas should fail the export and return a non-zero exit code.

Related pages:

- [Built-in Agents](/reference/built-in-agents)
- [Plugin Authoring](/developer/plugin-authoring)
