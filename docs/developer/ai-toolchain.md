# AI Development Toolchain

This guide documents the AI agents, skills, MCP servers, hooks, and tools recommended for developing Lunaria. The goal is maximum AI leverage across the entire development lifecycle.

## Claude Code Setup

### Required Skills

Install these skills for every Claude Code session working on Lunaria:

| Skill | Source | Purpose |
|-------|--------|---------|
| **Tauri v2 Development** | `dchuk/claude-code-tauri-skills` | 39 skills for Tauri setup, security, IPC, plugins, distribution |
| **Rust Coding** | `actionbook/rust-skills` | Rust patterns, module structure, clippy compliance |
| **React Best Practices** | `vercel-labs/react-best-practices` | React 19 patterns, hooks, composition |
| **shadcn/ui** | `google-labs-code/shadcn-ui` | Build UI with shadcn/ui component library |
| **Frontend Design** | `anthropics/frontend-design` | UI/UX design patterns and Tailwind CSS |
| **TDD Workflow** | Built-in (`/tdd`) | Red-Green-Refactor cycle enforcement |
| **Systematic Debugging** | Built-in (`/debug`) | Scientific method debugging workflow |
| **Trail of Bits Security** | `trailofbits/skills` | Security auditing and vulnerability detection |

### Install Commands

```bash
# Tauri v2 skills (39 specialized skills)
gh repo clone dchuk/claude-code-tauri-skills
cp -r claude-code-tauri-skills/tauri .claude/skills/

# Rust skills
gh repo clone actionbook/rust-skills
cp -r rust-skills/.claude/skills/* .claude/skills/

# Security skills
gh repo clone trailofbits/skills
cp -r skills/.claude/skills/* .claude/skills/
```

### Recommended MCP Servers

Configure in `.claude/settings.json`:

| Server | Purpose | Priority |
|--------|---------|----------|
| **Context7** | Real-time library documentation (Tauri, React, Vercel AI SDK) | Critical |
| **Sequential Thinking** | Structured reasoning for architecture decisions | High |
| **GitHub** | PR creation, issue management, code search | High |
| **Playwright/Chrome DevTools** | Browser testing and visual verification | High |
| **Filesystem** | Safe file operations with access control | Medium |
| **Memory (mem0)** | Persistent semantic memory across sessions | Medium |
| **Serena** | Semantic code navigation and symbolic editing | Medium |

### Custom Agents

Lunaria uses custom Claude Code agents in `.claude/agents/` for specialized development tasks. See the agents directory for the full set.

### Hooks Configuration

Recommended hooks in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "echo 'Verify changes work after editing. Test functionality before marking complete.'"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "echo 'Code modified. Run tests to verify.'"
      }
    ],
    "Stop": [
      {
        "command": "osascript -e 'display notification \"Claude Code task complete\" with title \"Lunaria\"'"
      }
    ]
  }
}
```

### Agent Teams Strategy

For large features, use Claude Code Agent Teams:

```
Orchestrator (main Claude Code session)
├── Architecture Agent (reads docs, validates design)
├── Rust Backend Agent (implements Tauri commands, core managers)
├── React Frontend Agent (implements UI components, Storybook)
├── Test Agent (writes and runs tests in parallel)
└── Documentation Agent (updates docs as code changes)
```

**Team workflow:**
1. Orchestrator reads the implementation prompt and breaks it into tasks
2. Agents work in parallel on non-conflicting files
3. Test Agent validates each agent's output
4. Orchestrator merges and resolves conflicts

## Codex CLI Setup

### AGENTS.md

Codex reads `AGENTS.md` for project context. See `/AGENTS.md` for the Lunaria-specific configuration.

### Multi-Agent with Codex

```bash
# Launch parallel Codex agents for different tasks
codex --task "Implement the session create Tauri command" &
codex --task "Create the SessionList React component" &
codex --task "Write integration tests for session CRUD" &
```

Each agent reads AGENTS.md for consistent project context.

### Codex + MCP

Configure MCP servers in `~/.codex/config.toml`:

```toml
[mcp.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]

