# Getting Started with Extensions

This guide walks through creating a Lunaria extension from scratch: writing the manifest, adding a panel, packaging as `.luna`, and installing it.

## Prerequisites

- [Bun](https://bun.sh) installed (for backend entry points and the packaging tool)
- Lunaria desktop app installed
- Basic familiarity with JSON and HTML

## Step 1: Create the Project Directory

```bash
mkdir my-extension
cd my-extension
```

Your extension project will contain the manifest and any assets you want to bundle:

```
my-extension/
  manifest.json     # Required — describes the extension
  panel.html        # Optional — UI panel
  main.js           # Optional — backend logic (Bun)
  icon.png          # Optional — extension icon
```

## Step 2: Write the Manifest

Create `manifest.json`:

```json
{
  "id": "com.example.my-extension",
  "name": "My Extension",
  "version": "1.0.0",
  "publisher": "Your Name",
  "description": "My first Lunaria extension",
  "icon": "icon.png",
  "permissions": ["sessions.read"],
  "activationEvents": ["onSession"],
  "contributes": {
    "commands": [
      {
        "id": "com.example.my-extension.open",
        "title": "My Extension: Open Panel"
      }
    ],
    "menus": {
      "sidebar": [
        {
          "panel": "com.example.my-extension.panel",
          "title": "My Extension",
          "icon": "icon.png"
        }
      ]
    },
    "panels": [
      {
        "id": "com.example.my-extension.panel",
        "title": "My Extension",
        "entry": "panel.html"
      }
    ]
  }
}
```

**Key fields:**
- `id` — Reverse-DNS style identifier, must be globally unique
- `activationEvents` — `"onSession"` means this extension activates whenever a session starts
- `contributes.panels[].entry` — References an asset file by name (not a filesystem path)

## Step 3: Create the Panel HTML

Create `panel.html`. Panels are full HTML documents rendered in a sandboxed webview:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Extension</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 16px;
      margin: 0;
      color: var(--color-foreground, #1a1a1a);
      background: var(--color-background, #ffffff);
    }
    h2 {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 12px;
    }
    .status {
      font-size: 12px;
      color: var(--color-muted, #666);
    }
  </style>
</head>
<body>
  <h2>My Extension</h2>
  <p class="status">Extension panel is active.</p>

  <script>
    // Panels receive messages from the host via window.addEventListener('message')
    window.addEventListener('message', (event) => {
      if (event.data.type === 'session-update') {
        document.querySelector('.status').textContent =
          'Session: ' + event.data.sessionId;
      }
    });
  </script>
</body>
</html>
```

## Step 4: (Optional) Add a Backend Entry Point

If your extension needs to run backend logic (process data, call APIs, handle commands), add a `main.js`:

```json
{
  "backend": {
    "type": "bun",
    "entry": "main.js"
  }
}
```

Create `main.js`:

```js
// Lunaria calls your backend via JSON-RPC on stdin/stdout
process.stdin.setEncoding('utf8');

let buffer = '';
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop(); // keep incomplete line

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const request = JSON.parse(line);
      handleRequest(request);
    } catch (e) {
      // ignore parse errors
    }
  }
});

function handleRequest(request) {
  const { id, method, params } = request;

  let result = null;
  if (method === 'plugin.execute') {
    result = { ok: true, message: 'Hello from backend' };
  }

  const response = JSON.stringify({ jsonrpc: '2.0', id, result });
  process.stdout.write(response + '\n');
}
```

## Step 5: Package as .luna

Use the `lunaria-pack` CLI to bundle your project into a `.luna` file:

```bash
# Install the packaging tool (once)
bun install -g @lunaria/pack

# Package from the project directory
lunaria-pack manifest.json --out my-extension.luna

# Or specify assets explicitly
lunaria-pack manifest.json \
  --asset panel.html \
  --asset main.js \
  --asset icon.png \
  --out my-extension.luna
```

The tool reads your manifest, embeds all referenced assets, and writes the binary bundle.

**Verify the bundle:**
```bash
lunaria-pack inspect my-extension.luna
```

Output:
```
.luna bundle: my-extension.luna
  ID:          com.example.my-extension
  Name:        My Extension
  Version:     1.0.0
  Format:      v1
  Assets (3):
    panel.html   (4.2 KB)
    main.js      (1.1 KB)
    icon.png     (2.8 KB)
```

## Step 6: Install in Lunaria

**Option A — Drag and drop:**
Drag `my-extension.luna` onto the Lunaria window. A confirmation dialog appears, then the extension installs and activates.

**Option B — Settings panel:**
Go to Settings → Extensions → Install Extension, then browse to your `.luna` file.

**Option C — Deeplink:**
```
lunaria://extension/install?source=file:///path/to/my-extension.luna
```

Or from a URL (useful for distribution):
```
lunaria://extension/install?source=https://example.com/my-extension.luna
```

## Verification

After installing, verify the extension is active:

1. Open the sidebar — "My Extension" panel should appear
2. Open the command palette (`Cmd+K`) and search "My Extension" — the command should be listed
3. Check Settings → Extensions — the extension should show as enabled

## Iterating

To update your extension:
1. Edit your source files
2. Re-run `lunaria-pack`
3. Reinstall — Lunaria replaces the existing extension with the same `id`

## Next Steps

- [Manifest Reference](./manifest.md) — All manifest fields and their types
- [Contributions](./contributions.md) — Commands, panels, hooks, tools, providers
- [Examples](./examples.md) — Full working examples for common use cases
