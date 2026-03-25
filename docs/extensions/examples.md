# Extension Examples

Complete working examples covering the most common extension patterns.

---

## 1. Hello World Command Extension

The simplest possible extension: one command that shows a notification.

**Project structure:**
```
hello-world/
  manifest.json
  main.js
```

**manifest.json:**
```json
{
  "id": "com.example.hello-world",
  "name": "Hello World",
  "version": "1.0.0",
  "description": "Shows a greeting when you run the command",
  "permissions": ["notifications"],
  "activationEvents": ["onCommand:com.example.hello-world.greet"],
  "contributes": {
    "commands": [
      {
        "id": "com.example.hello-world.greet",
        "title": "Hello World: Say Hello"
      }
    ]
  },
  "backend": {
    "type": "bun",
    "entry": "main.js"
  }
}
```

**main.js:**
```js
process.stdin.setEncoding('utf8');

let buffer = '';
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    const request = JSON.parse(line);
    const response = handleRequest(request);
    process.stdout.write(JSON.stringify(response) + '\n');
  }
});

function handleRequest(request) {
  const { id, method, params } = request;

  if (method === 'plugin.execute' && params.hook === 'greet') {
    return {
      jsonrpc: '2.0',
      id,
      result: { message: 'Hello from Amoena extensions!' },
    };
  }

  return { jsonrpc: '2.0', id, result: null };
}
```

**Package and install:**
```bash
amoena-pack manifest.json --asset main.js --out hello-world.luna
# Drag hello-world.luna into Amoena
```

---

## 2. Status Panel Extension

An HTML panel in the sidebar that shows active session information.

**Project structure:**
```
status-panel/
  manifest.json
  panel.html
```

**manifest.json:**
```json
{
  "id": "com.example.status-panel",
  "name": "Session Status",
  "version": "1.0.0",
  "description": "Displays active session information in the sidebar",
  "permissions": ["sessions.read"],
  "activationEvents": ["onSession"],
  "contributes": {
    "panels": [
      {
        "id": "com.example.status-panel.main",
        "title": "Session Status",
        "entry": "panel.html"
      }
    ],
    "menus": {
      "sidebar": [
        {
          "panel": "com.example.status-panel.main",
          "title": "Session Status",
          "icon": "icon.png"
        }
      ]
    }
  }
}
```

