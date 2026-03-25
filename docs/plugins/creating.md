# Creating a Plugin

This guide walks through building a Amoena plugin from scratch: directory layout, manifest, entry point, registering hooks, and installation.

## Prerequisites

- [Bun](https://bun.sh) installed (plugins run on Bun)
- Amoena desktop app

## Directory Layout

A plugin is a directory containing at minimum a `manifest.json` and the entry point file named in the `main` field:

```
my-plugin/
  manifest.json      # Required — plugin metadata and capabilities
  main.js            # Entry point (or main.ts, index.js, etc.)
  package.json       # Optional — if you have npm dependencies
```

The directory name does not matter; the plugin `id` in `manifest.json` is the canonical identifier.

## Step 1: Write the Manifest

Create `manifest.json`:

```json
{
  "id": "com.example.my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "A plugin that reacts to session events",
  "main": "main.js",
  "permissions": ["sessions.read"],
  "activationEvents": ["onSession"],
  "divisionAffinity": ["*"]
}
```

See [Manifest Reference](./manifest.md) for all fields.

## Step 2: Write the Entry Point

The entry point is a JavaScript (or TypeScript) file executed by Bun. It receives JSON-RPC requests on stdin and writes responses on stdout.

Create `main.js`:

```js
// Read newline-delimited JSON-RPC from stdin
process.stdin.setEncoding('utf8');

let buffer = '';

process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop(); // save incomplete line for next chunk

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const request = JSON.parse(line);
      const response = dispatch(request);
      process.stdout.write(JSON.stringify(response) + '\n');
    } catch (err) {
      // Invalid JSON — write an error response
      process.stdout.write(JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error' },
      }) + '\n');
    }
  }
});

function dispatch(request) {
  const { id, method, params } = request;

  if (method !== 'plugin.execute') {
    return rpcError(id, -32601, 'Method not found');
  }

  const { hook, payload } = params;

  switch (hook) {
    case 'onSession':
      return handleSession(id, payload);
    default:
      return rpcResult(id, { ok: true, skipped: true });
  }
}

function handleSession(id, payload) {
  const { session_id, working_dir } = payload;
  console.error(`[my-plugin] Session started: ${session_id} in ${working_dir}`);
  // Return a result — this goes back to Amoena
  return rpcResult(id, { ok: true, message: 'Session noted' });
}

// Helpers
function rpcResult(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function rpcError(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}
```

**Key rules for the entry point:**
- Read from `process.stdin`, write to `process.stdout`
- Requests are newline-delimited JSON-RPC 2.0
- Write exactly one response line per request
- Use `console.error` for logging (stderr is passed through; stdout is reserved for RPC)
- The process exits after responding — each invocation is a fresh process

## Step 3: Register Hook Handlers

Activation events control which hooks your plugin receives. Each string in `activationEvents` is matched against the hook event name before Amoena calls your plugin.

```json
{
  "activationEvents": ["onSession", "PreToolUse", "PostToolUse"]
}
```

Your `dispatch` function routes to the right handler based on `params.hook`.

## Step 4: Install the Plugin

### Option A: Copy to plugins directory

```bash
cp -r my-plugin ~/.amoena/plugins/
# Restart Amoena, or use Settings → Plugins → Rescan
```

### Option B: Deeplink installation

Serve your plugin directory as a tarball and use the deeplink:

```
amoena://plugin/install?id=com.example.my-plugin&source=https://example.com/my-plugin.tar.gz&publisher=Your+Name&title=My+Plugin
```

The user sees a review dialog showing the plugin's permissions and warnings before confirming. Trusted installations require an HTTPS `manifestUrl` and a `signature` parameter:

```
amoena://plugin/install
  ?id=com.example.my-plugin
  &source=https://example.com/my-plugin.tar.gz
  &manifestUrl=https://example.com/my-plugin/manifest.json
  &signature=<your-sig>
  &publisher=Your+Name
  &title=My+Plugin
  &version=1.0.0
```

## Step 5: Verify the Plugin Loaded

Open Settings → Plugins. Your plugin should appear with status `Healthy`.

If it does not appear:
1. Check that `manifest.json` exists in the directory and is valid JSON
2. Check that the `id` field is present and non-empty
3. Look in Help → Developer Logs for parse errors

## Handling Async Operations

Bun supports top-level async, so you can use async/await in your handlers:

```js
async function handleRequest(request) {
  const { id, params } = request;
  const { hook, payload } = params;

  if (hook === 'onSession') {
    const result = await fetchSomeData(payload.session_id);
    return rpcResult(id, result);
  }

  return rpcResult(id, { ok: true });
}

// Event loop: process each line sequentially
(async () => {
  const lines = []; // buffered lines
  process.stdin.setEncoding('utf8');

  let buffer = '';
  for await (const chunk of process.stdin) {
    buffer += chunk;
    const parts = buffer.split('\n');
    buffer = parts.pop();
    for (const line of parts) {
      if (!line.trim()) continue;
      const request = JSON.parse(line);
      const response = await handleRequest(request);
      process.stdout.write(JSON.stringify(response) + '\n');
    }
  }
})();
```

## Using npm Dependencies

If your plugin needs npm packages, create a `package.json` and install them:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "dependencies": {
    "zod": "^3.22.0"
  }
}
```

```bash
cd my-plugin
bun install
```

Bun resolves dependencies from the plugin directory at runtime, so `node_modules` should be present when the plugin is installed.

## Debugging

Write debug output to stderr — it appears in the Amoena developer logs:

```js
console.error('[my-plugin] Processing hook:', hook, JSON.stringify(payload));
```

To test your entry point in isolation:

```bash
echo '{"jsonrpc":"2.0","id":"test-1","method":"plugin.execute","params":{"pluginId":"com.example.my-plugin","hook":"onSession","payload":{"session_id":"sess-test","working_dir":"/tmp"}}}' | bun main.js
```

Expected output:
```json
{"jsonrpc":"2.0","id":"test-1","result":{"ok":true,"message":"Session noted"}}
```
