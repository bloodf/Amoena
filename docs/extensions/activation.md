# Activation Events

Extensions are not always active. They are activated on-demand based on **activation events** — conditions that trigger the extension to initialize its backend and register its contributions.

## Why Lazy Activation?

Activating every extension at startup would slow down Amoena and consume resources for extensions that may never be used in a given session. Instead, extensions declare the conditions under which they should activate, and Amoena activates them just-in-time.

## Declaring Activation Events

In the manifest, `activationEvents` is an array of event strings:

```json
{
  "activationEvents": [
    "onSession",
    "onCommand:com.example.my-extension.run"
  ]
}
```

An extension activates when **any** of its declared events fires. Once activated, it stays active for the remainder of the Amoena process lifetime (activations are not reversed).

## Supported Activation Events

### `onSession`

Fires when any session starts. This is the most common activation trigger.

```json
"activationEvents": ["onSession"]
```

Use `onSession` when your extension:
- Contributes panels that need to be available as soon as the user starts working
- Registers hook handlers that must be in place before tool use
- Provides tools or providers that the AI should have access to immediately

### `onCommand:<commandId>`

Fires when a specific command contributed by this extension is invoked for the first time.

```json
"activationEvents": ["onCommand:com.example.my-extension.open-panel"]
```

Use command-based activation when your extension:
- Has a heavy backend that should only start when explicitly requested
- Contributes a command that is the primary entry point

The command itself is still registered and visible in the command palette before activation. When the user invokes it, activation fires first, then the command executes.

### `onCommand:*` (Wildcard)

The `*` suffix matches any event that starts with the prefix before it:

```json
"activationEvents": ["onCommand:com.example.my-extension.*"]
```

This activates when any command with the prefix `com.example.my-extension.` is invoked. Useful when an extension contributes multiple commands and any of them should trigger activation.

The wildcard logic is: if the activation event ends with `*`, strip the `*` and check whether the fired event starts with the remaining prefix.

Examples:
| Activation event | Fired event | Match? |
|---|---|---|
| `"onCommand:*"` | `"onCommand:com.example.ext.run"` | Yes |
| `"onCommand:com.example.*"` | `"onCommand:com.example.ext.run"` | Yes |
| `"onCommand:com.example.*"` | `"onCommand:io.other.cmd"` | No |
| `"onSession"` | `"onSession"` | Yes (exact match) |

## How Activation Works

When Amoena fires an activation event (e.g. a session starts), it calls `fire_activation_event("onSession")`:

1. All loaded extensions are iterated
2. For each **enabled** extension, its `activationEvents` are checked against the event
3. Extensions that match are returned as a list of activated extension IDs
4. The application initializes those extensions (starts backend processes if declared, registers their contributions into the aggregated set)

Extensions that are **disabled** are never checked for activation events — even if the event matches, disabled extensions remain inactive.

## Activation vs. Always-Loaded

Some extension contributions are available without activation:

- **Commands** — Registered in the command palette from manifest data alone (no backend needed)
- **Menu items** — Rendered from manifest data
- **Panel metadata** — Listed in the sidebar

The backend process (`backend.entry`) only starts at activation time. Hook handlers, tool implementations, and provider handlers all require the backend to be running.

This means a user can see your extension's commands in the palette before activating it. The first invocation triggers activation.

## Contribution Loading

All contributions from **enabled** extensions are aggregated at startup into `AggregatedContributions`, regardless of activation state. This enables commands and menus to appear immediately. The distinction is:

- **Manifest contributions** (commands, menus, panels, settings) — Available from load time
- **Backend-dependent behavior** (hook handling, tool execution, provider routing) — Available after activation

## Debugging Activation

To verify your extension activated, check the Amoena developer logs (Help → Developer Logs). Look for entries like:

```
INFO  extensions::manager  extension activated  id="com.example.my-extension"  event="onSession"
```

If your extension never activates:
1. Confirm the extension is **enabled** in Settings → Extensions
2. Confirm `activationEvents` in the manifest matches the expected event exactly (case-sensitive)
3. Confirm the `.luna` file was loaded without errors (look for `WARN` entries with your extension ID)

## Example: Lazy Tool Extension

An extension that contributes a custom AI tool but should only activate when the tool is first used:

```json
{
  "id": "com.example.lazy-tool",
  "name": "Lazy Tool",
  "version": "1.0.0",
  "description": "A tool that activates on first use",
  "permissions": ["network"],
  "activationEvents": ["onSession"],
  "contributes": {
    "tools": [
      {
        "name": "fetch_price",
        "description": "Fetch the current price of a cryptocurrency",
        "handler": "handleFetchPrice",
        "inputSchema": {
          "type": "object",
          "properties": {
            "symbol": { "type": "string" }
          },
          "required": ["symbol"]
        }
      }
    ]
  },
  "backend": {
    "type": "bun",
    "entry": "main.js"
  }
}
```

Using `onSession` here ensures the tool is registered in the AI's tool list as soon as a session starts, so the AI can discover and call it without waiting for explicit user activation.
