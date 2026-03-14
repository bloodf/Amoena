# Remote Access

Lunaria's remote access system allows mobile and tablet devices to connect to the desktop runtime over LAN or an encrypted relay. It handles device pairing, JWT-based authentication with token rotation, and end-to-end encrypted relay communication.

## Architecture

```
Desktop Runtime (RemoteAccessService)
├── LAN Listener        — Axum server on a user-selected port
├── Pairing Registry    — In-memory PIN/token store (TTL-based)
├── Device Registry     — SQLite device_registry table
├── Relay Rooms         — In-memory E2E encrypted channels
└── JWT Authority       — Per-boot HS256 signing key
```

Remote clients interact with the exact same Axum router as the local frontend — the LAN listener shares the main router. Authentication is enforced via JWT on every request.

## LAN Listener

Before any pairing can happen, the LAN listener must be enabled. This starts a secondary Axum HTTP server on a network-accessible address:

```http
POST /api/v1/remote/lan/enable
{
  "bindAddress": "0.0.0.0",
  "port": 47821
}
```

Omitting `port` lets the OS pick a random available port. The response includes the advertised base URL, which is used in the pairing QR code:

```json
{
  "enabled": true,
  "bindAddress": "0.0.0.0",
  "baseUrl": "http://192.168.1.5:47821",
  "lanBaseUrl": "http://192.168.1.5:47821",
  "relayEndpoint": "wss://relay.lunaria.dev",
  "pairingPinTtlSeconds": 300
}
```

The advertised IP is detected automatically by opening a UDP socket toward `8.8.8.8:80` and reading the local address — this gives the outbound LAN IP without making any actual network request.

```http
POST /api/v1/remote/lan/disable
GET  /api/v1/remote/lan/status
```

## Device Pairing Flow

```
Desktop                                   Mobile
────────────────────────────────────────────────
POST /remote/pair/intent
← { pairingToken, pin, qrPayload, ... }

Display QR code or PIN to user
                                          Scan QR / enter PIN

                                          POST /remote/pair/complete
                                          { token, pin, metadata }
                                          ← { accessToken, refreshToken, deviceId, scopes }

Store tokens                              ←────────────────────────────

Subsequent requests:
Authorization: Bearer <accessToken>
```

### Step 1: Create Pairing Intent

```http
POST /api/v1/remote/pair/intent
{
  "advertisedHost": "192.168.1.5"
}
```

`advertisedHost` is optional. If provided it overrides the auto-detected LAN IP in the QR payload (useful when the machine has multiple network interfaces).

Response:

```json
{
  "pairingToken": "550e8400-e29b-41d4-a716-446655440000",
  "pin": "742851",
  "pinCode": "742851",
  "qrPayload": "lunaria://pair?host=192.168.1.5&port=47821&pin=742851&token=550e8400-...&tls=false",
  "baseUrl": "http://192.168.1.5:47821",
  "serverUrl": "http://192.168.1.5:47821",
  "expiresAtUnixMs": 1710000300000
}
```

The 6-digit PIN is derived deterministically from the pairing token:

```rust
fn generate_pin(seed: &str) -> String {
    let digest = Sha256::digest(seed.as_bytes());
    let value = u32::from_be_bytes([digest[0], digest[1], digest[2], digest[3]]) % 1_000_000;
    format!("{value:06}")
}
```

The pairing token expires after `pairingPinTtlSeconds` (default 300 seconds). After 3 failed PIN attempts the token is invalidated.

### Customizing Scopes Before Pairing

Before the mobile device completes pairing, the desktop can restrict the scopes it will grant:

```http
POST /api/v1/remote/pair/intent/scopes
{
  "pairingToken": "550e8400-...",
  "scopes": ["sessions:read", "terminal:read", "terminal:write"]
}
```

Default scopes granted at pairing:

```
sessions:read     sessions:write
agents:read       agents:control
terminal:read     terminal:write
settings:read
admin:devices
```

### Step 2: Complete Pairing (from mobile)

```http
POST /api/v1/remote/pair/complete
{
  "token": "550e8400-...",
  "pin": "742851",
  "metadata": {
    "name": "iPhone 15 Pro",
    "type": "mobile",
    "platform": "ios",
    "metadata": {}
  }
}
```

Device types: `desktop`, `mobile`, `tablet`, `unknown`

Response:

```json
{
  "tokenType": "Bearer",
  "accessToken": "<15-min JWT>",
  "refreshToken": "<30-day JWT>",
  "deviceId": "device-uuid",
  "scopes": ["sessions:read", "sessions:write", ...],
  "baseUrl": "http://192.168.1.5:47821",
  "serverUrl": "http://192.168.1.5:47821"
}
```

