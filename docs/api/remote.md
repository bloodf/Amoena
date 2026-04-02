# Remote Access API

Remote access allows a paired mobile or desktop device to connect to a running Amoena instance over LAN or relay. Today, the shipped mobile flow is desktop initiated and mobile completed: the desktop creates a pairing intent, then the mobile app enters the base URL, pairing token, and PIN to complete pairing. QR payload support exists in the API, but the current mobile UI still uses manual entry.

Remote endpoints are available on both the loopback router (for local clients) and the LAN router (for remote devices over the network).

---

## Authentication Note

The following endpoints do **not** require a Bearer token — they are used during the pairing handshake before an auth token exists:

- `POST /api/v1/remote/pairing/intents`
- `POST /api/v1/remote/pair/complete`
- `POST /api/v1/remote/auth/refresh`

---

## Pairing Flow

Current release flow:

1. Desktop enables remote access and creates a pairing intent.
2. Desktop shows the `baseUrl`, `pairingToken`, and `pin`.
3. Mobile app enters those values and calls `POST /api/v1/remote/pair/complete`.
4. Mobile stores the returned access and refresh tokens, then uses them for session reads, permission approvals, and message sends.

The mobile runtime subscribes to global events when available and falls back to polling for session and permission updates.

---

## Create Pairing Intent

Initiates a pairing flow from the trusted desktop instance. Returns a PIN, QR payload, and pairing token that the remote device needs to complete pairing.

```
POST /api/v1/remote/pairing/intents
Content-Type: application/json
```

**Request body**

```json
{
  "advertisedHost": "192.168.1.42",
  "scopes": ["sessions.read", "messages.write"]
}
```

| Field            | Type       | Required | Description                                  |
| ---------------- | ---------- | -------- | -------------------------------------------- |
| `advertisedHost` | `string`   | No       | IP address to advertise to pairing devices   |
| `scopes`         | `string[]` | No       | Permission scopes to grant the remote device |

**Response `200`**

```json
{
  "pairingToken": "pair_tok_abc123",
  "pin": "4829",
  "pinCode": "4829",
  "qrPayload": "amoena://pair?token=pair_tok_abc123&pin=4829&host=192.168.1.42:52341",
  "baseUrl": "http://192.168.1.42:52341",
  "serverUrl": "http://192.168.1.42:52341",
  "expiresAtUnixMs": 1705316400000
}
```

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/remote/pairing/intents \
  -H "Content-Type: application/json" \
  -d '{"scopes": ["sessions.read", "messages.write"]}'
```

**TypeScript**

```typescript
const intent = await client.createPairingIntent(['sessions.read', 'messages.write']);
// Show intent.qrPayload as a QR code for the mobile device to scan
```

---

## Complete Pairing

Called by the remote device after scanning the QR code or, in the current mobile app, manually entering the base URL, pairing token, and PIN. Returns an access token and refresh token for the remote device.

```
POST /api/v1/remote/pair/complete
Content-Type: application/json
```

**Request body**

```json
{
  "pairingToken": "pair_tok_abc123",
  "pin": "4829",
  "deviceName": "iPhone 15 Pro",
  "deviceType": "mobile",
  "platform": "ios",
  "metadata": {}
}
```

| Field          | Type     | Required | Description                                             |
| -------------- | -------- | -------- | ------------------------------------------------------- |
| `pairingToken` | `string` | Yes      | Token from the pairing intent                           |
| `pin`          | `string` | Yes      | PIN displayed on the desktop (also `pinCode` alias)     |
| `deviceName`   | `string` | No       | Human-readable device name                              |
| `deviceType`   | `string` | No       | `"mobile"`, `"desktop"`, `"tablet"`                     |
| `platform`     | `string` | No       | `"ios"`, `"android"`, `"macos"`, `"windows"`, `"linux"` |
| `metadata`     | `object` | No       | Arbitrary device metadata                               |

**Response `200`**

```json
{
  "tokenType": "Bearer",
  "accessToken": "lnr-remote-...",
  "refreshToken": "lnr-refresh-...",
  "deviceId": "dev_abc123",
  "scopes": ["sessions.read", "messages.write"],
  "baseUrl": "http://192.168.1.42:52341",
  "serverUrl": "http://192.168.1.42:52341"
}
```

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/remote/pair/complete \
  -H "Content-Type: application/json" \
  -d '{
    "pairingToken": "pair_tok_abc123",
    "pin": "4829",
    "deviceName": "My Phone",
    "deviceType": "mobile",
    "platform": "ios"
  }'
```

