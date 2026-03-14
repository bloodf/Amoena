# Mobile Remote Access

> **V2.0 Feature:** Mobile remote access ships with V2.0 after core agent orchestration (V1.5) is production-ready.

The mobile app is a paired remote client for the desktop runtime. It is a true native application built with React Native — not a web wrapper. Desktop is the trust anchor; mobile is a remote control surface.

## Architecture Overview

The desktop runtime owns all agent execution, tool invocation, and secret storage. The mobile app connects to it over a secure channel and renders a native UI for monitoring and interaction. No agent logic runs on the device.

```
┌─────────────────────────┐        ┌──────────────────────────┐
│   Desktop Runtime        │◄──────►│   Mobile App (RN)         │
│   (trust anchor)         │  E2E   │   packages/ui-native      │
│   agent execution        │  enc.  │   paired remote client    │
│   tool invocation        │        │   native UI only          │
│   secret storage         │        └──────────────────────────┘
└─────────────────────────┘
```

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| UI framework | React Native | True native components, not a web wrapper |
| Styling | NativeWind | Tailwind-compatible utility classes for React Native |
| Component library | react-native-reusables | shadcn-equivalent primitives for React Native |
| Design tokens | `packages/tokens` | Shared with `packages/ui` (desktop) |
| Navigation | React Navigation | Native stack and tab navigation |
| Native features | React Native modules | Camera (QR), biometrics, push notifications |
| Connection | LAN + E2E encrypted relay | Same protocol as desktop-to-desktop |

## What Is Shared vs. Separate

### Shared across desktop and mobile

| Artifact | Package | Description |
|----------|---------|-------------|
| Design tokens | `packages/tokens` | Colors, spacing, typography scale, radius |
| TypeScript types | `packages/core` | Session, agent, message, tool-call types |
| API contracts | `packages/core` | REST + SSE endpoint shapes, JWT payload types |
| Business logic | `packages/core` | Validation, serialization, error codes |

### Separate per platform

| Concern | Desktop (`packages/ui`) | Mobile (`packages/ui-native`) |
|---------|------------------------|-------------------------------|
| Components | React + Radix UI + shadcn/ui | React Native + react-native-reusables |
| Styling | Tailwind CSS | NativeWind |
| Navigation | React Router / app shell | React Navigation |
| Native access | Electron APIs | React Native modules |
| Build output | Electron app | iOS / Android binary |

`packages/ui-native` mirrors the file structure and component naming conventions of `packages/ui` but contains no web dependencies. Components consume tokens from `packages/tokens` via NativeWind theme configuration.

## Connection Modes

- **LAN:** opt-in listener on the desktop; mobile connects directly when on the same network
- **Relay:** E2E encrypted relay for connections across networks; desktop and mobile each hold one end of a keypair; the relay server sees only ciphertext

## Pairing Flow

1. Open **Remote Access** in desktop settings — desktop generates a one-time QR payload (public key + relay address + PIN salt)
2. Tap **Pair Device** in the mobile app — React Native camera module opens the native camera to scan the QR code
3. Mobile derives a shared secret from the PIN + QR payload using ECDH
4. Desktop confirms the PIN and issues a device-scoped JWT stored in the device's secure enclave (iOS Keychain / Android Keystore)
5. All subsequent connections are authenticated with that JWT; re-pairing is required if it is revoked

Biometric unlock (Face ID / fingerprint) gates access to the stored JWT using the React Native biometrics module.

## Mobile-Specific Screens

| Screen | Description |
|--------|-------------|
| Pair Device | Camera viewfinder + PIN entry for initial pairing |
| Session List | Live list of desktop sessions with status badges |
| Session View | Message thread, SSE updates, send-message composer |
| Permission Request | Native modal for approving tool-execution permission prompts |
| Agent Summary | Current active subagent and task progress |
| Settings | Manage paired devices, notification preferences, unlock method |

Push notifications (via React Native push notification module) alert the user to permission requests and session completions even when the app is backgrounded.

## What Mobile Can Do

- List and open sessions
- Receive real-time SSE updates from the desktop runtime
- Send messages into a session
- Resolve permission requests
- View the current active subagent summary
- Receive push notifications for blocking events

## What Mobile Does Not Do

- It does not store provider secrets
- It does not execute tools locally
- It does not replace desktop as the source of truth
- It does not share UI component code with the desktop (separate packages by design)
