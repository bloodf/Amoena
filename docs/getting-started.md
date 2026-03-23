# Getting Started with Lunaria

Set up Lunaria in minutes and launch your first AI agent session.

## Prerequisites

- **Node.js 22+** — [Download](https://nodejs.org)
- **Bun 1.1+** — Install via `curl -fsSL https://bun.sh/install | bash`
- **Git** — For workspace management
- **API Keys** — Claude (Anthropic), Gemini (Google), or Codex (OpenAI) — at least one required

## Installation

### Clone and Install

```bash
git clone https://github.com/LunariaAi/lunaria.git
cd lunaria
bun install
```

### Build Desktop App (Optional)

```bash
# Build Tauri desktop shell
bun run build

# Or run in dev mode with hot reload
bun run dev
```

The app will open automatically. You'll see the dashboard with session history and workspace selector.

## Configure API Keys

Lunaria requires at least one AI provider. Configuration is per-workspace.

### Option 1: Environment Variables

```bash
# .env.local in project root
CLAUDE_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
```

### Option 2: Settings UI

1. Open Lunaria desktop app
2. Settings → Providers
3. Paste your API keys
4. Save

Keys are stored securely in the system keychain (macOS) or credential manager (Windows/Linux).

## Start Development

```bash
# Launch dev server with hot reload
bun run dev

# Runs on http://localhost:5173 (Vite)
# Tauri shell is active and ready
```

The webview opens with:
- Session history on the left
- Empty workspace (ready for your first session)
- Provider selector at the top

## First Agent Session Walkthrough

### Step 1: Create a Session

1. Click **New Session** in the dashboard
2. Select a provider (Claude recommended for best quality)
3. Choose execution mode:
   - **Native** — Use Lunaria's orchestration engine
   - **Wrapper** — Use Claude Code, OpenCode, or Codex CLI

### Step 2: Start Chatting

1. Type your first message: `"Hello, let's build a CLI tool to count words in files"`
2. Press Enter or click Send
3. Watch the response stream in real-time

### Step 3: Use Tools

When the agent suggests running a command:
1. The command appears in a sandbox block
2. Click **Execute** to run it safely
3. Output returns to the chat
4. Agent uses the result to continue

### Step 4: Check Memory

After your session:
1. Open **Memory Panel** (right sidebar)
2. You'll see observations captured: task goals, decisions, code snippets
3. These observations will be retrieved in future sessions automatically

### Step 5: View History

All sessions persist:
- Click any session in the left sidebar to view it
- Merge requests show conflicts and resolution UI
- Export sessions as Markdown or JSON

## Next Steps

- [Installation Guide](/getting-started/installation) — Detailed setup for each OS
- [Configuration](/getting-started/configuration) — Advanced provider settings
- [Features](/features/sessions) — Sessions, multi-agent, Autopilot explained
- [Extensions](/extensions/) — Write your first extension

## Troubleshooting

**App won't start:**
```bash
# Clear cache and rebuild
bun run clean
bun install
bun run dev
```

**API key not recognized:**
- Verify key format (should start with `sk-` for most providers)
- Check settings → providers for typos
- Restart app if recently changed

**Commands fail in sandbox:**
- Check tool permissions in settings
- Verify your PATH includes required tools
- Use `which <command>` to verify tool exists

**Memory not working:**
- Ensure embeddings service is running (check logs)
- LanceDB database may need reset: delete `.lunaria/db/` and restart

For more help, see [Contributing](/contributing/) or open an issue on [GitHub](https://github.com/LunariaAi/lunaria/issues).
