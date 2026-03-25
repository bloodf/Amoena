# Agent Identity

## Purpose

This document is the detailed specification for Amoena's cryptographic agent identity system. It expands on the overview in [security-model.md](security-model.md#cryptographic-agent-identity-future) into a complete design covering key hierarchy, access tokens, OS keychain integration, identity lifecycle, and the supporting data model.

> **Priority:** V2.0. Not yet implemented.

## Design Goals

1. **Every participant has a verifiable identity.** Users, agents, and paired devices each hold an Ed25519 key pair.
2. **Delegated authority.** Agents act under a chain of trust rooted in the user's master key.
3. **Cross-platform key storage.** No single-vendor lock-in for secret management.
4. **Revocable at any level.** Compromised keys can be revoked without rebuilding the entire chain.
5. **Offline-capable.** Key verification must work without network access.

## Key Hierarchy

```
┌────────────────────────────────────────┐
│          User Master Key               │
│   Ed25519 · Generated on first run     │
│   Stored in OS keychain                │
├──────────────┬─────────────────────────┤
│              │                         │
│  ┌───────────▼────────────┐  ┌────────▼───────────────┐
│  │  Agent Key (derived)   │  │  Device Key (derived)  │
│  │  One per agent         │  │  One per device        │
│  └───────────┬────────────┘  └────────┬───────────────┘
│              │                         │
│  ┌───────────▼────────────┐  ┌────────▼───────────────┐
│  │  Access Token           │  │  Session Token          │
│  │  (lnr-v1-...)          │  │  (short-lived JWT)      │
│  └────────────────────────┘  └─────────────────────────┘
└────────────────────────────────────────┘
```

### User Master Key

