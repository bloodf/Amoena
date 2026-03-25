# Amoena Mobile Companion

React Native (Expo) companion app for remote-controlling Amoena desktop sessions from iOS and Android devices.

## Prerequisites

- Node.js 20+
- [Bun](https://bun.sh)
- Expo CLI (`npx expo`)
- For iOS: Xcode with iOS Simulator
- For Android: Android Studio with an Android Emulator

## Setup

From the monorepo root:

```sh
bun install
```

## Development

```sh
bun run --cwd apps/mobile start
```

Once the dev server is running, press `i` to open the iOS Simulator or `a` to open the Android Emulator.

You can also target a platform directly:

```sh
bun run --cwd apps/mobile ios
bun run --cwd apps/mobile android
```

## Testing

```sh
bun run --cwd apps/mobile test
```

## Type Checking

```sh
bun run --cwd apps/mobile type-check
```

## Architecture

### Navigation

Tab-based navigation using [Expo Router](https://expo.github.io/router/) with three primary tabs: Sessions, Permissions, and More.

### Screens

The app includes 12 screens:

| Screen | Description |
|---|---|
| Home | Session list and quick actions |
| Session | Active session view with real-time output |
| Tasks | Task queue for the current session |
| Queue | Pending operations manager |
| Memory | Session memory and context viewer |
| Terminal | Embedded terminal output |
| Agents | Agent status and configuration |
| Workspaces | Workspace switcher |
| Extensions | Installed .luna extension management |
| Settings | App and connection settings |
| Device | Device registration and pairing |
| Permissions | Runtime permission management |

### Real-time Updates

Runtime hooks connect to Amoena desktop sessions via Server-Sent Events (SSE) through `@lunaria/runtime-client`, enabling live task updates, terminal streaming, and session state changes without polling.

### Design System

UI primitives and design tokens are sourced from `@lunaria/tokens`, ensuring visual consistency with the desktop app.

### Internationalisation

Full i18n support via `@lunaria/i18n`, covering: English (`en`), German (`de`), Spanish (`es`), French (`fr`), and Brazilian Portuguese (`pt-BR`).

---

[Back to monorepo root](../../README.md)
