# Component Library

The Amoena component library (`@lunaria/ui`) provides 80+ components organized in four tiers.

## Primitives

Base UI building blocks from Radix UI, styled with Tailwind:

| Component | Based On | Description |
|-----------|----------|-------------|
| Accordion | `@radix-ui/react-accordion` | Collapsible content sections |
| AlertDialog | `@radix-ui/react-alert-dialog` | Modal confirmation dialogs |
| Avatar | `@radix-ui/react-avatar` | User/agent profile images |
| Button | Native + CVA | Variants: default, destructive, outline, secondary, ghost, link |
| Checkbox | `@radix-ui/react-checkbox` | Toggle checkboxes |
| ContextMenu | `@radix-ui/react-context-menu` | Right-click menus |
| Dialog | `@radix-ui/react-dialog` | Modal dialogs |
| DropdownMenu | `@radix-ui/react-dropdown-menu` | Dropdown action menus |
| Input | Native | Text input with variants |
| Label | `@radix-ui/react-label` | Form labels |
| Popover | `@radix-ui/react-popover` | Floating content panels |
| ScrollArea | `@radix-ui/react-scroll-area` | Custom scrollbars |
| Select | `@radix-ui/react-select` | Dropdown selectors |
| Separator | `@radix-ui/react-separator` | Visual dividers |
| Slider | `@radix-ui/react-slider` | Range sliders |
| Switch | `@radix-ui/react-switch` | Toggle switches |
| Tabs | `@radix-ui/react-tabs` | Tab navigation |
| Toast | `@radix-ui/react-toast` | Notification toasts |
| Tooltip | `@radix-ui/react-tooltip` | Hover tooltips |

## Components

Assembled UI patterns:

| Component | Description |
|-----------|-------------|
| `AppShell` | Main application layout with sidebar, header, and content area |
| `CommandPalette` | `cmdk`-based command palette (Ctrl+K) |
| `SessionComposer` | Message input with model selector, reasoning toggle, file attachments |
| `SidebarRail` | Navigation sidebar with icon links |
| `FileEditorTab` | Monaco editor tab with syntax highlighting |
| `MessageTimeline` | Chat message display with streaming support |
| `StatusBar` | Bottom bar with rate limits, token usage, connection status |

## Composites

Feature-specific assembled components:

### Session Composites
- **PermissionDialog** — Modal for approving/denying tool permissions
- **QueuePanel** — Message queue management (edit, remove, reorder, flush)
- **SessionTree** — Hierarchical session navigator (parent/child)
- **TodoPanel** — Task list with status tracking and completion counter
- **WorkspaceTabs** — Session and file tab management
- **WorkspaceResizeHandle** — Drag-to-resize workspace panes

### Agent Composites
- **AgentDetailSheet** — Agent profile sheet (model, division, collaboration style)
- **TeamStatusTable** — Team overview with member roles and status
- **SubAgentSwarmGrid** — Visual grid of active subagents
- **TeamConsensusMeter** — Progress indicator for team consensus

### Extension & Hook Composites
- **ExtensionPanel** — Extension management (install, toggle, uninstall)
- **HookManagementPanel** — Hook registry with test/delete actions

## Creating New Components

```tsx
// 1. Create the component file
// packages/ui/src/composites/my-feature/MyComponent.tsx

import React from "react";
import { useTranslation } from "react-i18next";

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 p-4">
      <h3 className="text-sm font-semibold">{t("myFeature.title")}</h3>
      <button onClick={onAction} className="px-4 py-2 rounded bg-primary text-primary-foreground">
        {t("myFeature.action")}
      </button>
    </div>
  );
}

// 2. Add i18n keys to packages/i18n/src/resources/en.ts
// 3. Create a story: MyComponent.stories.tsx
// 4. Create a test: my-component.test.tsx
```
