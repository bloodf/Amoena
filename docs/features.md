# Features Overview

Lunaria includes 33 integrated features across multi-agent orchestration, memory systems, extensibility, and remote access.

## Session Management (5 features)

- **Native Sessions** — Execute agents with Lunaria's orchestration engine using Vercel AI SDK
- **Wrapper Sessions** — Shell around Claude Code, OpenCode, Codex CLI, or Gemini CLI with full streaming
- **Session History** — Persistent chat history with markdown export and JSON backups
- **Message Streaming** — Real-time token-by-token output with cancel support
- **Merge Review UI** — Workspace branch conflicts with visual diff and manual resolution

## Multi-Agent Orchestration (6 features)

- **Subagent Spawning** — Create child agents for subtasks with automatic context inheritance
- **Team Formation** — Coordinate multiple agents with role assignment and task distribution
- **Mailbox Communication** — Agent-to-agent messaging with request/response patterns
- **Intelligent Dispatch** — Route tasks to best-fit agent based on capability and context
- **Autopilot Mode** — Fully autonomous task execution with periodic checkpoints
- **Agent Evaluation** — Built-in metrics for reasoning quality, tool effectiveness, success rate

## Memory System (4 features)

- **L0 Observations** — Raw context capture: user messages, tool outputs, decisions
- **L1 Summaries** — Automatic summarization of observation chains using embeddings
- **L2 Insights** — Cross-session pattern extraction and knowledge synthesis
- **Embedding Search** — Semantic retrieval of relevant observations using vector similarity

## AI Providers & Models (5 features)

- **Claude Support** — Full Claude 3 family with streaming and tool use
- **Codex Support** — OpenAI Codex with code completion and reasoning
- **Gemini Support** — Google Gemini with multimodal capabilities
- **OpenCode Support** — OpenCode CLI integration for code generation
- **Model Selection** — Intelligent routing based on task type, cost, and reasoning requirements

## Tool Execution (4 features)

- **Bash Execution** — Run shell commands with real-time output capture
- **File I/O** — Safe file read/write with permission checks and conflict handling
- **API Requests** — HTTP/REST calls with authentication header support
- **Sandbox Safety** — Capability checking, timeout enforcement, and error recovery

## Workspace Management (3 features)

- **Git Integration** — Branch-isolated workspaces with automatic conflict detection
- **Merge Conflict Resolution** — Visual diff UI with manual or auto-merge strategies
- **Workspace Switching** — Instant branch checkout with session isolation

## User Interface (2 features)

- **React 19 Frontend** — High-performance webview with streaming updates
- **Component Library** — 50+ reusable components with Storybook and i18n support

## Extensibility (2 features)

- **Extension Marketplace** — Discover, install, and share `.luna` binary extensions
- **Manifest-Driven Lifecycle** — Contributions for commands, panels, tools, providers, and hooks

## Remote Access (2 features)

- **QR Code Pairing** — Scan to pair mobile device with instant session access
- **Remote Session Control** — Full control from paired mobile device over LAN or relay

## Advanced Features (2 features)

- **Internationalization** — Full i18n support for 5 languages (en, pt, es, fr, de)
- **110+ API Endpoints** — Complete REST/SSE API for programmatic access

---

## By Use Case

### For Individual Developers
Sessions, Memory System, Git Integration, Extension Marketplace

### For Teams
Multi-Agent Orchestration, Autopilot, Merge Review, Workspace Sharing

### For Enterprises
Remote Access, Advanced Evaluation Metrics, Custom Provider Integration, Audit Logging

### For Extension Authors
Manifest System, Hook Events, Tool Sandbox, Provider Adapter Framework

---

See the [Features](/features/) section for detailed docs on each feature.