**TypeScript**

```typescript
const session = await client.completePairing({
  pairingToken: intent.pairingToken,
  pin: '4829',
  deviceName: 'My Phone',
  deviceType: 'mobile',
  platform: 'ios',
});
// Store session.accessToken and session.refreshToken for future API calls
```

---

## Refresh Auth Token

Refreshes an expired remote access token using the refresh token.

```
POST /api/v1/remote/auth/refresh
Content-Type: application/json
```

**Request body**

```json
{
  "refreshToken": "lnr-refresh-..."
}
```

**Response `200`** — New `RemotePairingSession` with a fresh `accessToken`

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/remote/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "lnr-refresh-..."}'
```

**TypeScript**

```typescript
const newSession = await client.refreshRemoteAuth(refreshToken);
```

---

## Get Device Info (Self)

Returns information about the currently authenticated remote device.

```
GET /api/v1/remote/devices/me
Authorization: Bearer <token>
```

**Response `200`**

```json
{
  "deviceId": "dev_abc123",
  "deviceType": "mobile",
  "platform": "ios",
  "scopes": ["sessions.read", "messages.write"],
  "pairedAt": "2025-01-15T09:00:00Z",
  "lastSeen": "2025-01-15T10:30:00Z"
}
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/remote/devices/me \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
const me = await client.remoteDeviceMe();
```

---

## List Devices

Returns all paired remote devices.

```
GET /api/v1/remote/devices
Authorization: Bearer <token>
```

**Response `200`** — Array of device records with same shape as `GET /remote/devices/me`

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/remote/devices \
  -H "Authorization: Bearer $TOKEN"
```

---

## Revoke Device

Revokes a paired device's access. The device's tokens are invalidated immediately.

```
POST /api/v1/remote/devices/{deviceId}/revoke
Authorization: Bearer <token>
```

**Response `204`** — No content

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/remote/devices/dev_abc123/revoke \
  -H "Authorization: Bearer $TOKEN"
```

---

## Resolve Remote Permission

When a remote session triggers a tool permission request, the local desktop resolves it via this endpoint.

```
POST /api/v1/remote/sessions/{sessionId}/permissions
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "requestId": "req_abc123",
  "decision": "approve",
  "reason": "User confirmed action"
}
```

**Response `204`** — No content

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/remote/sessions/sess_abc123/permissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestId": "req_abc123", "decision": "approve"}'
```

**TypeScript**

```typescript
await client.resolveRemotePermission(sessionId, {
  requestId: 'req_abc123',
  decision: 'approve',
});
```

---

## Remote Status

Returns the current remote access configuration and paired device count. Use this to confirm whether LAN access is enabled and which base URL should be advertised to mobile clients.

```
GET /api/v1/remote/status
Authorization: Bearer <token>
```

**Response `200`**

```json
{
  "enabled": true,
  "lanEnabled": true,
  "lanBaseUrl": "http://192.168.1.42:8080",
  "bindAddress": "0.0.0.0:8080",
  "relayEndpoint": "wss://relay.amoena.app",
  "pairedDeviceCount": 2
}
```

---

## LAN Access

Control LAN listener separately:

| Endpoint                          | Description                       |
| --------------------------------- | --------------------------------- |
| `GET /api/v1/remote/lan`          | Get LAN listener status           |
| `POST /api/v1/remote/lan`         | Set LAN listener enabled/disabled |
| `POST /api/v1/remote/lan/enable`  | Enable LAN listener               |
| `POST /api/v1/remote/lan/disable` | Disable LAN listener              |