[mcp.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]
```

## oh-my-claudecode (OMC)

If using OMC, it provides 32+ specialized agents with automatic routing:

| OMC Agent | Use For |
|-----------|---------|
| `executor` | Focused implementation tasks |
| `deep-executor` | Complex multi-step autonomous work |
| `architect` | Architecture review and design |
| `code-reviewer` | Code quality and style review |
| `security-reviewer` | Security vulnerability detection |
| `test-engineer` | Test strategy and implementation |
| `debugger` | Root cause analysis |
| `build-fixer` | Build and compilation errors |
| `designer` | UI/UX implementation |
| `planner` | Strategic planning with interview workflow |

## Development Workflow

### Phase 0 Spikes

Each spike should use a dedicated Claude Code session:
1. Open a new session per spike item
2. Load the spike prompt: `docs/prompts/00-spike/01-phase-zero-validation.md`
3. Use Tauri v2 skills for Tauri-specific spikes
4. Use Rust skills for specta and SQLite spikes
5. Document results directly in the session

### MVP Implementation

For each implementation prompt:
1. **Read the prompt** — give the full prompt file to Claude Code
2. **Brainstorm first** — use the brainstorming skill before coding
3. **TDD cycle** — write tests first, then implement
4. **Parallel agents** for independent components:
   - Rust backend agent (Tauri commands, SQLite)
   - React frontend agent (UI components, Storybook)
   - Test agent (integration tests, E2E)
5. **Review** — use the code-reviewer agent on each PR

### Cross-Tool Strategy

| Task Type | Best Tool | Why |
|-----------|----------|-----|
| Architecture design | Claude Code (Opus) | Deep reasoning, multi-file context |
| Rust implementation | Claude Code + Tauri skills | Specialized Tauri/Rust knowledge |
| React UI components | Claude Code or Codex | Both work well; use Storybook for verification |
| Parallel feature work | Codex App (cloud) | Sandboxed parallel agents |
| Quick bug fixes | Claude Code (Sonnet) | Fast, focused |
| Security audit | Claude Code + Trail of Bits skills | Specialized security knowledge |
| Documentation | Claude Code (Haiku) | Cost-effective for text generation |

## Architectural Inspirations

Lunaria draws design patterns and structural ideas from several open-source projects. These are not runtime dependencies — they are reference architectures whose concepts have been adapted into Lunaria's own systems.

### agency-agents

**Repository:** [ruvnet/agent-agents](https://github.com/ruvnet/agent-agents) (33.1k stars)

A collection of 130+ agent persona definitions with a multi-tool conversion pipeline that transforms persona YAML into formats consumable by different agent runtimes.

**What Lunaria borrows:**

- **Division taxonomy.** agency-agents organizes personas into functional divisions (engineering, research, operations, creative, etc.). Lunaria's agent management system (`AgentManagementScreen`, agent teams configuration) uses an analogous division model to categorize and filter agents by role.
- **Persona schema.** The structured persona format (name, role, expertise domains, system prompt, tool permissions) informed the shape of Lunaria's agent definition schema stored in SQLite and surfaced in the agent management UI.
- **Multi-format export pipeline.** The concept of a single canonical agent definition that can be exported to multiple backend formats (Claude Code subagent, OpenCode config, standalone prompt file) directly influenced Lunaria's wrapper adapter framework described in `docs/architecture/agent-backend-interface.md`.

**Maps to:** Agent management subsystem, wrapper adapter framework, `.claude/agents/` definitions.

### MiroFish

**Repository:** [mirofish/mirofish](https://github.com/mirofish/mirofish) (18.4k stars)

A multi-agent swarm framework built around finite state machines, GraphRAG-backed memory, and persistent personality profiles for long-running collaborative agent sessions.

**What Lunaria borrows:**

- **Extended agent lifecycle states.** MiroFish models agents with states beyond simple idle/running/done — including warming up, waiting for peer, negotiating, and cooling down. Lunaria adopts a similar extended state machine for agent sessions, enabling the UI to show granular status in the session workspace and Kanban board.
- **Collaboration metadata.** MiroFish attaches `collaborationStyle`, `communicationPreference`, and `decisionWeight` to each agent profile. Lunaria's agent teams configuration (see `docs/architecture/multi-agent-runtime.md`) uses equivalent metadata to govern how agents in a team coordinate, whose output takes priority, and how consensus is reached.
- **Team consensus patterns.** The voting, delegation, and arbitration patterns for multi-agent decision-making informed Lunaria's mailbox-based inter-agent communication and the orchestrator's conflict resolution strategy.

**Maps to:** Multi-agent runtime, agent teams and mailbox system, session workspace lifecycle states.

### impeccable

**Repository:** [impeccable-ai/impeccable](https://github.com/impeccable-ai/impeccable) (4.7k stars)

A design quality system that combines OKLCH color science, automated anti-pattern detection, and 18 specialized steering skills to enforce visual consistency and accessibility standards.

**What Lunaria borrows:**

- **7-domain audit framework.** impeccable audits UI across seven domains: color contrast, spacing rhythm, typography scale, component consistency, motion coherence, responsive fidelity, and accessibility compliance. Lunaria uses this framework as the basis for UI quality gates in its Storybook verification pipeline and test coverage hardening (see `docs/prompts/07-ui-implementation/13-ui-test-coverage-hardening.md`).
- **Anti-pattern detection approach.** Rather than only checking for the presence of correct patterns, impeccable also flags known anti-patterns (z-index stacking conflicts, inconsistent border radii, orphaned design tokens). Lunaria's theming and design system (`docs/architecture/theming-design-system.md`) incorporates similar negative checks alongside its OKLCH palette validation.
- **OKLCH color science alignment.** impeccable's perceptually uniform color validation reinforced Lunaria's choice of OKLCH as the palette foundation, with the magenta accent `#B800B8` validated through the same perceptual uniformity principles.

