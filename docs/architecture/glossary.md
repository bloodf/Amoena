# Glossary

| Term | Definition |
|------|-----------|
| **Agent** | An AI model instance executing within a session, with its own context, tools, and permissions. |
| **Autopilot** | Mode where the agent decomposes a goal into stories and executes them with human checkpoints. |
| **CoW clone** | Copy-on-Write filesystem clone (APFS `cp -c`). Creates an instant, space-efficient copy. |
| **Hook** | A user-defined action triggered by a lifecycle event (session start, tool call, message send, etc.). |
| **Mailbox** | Agent-to-agent message channel in multi-agent orchestration. |
| **MCP** | Model Context Protocol — standard for connecting AI models to external tools and data sources. |
| **Memory observation** | A unit of persistent context captured from session activity (user prompt, tool result, assistant output). |
| **Native mode** | Lunaria's own agentic loop using Vercel AI SDK. Full control over agent lifecycle. |
| **Opinion** | A committee query sent to multiple providers for consensus answers. |
| **Primary agent** | The main agent in a session, responsible for user interaction. |
| **Progressive disclosure** | Memory injection pattern: index → timeline → full details, expanding only on request. |
| **Session** | A conversation between a user and one or more agents, with associated workspace and memory. |
| **specta** | Rust crate that generates TypeScript bindings from Rust types. Used for IPC type safety. |
| **Subagent** | An agent spawned by another agent for delegated work. Inherits parent permissions (can't exceed). |
| **System agent** | A background agent that performs maintenance tasks (summarization, observation processing). |
| **Team** | A group of coordinated agents sharing task context in multi-agent orchestration. |
| **Transcript** | JSONL file containing the complete message history of a session. |
| **Workspace** | An isolated directory (CoW clone or git worktree) where an agent operates on files. |
| **Wrapper mode** | Mode where Lunaria wraps an external CLI tool (Claude Code, OpenCode) as a GUI shell. |
