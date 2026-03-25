# UI Extensions

Extensions can contribute custom UI through panels, menu items, commands, and settings sections.

## Panels

Panels are custom UI views loaded in a sandboxed JavaScript context. Each panel has access to the `amoena` API bridge.

### Panel Manifest

```json
{
  "contributes": {
    "panels": [
      {
        "id": "my.panel",
        "title": "My Custom Panel",
        "html": "panel.html",
        "css": "panel.css",
        "scripts": ["panel.js"],
        "icon": "icon.png",
        "default": false
      }
    ]
  }
}
```

### Panel Structure

Assets are embedded in the `.luna` file:

```
my-extension.luna
├── manifest.json
├── panel.html
├── panel.css
├── panel.js
└── icon.png
```

### panel.html

```html
<div id="app">
  <h2>My Extension</h2>
  <button id="btn">Click me</button>
  <div id="output"></div>
</div>
```

### panel.js

```javascript
// Access the amoena bridge API
const api = window.amoena;

document.getElementById('btn').addEventListener('click', async () => {
  // Get current session info
  const session = await api.sessions.getCurrent();
  const output = document.getElementById('output');
  output.textContent = `Session: ${session.id}`;
});

// Listen to events
api.events.subscribe('SessionStart', (payload) => {
  console.log('Session started:', payload);
});
```

### panel.css

```css
#app {
  padding: 16px;
  font-family: var(--font-base);
  color: var(--text-primary);
}

#btn {
  background: var(--button-bg);
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}
```

## Amoena API Bridge

Panels have access to read-only operations via the `amoena.*` API:

```javascript
// Sessions
await amoena.sessions.getCurrent()
await amoena.sessions.list()
await amoena.sessions.getMessages(sessionId)

// Memory
await amoena.memory.search(query)
await amoena.memory.observe({ title, narrative })

// Events
amoena.events.subscribe(eventName, callback)
amoena.events.unsubscribe(eventName)

// Settings
await amoena.settings.get(key)
await amoena.settings.set(key, value)

// Notifications
amoena.notify({ title, message, level })
```

## Commands

Commands are callable actions registered by the extension.

### Manifest

```json
{
  "contributes": {
    "commands": [
      {
        "id": "my.command.format",
        "title": "Format Code",
        "category": "My Extension",
        "icon": "icon.png",
        "keybinding": "ctrl+shift+f"
      }
    ]
  }
}
```

### Handler

Specify a handler via the manifest's top-level `backend` or in a hook:

```json
{
  "backend": {
    "type": "bun",
    "entrypoint": "handler.ts"
  }
}
```

> **Planned**: WASM sandbox support is planned for a future release. Currently, extensions use the JavaScript (Bun) backend.
```

Or register dynamically via hook on `SessionStart`:

```json
{
  "contributes": {
    "hooks": [
      {
        "event": "SessionStart",
        "handler": {
          "type": "http",
          "config": {
            "url": "https://my-service.com/command/format"
          }
        }
      }
    ]
  }
}
```

## Menus

Menus are collections of commands accessible from the UI.

### Manifest

```json
{
  "contributes": {
    "menus": [
      {
        "id": "context.session",
        "label": "Session Actions",
        "items": [
          {
            "command": "my.command.format",
            "label": "Format Session Output"
          }
        ]
      }
    ]
  }
}
```

Menu IDs:
- `context.session` — Right-click on a session
- `context.message` — Right-click on a message
- `context.file` — Right-click on a file in the browser
- `toolbar.session` — Session toolbar
- `sidebar.main` — Main sidebar

## Settings

Extensions can contribute settings sections to the Settings UI.

### Manifest

```json
{
  "contributes": {
    "settings": [
      {
        "id": "my.setting.enabled",
        "title": "Enable My Feature",
        "type": "boolean",
        "default": true,
        "description": "Turn on my awesome feature"
      },
      {
        "id": "my.setting.endpoint",
        "title": "Service Endpoint",
        "type": "string",
        "default": "https://api.example.com",
        "description": "HTTP endpoint for the service"
      }
    ]
  }
}
```

Setting types: `boolean`, `string`, `number`, `select`, `textarea`

## Security Model

### Sandboxing

- Panels run in an iframe with limited scope
- `amoena.*` API is the only bridge to the host
- DOM access is restricted to the panel's container
- Network requests must be explicit and logged

### Permissions

- Panels inherit the extension's declared permissions
- Settings UI is read/write only for extension settings
- File access requires `fs.read` or `fs.write` permissions
- Session data access requires `sessions.read` permission

### Best Practices

- **Use the amoena API** — Don't try to bypass it
- **Respect permissions** — Only access what you declared
- **Keep panels lightweight** — Load async resources only when needed
- **Log errors** — Use console.error for debugging
- **Validate input** — Never trust user or API data
- **Cache appropriately** — Store in `localStorage` for settings, use API otherwise