The `DeviceRecord` is persisted to `device_registry` with a SHA-256 hash of the refresh token (never the raw token) and a `token_family_id` for rotation tracking.

## Token Refresh and Rotation

Access tokens expire after 15 minutes. Mobile devices must rotate them using the refresh token:

```http
POST /api/v1/remote/pair/refresh
Authorization: Bearer <refreshToken>
```

Response:

```json
{
  "tokenType": "Bearer",
  "accessToken": "<new 15-min JWT>",
  "refreshToken": "<new 30-day JWT>",
  "deviceId": "...",
  "scopes": [...],
  "baseUrl": "...",
  "serverUrl": "..."
}
```

Each refresh issues a completely new refresh token (rotation). The old refresh token is invalidated by updating `refresh_token_hash` on the device record.

### Refresh Token Reuse Detection

If a stolen refresh token is used after the legitimate device has already rotated:

1. The hash of the presented token does not match `device.refresh_token_hash`
2. The device is immediately revoked (`status = 'revoked'`, `revoked_at` set)
3. A warning is emitted: `remote_refresh_reuse_detected`
4. The attacker's token is invalidated along with the victim's

This follows the OAuth 2.0 refresh token rotation security model.

## Device Management

```http
GET    /api/v1/remote/devices          — list all paired devices
GET    /api/v1/remote/devices/{id}     — get specific device
DELETE /api/v1/remote/devices/{id}     — revoke device
```

Device record:

```json
{
  "deviceId": "device-uuid",
  "name": "iPhone 15 Pro",
  "deviceType": "mobile",
  "platform": "ios",
  "pairedAt": "2026-03-14T10:00:00Z",
  "lastSeen": "2026-03-14T10:30:00Z",
  "tokenFamilyId": "family-uuid",
  "scopes": ["sessions:read", "sessions:write", ...],
  "status": "active",
  "metadata": {},
  "revokedAt": null
}
```

## Relay Protocol

When LAN is unavailable (different network, VPN), the relay bridges the connection with end-to-end encryption using X25519 ECDH key exchange and XChaCha20-Poly1305 AEAD encryption.

### Creating a Relay Room (Desktop)

```http
POST /api/v1/remote/relay/room
```

```json
{
  "roomId": "room-uuid",
  "relayEndpoint": "wss://relay.lunaria.dev",
  "serverPublicKey": "<base64 X25519 public key>"
}
```

The desktop generates an ephemeral X25519 keypair. The public key is shared with the mobile client (via QR or push notification).

### Joining a Relay Room (Mobile)

```http
POST /api/v1/remote/relay/{roomId}/join
{
  "clientPublicKey": "<base64 X25519 public key>"
}
```

The server performs ECDH: `shared_key = ECDH(server_secret, client_public_key)`. The mobile performs: `shared_key = ECDH(client_secret, server_public_key)`. Both sides now have the same 32-byte shared key without it ever being transmitted.

### Sending Encrypted Commands

```http
POST /api/v1/remote/relay/{roomId}/send
{
  "requestId": "req-uuid",
  "nonce": "<base64 XChaCha20 nonce>",
  "ciphertext": "<base64 XChaCha20-Poly1305 ciphertext>"
}
```

Replay protection: each `requestId` is accepted exactly once per room (`seen_request_ids` set).

### Reading Relay Events

```http
GET /api/v1/remote/relay/{roomId}/events?lastEventId=0
```

```json
[
  {
    "eventId": 1,
    "requestId": "req-uuid",
    "nonce": "<base64>",
    "ciphertext": "<base64>"
  }
]
```

Poll this endpoint to receive responses from the desktop. The `lastEventId` parameter implements efficient incremental polling.

## Remote Tool Permission Resolution

When the AI requests a tool that requires permission and the desktop user is not present, the mobile client can resolve the approval:

```http
PATCH /api/v1/tools/approvals/{requestId}
Authorization: Bearer <mobileAccessToken>
{
  "decision": "approved",
  "reason": "Reviewed the command, looks safe"
}
```

This works over both LAN and relay. The `PermissionBroker` on the desktop receives the resolution and unblocks the suspended AI turn regardless of which client resolved it.

## Remote Terminal Sessions

Paired mobile devices can create and interact with PTY terminal sessions:

```http
POST /api/v1/terminal/create
Authorization: Bearer <mobileAccessToken>
{
  "shell": "/bin/zsh",
  "cwd": "/Users/dev/myproject",
  "cols": 80,
  "rows": 24
}
```

The `terminal:read` and `terminal:write` scopes control access. See [Terminal](terminal.md) for the full API.
