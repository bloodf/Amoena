# Security Model

## Purpose

This document defines Amoena's security architecture, threat model, and trust boundaries. Amoena executes arbitrary code via AI agents on the user's machine — security is not optional.

## Trust Boundaries

```
┌─────────────────────────────────────────────────┐
│              TRUSTED (Desktop)                    │
│                                                   │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Tauri Main   │  │ Core Managers (Rust)      │  │
│  │ (Rust)       │  │ ├─ Session Manager        │  │
│  │ ├─ IPC gate  │  │ ├─ Permission Engine      │  │
│  │ ├─ CSP       │  │ ├─ Tool Executor          │  │
│  │ └─ Allowlist │  │ └─ Workspace Manager      │  │
│  └──────────────┘  └──────────────────────────┘  │
│                                                   │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Webview      │  │ Bun Daemon               │  │
│  │ (sandboxed)  │  │ (provider calls only)     │  │
│  └──────────────┘  └──────────────────────────┘  │
│                                                   │
├───────────────────────────────────────────────────┤
│           UNTRUSTED (External)                    │
│                                                   │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ LLM Provider │  │ Remote Clients           │  │
│  │ APIs         │  │ (mobile, web)             │  │
│  └──────────────┘  └──────────────────────────┘  │
│                                                   │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ MCP Servers  │  │ Plugins                  │  │
│  │ (external)   │  │ (third-party)             │  │
│  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Threat Model

### T1: Prompt Injection via LLM Response

**Threat:** Model output contains instructions that trick the system into executing unauthorized actions.

**Mitigations:**
- Tool calls require explicit user approval (permission engine).
- Tool arguments are validated against schemas before execution.
- Dangerous tools (file delete, shell exec) require per-call approval by default.
- Autopilot mode has story-boundary checkpoints.

### T2: Malicious Tool Execution

**Threat:** An AI agent requests a tool call that damages the user's system or exfiltrates data.

**Mitigations:**
- Workspace isolation: agents operate in CoW clones, not the user's working tree.
- Permission model: allow/deny/ask per tool, per session.
- File system scope: tools can only access files within the workspace directory.
- Network scope: tools cannot make arbitrary network requests without explicit permission.
- Timeout enforcement: all tool executions have configurable timeouts.

### T3: Credential Theft

**Threat:** Provider API keys or OAuth tokens are exposed through logs, crash reports, or file system access.

**Mitigations:**
- API keys stored in OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service).
- Keys never written to disk in plaintext.
- Keys never included in log output or error messages.
- Environment variable detection uses read-once-and-forget pattern.

### T4: Remote Client Impersonation

**Threat:** An unauthorized device gains access to the desktop runtime via the remote access surface.

**Mitigations:**
- Remote access is opt-in (disabled by default).
- QR code + PIN pairing with device-scoped JWT tokens.
- Tokens are short-lived with refresh mechanism.
- Device registry with explicit revocation.
- E2E encryption for relay connections (no plaintext transit).
- LAN connections require same-network verification.

### T5: Supply Chain (Plugins and MCP Servers)

**Threat:** A malicious plugin or MCP server is installed and executes arbitrary code.

**Mitigations:**
- Plugins run in sandboxed processes with limited system access.
- MCP servers are launched with scoped permissions.
- Plugin manifest declares required permissions; user approves at install.
- V2.0 marketplace includes automated scanning and review queue.

### T6: Data Exfiltration via Streaming

**Threat:** Session content (code, conversations) is leaked through the streaming pipeline.

**Mitigations:**
- All provider communication uses TLS.
- JSONL transcripts are stored locally, never uploaded without explicit user action.
- Memory observations stay local unless explicitly shared.
- Session export is a user-initiated action with preview.

## Permission Engine

### Default Rules

| Tool Category | Default | Override |
|--------------|---------|---------|
| File read (in workspace) | Allow | Per-session |
| File write (in workspace) | Ask | Per-session |
| File operations (outside workspace) | Deny | Per-call |
| Shell execution | Ask | Per-session |
| Network request | Ask | Per-session |
| Git operations (in workspace) | Allow | Per-session |
| Git push | Ask | Per-call |

### Permission Persistence

- **Per-session:** Decisions persist for the session lifetime.
- **Per-project:** Users can configure project-level defaults in settings.
- **Global:** System-wide defaults in the global settings.

### Permission Audit Log

Every permission decision is logged:

```json
{
  "timestamp": "2025-03-11T19:00:00Z",
  "session_id": "...",
  "agent_id": "...",
  "tool": "file_write",
  "target": "/workspace/src/main.rs",
  "decision": "allow",
  "source": "user_prompt"
}
```

Audit logs are stored in SQLite and can be reviewed in the Settings screen.

## Content Security Policy

The Tauri webview enforces a strict CSP:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
connect-src 'self' ipc: tauri:;
img-src 'self' data: blob:;
font-src 'self' data:;
```

