# Sandbox Execution

## Purpose

This document defines how Lunaria creates, manages, and tears down isolated execution environments for agent code. Agents run arbitrary commands (build, test, install packages) inside per-session containers so the host machine is never exposed to unintended side effects.

Priority: **V1.5**

## Motivation

- Agents must execute untrusted or unpredictable code (shell commands, package installs, builds, test suites).
- The host machine must be protected from filesystem corruption, network abuse, and resource exhaustion.
- Per-agent isolation prevents cross-contamination between concurrent sessions.
- Reproducible container images guarantee consistent behavior across macOS, Windows, and Linux.

## Container Runtime

Lunaria uses Docker/OCI containers as the isolation primitive. This is a deliberate cross-platform choice — unlike Apple's Containerization framework (macOS 26+, Apple Silicon only), Docker Engine runs on all three desktop targets.

| Runtime | Platform | Notes |
|---------|----------|-------|
| Docker Engine | macOS, Windows, Linux | Primary. Docker Desktop or standalone daemon. |
| Podman | macOS, Linux | Rootless alternative. Drop-in Docker API compat. |

The Tauri main process communicates with the container runtime via the Docker-compatible HTTP API over the local Unix socket (`/var/run/docker.sock`) or named pipe (`\\.\pipe\docker_engine` on Windows).

## Base Images

- **Default**: Lightweight Debian slim with common dev tools (git, curl, Node.js LTS, Python 3, build-essential).
- **Minimal**: Alpine-based image for fast pull and low disk footprint.
- **Custom**: Users and plugins can specify any OCI-compliant image in agent configuration.

Images are pulled lazily on first use and cached locally. A background prefetch runs after onboarding if Docker is detected.

## Container Lifecycle

| Phase | Action |
|-------|--------|
| **Session start** | Pull or create container from the agent's configured image. Mount workspace volume. Apply resource limits. |
| **During session** | Agent executes commands via the Docker exec API. Output is streamed back to the Tauri main process. |
| **Session end** | Container stopped. Optionally preserved for post-mortem debugging. |
| **Cleanup** | Configurable retention policy: immediate destroy, keep for N hours, or keep until manual cleanup. |

### Sequence

```
Agent Orchestrator → Sandbox Manager → Docker API
        │                    │               │
        │  create_sandbox()  │               │
        │───────────────────>│  POST /containers/create
        │                    │──────────────>│
        │                    │  container_id │
        │                    │<──────────────│
        │                    │  POST /containers/{id}/start
        │                    │──────────────>│
        │   sandbox_ready    │               │
        │<───────────────────│               │
        │                    │               │
        │  exec("npm test") │               │
        │───────────────────>│  POST /containers/{id}/exec
        │                    │──────────────>│
        │                    │  stream stdout/stderr
        │                    │<──────────────│
        │  streaming output  │               │
        │<───────────────────│               │
        │                    │               │
        │  end_session()     │               │
        │───────────────────>│  POST /containers/{id}/stop
        │                    │──────────────>│
```

## Communication Bridge

| Channel | Transport | Purpose |
|---------|-----------|---------|
| Tauri Main → Docker API | HTTP over Unix socket / named pipe | Container lifecycle and exec commands |
| Container → Tauri Main | JSON over stdout/stderr (exec stream) | Command output, structured results |
| File transfer (primary) | Docker volume mounts | Workspace directory shared read-write |
| File transfer (ad-hoc) | Docker cp API | One-off file injection or extraction |

### Structured Protocol

Commands sent to the container exec API use a JSON envelope:

```json
{
  "id": "exec-001",
  "command": ["npm", "test"],
  "cwd": "/workspace",
  "env": { "CI": "true" },
  "timeout_ms": 300000
}
```

Responses stream back as newline-delimited JSON:

```json
{ "id": "exec-001", "type": "stdout", "data": "PASS src/app.test.ts" }
{ "id": "exec-001", "type": "exit", "code": 0, "duration_ms": 4521 }
```

## Security Model

- **No host network access** by default. Container network mode is `none`.
- **No host filesystem access** outside the explicitly mounted workspace volume.
- **Resource limits** enforced per container:

| Resource | Default Limit | Configurable |
|----------|---------------|--------------|
| Memory | 2 GB | Yes |
| CPU | 2 cores | Yes |
| Disk (writable layer) | 10 GB | Yes |
| PIDs | 256 | Yes |

- **No privileged mode**. Containers never run with `--privileged`.
- **Optional hardening**: seccomp profiles, AppArmor (Linux), and read-only root filesystem.
- **No Docker socket mount**. Containers cannot control the Docker daemon.

## Per-Agent Configuration

```toml
[sandbox]
enabled = true
image = "lunaria/agent-sandbox:latest"
memory_limit = "2g"
cpu_limit = 2
network = "none"        # none | bridge | host
mounts = ["/workspace"]
env = { NODE_ENV = "development" }
retention = "1h"        # immediate | 1h | 24h | manual
```

Configuration is specified per agent in the agent manifest. Defaults are applied from the global Lunaria settings. The setup wizard detects Docker availability and prompts for installation if missing.

## Filesystem Strategy

- The active workspace directory is bind-mounted into the container at `/workspace` (read-write).
- The rest of the container filesystem is ephemeral (destroyed on cleanup).
- CoW workspace clones (see [workspace-lifecycle.md](workspace-lifecycle.md)) are mounted independently per agent, preserving isolation between parallel sessions.

## Fallback Modes

| Condition | Behavior |
|-----------|----------|
| Docker available | Full container isolation (default) |
| Docker unavailable | Host-process execution with restricted permissions. User warned at session start. |
| Future (V2+) | WASM sandbox for lightweight isolation without Docker dependency |

When running in host-process fallback, Lunaria applies OS-level restrictions where possible (macOS sandbox profiles, Windows job objects, Linux namespaces) but cannot guarantee full isolation. A persistent banner warns the user that sandbox protection is degraded.

## Rust Integration

The Sandbox Manager is a Rust module in the Tauri main process, peer to the existing Workspace Manager and Tool Executor:

- **SandboxManager**: owns container lifecycle, image cache, and cleanup scheduling.
- **SandboxHandle**: per-session handle wrapping a running container. Passed to the Tool Executor for command dispatch.
- All Docker API calls are async (tokio + hyper over Unix socket).

## Competitive Reference

| Capability | Osaurus | Lunaria |
|------------|---------|---------|
| Isolation technology | Apple Containerization (Linux VMs) | Docker/OCI containers |
| Platform support | macOS 26+, Apple Silicon only | macOS, Windows, Linux |
| Per-agent isolation | Linux user + home directory per agent | Dedicated container per agent session |
| Communication | vsock bridge | Docker API (HTTP socket) + JSON stdout |
| Extensibility | JSON plugin recipes | Agent manifest + OCI image config |
| Host dependency | None (framework built into macOS) | Docker Engine (~100 MB) or Podman |

Trade-off: Docker adds an external dependency but delivers cross-platform support on day one. Apple Containerization is tighter but locks out Windows, Linux, and older macOS versions.

## Acceptance Criteria

- Every agent command executes inside a container when sandbox is enabled.
- No container has host network access unless explicitly configured.
- No container accesses host filesystem outside the mounted workspace.
- Resource limits are enforced and configurable per agent.
- Container cleanup respects the configured retention policy.
- Fallback mode warns the user and degrades gracefully when Docker is unavailable.
- Sandbox lifecycle does not block session start by more than 5 seconds (warm image cache).
