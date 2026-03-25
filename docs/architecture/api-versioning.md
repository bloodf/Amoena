# API Versioning

## Overview

Amoena exposes multiple API surfaces that require versioning: the Tauri IPC commands, the Axum HTTP API (for remote access), and the plugin API. This document defines versioning strategy for each.

## Tauri IPC Commands

Tauri commands are internal to the desktop app — both sides (Rust and webview) ship together. Versioning is implicit through the build:

- Commands are defined in Rust and invoked from TypeScript.
- Type safety is enforced by specta-generated bindings.
- Breaking changes are caught at compile time.
- No runtime version negotiation needed.

## HTTP API (Remote Access)

The Axum HTTP API is versioned in the URL path:

```
/api/v1/sessions
/api/v1/sessions/{id}/messages
/api/v1/sessions/{id}/approve
```

### Versioning Rules

- Breaking changes increment the version: `/api/v2/...`
- Additive changes (new fields, new endpoints) are non-breaking.
- Deprecated endpoints return `Sunset` header with removal date.
- At most 2 API versions are supported simultaneously.

### Compatibility Contract

The remote client (mobile app) and desktop may be on different versions:

| Desktop Version | Mobile Version | Behavior |
|----------------|---------------|----------|
| v1.5 | v1.5 | Full feature parity |
| v1.5 | v1.0 | Desktop serves v1 API; mobile works with reduced features |
| v1.0 | v1.5 | Mobile falls back to v1 API; warns about update |

The mobile app declares its minimum API version at connection time. The desktop responds with its supported versions.

## Plugin API

Plugins declare their target API version in the manifest:

```json
{
  "name": "my-plugin",
  "api_version": "1",
  "min_host_version": "1.0.0"
}
```

- Plugins targeting a newer API than the host are rejected at load time.
- Plugins targeting an older API run with a compatibility shim (if available) or are disabled with a warning.

## Semantic Versioning

The project follows SemVer for releases:
- **Major:** Breaking changes to any public API surface
- **Minor:** New features, additive API changes
- **Patch:** Bug fixes, performance improvements

## Type Evolution

When adding fields to IPC types:
1. Add the field as `Option<T>` in Rust (backward-compatible).
2. Regenerate TypeScript bindings.
3. Update consumers to handle the new field.
4. In a future major version, make the field required if appropriate.
