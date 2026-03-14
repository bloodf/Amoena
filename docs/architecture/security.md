# Security

Lunaria's security model is designed for a desktop application that exposes a local HTTP server and optionally opens that server to LAN devices. The threat model assumes an untrusted local network and requires explicit device pairing for any remote access.

## Authentication Model

### Bootstrap Token → Session JWT

At startup the runtime generates a single-use `bootstrap_token` (UUID v4) with a 60-second TTL. The Tauri shell passes this token to the embedded WebView via IPC — it never touches the network. The frontend exchanges it immediately:

```
POST /api/v1/bootstrap/auth
Authorization: Bearer <bootstrap_token>

200 OK
{
  "authToken": "<jwt>",
  "tokenType": "Bearer",
  ...
}
```

The returned JWT is signed with an `HS256` key generated fresh at each runtime start (`issue_secret()` — two concatenated UUID v4 bytes = 32 bytes of entropy). The key is held only in memory; it is never persisted to disk. This means all session JWTs are invalidated when the app restarts.

The JWT carries:
- `iss`: `"lunaria-desktop"`
- `aud`: `"lunaria-local"` (for local) / `"lunaria-remote"` (for remote devices)
- `sub`: session or device ID
- `exp`: expiry timestamp
- `jti`: unique token ID
- `family_id`: token rotation family (remote only)
- `scopes`: capability list (remote only)
- `kind`: `"access"` or `"refresh"` (remote only)

### Auth Middleware

Every route except the two bootstrap paths is gated by `auth_middleware`. It:

1. Extracts `Authorization: Bearer <token>` from the request header
2. Verifies the JWT signature against the in-memory secret
3. Checks the `exp` claim
4. Validates `aud` and `iss`
5. Injects `AuthenticatedUser` into request extensions
6. Returns `401 Unauthorized` on any failure

There is no session cookie, no CSRF token, and no origin check — authentication is token-only.

## Secret Storage

API keys for AI providers are stored in the OS keychain via `KeyringSecretStore`. The keychain entry identifier is derived from the provider ID. Keys are retrieved at request time and passed to the AI worker process in memory; they are never written to the SQLite database or log files.

```rust
pub struct KeyringSecretStore {
    service_name: String,
}
// wraps the `keyring` crate, which delegates to:
//   macOS  → Keychain Services
//   Linux  → libsecret / KWallet
//   Windows → Windows Credential Manager
```

## Permission Broker

Tool calls follow a three-level permission model:

| Mode | Condition | Effect |
|---|---|---|
| `Deny` | Tool level exceeds persona ceiling | Rejected immediately, audit logged |
| `Ask` | Tool requires explicit approval | Suspended; user shown approval dialog |
| `Allow` | Tool within ceiling and auto-approved | Executed immediately |

The `PermissionCeiling` for a persona is one of:

- `ReadOnly` — only read-only tools permitted
- `ReadWrite` — file read/write tools permitted
- `ShellAccess` — Bash execution permitted
- `Admin` — all tools permitted

Ceiling comparison uses a numeric rank; subagents inherit the minimum of their parent's ceiling and their persona's ceiling. This ensures no subagent can escalate beyond what its parent was granted.

The `PermissionBroker` uses `tokio::sync::oneshot` channels to block the AI turn for up to 30 seconds while waiting for user input. If no decision arrives in 30 seconds, the tool call is treated as denied.

```rust
pub async fn wait_for(&self, request_id: &str) -> Result<PermissionResolution> {
    // Check if resolution was pre-queued (race condition handling)
    // Otherwise register oneshot sender and await with 30s timeout
}
```

All tool executions — approved, denied, or auto-executed — are written to the `tool_executions` audit table with input, output, permission decision, and duration.

## Remote Access Authentication

Remote devices (mobile, tablet) use a separate authentication flow with short-lived access tokens and rotating refresh tokens.

### Token Lifetimes

- Access token: **15 minutes** (`ACCESS_TOKEN_TTL_SECONDS = 900`)
- Refresh token: **30 days** (`REFRESH_TOKEN_TTL_SECONDS = 2592000`)

### Pairing Flow

Device pairing is PIN-based with a maximum of 3 failed attempts before the pairing token is revoked:

```
1. Desktop: POST /api/v1/remote/pair/intent
   → PairingIntentResponse {
       pairingToken, pin, pinCode, qrPayload,
       baseUrl, serverUrl, expiresAtUnixMs
     }
   pin = first 6 digits of SHA-256(pairingToken) mod 1_000_000
   qrPayload = "lunaria://pair?host=...&port=...&pin=...&token=...&tls=false"

2. Mobile device scans QR or enters PIN
   POST /api/v1/remote/pair/complete
   { "token": "<pairingToken>", "pin": "<6-digit>", "metadata": { ... } }
   → PairingCompleteResponse { accessToken, refreshToken, deviceId, scopes }

3. access_token (15min JWT) used for all API calls
   refresh_token (30-day JWT) used to rotate:
   POST /api/v1/remote/pair/refresh
   → new accessToken + new refreshToken (rotation)
```

### Refresh Token Rotation and Reuse Detection

Each device record stores a `refresh_token_hash` (SHA-256 of the current refresh token) and a `token_family_id`. On refresh:

1. Verify the presented refresh token's `family_id` matches the stored `token_family_id`
2. Verify `SHA-256(presented_token) == stored refresh_token_hash`
3. If the hash does **not** match → reuse detected → immediately revoke the device and return an error

This prevents refresh token theft: if an attacker uses a stolen token, the legitimate device's next refresh will be blocked and the attacker's token is simultaneously invalidated.

### Remote Device Scopes

Default scopes granted at pairing:

```
sessions:read     sessions:write
agents:read       agents:control
terminal:read     terminal:write
settings:read
admin:devices
```

Scopes can be narrowed before pairing completes via `POST /api/v1/remote/pair/intent/scopes`.

## Relay Encryption

When devices connect over the relay (not LAN), commands are end-to-end encrypted using X25519 ECDH + XChaCha20-Poly1305 AEAD:

```
Desktop:                      Mobile:
EphemeralSecret::random() → PublicKey
POST /relay/room → { roomId, serverPublicKey }

                              EphemeralSecret::random() → ClientPublicKey
                              POST /relay/{id}/join { clientPublicKey }
                              → server derives shared_key = ECDH(serverSecret, clientPublicKey)

                              Client derives: shared_key = ECDH(clientSecret, serverPublicKey)

POST /relay/{id}/send:        Mobile sends:
{ nonce, ciphertext }         XChaCha20Poly1305.encrypt(shared_key, plaintext)
→ decrypt_envelope            ← decrypt_envelope
```

Replay attacks are prevented by a `seen_request_ids` set per relay room. Each `request_id` is accepted exactly once.

## LAN Listener

The LAN listener binds to a user-specified address (default `0.0.0.0:0` — OS-assigned port). The bound port is advertised in the pairing QR code. No TLS is used on LAN — authentication relies on the JWT tokens and the physical security of the local network. TLS support is planned for a future release.

## Rate Limiting

The permission broker's 30-second timeout is the primary rate-limiting mechanism for tool approval spam. Provider API keys are rate-limited by the upstream providers. No additional application-level rate limiting is currently implemented for local connections.

## Audit Trail

All security-relevant events are persisted:

| Event | Table |
|---|---|
| Tool execution (any decision) | `tool_executions` |
| Pending approval created | `pending_approvals` |
| Device paired | `device_registry` |
| Device revoked | `device_registry` (revoked_at, status) |
| Refresh token reuse | `tracing::warn` log + device revocation |
| Hook invocations | SSE events (not persisted) |