**panel.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Session Status</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-family-ui, system-ui, sans-serif);
      font-size: var(--font-size-base, 13px);
      color: var(--color-foreground, #1a1a1a);
      background: var(--color-background, #fff);
      padding: 12px;
    }

    .section {
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-muted, #888);
      margin-bottom: 6px;
    }

    .row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid var(--color-border, #eee);
      font-size: 12px;
    }

    .row:last-child { border-bottom: none; }

    .label { color: var(--color-muted, #888); }

    .value {
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }

    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      margin-right: 6px;
    }
  </style>
</head>
<body>
  <div class="section">
    <div class="section-title">Active Session</div>
    <div class="row">
      <span class="label">Status</span>
      <span class="value"><span class="status-dot"></span><span id="status">Idle</span></span>
    </div>
    <div class="row">
      <span class="label">Session ID</span>
      <span class="value" id="session-id">—</span>
    </div>
    <div class="row">
      <span class="label">Working Dir</span>
      <span class="value" id="working-dir">—</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Usage</div>
    <div class="row">
      <span class="label">Messages</span>
      <span class="value" id="message-count">0</span>
    </div>
    <div class="row">
      <span class="label">Tool Calls</span>
      <span class="value" id="tool-count">0</span>
    </div>
  </div>

  <script>
    let messageCount = 0;
    let toolCount = 0;

    window.addEventListener('message', (event) => {
      const { type, ...data } = event.data || {};

      switch (type) {
        case 'session-update':
          document.getElementById('session-id').textContent =
            (data.sessionId || '').slice(0, 8) + '…';
          document.getElementById('working-dir').textContent =
            data.workingDir || '—';
          break;

        case 'status-update':
          document.getElementById('status').textContent = data.status || 'Idle';
          break;

        case 'message-added':
          messageCount++;
          document.getElementById('message-count').textContent = messageCount;
          break;

        case 'tool-call':
          toolCount++;
          document.getElementById('tool-count').textContent = toolCount;
          break;
      }
    });
  </script>
</body>
</html>
```

**Package:**
```bash
amoena-pack manifest.json --asset panel.html --out status-panel.luna
```

---

## 3. Custom Tool Extension

Adds a `search_npm` tool the AI can call to look up npm package information.

**Project structure:**
```
npm-search-tool/
  manifest.json
  main.js
```

**manifest.json:**
```json
{
  "id": "com.example.npm-search-tool",
  "name": "NPM Search Tool",
  "version": "1.0.0",
  "description": "Lets the AI search npm for package information",
  "permissions": ["network"],
  "activationEvents": ["onSession"],
  "contributes": {
    "tools": [
      {
        "name": "search_npm",
        "description": "Search npm registry for packages. Use this when the user asks about npm packages, wants to find libraries, or needs package metadata like version, description, or weekly downloads.",
        "handler": "handleSearchNpm",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search query (package name or keywords)"
            },
            "limit": {
              "type": "number",
              "description": "Maximum number of results to return (default: 5, max: 20)"
            }
          },
          "required": ["query"]
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

**main.js:**
```js
process.stdin.setEncoding('utf8');

let buffer = '';
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    const request = JSON.parse(line);
    handleRequest(request).then((response) => {
      process.stdout.write(JSON.stringify(response) + '\n');
    });
  }
});

async function handleRequest(request) {
  const { id, method, params } = request;

  if (method !== 'plugin.execute' || params.hook !== 'handleSearchNpm') {
    return { jsonrpc: '2.0', id, result: null };
  }

  const { query, limit = 5 } = params.payload;
  const maxLimit = Math.min(limit, 20);

  try {
    const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${maxLimit}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`npm API returned ${resp.status}`);

    const data = await resp.json();
    const results = data.objects.map((obj) => ({
      name: obj.package.name,
      version: obj.package.version,
      description: obj.package.description || '',
      weeklyDownloads: obj.downloads?.weekly ?? null,
      keywords: obj.package.keywords ?? [],
      link: obj.package.links?.npm ?? `https://www.npmjs.com/package/${obj.package.name}`,
    }));

    return { jsonrpc: '2.0', id, result: { results } };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32000, message: error.message },
    };
  }
}
```

**Package:**
```bash
amoena-pack manifest.json --asset main.js --out npm-search-tool.luna
```

---

## 4. Hook Listener Extension

Logs all `PreToolUse` events to a file for debugging.

**Project structure:**
```
tool-logger/
  manifest.json
  main.js
```

**manifest.json:**
```json
{
  "id": "com.example.tool-logger",
  "name": "Tool Logger",
  "version": "1.0.0",
  "description": "Logs all AI tool calls to ~/amoena-tools.log",
  "permissions": ["fs.write"],
  "activationEvents": ["onSession"],
  "contributes": {
    "hooks": [
      {
        "event": "PreToolUse",
        "handler": "onPreToolUse"
      },
      {
        "event": "PostToolUse",
        "handler": "onPostToolUse"
      },
      {
        "event": "PostToolUseFailure",
        "handler": "onPostToolUseFailure"
      }
    ]
  },
  "backend": {
    "type": "bun",
    "entry": "main.js"
  }
}
```

**main.js:**
```js
import { appendFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const LOG_PATH = join(homedir(), 'amoena-tools.log');

function log(entry) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n';
  appendFileSync(LOG_PATH, line, 'utf8');
}

process.stdin.setEncoding('utf8');

let buffer = '';
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    const request = JSON.parse(line);
    const response = handleRequest(request);
    process.stdout.write(JSON.stringify(response) + '\n');
  }
});

function handleRequest(request) {
  const { id, method, params } = request;

  if (method !== 'plugin.execute') {
    return { jsonrpc: '2.0', id, result: null };
  }

  const { hook, payload } = params;

  switch (hook) {
    case 'onPreToolUse':
      log({
        event: 'PreToolUse',
        sessionId: payload.session_id,
        toolId: payload.tool_id,
        input: payload.input,
      });
      break;

    case 'onPostToolUse':
      log({
        event: 'PostToolUse',
        sessionId: payload.session_id,
        toolId: payload.tool_id,
        success: true,
      });
      break;

    case 'onPostToolUseFailure':
      log({
        event: 'PostToolUseFailure',
        sessionId: payload.session_id,
        toolId: payload.tool_id,
        error: payload.error,
      });
      break;
  }

  return { jsonrpc: '2.0', id, result: { ok: true } };
}
```

**Package:**
```bash
amoena-pack manifest.json --asset main.js --out tool-logger.luna
```

Logs are written to `~/amoena-tools.log`, one JSON line per event.

---

## 5. Provider Extension

Adds a local Ollama instance as an LLM provider, making local models available in the model picker.

**Project structure:**
```
ollama-provider/
  manifest.json
  main.js
  panel.html
