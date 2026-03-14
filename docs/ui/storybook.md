# Storybook

Lunaria uses **Storybook 10** for visual component development, testing, and documentation.

## Running Storybook

```bash
cd packages/ui
bunx storybook dev -p 6006
```

Open [http://localhost:6006](http://localhost:6006) to browse components.

## Building Storybook

```bash
cd packages/ui
bunx storybook build
```

Output goes to `packages/ui/storybook-static/`.

## Writing Stories

Stories use the CSF3 (Component Story Format 3) syntax:

```tsx
// MyComponent.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { MyComponent } from "./MyComponent";

const meta: Meta<typeof MyComponent> = {
  title: "Composites/MyFeature/MyComponent",
  component: MyComponent,
};
export default meta;

type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    title: "Example",
    items: [
      { id: "1", name: "Item 1" },
      { id: "2", name: "Item 2" },
    ],
    onAction: () => {},
  },
};

export const Empty: Story = {
  args: {
    title: "Example",
    items: [],
    onAction: () => {},
  },
};
```

## Story Organization

Stories are organized to mirror the component hierarchy:

```
Primitives/
  Button
  Dialog
  Input
  ...
Components/
  AppShell
  CommandPalette
  SessionComposer
  ...
Composites/
  Session/
    PermissionDialog
    QueuePanel
    SessionTree
    TodoPanel
  Extensions/
    ExtensionPanel
  Hooks/
    HookManagementPanel
  Agents/
    AgentDetailSheet
    TeamStatusTable
Screens/
  SessionWorkspace
  AgentManagement
  AutopilotScreen
```

## Addons

| Addon | Purpose |
|-------|---------|
| `@storybook/addon-a11y` | Accessibility checks |
| `@storybook/addon-docs` | Auto-generated documentation |
| `@storybook/addon-themes` | Dark/light theme switching |
| `@storybook/addon-vitest` | Test integration |
| `@storybook/addon-coverage` | Coverage reporting |
| `storybook-addon-pseudo-states` | Hover, focus, active states |
| `@chromatic-com/storybook` | Visual regression testing |

## Visual Regression Testing

Lunaria uses [Chromatic](https://www.chromatic.com/) for visual regression testing:

```bash
cd packages/ui
CHROMATIC_SKIP_TEST_ADDONS=1 chromatic
```

This is also run automatically via `.github/workflows/chromatic.yml` on every PR.

## Best Practices

1. **Every new component needs a story** — At minimum, a Default and Empty state
2. **Use realistic data** — Avoid "Lorem ipsum"; use domain-relevant content
3. **Cover edge cases** — Empty states, loading states, error states, long content
4. **Test interactions** — Use Storybook's `play` function for interaction testing
5. **Keep stories focused** — One concept per story variant