- No `unsafe-eval` — this constrains editor choice (must work without eval).
- No external script loading.
- Connections only to self and Tauri IPC.

## Tauri Command Allowlist

Only explicitly listed Tauri commands are accessible from the webview. The allowlist is defined in `tauri.conf.json` and enforced by the Tauri runtime.

Sensitive commands (e.g., file system access, shell execution) are proxied through the permission engine — the webview cannot invoke them directly.

## Secrets in Development

- `.env` files are gitignored.
- No secrets in `tauri.conf.json` or any committed config file.
- CI secrets are stored in GitHub Secrets, not in the repository.
- Test fixtures must never contain real API keys.

## Competitive Reference: Osaurus Identity Model

Osaurus implements a cryptographic identity system worth studying. Key design decisions:

### Cryptographic Identity

- **Algorithm:** secp256k1 elliptic curve cryptography for all participants (humans, agents, devices).
- **Key hierarchy:** Master key → derived per-agent keys, forming a chain of trust.
- **Storage:** Master key stored in iCloud Keychain (Apple-only).
- **Portable tokens:** Scoped access keys (`osk-v1`) tied to individual agents, enabling remote invocation without exposing the master key.
- **Revocation:** Any key in the chain can be revoked at any time, invalidating all downstream tokens.
- **Auditability:** Every action carries a verifiable cryptographic signature traceable to a specific participant.

### Sandbox Execution

- Agents execute in isolated Linux VMs via Apple Containerization framework.
- Each sandbox provides a full dev environment (shell, Python, Node.js) with zero host risk.
- Per-agent Linux user and home directory for filesystem isolation.
- Secure communication between host and sandbox via vsock bridge.

### Plugin Security

- Plugins run with declared permissions.
- V2 plugins receive scoped access to host APIs — no blanket system access.

### Observations

| Aspect | Osaurus | Amoena (Current) |
|--------|---------|-------------------|
| Identity model | Cryptographic key pairs | Session-scoped JWTs |
| Key storage | iCloud Keychain (Apple-only) | OS keychain (cross-platform) |
| Agent isolation | Linux VMs (Apple Containerization) | CoW workspace clones |
| Platform support | macOS-only | macOS, Windows, Linux |
| Remote auth | Scoped portable keys | QR + PIN pairing |

Osaurus's cryptographic identity model is stronger than Amoena's current session-scoped approach, but its reliance on Apple-only infrastructure (iCloud Keychain, Apple Containerization) limits portability. Amoena's cross-platform constraint requires a different implementation path.

## Cryptographic Agent Identity (Future)

> **Status:** Proposed. Not yet implemented.

This section outlines a cryptographic identity system for Amoena agents, informed by the Osaurus model but designed for cross-platform operation.

### Design Goals

1. **Every participant has a verifiable identity.** Users, agents, and paired devices each hold a key pair.
2. **Delegated authority.** Agents act under a chain of trust rooted in the user's master key.
3. **Cross-platform key storage.** No single-vendor lock-in for secret management.
4. **Revocable at any level.** Compromised keys can be revoked without rebuilding the entire chain.
5. **Offline-capable.** Key verification must work without network access.

### Key Hierarchy

```
┌────────────────────────────────────┐
│        User Master Key             │
│   (Ed25519 or secp256k1)           │
│   Stored in OS keychain            │
├────────────┬───────────────────────┤
│            │                       │
│  ┌─────────▼──────────┐  ┌────────▼─────────────┐
│  │ Agent Key (derived) │  │ Device Key (derived)  │
│  │ Per-agent scope     │  │ Per-device scope      │
│  └─────────┬──────────┘  └────────┬─────────────┘
│            │                       │
│  ┌─────────▼──────────┐  ┌────────▼─────────────┐
│  │ Scoped Access Token │  │ Session Token         │
│  │ (lnr-v1-...)       │  │ (short-lived JWT)     │
│  └────────────────────┘  └───────────────────────┘
└────────────────────────────────────┘
```