```

**manifest.json:**
```json
{
  "id": "com.example.ollama-provider",
  "name": "Ollama",
  "version": "1.0.0",
  "description": "Use local Ollama models in Amoena",
  "permissions": ["network"],
  "activationEvents": ["onSession"],
  "contributes": {
    "providers": [
      {
        "id": "com.example.ollama-provider.ollama",
        "name": "Ollama (Local)",
        "handler": "handleOllamaRequest"
      }
    ],
    "settings": [
      {
        "id": "com.example.ollama-provider.baseUrl",
        "type": "string",
        "title": "Ollama base URL",
        "default": "http://localhost:11434"
      },
      {
        "id": "com.example.ollama-provider.defaultModel",
        "type": "string",
        "title": "Default model",
        "default": "llama3.2"
      }
    ],
    "panels": [
      {
        "id": "com.example.ollama-provider.status",
        "title": "Ollama Status",
        "entry": "panel.html"
      }
    ],
    "menus": {
      "sidebar": [
        {
          "panel": "com.example.ollama-provider.status",
          "title": "Ollama"
        }
      ]
    }
  },
  "backend": {
    "type": "bun",
    "entry": "main.js"
  }
}
```

**main.js:**
```js
const BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

process.stdin.setEncoding('utf8');

let buffer = '';
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    const request = JSON.parse(line);
    handleRequest(request).then((response) => {
      process.stdout.write(JSON.stringify(response) + '\n');
    });
  }
});

async function handleRequest(request) {
  const { id, params } = request;
  const { hook, payload } = params;

  if (hook !== 'handleOllamaRequest') {
    return { jsonrpc: '2.0', id, result: null };
  }

  const { model, messages, stream = false } = payload;

  try {
    const resp = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream }),
    });

    if (!resp.ok) {
      throw new Error(`Ollama API error: ${resp.status} ${await resp.text()}`);
    }

    const data = await resp.json();
    return {
      jsonrpc: '2.0',
      id,
      result: {
        content: data.message?.content ?? '',
        model: data.model,
        done: data.done,
      },
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32000, message: error.message },
    };
  }
}
```

**panel.html** (shows Ollama connection status and available models):
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Ollama Status</title>
  <style>
    body {
      font-family: var(--font-family-ui, system-ui, sans-serif);
      font-size: 13px;
      padding: 12px;
      color: var(--color-foreground, #1a1a1a);
      background: var(--color-background, #fff);
    }
    .status { margin-bottom: 12px; }
    .connected { color: #22c55e; font-weight: 600; }
    .disconnected { color: #ef4444; font-weight: 600; }
    .model-list { list-style: none; padding: 0; }
    .model-list li {
      padding: 4px 0;
      border-bottom: 1px solid var(--color-border, #eee);
      font-size: 12px;
      font-family: monospace;
    }
    button {
      margin-top: 8px;
      padding: 4px 10px;
      font-size: 12px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="status">
    Status: <span id="status" class="disconnected">Checking…</span>
  </div>
  <div id="models-section" style="display:none">
    <strong>Available Models</strong>
    <ul class="model-list" id="model-list"></ul>
  </div>
  <button onclick="checkOllama()">Refresh</button>

  <script>
    async function checkOllama() {
      const statusEl = document.getElementById('status');
      try {
        const resp = await fetch('http://localhost:11434/api/tags');
        if (!resp.ok) throw new Error('not ok');
        const data = await resp.json();

        statusEl.textContent = 'Connected';
        statusEl.className = 'connected';

        const list = document.getElementById('model-list');
        list.innerHTML = '';
        for (const model of data.models || []) {
          const li = document.createElement('li');
          li.textContent = model.name;
          list.appendChild(li);
        }
        document.getElementById('models-section').style.display = 'block';
      } catch {
        statusEl.textContent = 'Not running';
        statusEl.className = 'disconnected';
        document.getElementById('models-section').style.display = 'none';
      }
    }

    checkOllama();
  </script>
</body>
</html>
```

**Package:**
```bash
amoena-pack manifest.json --asset main.js --asset panel.html --out ollama-provider.luna
```
