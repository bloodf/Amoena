# UI Development

Amoena's frontend is built with **React 19**, **TypeScript**, and **Tailwind CSS**. The component library lives in `packages/ui/` and is developed with **Storybook**.

## Architecture

```
packages/ui/
├── src/
│   ├── primitives/      # Base UI primitives (Button, Dialog, Input, etc.)
│   ├── components/      # Assembled components (AppShell, CommandPalette, etc.)
│   ├── composites/      # Feature composites (session, agents, extensions, etc.)
│   ├── screens/         # Full screen layouts
│   ├── hooks/           # Shared React hooks
│   └── globals.css      # Global styles and CSS variables
├── .storybook/          # Storybook configuration
└── vitest.config.ts     # Test configuration
```

## Key Principles

- **Primitives first**: Build on Radix UI primitives with Tailwind styling
- **Composites over pages**: Feature-specific composites compose primitives
- **i18n required**: All user-facing strings must use translation keys — no hardcoded English
- **Immutable state**: Use new objects, never mutate existing ones
- **Small files**: 200-400 lines typical, 800 max

## Runtime Communication

The UI communicates with the Rust backend via:

1. **REST API** — Using `@lunaria/runtime-client` for typed HTTP calls
2. **SSE Streams** — `EventSource` for real-time updates (messages, tool events, permissions)
3. **Tauri IPC** — For desktop-specific operations (file dialogs, window management)

```typescript
import { createRuntimeClient } from '@lunaria/runtime-client';

const client = createRuntimeClient({
  baseUrl: 'http://localhost:47821',
  authToken: bootstrapToken,
});

// REST
const sessions = await client.listSessions();

// SSE
const source = new EventSource(client.sessionEventsUrl(sessionId));
source.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  // Handle: message.delta, message.complete, tool.start, permission.request, etc.
});
```

## Component Categories

| Category | Location | Examples |
|----------|----------|---------|
| Primitives | `primitives/` | Button, Dialog, Input, Select, Tabs, Toast |
| Components | `components/` | AppShell, CommandPalette, SessionComposer, SidebarRail |
| Session | `composites/session/` | WorkspaceTabs, PermissionDialog, QueuePanel, TodoPanel, SessionTree |
| Agents | `composites/agents/` | AgentDetailSheet, TeamStatusTable, SubAgentSwarmGrid |
| Extensions | `composites/extensions/` | ExtensionPanel |
| Hooks | `composites/hooks/` | HookManagementPanel |
| Composer | `composites/composer/` | ComposerInputArea |
| File Browser | `composites/file-browser/` | FileTreeItem |
| Side Panel | `composites/side-panel/` | AgentsTab, FilesTab, MemoryTab |
| Screens | `screens/` | SessionWorkspace, AgentManagement, AutopilotScreen, SetupWizard |

## Styling

Amoena uses Tailwind CSS with CSS custom properties for theming:

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --muted: 0 0% 96.1%;
  /* ... */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

Use `bg-background`, `text-foreground`, `bg-primary`, etc. for theme-aware styling.