**Maps to:** Design token system, Storybook quality gates, theming and design system, UI test coverage.

### OpenViking

**Repository:** [openviking/openviking](https://github.com/openviking/openviking) (6.3k stars)

A context database designed for AI agent workloads, featuring tiered context loading, session transcript compression, memory deduplication, and AGFS (Agent File System) for virtual file-based context access.

**What Lunaria borrows:**

- **Three-tier context loading (L0/L1/L2).** OpenViking loads context in three tiers: L0 (always present — identity, rules, active task), L1 (session-scoped — recent transcript, open files, workspace state), and L2 (on-demand — full repository search, archived sessions, long-term memory). Lunaria's memory system (`docs/architecture/memory-system.md`) follows the same tiered injection pattern, with L0 mapped to the system prompt and active session, L1 to the hybrid retrieval cache, and L2 to the full SQLite-backed memory store.
- **6-category memory taxonomy.** OpenViking classifies memories into six categories: facts, preferences, procedures, relationships, events, and context. Lunaria's Claude-mem parity architecture uses a compatible taxonomy for its observe-persist-retrieve-inject cycle, ensuring that different memory types are weighted and retrieved appropriately.
- **Session compression and deduplication.** The techniques for compressing long transcripts into summaries while preserving key decision points, and deduplicating redundant observations before persistence, informed Lunaria's JSONL transcript management and memory consolidation strategies.

**Maps to:** Memory system, context injection pipeline, JSONL transcript persistence, hybrid retrieval.

## Resources

### Claude Code
- [Skills documentation](https://code.claude.com/docs/en/skills)
- [Agent Teams guide](https://code.claude.com/docs/en/agent-teams)
- [Hooks guide](https://code.claude.com/docs/en/hooks-guide)
- [Subagents documentation](https://code.claude.com/docs/en/sub-agents)
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- [Tauri v2 skills](https://github.com/dchuk/claude-code-tauri-skills)
- [100+ subagents collection](https://github.com/VoltAgent/awesome-claude-code-subagents)

### Codex CLI
- [AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md/)
- [Multi-agent documentation](https://developers.openai.com/codex/multi-agent/)
- [MCP integration](https://developers.openai.com/codex/cli/features/)

### MCP Servers
- [Context7](https://github.com/upstash/context7)
- [Sequential Thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking)
- [GitHub MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