- **Algorithm:** Ed25519 (fast, small keys, widely supported, cross-platform).
- **Generation:** Created on first application launch if no master key exists.
- **Storage:** OS keychain (see [OS Keychain Integration](#os-keychain-integration)).
- **Purpose:** Root of trust for all derived keys. Never leaves the keychain in plaintext.

### Agent Keys

- **Derivation:** HKDF-SHA256 with the master key as input keying material and the agent ID as the `info` context parameter.
- **Scope:** One key pair per agent instance. The key is deterministic given a master key and agent ID, so it can be re-derived without storing the private key separately.
- **Usage:** Signs tool execution requests, permission grants, and audit log entries originating from this agent.

### Device Keys

- **Derivation:** HKDF-SHA256 with the master key as input keying material and the device ID as the `info` context parameter.
- **Scope:** One key pair per paired device (desktop, mobile, or headless runner).
- **Usage:** Authenticates device-to-device connections in multi-device scenarios. Enables encrypted session sync across machines without exposing the master key.

### Key Derivation Details

```
PRK  = HKDF-Extract(salt=0x00..00, IKM=master_private_key)
OKM  = HKDF-Expand(PRK, info="amoena:agent:<agent_id>", L=32)
      or
OKM  = HKDF-Expand(PRK, info="amoena:device:<device_id>", L=32)
```

The 32-byte output is used as the Ed25519 private key seed. The `info` string includes a namespace prefix (`amoena:agent:` or `amoena:device:`) to prevent collision between agent and device derivation paths.

## Access Tokens

### Format

Portable tokens for remote agent invocation, analogous to Osaurus's `osk-v1` tokens:

```
lnr-v1-<base64url-encoded-payload>.<base64url-encoded-signature>
```

The `lnr-v1` prefix identifies the token version and makes tokens grep-friendly in logs and config files.

### Payload

```json
{
  "iss": "<user_master_key_fingerprint>",
  "sub": "<agent_public_key_fingerprint>",
  "perm": 255,
  "exp": 1720000000,
  "iat": 1719900000,
  "jti": "<unique_token_id>"
}
```

| Field  | Description |
|--------|-------------|
| `iss`  | SHA-256 fingerprint of the user master public key. Identifies the issuer. |
| `sub`  | SHA-256 fingerprint of the agent public key this token grants access to. |
| `perm` | Permissions bitmap. Each bit enables a capability (see below). |
| `exp`  | Expiration timestamp (Unix seconds). Long-lived tokens are discouraged. |
| `iat`  | Issued-at timestamp (Unix seconds). |
| `jti`  | Unique token identifier. Used for revocation lookup. |

### Permissions Bitmap

```
Bit 0: tool:file_read
Bit 1: tool:file_write
Bit 2: tool:shell_exec
Bit 3: tool:git_ops
Bit 4: tool:network
Bit 5: session:read
Bit 6: session:write
Bit 7: admin
```

A token with `perm = 0b00100011` (decimal 35) grants `file_read`, `file_write`, and `session:read`.

### Signing and Verification

1. The payload is serialized as canonical JSON (sorted keys, no whitespace).
2. The serialized payload is signed with the issuing agent's Ed25519 private key.
3. The verifier checks the signature against the agent public key, then verifies the agent key chains back to the user master key.

### Revocation

- A revocation list is maintained in SQLite (see [SQLite Schema](#sqlite-schema)).
- Every token use checks `access_tokens.revoked_at IS NULL` before granting access.
- Revocation is immediate — there is no grace period for access tokens.
- Revoking an identity revokes all tokens issued to that identity.

## OS Keychain Integration

| Platform | Backend | Rust Crate | Notes |
|----------|---------|------------|-------|
| macOS    | Keychain Services API | `security-framework` | Native, hardware-backed on Apple Silicon. |
| Windows  | Credential Manager (DPAPI) | `windows-credentials` or `keyring` | Protected by user login session. |
| Linux    | Secret Service API (GNOME Keyring / KDE Wallet) | `secret-service` or `keyring` | Requires a running secret service daemon. |

### Fallback: Encrypted File Store

If no OS keychain is available (headless Linux, CI environments, containers):

- Keys are stored in `~/.amoena/keystore.enc`.
- Encrypted with AES-256-GCM using a key derived from a user passphrase via Argon2id.
- The passphrase is prompted on first use and cached in memory for the session lifetime.

### Abstraction Layer

A `KeyStore` trait abstracts platform differences:

```rust
pub trait KeyStore: Send + Sync {
    fn store_key(&self, id: &str, key: &[u8]) -> Result<()>;
    fn load_key(&self, id: &str) -> Result<Vec<u8>>;
    fn delete_key(&self, id: &str) -> Result<()>;
    fn has_key(&self, id: &str) -> Result<bool>;
}
```

Implementations: `MacOSKeyStore`, `WindowsKeyStore`, `LinuxKeyStore`, `FileKeyStore`. Runtime selection based on platform detection with explicit override via `AMOENA_KEYSTORE` environment variable.

## Use Cases

### Remote Access Authentication

Replace or augment the current QR + PIN flow ([remote-control-protocol.md](remote-control-protocol.md)) with token-based auth. A paired mobile device presents a scoped `lnr-v1` token bound to a specific agent and permission set.

### Plugin Permission Signing

Plugin manifests are signed by the publisher's key. Permission grants are signed by the user's key. Both are independently verifiable, enabling offline plugin permission checks.

### Audit Trails

Every permission decision in the [Permission Audit Log](security-model.md#permission-audit-log) includes the cryptographic identity of the requesting agent, producing tamper-evident, non-repudiable logs.

### Cross-Device Agent Access

Share an agent across devices by issuing a scoped access token. The receiving device can invoke the agent without access to the master key. Revocation propagates via the shared SQLite revocation list (synced on reconnect).

### MCP Server Authentication

When Amoena acts as an MCP client, it can present a signed identity to MCP servers for client verification. When Amoena hosts MCP servers, incoming connections are authenticated against the identity system before tool access is granted.

## Identity Lifecycle

### Creation

| Identity Type | Trigger | Storage |
|---------------|---------|---------|
| User master key | First application launch | OS keychain |
| Agent key | Agent creation in UI or config | Derived on demand (not stored separately) |
| Device key | Device pairing flow | OS keychain on both devices |

### Rotation

- **Periodic rotation:** Configurable interval (default: 90 days) with a 7-day grace period where both old and new keys are valid.
- **Forced rotation:** Triggered manually or on suspected compromise.
- **Rotation process:** New key is derived, all active tokens are re-signed, old key is moved to a `rotated_keys` archive for grace-period verification.

### Revocation

- **Immediate effect:** Setting `revoked_at` on an identity invalidates it and all downstream tokens on the next request.
- **Cascade:** Revoking a user master key revokes all agent and device keys. Revoking an agent key revokes only that agent's tokens.
- **Recovery:** Revocation is irreversible. A new key must be generated and distributed.

### Export

- **Encrypted backup:** Master key can be exported as an encrypted archive (AES-256-GCM + Argon2id passphrase).
- **Format:** JSON envelope containing the encrypted key material, salt, nonce, and metadata.
- **Use case:** Migration to a new machine or disaster recovery.

### Import

- **Restore from backup:** Import the encrypted archive on a new device, authenticate with the passphrase, and store the master key in the local OS keychain.
- **Re-derivation:** Agent and device keys are re-derived automatically from the restored master key.

## SQLite Schema

```sql
-- Identities: users, agents, and devices
CREATE TABLE identities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('user', 'agent', 'device')),
  public_key BLOB NOT NULL,
  private_key_ref TEXT,   -- keychain reference, NULL for remote identities
  parent_id TEXT REFERENCES identities(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  revoked_at TEXT
);

CREATE INDEX idx_identities_parent ON identities(parent_id);
CREATE INDEX idx_identities_type ON identities(type);

-- Access tokens bound to identities
CREATE TABLE access_tokens (
  id TEXT PRIMARY KEY,     -- matches the jti field in the token payload
  identity_id TEXT NOT NULL REFERENCES identities(id),
  token_hash BLOB NOT NULL,
  permissions INTEGER NOT NULL,
  expires_at TEXT,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX idx_access_tokens_identity ON access_tokens(identity_id);
CREATE INDEX idx_access_tokens_revoked ON access_tokens(revoked_at)
  WHERE revoked_at IS NOT NULL;

-- Rotated keys archive for grace-period verification
CREATE TABLE rotated_keys (
  id TEXT PRIMARY KEY,
  identity_id TEXT NOT NULL REFERENCES identities(id),
  public_key BLOB NOT NULL,
  rotated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  grace_expires_at TEXT NOT NULL
);

CREATE INDEX idx_rotated_keys_identity ON rotated_keys(identity_id);
```

## Migration Path

1. **Phase 1 — Keychain Abstraction.** Implement the `KeyStore` trait and platform backends. This also benefits existing credential storage (T3 mitigations in [security-model.md](security-model.md#t3-credential-theft)).
2. **Phase 2 — Master Key and Derivation.** Generate master key on first run, implement HKDF-SHA256 agent/device key derivation.
3. **Phase 3 — Access Tokens.** Introduce `lnr-v1` scoped tokens for remote access, replacing raw JWTs in the remote control flow.
4. **Phase 4 — Plugin Signatures.** Plugin manifests carry publisher signatures; permission grants are counter-signed by the user.
5. **Phase 5 — Audit Integration.** Permission audit log entries include cryptographic identity and signature verification.

## Competitive Reference

| Aspect | Osaurus | Amoena |
|--------|---------|---------|
| Algorithm | secp256k1 (Bitcoin curve) | Ed25519 |
| Key size | 32-byte private, 33-byte compressed public | 32-byte private, 32-byte public |
| Signature size | 64 bytes (DER-encoded up to 72) | 64 bytes |
| Sign/verify speed | ~100 µs / ~200 µs | ~50 µs / ~70 µs |
| Key hierarchy | Master → agent (iCloud Keychain) | Master → agent/device (cross-platform keychain) |
| Token format | `osk-v1` | `lnr-v1` |
| Platform support | macOS only (Apple Containerization) | macOS, Windows, Linux |
| Keychain backend | iCloud Keychain | OS-native + encrypted file fallback |

Ed25519 is the better fit for Amoena's cross-platform constraint: smaller keys, faster operations, and broader library support across Rust (`ring`, `ed25519-dalek`), JavaScript (`tweetnacl`), and mobile (`libsodium`). The secp256k1 ecosystem is stronger in blockchain tooling, which is not a Amoena requirement.

## Open Questions

1. **Hardware key support.** Should the `KeyStore` trait support hardware security modules (YubiKey, TPM) in a future phase?
2. **Key escrow.** Should Amoena offer optional cloud-based key backup (encrypted) for users who want recovery without managing export files?
3. **Multi-user.** The current design assumes a single user per desktop instance. Multi-user support would require a key hierarchy redesign.

## References

- [security-model.md](security-model.md) — Threat model, trust boundaries, and the identity overview this document expands.
- [remote-control-protocol.md](remote-control-protocol.md) — Current QR + PIN pairing flow that tokens will augment.
- [data-model.md](data-model.md) — SQLite schema conventions and migration strategy.
- [plugin-framework.md](plugin-framework.md) — Plugin manifest and permission model.
- [sandbox-execution.md](sandbox-execution.md) — Process isolation layer that complements identity-based access control.