### Algorithm Selection

| Option | Pros | Cons |
|--------|------|------|
| Ed25519 | Fast, small keys, widely supported in Rust (`ed25519-dalek`) | Less common in blockchain tooling |
| secp256k1 | Proven in high-value systems (Bitcoin, Ethereum), Osaurus compatibility | Larger signatures, slightly slower |

**Recommendation:** Ed25519 as default with secp256k1 as an opt-in alternative. Ed25519 has better Rust ecosystem support (`ring`, `ed25519-dalek`) and smaller key/signature sizes, which matters for embedded tokens.

### Key Storage (Cross-Platform)

| Platform | Backend | Crate |
|----------|---------|-------|
| macOS | Keychain Services | `security-framework` |
| Windows | Credential Manager (DPAPI) | `windows-credentials` or `keyring` |
| Linux | Secret Service (GNOME Keyring / KDE Wallet) | `secret-service` or `keyring` |

Unlike Osaurus's iCloud Keychain approach, Amoena must abstract over platform-specific backends. The Rust `keyring` crate provides a unified API but may need to be supplemented for advanced operations (key derivation, hardware key support).

**Fallback:** If no OS keychain is available (headless Linux, CI environments), support an encrypted file-based store with a passphrase-derived key (Argon2id).

### Scoped Access Tokens

Portable tokens for remote agent invocation, analogous to Osaurus's `osk-v1`:

```
lnr-v1-<base62-encoded-payload>
```

Token payload:

```json
{
  "iss": "<user_master_key_fingerprint>",
  "sub": "<agent_key_fingerprint>",
  "scope": ["tool:file_read", "tool:shell_exec"],
  "workspace": "/path/to/project",
  "exp": 1720000000,
  "iat": 1719900000
}
```

- **Scoped:** Each token is bound to a specific agent and a set of permitted tools.
- **Time-limited:** Tokens have an expiration timestamp. Long-lived tokens are discouraged.
- **Revocable:** A revocation list is maintained locally (SQLite) and checked on every token use.
- **Signed:** The token is signed by the issuing agent key, which chains back to the user master key.

### Use Cases

1. **Remote access authentication.** Replace or augment the current QR + PIN flow with token-based auth. A paired device presents a scoped token instead of a session JWT.
2. **Plugin permission signing.** Plugin manifests are signed by the publisher's key. Permission grants are signed by the user's key. Both are independently verifiable.
3. **Audit trails.** Every permission decision (see [Permission Audit Log](#permission-audit-log)) includes the cryptographic identity of the requesting agent, enabling tamper-evident logs.
4. **Multi-device sync.** Derived device keys allow syncing encrypted session data across machines without exposing the master key.

### Migration Path

1. **Phase 1:** Add OS keychain abstraction layer for key storage (prerequisite, also benefits T3 mitigations).
2. **Phase 2:** Implement master key generation and agent key derivation.
3. **Phase 3:** Introduce `lnr-v1` scoped tokens for remote access (replaces raw JWTs).
4. **Phase 4:** Plugin signature verification.

## Sandboxed Execution and the Security Model

Amoena currently isolates agent work through CoW (copy-on-write) workspace clones — agents operate on copies of the user's working tree, and changes are only applied after review. This provides data isolation but not process isolation.

Full process-level sandboxing (comparable to Osaurus's Linux VM approach) would strengthen the security model by containing:

- Filesystem access outside the workspace.
- Network calls to unauthorized endpoints.
- Resource exhaustion (CPU, memory, disk).

Cross-platform sandboxing options under consideration:

| Platform | Mechanism | Notes |
|----------|-----------|-------|
| macOS | App Sandbox / `sandbox-exec` | Built-in, limited configurability |
| Windows | AppContainer / Job Objects | Good process isolation |
| Linux | bubblewrap / Landlock | No VM overhead, namespace-based |

Process-level sandboxing is complementary to the permission engine — the permission engine controls _what_ an agent is allowed to do, while the sandbox enforces _what_ it is physically capable of doing. Defense in depth requires both layers.
