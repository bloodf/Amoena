# Amoena Theming & Design System Specification

## Scope

This document defines Amoena's complete design system: design tokens, Tailwind v4 CSS-first configuration, light/dark mode switching, custom theme JSON format, theme editor UI, community sharing, component library, cross-platform considerations, Monaco Editor theming integration, terminal theming, responsive session workspace behavior, and the full catalog of Amoena-specific component specifications.

**Package home**: `packages/ui/src/theme/` inside this monorepo (`@lunaria/ui`).
**Consumers**: Desktop app (Tauri 2 + React 19) and the future React Native mobile app (via packages/ui-native).
**Dependencies**: Tailwind CSS v4, shadcn/ui, Radix Primitives, CVA (Class Variance Authority), Monaco Editor, xterm.js.

---

## 1. Design Tokens

Design tokens are the atomic values that define Amoena's visual language. They follow a three-tier hierarchy:

```
Brand Tokens (abstract, platform-agnostic)
    └── Semantic Tokens (purpose-driven, theme-aware)
        └── Component Tokens (scoped to specific UI elements)
```

### 1.1 Color Palette

All colors use **OKLCH** color space for perceptual uniformity across light and dark modes. OKLCH provides better lightness consistency than HSL, ensuring accessible contrast ratios are maintained when generating color variants.

#### Brand Color Palette Overview

- **Deep Purple**: `#6640D0`
- **Purple**: `#9E2DD6`
- **Magenta (Primary)**: `#B800B8`
- **Pink**: `#B5008B`
- **Rose**: `#CD007C`
- **Green (Accent)**: `#006C2A`

#### Primary Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-primary` | `#B800B8` | `#E066E0` | Primary actions, active states, links |
| `--color-primary-foreground` | `#FFFFFF` | `#000000` | Text on primary backgrounds |
| `--color-primary-50` | `color-mix(in oklab, var(--color-primary) 5%, transparent)` | Same formula | Subtle primary tints |
| `--color-primary-100` | `color-mix(in oklab, var(--color-primary) 10%, transparent)` | Same formula | Hover backgrounds |
| `--color-primary-200` | `color-mix(in oklab, var(--color-primary) 20%, transparent)` | Same formula | Active backgrounds |

#### Secondary Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-secondary` | `oklch(96% 0.01 260)` | `oklch(22% 0.02 260)` | Secondary actions, less prominent UI |
| `--color-secondary-foreground` | `oklch(15% 0.025 260)` | `oklch(98% 0.01 260)` | Text on secondary backgrounds |

#### Accent Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-accent` | `#006C2A` | `#00A040` | Highlights, badges, decorative elements |
| `--color-accent-foreground` | `#FFFFFF` | `#FFFFFF` | Text on accent backgrounds |

#### Neutral Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-background` | `oklch(100% 0 0)` | `oklch(13% 0.02 260)` | Page background |
| `--color-foreground` | `oklch(15% 0.025 260)` | `oklch(98% 0.01 260)` | Default text |
| `--color-muted` | `oklch(96% 0.01 260)` | `oklch(20% 0.02 260)` | Muted backgrounds, disabled states |
| `--color-muted-foreground` | `oklch(46% 0.02 260)` | `oklch(65% 0.02 260)` | Secondary text, placeholders |
| `--color-card` | `oklch(100% 0 0)` | `oklch(16% 0.02 260)` | Card surfaces |
| `--color-card-foreground` | `oklch(15% 0.025 260)` | `oklch(98% 0.01 260)` | Text on cards |
| `--color-popover` | `oklch(100% 0 0)` | `oklch(16% 0.02 260)` | Popover/dropdown surfaces |
| `--color-popover-foreground` | `oklch(15% 0.025 260)` | `oklch(98% 0.01 260)` | Text in popovers |

#### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-destructive` | `oklch(53% 0.22 27)` | `oklch(65% 0.2 27)` | Errors, destructive actions, danger |
| `--color-destructive-foreground` | `oklch(98% 0.01 27)` | `oklch(98% 0.01 27)` | Text on destructive backgrounds |
| `--color-success` | `oklch(55% 0.18 145)` | `oklch(68% 0.16 145)` | Success states, confirmations |
| `--color-success-foreground` | `oklch(98% 0.01 145)` | `oklch(15% 0.02 145)` | Text on success backgrounds |
| `--color-warning` | `oklch(75% 0.15 85)` | `oklch(78% 0.14 85)` | Warnings, caution states |
| `--color-warning-foreground` | `oklch(20% 0.03 85)` | `oklch(20% 0.03 85)` | Text on warning backgrounds |
| `--color-info` | `#6640D0` | `#9E2DD6` | Informational messages |
| `--color-info-foreground` | `#FFFFFF` | `#FFFFFF` | Text on info backgrounds |

#### Border & Ring Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-border` | `oklch(91% 0.01 260)` | `oklch(25% 0.02 260)` | Default borders |
| `--color-input` | `oklch(91% 0.01 260)` | `oklch(25% 0.02 260)` | Input borders |
| `--color-ring` | `oklch(45% 0.2 260)` | `oklch(75% 0.15 260)` | Focus ring color |
| `--color-ring-offset` | `oklch(100% 0 0)` | `oklch(13% 0.02 260)` | Focus ring offset background |

#### TUI-Specific Accent Colors

Each supported TUI has a brand color for visual identification in multi-session views:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-tui-claude` | `#B800B8` | Claude Code session indicators |
| `--color-tui-opencode` | `#9E2DD6` | OpenCode session indicators |
| `--color-tui-codex` | `#6640D0` | Codex CLI session indicators |
| `--color-tui-gemini` | `#B5008B` | Gemini CLI session indicators |

#### State Colors (New)

Tokens for dynamic agent and session states used across streaming, thinking, permission, and agent lifecycle UI:

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-state-streaming` | `oklch(55% 0.22 260)` | `oklch(72% 0.18 260)` | Active token streaming indicator |
| `--color-state-streaming-fg` | `oklch(98% 0.01 260)` | `oklch(98% 0.01 260)` | Text/icon on streaming surfaces |
| `--color-state-thinking` | `oklch(60% 0.15 300)` | `oklch(75% 0.12 300)` | Extended thinking active state |
| `--color-state-thinking-fg` | `oklch(98% 0.01 300)` | `oklch(98% 0.01 300)` | Text/icon on thinking surfaces |
| `--color-state-permission-pending` | `oklch(72% 0.16 75)` | `oklch(78% 0.14 75)` | Permission awaiting user decision |
| `--color-state-permission-pending-fg` | `oklch(18% 0.03 75)` | `oklch(18% 0.03 75)` | Text on permission-pending surfaces |
| `--color-state-agent-active` | `oklch(58% 0.2 145)` | `oklch(68% 0.18 145)` | Agent currently executing |
| `--color-state-agent-active-fg` | `oklch(98% 0.01 145)` | `oklch(15% 0.02 145)` | Text on agent-active surfaces |
| `--color-state-agent-idle` | `oklch(55% 0.04 260)` | `oklch(50% 0.04 260)` | Agent connected but not executing |
| `--color-state-agent-idle-fg` | `oklch(98% 0.01 260)` | `oklch(98% 0.01 260)` | Text on agent-idle surfaces |
| `--color-state-compacting` | `oklch(65% 0.14 200)` | `oklch(70% 0.12 200)` | Context compaction in progress |
| `--color-state-compacting-fg` | `oklch(98% 0.01 200)` | `oklch(15% 0.02 200)` | Text on compacting surfaces |

### 1.2 Spacing Scale

Based on a 4px base unit with a consistent multiplier. All spacing values are available as Tailwind utilities (`p-1` = 4px, `p-2` = 8px, etc.).

| Token | Value | Tailwind Class | Usage |
|-------|-------|---------------|-------|
| `--spacing-0` | `0px` | `*-0` | Reset |
| `--spacing-px` | `1px` | `*-px` | Hairline borders |
| `--spacing-0.5` | `2px` | `*-0.5` | Tight spacing |
| `--spacing-1` | `4px` | `*-1` | Minimal spacing |
| `--spacing-1.5` | `6px` | `*-1.5` | Small gap |
| `--spacing-2` | `8px` | `*-2` | Default small spacing |
| `--spacing-3` | `12px` | `*-3` | Medium-small spacing |
| `--spacing-4` | `16px` | `*-4` | Default spacing |
| `--spacing-5` | `20px` | `*-5` | Medium spacing |
| `--spacing-6` | `24px` | `*-6` | Section spacing |
| `--spacing-8` | `32px` | `*-8` | Large spacing |
| `--spacing-10` | `40px` | `*-10` | Extra-large spacing |
| `--spacing-12` | `48px` | `*-12` | Panel spacing |
| `--spacing-16` | `64px` | `*-16` | Layout spacing |
| `--spacing-20` | `80px` | `*-20` | Page-level spacing |
| `--spacing-24` | `96px` | `*-24` | Maximum spacing |

### 1.3 Typography

#### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `"Inter Variable", "Inter", system-ui, -apple-system, sans-serif` | UI text, body copy |
| `--font-mono` | `"JetBrains Mono Variable", "JetBrains Mono", "Fira Code", ui-monospace, monospace` | Code, terminal output, diffs |
| `--font-heading` | `var(--font-sans)` | Headings (same family, different weight) |

**Rationale**: Inter provides excellent readability at small sizes for UI text. JetBrains Mono has programming ligatures and clear character distinction for code display. Both support variable font weights for optimal file size.

#### Font Sizes

| Token | Size | Line Height | Letter Spacing | Usage |
|-------|------|-------------|----------------|-------|
| `--text-xs` | `0.75rem` (12px) | `1rem` | `0.01em` | Captions, badges |
| `--text-sm` | `0.875rem` (14px) | `1.25rem` | `0` | Secondary text, labels |
| `--text-base` | `1rem` (16px) | `1.5rem` | `0` | Body text |
| `--text-lg` | `1.125rem` (18px) | `1.75rem` | `-0.01em` | Large body text |
| `--text-xl` | `1.25rem` (20px) | `1.75rem` | `-0.01em` | Small headings |
| `--text-2xl` | `1.5rem` (24px) | `2rem` | `-0.02em` | Section headings |
| `--text-3xl` | `1.875rem` (30px) | `2.25rem` | `-0.02em` | Page headings |
| `--text-4xl` | `2.25rem` (36px) | `2.5rem` | `-0.03em` | Display headings |

#### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--font-weight-normal` | `400` | Body text |
| `--font-weight-medium` | `500` | Labels, emphasis |
| `--font-weight-semibold` | `600` | Headings, buttons |
| `--font-weight-bold` | `700` | Strong emphasis |

### 1.4 Border Radius

| Token | Value | Tailwind Class | Usage |
|-------|-------|---------------|-------|
| `--radius-none` | `0` | `rounded-none` | No rounding |
| `--radius-sm` | `0.25rem` (4px) | `rounded-sm` | Subtle rounding (badges, chips) |
| `--radius-md` | `0.375rem` (6px) | `rounded-md` | Default rounding (inputs, buttons) |
| `--radius-lg` | `0.5rem` (8px) | `rounded-lg` | Card rounding |
| `--radius-xl` | `0.75rem` (12px) | `rounded-xl` | Dialog rounding |
| `--radius-2xl` | `1rem` (16px) | `rounded-2xl` | Large panel rounding |
| `--radius-full` | `9999px` | `rounded-full` | Pill shapes, avatars |

### 1.5 Shadows

Shadows use layered approach for realistic depth. Dark mode shadows use lower opacity and slightly tinted values.

| Token | Light Mode Value | Dark Mode Value | Usage |
|-------|-----------------|-----------------|-------|
| `--shadow-xs` | `0 1px 2px oklch(0% 0 0 / 0.05)` | `0 1px 2px oklch(0% 0 0 / 0.3)` | Subtle elevation (buttons) |
| `--shadow-sm` | `0 1px 3px oklch(0% 0 0 / 0.1), 0 1px 2px oklch(0% 0 0 / 0.06)` | `0 1px 3px oklch(0% 0 0 / 0.4), 0 1px 2px oklch(0% 0 0 / 0.2)` | Low elevation (cards) |
| `--shadow-md` | `0 4px 6px oklch(0% 0 0 / 0.1), 0 2px 4px oklch(0% 0 0 / 0.06)` | `0 4px 6px oklch(0% 0 0 / 0.5), 0 2px 4px oklch(0% 0 0 / 0.2)` | Medium elevation (dropdowns) |
| `--shadow-lg` | `0 10px 15px oklch(0% 0 0 / 0.1), 0 4px 6px oklch(0% 0 0 / 0.05)` | `0 10px 15px oklch(0% 0 0 / 0.5), 0 4px 6px oklch(0% 0 0 / 0.2)` | High elevation (modals) |
| `--shadow-xl` | `0 20px 25px oklch(0% 0 0 / 0.1), 0 8px 10px oklch(0% 0 0 / 0.04)` | `0 20px 25px oklch(0% 0 0 / 0.5), 0 8px 10px oklch(0% 0 0 / 0.15)` | Highest elevation (toasts) |

### 1.6 Z-Index Layers

Strict z-index scale prevents stacking context conflicts. All z-index values are defined as tokens — never use arbitrary z-index values.

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | `0` | Default stacking |
| `--z-raised` | `10` | Raised elements (sticky headers) |
| `--z-dropdown` | `20` | Dropdowns, select menus |
| `--z-sticky` | `30` | Sticky elements (sidebar, toolbar) |
| `--z-overlay` | `40` | Overlay backgrounds |
| `--z-modal` | `50` | Modal dialogs |
| `--z-popover` | `60` | Popovers, tooltips |
| `--z-toast` | `70` | Toast notifications |
| `--z-command` | `80` | Command palette (always on top) |
| `--z-max` | `9999` | Emergency override (avoid using) |

### 1.7 Animation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | `100ms` | Micro-interactions (hover, focus) |
| `--duration-normal` | `200ms` | Standard transitions |
| `--duration-slow` | `300ms` | Complex animations (modals, panels) |
| `--duration-slower` | `500ms` | Page transitions |
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General purpose |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Enter animations |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Exit animations |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful interactions |

---

## 2. Tailwind v4 @theme Configuration

Amoena uses Tailwind CSS v4's **CSS-first configuration** via the `@theme` directive. No `tailwind.config.ts` file is used.

### 2.1 Main CSS Entry Point

**File**: `ui/src/styles/tailwind.css`

```css
@import "tailwindcss";

/* ============================================
   AMOENA DESIGN SYSTEM — @theme Configuration
   ============================================ */

@theme {
  /* --- Font Families --- */
  --font-sans: "Inter Variable", "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono Variable", "JetBrains Mono", "Fira Code", ui-monospace, monospace;

  /* --- Color Palette (Light Mode Defaults) --- */
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(15% 0.025 260);

  --color-primary: oklch(45% 0.2 260);
  --color-primary-foreground: oklch(98% 0.01 260);
  --color-primary-50: color-mix(in oklab, var(--color-primary) 5%, transparent);
  --color-primary-100: color-mix(in oklab, var(--color-primary) 10%, transparent);
  --color-primary-200: color-mix(in oklab, var(--color-primary) 20%, transparent);

  --color-secondary: oklch(96% 0.01 260);
  --color-secondary-foreground: oklch(15% 0.025 260);

  --color-accent: oklch(65% 0.18 160);
  --color-accent-foreground: oklch(15% 0.025 160);

  --color-muted: oklch(96% 0.01 260);
  --color-muted-foreground: oklch(46% 0.02 260);

  --color-card: oklch(100% 0 0);
  --color-card-foreground: oklch(15% 0.025 260);

  --color-popover: oklch(100% 0 0);
  --color-popover-foreground: oklch(15% 0.025 260);

  --color-destructive: oklch(53% 0.22 27);
  --color-destructive-foreground: oklch(98% 0.01 27);

  --color-success: oklch(55% 0.18 145);
  --color-success-foreground: oklch(98% 0.01 145);

  --color-warning: oklch(75% 0.15 85);
  --color-warning-foreground: oklch(20% 0.03 85);

  --color-info: oklch(60% 0.15 240);
  --color-info-foreground: oklch(98% 0.01 240);

  --color-border: oklch(91% 0.01 260);
  --color-input: oklch(91% 0.01 260);
  --color-ring: oklch(45% 0.2 260);
  --color-ring-offset: oklch(100% 0 0);

  /* TUI brand colors */
  --color-tui-claude: oklch(60% 0.2 25);
  --color-tui-opencode: oklch(65% 0.18 145);
  --color-tui-codex: oklch(55% 0.15 260);
  --color-tui-gemini: oklch(65% 0.2 280);

  /* State colors */
  --color-state-streaming: oklch(55% 0.22 260);
  --color-state-streaming-fg: oklch(98% 0.01 260);
  --color-state-thinking: oklch(60% 0.15 300);
  --color-state-thinking-fg: oklch(98% 0.01 300);
  --color-state-permission-pending: oklch(72% 0.16 75);
  --color-state-permission-pending-fg: oklch(18% 0.03 75);
  --color-state-agent-active: oklch(58% 0.2 145);
  --color-state-agent-active-fg: oklch(98% 0.01 145);
  --color-state-agent-idle: oklch(55% 0.04 260);
  --color-state-agent-idle-fg: oklch(98% 0.01 260);
  --color-state-compacting: oklch(65% 0.14 200);
  --color-state-compacting-fg: oklch(98% 0.01 200);

  /* --- Border Radius --- */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;

  /* --- Shadows --- */
  --shadow-xs: 0 1px 2px oklch(0% 0 0 / 0.05);
  --shadow-sm: 0 1px 3px oklch(0% 0 0 / 0.1), 0 1px 2px oklch(0% 0 0 / 0.06);
  --shadow-md: 0 4px 6px oklch(0% 0 0 / 0.1), 0 2px 4px oklch(0% 0 0 / 0.06);
  --shadow-lg: 0 10px 15px oklch(0% 0 0 / 0.1), 0 4px 6px oklch(0% 0 0 / 0.05);
  --shadow-xl: 0 20px 25px oklch(0% 0 0 / 0.1), 0 8px 10px oklch(0% 0 0 / 0.04);

  /* --- Z-Index Layers --- */
  --z-base: 0;
  --z-raised: 10;
  --z-dropdown: 20;
  --z-sticky: 30;
  --z-overlay: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-toast: 70;
  --z-command: 80;

  /* --- Animation --- */
  --animate-fade-in: fade-in 200ms ease-out;
  --animate-fade-out: fade-out 150ms ease-in;
  --animate-slide-in-up: slide-in-up 300ms ease-out;
  --animate-slide-in-down: slide-in-down 300ms ease-out;
  --animate-slide-in-left: slide-in-left 300ms ease-out;
  --animate-slide-in-right: slide-in-right 300ms ease-out;
  --animate-scale-in: scale-in 200ms ease-out;
  --animate-spin: spin 1s linear infinite;
  --animate-pulse-subtle: pulse-subtle 2s ease-in-out infinite;
  --animate-shimmer: shimmer 1.5s linear infinite;

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  @keyframes slide-in-up {
    from { transform: translateY(0.5rem); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes slide-in-down {
    from { transform: translateY(-0.5rem); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes slide-in-left {
    from { transform: translateX(-0.5rem); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slide-in-right {
    from { transform: translateX(0.5rem); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes scale-in {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse-subtle {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  @keyframes shimmer {
    from { background-position: -200% 0; }
    to { background-position: 200% 0; }
  }
}

/* --- Dark Mode Variant --- */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

/* --- Base Layer --- */
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }
}
```

### 2.2 Dark Mode Overrides

**File**: `ui/src/styles/dark-theme.css`

```css
[data-theme="dark"] {
  --color-background: oklch(13% 0.02 260);
  --color-foreground: oklch(98% 0.01 260);

  --color-primary: oklch(75% 0.15 260);
  --color-primary-foreground: oklch(15% 0.02 260);

  --color-secondary: oklch(22% 0.02 260);
  --color-secondary-foreground: oklch(98% 0.01 260);

  --color-accent: oklch(70% 0.15 160);
  --color-accent-foreground: oklch(98% 0.01 160);

  --color-muted: oklch(20% 0.02 260);
  --color-muted-foreground: oklch(65% 0.02 260);

  --color-card: oklch(16% 0.02 260);
  --color-card-foreground: oklch(98% 0.01 260);

  --color-popover: oklch(16% 0.02 260);
  --color-popover-foreground: oklch(98% 0.01 260);

  --color-destructive: oklch(65% 0.2 27);
  --color-destructive-foreground: oklch(98% 0.01 27);

  --color-success: oklch(68% 0.16 145);
  --color-success-foreground: oklch(15% 0.02 145);

  --color-warning: oklch(78% 0.14 85);
  --color-warning-foreground: oklch(20% 0.03 85);

  --color-info: oklch(70% 0.13 240);
  --color-info-foreground: oklch(15% 0.02 240);

  --color-border: oklch(25% 0.02 260);
  --color-input: oklch(25% 0.02 260);
  --color-ring: oklch(75% 0.15 260);
  --color-ring-offset: oklch(13% 0.02 260);

  /* State colors (dark overrides) */
  --color-state-streaming: oklch(72% 0.18 260);
  --color-state-thinking: oklch(75% 0.12 300);
  --color-state-permission-pending: oklch(78% 0.14 75);
  --color-state-agent-active: oklch(68% 0.18 145);
  --color-state-agent-idle: oklch(50% 0.04 260);
  --color-state-compacting: oklch(70% 0.12 200);

  --shadow-xs: 0 1px 2px oklch(0% 0 0 / 0.3);
  --shadow-sm: 0 1px 3px oklch(0% 0 0 / 0.4), 0 1px 2px oklch(0% 0 0 / 0.2);
  --shadow-md: 0 4px 6px oklch(0% 0 0 / 0.5), 0 2px 4px oklch(0% 0 0 / 0.2);
  --shadow-lg: 0 10px 15px oklch(0% 0 0 / 0.5), 0 4px 6px oklch(0% 0 0 / 0.2);
  --shadow-xl: 0 20px 25px oklch(0% 0 0 / 0.5), 0 8px 10px oklch(0% 0 0 / 0.15);
}
```

---

## 3. Light/Dark Mode

### 3.1 Switching Mechanism

Amoena uses a `data-theme` attribute on the `<html>` element rather than a CSS class. This approach:

- Avoids specificity conflicts with utility classes
- Works with Tailwind v4's `@custom-variant` directive
- Supports future multi-theme expansion (not just light/dark)
- Is compatible with Tauri's webview and standard browsers

```html
<!-- Light mode (default) -->
<html data-theme="light">

<!-- Dark mode -->
<html data-theme="dark">

<!-- Custom theme -->
<html data-theme="custom" style="--color-primary: oklch(55% 0.2 300); ...">
```

### 3.2 CSS Custom Properties Per Mode

All color tokens are defined as CSS custom properties at the `:root` level (light mode defaults) and overridden within `[data-theme="dark"]`. See Section 2.1 and 2.2 for the complete property lists.

The key principle: **components never reference mode-specific colors directly**. They always use semantic tokens (`bg-primary`, `text-foreground`, etc.) which resolve to the correct value based on the active `data-theme`.

### 3.3 System Preference Detection

**File**: `ui/src/theme/theme-provider.tsx`

```typescript
// Theme detection and persistence logic
interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  customThemeId?: string;
}

// Detection priority:
// 1. User's explicit choice (stored in settings DB)
// 2. System preference via prefers-color-scheme media query
// 3. Default: 'system'

function resolveTheme(config: ThemeConfig): 'light' | 'dark' {
  if (config.mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return config.mode;
}

// System preference change listener
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', (e) => {
  if (currentConfig.mode === 'system') {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});
```

### 3.4 Theme Application Flow

```
User selects theme mode
    ↓
Store preference in SQLite settings table
    ↓
Resolve effective theme (system → detect OS preference)
    ↓
Set data-theme attribute on <html>
    ↓
If custom theme: inject CSS custom properties as inline styles
    ↓
Notify Monaco Editor to update its theme
    ↓
Update xterm.js terminal theme tokens
    ↓
Update Tauri window title bar color (via Tauri API)
```

### 3.5 Flash Prevention

To prevent a flash of incorrect theme on app startup:

```html
<!-- Inline script in index.html, runs before React hydration -->
<script>
  (function() {
    try {
      const stored = localStorage.getItem('amoena-theme-mode');
      const mode = stored || 'system';
      const resolved = mode === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mode;
      document.documentElement.setAttribute('data-theme', resolved);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  })();
</script>
```

---

## 4. Custom Theme System

### 4.1 Theme JSON Format

Custom themes are stored as JSON files that can be imported, exported, and shared. Each theme defines overrides for the base design tokens.

```typescript
// ui/src/types/theme.ts

interface AmoenaTheme {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Schema version for forward compatibility */
  schemaVersion: 1;

  /** Human-readable theme name */
  name: string;

  /** Theme description */
  description?: string;

  /** Theme author */
  author?: string;

  /** Theme version (semver) */
  version?: string;

  /** Theme tags for discovery */
  tags?: string[];

  /** Preview screenshot URL (base64 data URI or HTTPS URL) */
  preview?: string;

  /** Base mode this theme extends */
  base: 'light' | 'dark';

  /** Color token overrides (OKLCH format required) */
  colors: {
    background?: string;
    foreground?: string;
    primary?: string;
    primaryForeground?: string;
    secondary?: string;
    secondaryForeground?: string;
    accent?: string;
    accentForeground?: string;
    muted?: string;
    mutedForeground?: string;
    card?: string;
    cardForeground?: string;
    popover?: string;
    popoverForeground?: string;
    destructive?: string;
    destructiveForeground?: string;
    success?: string;
    successForeground?: string;
    warning?: string;
    warningForeground?: string;
    info?: string;
    infoForeground?: string;
    border?: string;
    input?: string;
    ring?: string;
    ringOffset?: string;
  };

  /** Typography overrides */
  typography?: {
    fontSans?: string;
    fontMono?: string;
  };

  /** Border radius overrides */
  radius?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };

  /** Shadow overrides */
  shadows?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };

  /** Monaco Editor theme name or inline definition */
  monacoTheme?: string | MonacoThemeDefinition;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last modified timestamp (ISO 8601) */
  updatedAt: string;
}
```

### 4.2 JSON to CSS Custom Properties Mapping

The theme engine maps JSON keys to CSS custom properties using a deterministic naming convention:

```typescript
// ui/src/theme/theme-engine.ts

const TOKEN_MAP: Record<string, string> = {
  // Colors
  'colors.background': '--color-background',
  'colors.foreground': '--color-foreground',
  'colors.primary': '--color-primary',
  'colors.primaryForeground': '--color-primary-foreground',
  'colors.secondary': '--color-secondary',
  'colors.secondaryForeground': '--color-secondary-foreground',
  'colors.accent': '--color-accent',
  'colors.accentForeground': '--color-accent-foreground',
  'colors.muted': '--color-muted',
  'colors.mutedForeground': '--color-muted-foreground',
  'colors.card': '--color-card',
  'colors.cardForeground': '--color-card-foreground',
  'colors.popover': '--color-popover',
  'colors.popoverForeground': '--color-popover-foreground',
  'colors.destructive': '--color-destructive',
  'colors.destructiveForeground': '--color-destructive-foreground',
  'colors.success': '--color-success',
  'colors.successForeground': '--color-success-foreground',
  'colors.warning': '--color-warning',
  'colors.warningForeground': '--color-warning-foreground',
  'colors.info': '--color-info',
  'colors.infoForeground': '--color-info-foreground',
  'colors.border': '--color-border',
  'colors.input': '--color-input',
  'colors.ring': '--color-ring',
  'colors.ringOffset': '--color-ring-offset',

  // Typography
  'typography.fontSans': '--font-sans',
  'typography.fontMono': '--font-mono',

  // Radius
  'radius.sm': '--radius-sm',
  'radius.md': '--radius-md',
  'radius.lg': '--radius-lg',
  'radius.xl': '--radius-xl',

  // Shadows
  'shadows.xs': '--shadow-xs',
  'shadows.sm': '--shadow-sm',
  'shadows.md': '--shadow-md',
  'shadows.lg': '--shadow-lg',
  'shadows.xl': '--shadow-xl',
};

function applyTheme(theme: AmoenaTheme): void {
  const root = document.documentElement;

  // Set base mode
  root.setAttribute('data-theme', theme.base);

  // Apply all overrides as inline CSS custom properties
  for (const [jsonPath, cssVar] of Object.entries(TOKEN_MAP)) {
    const value = getNestedValue(theme, jsonPath);
    if (value !== undefined) {
      root.style.setProperty(cssVar, value);
    }
  }

  // Apply Monaco theme if specified
  if (theme.monacoTheme) {
    applyMonacoTheme(theme.monacoTheme);
  }
}

function removeTheme(): void {
  const root = document.documentElement;
  for (const cssVar of Object.values(TOKEN_MAP)) {
    root.style.removeProperty(cssVar);
  }
}
```

### 4.3 Validation Schema

Theme JSON files are validated using Zod before application:

```typescript
// ui/src/validators/theme-schema.ts
import { z } from 'zod';

const oklchPattern = /^oklch\(\d+(\.\d+)?%\s+\d+(\.\d+)?\s+\d+(\.\d+)?\)$/;
const oklchColor = z.string().regex(oklchPattern, 'Must be valid OKLCH color');

const cssLength = z.string().regex(
  /^\d+(\.\d+)?(rem|px|em)$/,
  'Must be valid CSS length'
);

export const AmoenaThemeSchema = z.object({
  id: z.string().uuid(),
  schemaVersion: z.literal(1),
  name: z.string().min(1).max(64),
  description: z.string().max(256).optional(),
  author: z.string().max(64).optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
  tags: z.array(z.string().max(32)).max(10).optional(),
  preview: z.string().optional(),
  base: z.enum(['light', 'dark']),
  colors: z.object({
    background: oklchColor.optional(),
    foreground: oklchColor.optional(),
    primary: oklchColor.optional(),
    primaryForeground: oklchColor.optional(),
    secondary: oklchColor.optional(),
    secondaryForeground: oklchColor.optional(),
    accent: oklchColor.optional(),
    accentForeground: oklchColor.optional(),
    muted: oklchColor.optional(),
    mutedForeground: oklchColor.optional(),
    card: oklchColor.optional(),
    cardForeground: oklchColor.optional(),
    popover: oklchColor.optional(),
    popoverForeground: oklchColor.optional(),
    destructive: oklchColor.optional(),
    destructiveForeground: oklchColor.optional(),
    success: oklchColor.optional(),
    successForeground: oklchColor.optional(),
    warning: oklchColor.optional(),
    warningForeground: oklchColor.optional(),
    info: oklchColor.optional(),
    infoForeground: oklchColor.optional(),
    border: oklchColor.optional(),
    input: oklchColor.optional(),
    ring: oklchColor.optional(),
    ringOffset: oklchColor.optional(),
  }),
  typography: z.object({
    fontSans: z.string().optional(),
    fontMono: z.string().optional(),
  }).optional(),
  radius: z.object({
    sm: cssLength.optional(),
    md: cssLength.optional(),
    lg: cssLength.optional(),
    xl: cssLength.optional(),
  }).optional(),
  shadows: z.object({
    xs: z.string().optional(),
    sm: z.string().optional(),
    md: z.string().optional(),
    lg: z.string().optional(),
    xl: z.string().optional(),
  }).optional(),
  monacoTheme: z.union([z.string(), z.record(z.unknown())]).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ValidatedTheme = z.infer<typeof AmoenaThemeSchema>;
```

### 4.4 Example Theme JSON

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "schemaVersion": 1,
  "name": "Moonlight Purple",
  "description": "A deep purple theme inspired by moonlit nights",
  "author": "Amoena Community",
  "version": "1.0.0",
  "tags": ["dark", "purple", "minimal"],
  "base": "dark",
  "colors": {
    "background": "oklch(14% 0.03 280)",
    "foreground": "oklch(95% 0.01 280)",
    "primary": "oklch(70% 0.2 300)",
    "primaryForeground": "oklch(15% 0.02 300)",
    "secondary": "oklch(22% 0.03 280)",
    "secondaryForeground": "oklch(95% 0.01 280)",
    "accent": "oklch(65% 0.22 320)",
    "accentForeground": "oklch(95% 0.01 320)",
    "border": "oklch(28% 0.03 280)"
  },
  "radius": {
    "lg": "0.75rem"
  },
  "monacoTheme": "amoena-moonlight-purple",
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

---

## 5. Theme Editor UI Spec

The Theme Editor is a dedicated settings panel that allows users to create, modify, preview, and manage custom themes.

### 5.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Theme Editor                                    [X] Close  │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│  Theme Metadata      │         Live Preview                 │
│  ─────────────       │         ────────────                 │
│  Name: [________]    │  ┌──────────────────────────────┐   │
│  Base: [Light ▼]     │  │  Preview of a typical         │   │
│  Description: [___]  │  │  Amoena screen with the      │   │
│                      │  │  current token values applied  │   │
│  Color Tokens        │  │                                │   │
│  ────────────        │  │  ┌─────────┐ ┌─────────┐     │   │
│  Background  [■ ___] │  │  │ Button  │ │ Outline │     │   │
│  Foreground  [■ ___] │  │  └─────────┘ └─────────┘     │   │
│  Primary     [■ ___] │  │                                │   │
│  Secondary   [■ ___] │  │  Card with text and border    │   │
│  Accent      [■ ___] │  │  ┌────────────────────────┐   │   │
│  Muted       [■ ___] │  │  │ Input field             │   │   │
│  Destructive [■ ___] │  │  └────────────────────────┘   │   │
│  Success     [■ ___] │  │                                │   │
│  Warning     [■ ___] │  │  Monaco Editor preview        │   │
│  Info        [■ ___] │  │  ┌────────────────────────┐   │   │
│  Border      [■ ___] │  │  │ const x = 42;          │   │   │
│  Ring        [■ ___] │  │  │ // comment              │   │   │
│                      │  │  └────────────────────────┘   │   │
│  Typography          │  └──────────────────────────────┘   │
│  ──────────          │                                      │
│  Sans Font  [______] │                                      │
│  Mono Font  [______] │                                      │
│                      │                                      │
│  Border Radius       │                                      │
│  ─────────────       │                                      │
│  SM [0.25rem]        │                                      │
│  MD [0.375rem]       │                                      │
│  LG [0.5rem]         │                                      │
│  XL [0.75rem]        │                                      │
│                      │                                      │
├──────────────────────┴──────────────────────────────────────┤
│  [Reset to Default]  [Import JSON]  [Export JSON]  [Save]   │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Color Pickers

Each color token has a color picker component:

- **Swatch**: Small colored square showing current value
- **OKLCH Input**: Three numeric inputs for Lightness (0–100%), Chroma (0–0.4), Hue (0–360)
- **Hex Fallback**: Optional hex input that auto-converts to OKLCH
- **Contrast Checker**: Real-time WCAG contrast ratio display between foreground/background pairs
  - Shows ✅ AA (≥4.5:1 for normal text, ≥3:1 for large text)
  - Shows ⚠️ below AA threshold

### 5.3 Live Preview

The preview panel renders a representative set of UI components with the current token values applied in real-time:

- **Typography**: Heading, body text, muted text, link
- **Buttons**: Primary, secondary, outline, destructive, ghost variants
- **Card**: With header, content, and footer
- **Input**: Text input with label and placeholder
- **Badge/Chip**: Success, warning, error, info variants
- **Monaco Editor**: Small code snippet with syntax highlighting
- **Toast**: Example notification

Changes are applied instantly via CSS custom property updates — no re-render required.

### 5.4 Action Buttons

| Button | Action |
|--------|--------|
| **Reset to Default** | Removes all custom overrides, reverts to base light/dark theme |
| **Import JSON** | Opens file picker for `.amoena-theme.json` files, validates with Zod schema, applies |
| **Export JSON** | Generates theme JSON from current state, triggers download as `{theme-name}.amoena-theme.json` |
| **Save** | Persists theme to SQLite `themes` table and applies as active theme |

### 5.5 Theme Management

- **Theme List**: Sidebar or dropdown showing all saved themes (built-in + custom)
- **Duplicate**: Clone an existing theme as starting point for customization
- **Delete**: Remove custom themes (built-in themes cannot be deleted)
- **Set Active**: Apply a theme as the current active theme

---

## 6. Community Theme Sharing

### 6.1 Theme Packaging

Themes are packaged as single JSON files with the `.amoena-theme.json` extension:

```
moonlight-purple.amoena-theme.json
```

The file contains the complete `AmoenaTheme` object (Section 4.1). The `preview` field can contain a base64-encoded PNG screenshot (max 200KB) for visual browsing.

### 6.2 Sharing Mechanism

**Phase 1 (MVP)**: File-based sharing
- Export theme as `.amoena-theme.json` file
- Share via any file transfer method (email, Discord, GitHub Gist, etc.)
- Import via Theme Editor's "Import JSON" button
- Drag-and-drop `.amoena-theme.json` files onto the app window

**Phase 2 (V1)**: GitHub-based sharing
- Themes stored in a community GitHub repository (`amoena-themes`)
- Users submit themes via Pull Request
- App fetches theme index from GitHub API
- Browse and install themes from within the app

### 6.3 Future Marketplace Integration

**Phase 3 (V2)**: Integrated into the Unified Discovery Marketplace (see `marketplace-discovery.md`):

- Themes appear alongside plugins, skills, and MCP servers in the marketplace
- Theme registry entry format:

```typescript
interface ThemeRegistryEntry {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  preview: string;        // URL to screenshot
  downloadUrl: string;    // URL to .amoena-theme.json
  downloads: number;
  rating: number;         // 1-5 stars
  compatibility: string;  // Minimum Amoena version
}
```

- Search by name, tags, base mode (light/dark), color hue
- One-click install from marketplace
- Auto-update when theme author publishes new version
- Rating and review system

---

## 7. Component Library Spec

### 7.1 shadcn/ui Components

Amoena uses [shadcn/ui](https://ui.shadcn.com/) as the component foundation. Components are copied into the project (not installed as a dependency), allowing full customization.

#### MVP Components (Desktop App)

| Component | Source | Customization | Priority |
|-----------|--------|---------------|----------|
| Button | shadcn/ui | TUI-specific variants | P0 |
| Input | shadcn/ui | Monospace variant for code | P0 |
| Label | shadcn/ui | Standard | P0 |
| Card | shadcn/ui | Session card variant | P0 |
| Dialog | shadcn/ui | Standard | P0 |
| Dropdown Menu | shadcn/ui | Standard | P0 |
| Tabs | shadcn/ui | Session tabs variant | P0 |
| Scroll Area | shadcn/ui | Terminal scroll behavior | P0 |
| Tooltip | shadcn/ui | Standard | P0 |
| Badge | shadcn/ui | TUI status variants | P0 |
| Separator | shadcn/ui | Standard | P0 |
| Avatar | shadcn/ui | TUI icon variant | P0 |
| Command | shadcn/ui | Command palette (⌘K) | P0 |
| Toast | shadcn/ui | Notification variants | P0 |
| Select | shadcn/ui | Standard | P1 |
| Switch | shadcn/ui | Settings toggles | P1 |
| Slider | shadcn/ui | Volume, threshold controls | P1 |
| Progress | shadcn/ui | Token usage, cost tracking | P1 |
| Checkbox | shadcn/ui | Permission controls | P1 |
| Radio Group | shadcn/ui | Settings options | P1 |
| Textarea | shadcn/ui | Message input | P1 |
| Popover | shadcn/ui | Standard | P1 |
| Sheet | shadcn/ui | Mobile-style side panels | P1 |
| Accordion | shadcn/ui | Settings sections | P2 |
| Alert | shadcn/ui | System notifications | P2 |
| Alert Dialog | shadcn/ui | Destructive confirmations | P2 |
| Context Menu | shadcn/ui | Right-click menus | P2 |
| Resizable | shadcn/ui | Panel resizing | P2 |
| Table | shadcn/ui | Data display | P2 |
| Skeleton | shadcn/ui | Loading states | P2 |

#### Custom Components (Not from shadcn/ui)

| Component | Description | Priority |
|-----------|-------------|----------|
| SessionCard | TUI session with status, model, cost | P0 |
| TerminalView | PTY terminal output renderer | P0 |
| MessageBubble | Chat message with tool calls | P0 |
| FileTree | File browser with git status | P0 |
| DiffViewer | Monaco-based diff display | P0 |
| TuiStatusBar | Per-TUI connection status | P0 |
| CostTracker | Token usage and cost display | P1 |
| PermissionPrompt | Approve/deny tool execution | P0 |
| ThemeEditor | Custom theme creation (Section 5) | P1 |
| CommandPalette | Extended ⌘K with TUI commands | P0 |

### 7.2 Customization Approach

Components follow the **CVA (Class Variance Authority)** pattern for type-safe variants:

```typescript
// Example: Button with TUI-specific variants
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        // TUI-specific
        claude: 'bg-tui-claude text-white hover:bg-tui-claude/90',
        opencode: 'bg-tui-opencode text-white hover:bg-tui-opencode/90',
        codex: 'bg-tui-codex text-white hover:bg-tui-codex/90',
        gemini: 'bg-tui-gemini text-white hover:bg-tui-gemini/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

### 7.3 WCAG 2.1 AA Accessibility Requirements

All components MUST meet **WCAG 2.1 Level AA** compliance:

#### Color Contrast

| Requirement | Ratio | Applies To |
|-------------|-------|-----------|
| Normal text (< 18px) | ≥ 4.5:1 | Body text, labels, inputs |
| Large text (≥ 18px or ≥ 14px bold) | ≥ 3:1 | Headings, large buttons |
| UI components | ≥ 3:1 | Borders, icons, focus rings |
| Non-text contrast | ≥ 3:1 | Charts, graphs, indicators |

#### Keyboard Navigation

- All interactive elements must be focusable via Tab key
- Focus order must follow visual layout (logical tab order)
- Focus indicators must be visible (2px ring with `--color-ring`)
- Escape key must close modals, dropdowns, and popovers
- Arrow keys must navigate within composite widgets (tabs, menus, radio groups)

#### ARIA Requirements

- All form inputs must have associated labels (`<label>` or `aria-label`)
- Dynamic content changes must use `aria-live` regions
- Modal dialogs must trap focus and use `role="dialog"` with `aria-modal="true"`
- Loading states must use `aria-busy="true"`
- Error messages must be linked via `aria-describedby`
- Icon-only buttons must have `aria-label` or `sr-only` text

#### Motion & Animation

- Respect `prefers-reduced-motion` media query
- All animations must be disableable
- No content should flash more than 3 times per second

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

#### Testing Requirements

- Automated: axe-core integration in component tests
- Manual: Screen reader testing (VoiceOver on macOS, NVDA on Windows)
- Contrast: All color combinations validated against WCAG AA ratios
- Keyboard: Full app navigation without mouse

---

## 8. Cross-Platform Considerations

### 8.1 @lunaria/ui Platform Exports

The `@lunaria/ui` package uses conditional exports to serve platform-specific component implementations:

```
ui/src/components/
├── Button.tsx          # Shared logic, types, and props
├── Button.web.tsx      # Web/desktop implementation (Tailwind + Radix)
├── Button.native.tsx   # Mobile implementation (React Native via packages/ui-native)
├── Modal.tsx
├── Modal.web.tsx
├── Modal.native.tsx
└── ...
```

**Resolution strategy** (configured in bundler):
- **Desktop (Vite/Tauri)**: Resolves desktop-targeted shared components and uses Tailwind CSS classes
- **Mobile (future React Native)**: Resolves `.native.tsx` where a platform-specific implementation is required; uses packages/ui-native with NativeWind for styling

### 8.2 Shared Design Token Format

Design tokens must be consumable by both desktop CSS custom properties and mobile JavaScript objects:

**File**: `ui/src/theme/tokens.ts`

```typescript
// Platform-agnostic token definitions
export const tokens = {
  colors: {
    light: {
      background: 'oklch(100% 0 0)',
      foreground: 'oklch(15% 0.025 260)',
      primary: 'oklch(45% 0.2 260)',
      // ... all color tokens
    },
    dark: {
      background: 'oklch(13% 0.02 260)',
      foreground: 'oklch(98% 0.01 260)',
      primary: 'oklch(75% 0.15 260)',
      // ... all color tokens
    },
  },
  spacing: {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
  },
  typography: {
    fontSans: 'Inter Variable, Inter, system-ui, -apple-system, sans-serif',
    fontMono: 'JetBrains Mono Variable, JetBrains Mono, Fira Code, ui-monospace, monospace',
    sizes: {
      xs: { fontSize: 12, lineHeight: 16 },
      sm: { fontSize: 14, lineHeight: 20 },
      base: { fontSize: 16, lineHeight: 24 },
      lg: { fontSize: 18, lineHeight: 28 },
      xl: { fontSize: 20, lineHeight: 28 },
      '2xl': { fontSize: 24, lineHeight: 32 },
      '3xl': { fontSize: 30, lineHeight: 36 },
      '4xl': { fontSize: 36, lineHeight: 40 },
    },
  },
  radius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    full: 9999,
  },
} as const;
```

**Web consumer** (`ui/src/theme/tokens-web.ts`):

```typescript
import { tokens } from './tokens';

// Generate CSS custom properties from tokens
export function generateCSSVariables(mode: 'light' | 'dark'): string {
  const colors = tokens.colors[mode];
  return Object.entries(colors)
    .map(([key, value]) => `--color-${camelToKebab(key)}: ${value};`)
    .join('\n');
}
```

**Native consumer** (`ui/src/theme/tokens-native.ts`):

```typescript
import { tokens } from './tokens';
// Convert OKLCH to hex for mobile (OKLCH may not be supported in all contexts)
export function getNativeColors(mode: 'light' | 'dark') {
  const colors = tokens.colors[mode];
  return Object.fromEntries(
    Object.entries(colors).map(([key, oklch]) => [key, oklchToHex(oklch)])
  );
}

// Generate mobile-friendly spacing from tokens
export function createNativeSpacing() {
  return Object.fromEntries(
    Object.entries(tokens.spacing).map(([key, value]) => [
      `spacing${key}`,
      { padding: value },
    ])
  );
}
```

### 8.3 Token Build Pipeline

```
tokens.ts (source of truth)
    ├── → tokens-web.ts → CSS custom properties → Tailwind @theme
    ├── → tokens-native.ts → Mobile token objects
    └── → tokens.json → Design tool sync (Figma, etc.)
```

---

## 9. Monaco Editor Theming

### 9.1 Overview

Monaco Editor is used for code diffs, file editing, and code preview within Amoena. Its theme must stay synchronized with the app's active theme.

### 9.2 VS Code Theme → Monaco Theme Mapping

Monaco Editor uses a subset of VS Code's theme format. The mapping process:

```typescript
// ui/src/theme/monaco-theme.ts

interface MonacoThemeDefinition {
  base: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
  inherit: boolean;
  rules: Array<{
    token: string;
    foreground?: string;
    background?: string;
    fontStyle?: string;
  }>;
  colors: Record<string, string>;
}

// Map Amoena tokens to Monaco editor colors
function generateMonacoTheme(
  mode: 'light' | 'dark',
  colors: AmoenaTheme['colors']
): MonacoThemeDefinition {
  const base = mode === 'dark' ? 'vs-dark' : 'vs';

  return {
    base,
    inherit: true,
    rules: [
      { token: 'comment', foreground: toHex(colors.muted || defaults.muted), fontStyle: 'italic' },
      { token: 'keyword', foreground: toHex(colors.primary || defaults.primary) },
      { token: 'string', foreground: toHex(colors.success || defaults.success) },
      { token: 'number', foreground: toHex(colors.accent || defaults.accent) },
      { token: 'type', foreground: toHex(colors.info || defaults.info) },
      { token: 'function', foreground: toHex(colors.warning || defaults.warning) },
      { token: 'variable', foreground: toHex(colors.foreground || defaults.foreground) },
      { token: 'operator', foreground: toHex(colors.mutedForeground || defaults.mutedForeground) },
    ],
    colors: {
      'editor.background': toHex(colors.background || defaults.background),
      'editor.foreground': toHex(colors.foreground || defaults.foreground),
      'editor.lineHighlightBackground': toHex(colors.muted || defaults.muted),
      'editor.selectionBackground': toHexAlpha(colors.primary || defaults.primary, 0.3),
      'editor.inactiveSelectionBackground': toHexAlpha(colors.primary || defaults.primary, 0.15),
      'editorCursor.foreground': toHex(colors.primary || defaults.primary),
      'editorLineNumber.foreground': toHex(colors.mutedForeground || defaults.mutedForeground),
      'editorLineNumber.activeForeground': toHex(colors.foreground || defaults.foreground),
      'editorIndentGuide.background': toHex(colors.border || defaults.border),
      'editorIndentGuide.activeBackground': toHex(colors.mutedForeground || defaults.mutedForeground),
      'editorBracketMatch.background': toHexAlpha(colors.accent || defaults.accent, 0.2),
      'editorBracketMatch.border': toHex(colors.accent || defaults.accent),
      'editor.findMatchBackground': toHexAlpha(colors.warning || defaults.warning, 0.3),
      'editor.findMatchHighlightBackground': toHexAlpha(colors.warning || defaults.warning, 0.15),
      'editorWidget.background': toHex(colors.card || defaults.card),
      'editorWidget.border': toHex(colors.border || defaults.border),
      'editorSuggestWidget.background': toHex(colors.popover || defaults.popover),
      'editorSuggestWidget.border': toHex(colors.border || defaults.border),
      'editorSuggestWidget.selectedBackground': toHex(colors.accent || defaults.accent),
      'scrollbarSlider.background': toHexAlpha(colors.mutedForeground || defaults.mutedForeground, 0.2),
      'scrollbarSlider.hoverBackground': toHexAlpha(colors.mutedForeground || defaults.mutedForeground, 0.4),
      'scrollbarSlider.activeBackground': toHexAlpha(colors.mutedForeground || defaults.mutedForeground, 0.5),
    },
  };
}
```

### 9.3 Theme Registration and Switching

```typescript
import * as monaco from 'monaco-editor';

// Register Amoena themes with Monaco
function registerAmoenaMonacoThemes(): void {
  const lightTheme = generateMonacoTheme('light', defaultLightColors);
  const darkTheme = generateMonacoTheme('dark', defaultDarkColors);

  monaco.editor.defineTheme('amoena-light', lightTheme);
  monaco.editor.defineTheme('amoena-dark', darkTheme);
}

// Switch Monaco theme when app theme changes
function syncMonacoTheme(mode: 'light' | 'dark', customColors?: AmoenaTheme['colors']): void {
  if (customColors) {
    const customTheme = generateMonacoTheme(mode, customColors);
    monaco.editor.defineTheme('amoena-custom', customTheme);
    monaco.editor.setTheme('amoena-custom');
  } else {
    monaco.editor.setTheme(mode === 'dark' ? 'amoena-dark' : 'amoena-light');
  }
}
```

### 9.4 VS Code Theme Import

Users can import existing VS Code themes (`.json` files from VS Code extensions) for use in Monaco:

```typescript
// Convert VS Code theme JSON to Monaco theme definition
function importVSCodeTheme(vscodeTheme: VSCodeThemeJSON): MonacoThemeDefinition {
  const base = vscodeTheme.type === 'dark' ? 'vs-dark' : 'vs';

  return {
    base,
    inherit: true,
    rules: (vscodeTheme.tokenColors || []).flatMap((tc) => {
      const scopes = Array.isArray(tc.scope) ? tc.scope : [tc.scope];
      return scopes.map((scope) => ({
        token: mapVSCodeScopeToMonaco(scope),
        foreground: tc.settings.foreground?.replace('#', ''),
        fontStyle: tc.settings.fontStyle,
      }));
    }),
    colors: vscodeTheme.colors || {},
  };
}

// Scope mapping (VS Code TextMate scopes → Monaco token types)
const SCOPE_MAP: Record<string, string> = {
  'comment': 'comment',
  'comment.line': 'comment',
  'comment.block': 'comment',
  'keyword': 'keyword',
  'keyword.control': 'keyword',
  'storage.type': 'keyword',
  'string': 'string',
  'string.quoted': 'string',
  'constant.numeric': 'number',
  'entity.name.function': 'function',
  'entity.name.type': 'type',
  'variable': 'variable',
  'punctuation.definition': 'delimiter',
  'meta.tag': 'tag',
};
```

### 9.5 Diff Viewer Theming

The diff viewer (used for code review and file changes) inherits Monaco theming with additional tokens:

```typescript
const diffColors = {
  'diffEditor.insertedTextBackground': toHexAlpha(colors.success, 0.15),
  'diffEditor.removedTextBackground': toHexAlpha(colors.destructive, 0.15),
  'diffEditor.insertedLineBackground': toHexAlpha(colors.success, 0.08),
  'diffEditor.removedLineBackground': toHexAlpha(colors.destructive, 0.08),
  'diffEditorGutter.insertedLineBackground': toHexAlpha(colors.success, 0.3),
  'diffEditorGutter.removedLineBackground': toHexAlpha(colors.destructive, 0.3),
};
```

---

## 10. Terminal Theming (xterm.js)

### 10.1 Overview

Amoena embeds xterm.js for PTY terminal rendering within session workspaces. The xterm.js color palette must align with the Amoena design system, using the same OKLCH palette anchored to the brand magenta `#B800B8`.

### 10.2 xterm.js Token Mapping

xterm.js uses a 16-color ANSI palette plus foreground, background, cursor, and selection colors. All values are hex strings (OKLCH computed to hex at build time).

**File**: `ui/src/theme/xterm-theme.ts`

```typescript
import type { ITheme } from '@xterm/xterm';

// Light terminal theme
export const xtermLightTheme: ITheme = {
  background: '#FFFFFF',           // --color-background (light)
  foreground: '#1A0A1A',           // near-black with warm purple tint
  cursor: '#B800B8',               // brand magenta
  cursorAccent: '#FFFFFF',         // cursor text
  selectionBackground: 'rgba(184, 0, 184, 0.2)',   // primary/20
  selectionForeground: '#1A0A1A',
  selectionInactiveBackground: 'rgba(184, 0, 184, 0.1)',

  // Standard ANSI colors (light variant)
  black: '#1A0A1A',
  red: '#C0392B',
  green: '#006C2A',                // --color-accent
  yellow: '#B8860B',
  blue: '#6640D0',                 // --color-tui-codex / deep-purple
  magenta: '#B800B8',              // brand magenta
  cyan: '#006080',
  white: '#F5F0F5',

  // Bright ANSI colors
  brightBlack: '#5A4A5A',
  brightRed: '#E74C3C',
  brightGreen: '#00A040',
  brightYellow: '#DAA520',
  brightBlue: '#9E2DD6',           // --color-tui-opencode / purple
  brightMagenta: '#E066E0',        // magenta light variant
  brightCyan: '#0086B3',
  brightWhite: '#FFFFFF',
};

// Dark terminal theme
export const xtermDarkTheme: ITheme = {
  background: '#1A0D1A',           // near-match --color-background (dark) with magenta tint
  foreground: '#F5EFF5',           // near-white with warm tint
  cursor: '#E066E0',               // magenta light variant for dark bg
  cursorAccent: '#1A0D1A',
  selectionBackground: 'rgba(224, 102, 224, 0.25)',
  selectionForeground: '#F5EFF5',
  selectionInactiveBackground: 'rgba(224, 102, 224, 0.12)',

  // Standard ANSI colors (dark variant)
  black: '#1A0D1A',
  red: '#E74C3C',
  green: '#00A040',
  yellow: '#DAA520',
  blue: '#9E2DD6',                 // purple
  magenta: '#E066E0',              // bright magenta for dark bg
  cyan: '#0086B3',
  white: '#F5EFF5',

  // Bright ANSI colors
  brightBlack: '#6B5B6B',
  brightRed: '#FF6B6B',
  brightGreen: '#4CAF50',
  brightYellow: '#FFD700',
  brightBlue: '#B066FF',
  brightMagenta: '#F0A0F0',
  brightCyan: '#40C4FF',
  brightWhite: '#FFFFFF',
};
```

### 10.3 Theme Synchronization

xterm.js themes update whenever the app theme changes:

```typescript
// ui/src/theme/xterm-sync.ts
import { Terminal } from '@xterm/xterm';
import { xtermLightTheme, xtermDarkTheme } from './xterm-theme';

export function syncXtermTheme(terminal: Terminal, mode: 'light' | 'dark'): void {
  terminal.options.theme = mode === 'dark' ? xtermDarkTheme : xtermLightTheme;
}
```

Custom themes can supply `xtermTheme` overrides in their JSON (future schema v2 field). Until then the derived light/dark xterm themes are always used.

### 10.4 Font Configuration

xterm.js uses the same monospace font as the rest of the design system:

```typescript
const xtermOptions = {
  fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", "Fira Code", ui-monospace, monospace',
  fontSize: 13,
  lineHeight: 1.4,
  letterSpacing: 0,
  fontWeight: '400',
  fontWeightBold: '700',
  cursorBlink: true,
  cursorStyle: 'block',
  scrollback: 10000,
  smoothScrollDuration: 100,
};
```

---

## 11. Responsive Session Workspace

### 11.1 Layout Structure

The session workspace uses a three-zone layout with resizable and collapsible panels:

```
┌───────────────────────────────────────────────────────────────┐
│ Title Bar / Menu Bar                                          │
├──────────┬────────────────────────────────────┬──────────────┤
│          │                                    │              │
│ Session  │      Main Content Area             │  Side Panel  │
│ Sidebar  │   (timeline / terminal / diff)     │  (optional)  │
│          │                                    │              │
│          ├────────────────────────────────────┤              │
│          │  Collapsible Terminal              │              │
│          │  (xterm.js PTY output)             │              │
│          ├────────────────────────────────────┤              │
│          │  Dock Prompt (session composer)    │              │
└──────────┴────────────────────────────────────┴──────────────┘
         [Floating Command Palette via ⌘K — z-command layer]
```

### 11.2 Resizable Side Panel

The right-hand side panel is resizable and optional:

- **Default width**: 320px
- **Min width**: 240px
- **Max width**: 600px or 40% of window width, whichever is smaller
- **Persistence**: Width stored in user settings per workspace layout
- **Resize handle**: 4px wide, shows `--color-border` at rest, `--color-primary` on hover/drag
- **Collapse**: Single click on handle collapses to 0px with `--duration-slow` transition; icon remains visible in collapsed rail (32px wide)
- **Contents**: Observation timeline, workspace card, team status, or agent details depending on active session

```typescript
// Component token: side panel
--panel-side-width-default: 320px;
--panel-side-width-min: 240px;
--panel-side-width-max: 600px;
--panel-side-rail-width: 32px;
--panel-resize-handle-width: 4px;
```

### 11.3 Collapsible Terminal

The embedded xterm.js terminal is collapsible within the session workspace:

- **Default height**: 200px
- **Min height**: 80px (one visible line + gutter)
- **Max height**: 50% of available workspace height
- **Collapse trigger**: Chevron button in terminal header bar, or drag handle to 0
- **Collapsed state**: Header bar only (32px), shows last line of output as preview
- **Keyboard shortcut**: `⌘J` toggles terminal visibility (matches VS Code muscle memory)
- **Persistence**: Height and open/closed state stored per session
- **Transition**: `--duration-slow` with `--ease-out`

### 11.4 Floating Command Palette

The command palette (`⌘K`) floats above all content at `--z-command` (80):

- **Width**: 640px, centered horizontally
- **Position**: 20% from top of window
- **Backdrop**: `oklch(0% 0 0 / 0.4)` overlay at `--z-overlay` (40)
- **Animation**: `scale-in` + `fade-in` on open; `fade-out` on close
- **Dismiss**: `Escape` key, clicking backdrop, or selecting a result
- **Responsive**: On windows narrower than 720px, width becomes `calc(100vw - 32px)`

---

## 12. Amoena-Specific Component Specifications

Each component below follows the same structure: description, visual states, design tokens, responsive behavior, and accessibility notes.

---

### 12.1 dock-prompt

**Description**: The session composer dock anchored at the bottom of the main content area. Serves as the primary input surface for sending messages, attaching context, and triggering commands within an active session.

**Visual States**:
- `idle`: Single-line text input with placeholder "Message session…", attachment icon, send button (disabled)
- `typing`: Multi-line expansion (max 6 lines), send button enabled (primary color), character count near limit shown
- `streaming`: Input disabled, "Stop generation" button replaces send, pulsing border `--color-state-streaming`
- `thinking`: Input disabled, thinking animation (shimmer on border), "Cancel" button shown
- `permission-pending`: Input disabled, amber pulsing border `--color-state-permission-pending`, permission dock surfaced above
- `compacting`: Input disabled, brief "Compacting context…" overlay badge, `--color-state-compacting` tint

**Design Tokens**:
```
--dock-prompt-bg: var(--color-card)
--dock-prompt-border: var(--color-border)
--dock-prompt-border-radius: var(--radius-xl)
--dock-prompt-padding: var(--spacing-3) var(--spacing-4)
--dock-prompt-min-height: 52px
--dock-prompt-max-height: calc(var(--text-base) * 1.5 * 6 + var(--spacing-6))
--dock-prompt-shadow: var(--shadow-md)
--dock-prompt-streaming-border: var(--color-state-streaming)
--dock-prompt-thinking-border: var(--color-state-thinking)
--dock-prompt-permission-border: var(--color-state-permission-pending)
```

**Responsive Behavior**: Full width of main content area minus `--spacing-4` on each side. On narrow layouts (< 600px width), attachment controls collapse into a `+` overflow menu. Keyboard shortcut `⌘↵` sends; `Shift↵` inserts newline.

**Accessibility**:
- `role="textbox"` with `aria-multiline="true"` and `aria-label="Message session"`
- `aria-disabled="true"` in streaming/thinking/compacting states with `aria-describedby` pointing to status message
- Send button `aria-label="Send message"` when enabled, `aria-label="Stop generation"` in streaming state
- Focus returns to prompt automatically after permission resolution

---

### 12.2 session-turn

**Description**: A single message turn in the session conversation timeline. Renders user messages, assistant responses (with streaming support), system messages, and tool call groups. The fundamental repeating unit of the conversation UI.

**Visual States**:
- `user`: Right-aligned (desktop) or full-width bubble, `--color-secondary` background
- `assistant`: Left-aligned, transparent background, avatar badge showing TUI identity
- `assistant-streaming`: Blinking cursor at text end, `--animate-pulse-subtle` on avatar badge
- `assistant-thinking`: Collapsed "Thinking…" section with expandable reasoning, `--color-state-thinking` left border
- `tool-group`: Indented block containing one or more `tool-call-card` components
- `error`: `--color-destructive` left border, error icon, retry action

**Design Tokens**:
```
--turn-user-bg: var(--color-secondary)
--turn-user-radius: var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)
--turn-assistant-radius: var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)
--turn-gap: var(--spacing-4)
--turn-avatar-size: 28px
--turn-max-width: 80ch
--turn-thinking-border: var(--color-state-thinking)
--turn-streaming-cursor-color: var(--color-primary)
--turn-error-border: var(--color-destructive)
```

**Responsive Behavior**: On narrow layouts (< 600px), both user and assistant turns go full-width. Avatar shifts to top of turn rather than inline. Thinking section collapsed by default; tap to expand. Tool groups scroll horizontally if they overflow.

**Accessibility**:
- Each turn is a `<article>` with `aria-label="User message"` or `aria-label="Assistant response"`
- Streaming turns use `aria-live="polite"` on the content region
- Thinking section uses `<details>`/`<summary>` for native expand/collapse
- Time metadata shown on hover; always visible on reduced-motion

---

### 12.3 diff-changes

**Description**: A Monaco-based file diff viewer surfaced inline within session turns (for file edits) or in a dedicated diff panel. Shows added/removed lines with syntax highlighting aligned to the active Amoena theme.

**Visual States**:
- `inline`: Compact single-file diff embedded in a session turn, max 20 lines visible, "Show more" if truncated
- `expanded`: Full-height panel view with file path header, line counts, collapse button
- `side-by-side`: Split view (two Monaco instances) for complex diffs; toggled via toolbar button
- `loading`: Skeleton shimmer over Monaco container while diff computes

**Design Tokens**:
```
--diff-bg: var(--color-card)
--diff-border: var(--color-border)
--diff-radius: var(--radius-lg)
--diff-header-bg: var(--color-muted)
--diff-header-padding: var(--spacing-2) var(--spacing-3)
--diff-inserted-bg: color-mix(in oklab, var(--color-success) 8%, transparent)
--diff-removed-bg: color-mix(in oklab, var(--color-destructive) 8%, transparent)
--diff-inserted-gutter: color-mix(in oklab, var(--color-success) 30%, transparent)
--diff-removed-gutter: color-mix(in oklab, var(--color-destructive) 30%, transparent)
--diff-line-height: 19px
--diff-font-size: var(--text-sm)
```

**Responsive Behavior**: Side-by-side mode disabled below 900px window width; automatically switches to unified diff. Inline diffs cap at 10 visible lines on narrow layouts. Horizontal scroll enabled for long lines (no line wrapping in diff mode).

**Accessibility**:
- `role="region"` with `aria-label="File diff: {filename}"`
- Added lines announced as "added line {n}: {content}" to screen readers via visually-hidden text
- Removed lines announced as "removed line {n}: {content}"
- Keyboard: `Tab` focuses diff container; arrow keys scroll; `F` for fullscreen expand

---

### 12.4 tool-call-card

**Description**: An inline card displaying a single tool execution event within a session turn. Shows the tool name, input parameters, execution status, and output/result. Groups of tool calls appear in a `tool-group` container inside `session-turn`.

**Visual States**:
- `pending`: Tool name and inputs shown, spinner on right, `--color-state-agent-active` left border
- `success`: Green check icon, tool name, collapsed output (expandable), `--color-success` left border
- `error`: Red X icon, error message, `--color-destructive` left border
- `permission-required`: Amber warning icon, "Awaiting permission" label, inputs shown, `--color-state-permission-pending` left border
- `expanded`: Full input JSON and output/result visible

**Design Tokens**:
```
--tool-card-bg: var(--color-muted)
--tool-card-border: var(--color-border)
--tool-card-radius: var(--radius-md)
--tool-card-padding: var(--spacing-2) var(--spacing-3)
--tool-card-pending-border: var(--color-state-agent-active)
--tool-card-success-border: var(--color-success)
--tool-card-error-border: var(--color-destructive)
--tool-card-permission-border: var(--color-state-permission-pending)
--tool-card-font: var(--font-mono)
--tool-card-font-size: var(--text-xs)
```

**Responsive Behavior**: Full width within turn container. Input/output JSON uses a scrollable `<pre>` block capped at 200px height with overflow scroll. On narrow layouts, input label and value stack vertically.

**Accessibility**:
- `role="status"` during pending; switches to `role="article"` on completion
- `aria-label="Tool call: {toolName}, status: {status}"`
- Expand/collapse trigger is a `<button>` with `aria-expanded`
- Error details linked via `aria-describedby`

---

### 12.5 agent-badge

**Description**: A compact inline badge indicating the identity and current state of an agent (TUI, worker, or orchestrator). Used in session turn avatars, team status panels, and session tree nodes.

**Visual States**:
- `active`: TUI brand color fill, white text, pulsing glow `--animate-pulse-subtle`
- `idle`: Muted background `--color-state-agent-idle`, muted text
- `thinking`: Purple tint `--color-state-thinking`, shimmer animation
- `streaming`: Primary tint `--color-state-streaming`, blinking dot indicator
- `error`: `--color-destructive` fill
- `offline`: `--color-muted` fill, strikethrough or reduced opacity

**Design Tokens**:
```
--agent-badge-height: 20px
--agent-badge-padding: 0 var(--spacing-2)
--agent-badge-radius: var(--radius-full)
--agent-badge-font-size: var(--text-xs)
--agent-badge-font-weight: var(--font-weight-medium)
--agent-badge-active-bg: var(--color-state-agent-active)
--agent-badge-active-fg: var(--color-state-agent-active-fg)
--agent-badge-idle-bg: var(--color-state-agent-idle)
--agent-badge-idle-fg: var(--color-state-agent-idle-fg)
--agent-badge-thinking-bg: var(--color-state-thinking)
--agent-badge-streaming-bg: var(--color-state-streaming)
```

**Responsive Behavior**: Icon-only mode below 400px container width (hides label, preserves icon and color). Tooltip shows full agent name and state on hover/focus.

**Accessibility**:
- `role="status"` with `aria-label="{agentName}: {state}"`
- State changes announced via `aria-live="polite"` on parent container
- Color is not the sole differentiator — icon shape and label also indicate state

---

### 12.6 memory-card

**Description**: A card displaying a single memory observation from the agent's memory system. Used in the observation timeline and memory browser. Shows observation text, source agent, timestamp, and relevance score.

**Visual States**:
- `default`: Standard card, observation text, metadata footer
- `highlighted`: `--color-primary-100` background, used when observation is referenced by current turn
- `dimmed`: Reduced opacity (0.6), used for low-relevance observations in filtered views
- `loading`: Shimmer skeleton

**Design Tokens**:
```
--memory-card-bg: var(--color-card)
--memory-card-border: var(--color-border)
--memory-card-radius: var(--radius-lg)
--memory-card-padding: var(--spacing-3)
--memory-card-highlighted-bg: var(--color-primary-100)
--memory-card-highlighted-border: var(--color-primary)
--memory-card-meta-color: var(--color-muted-foreground)
--memory-card-meta-size: var(--text-xs)
--memory-card-text-size: var(--text-sm)
--memory-card-shadow: var(--shadow-xs)
```

**Responsive Behavior**: Full width within observation timeline or memory browser. Text truncated to 3 lines with "Read more" expand toggle. On narrow layouts, metadata row wraps to two lines.

**Accessibility**:
- `role="article"` with `aria-label="Memory observation from {agentName}"`
- Timestamp shown in `<time>` element with `datetime` attribute
- "Read more" is a `<button>` with `aria-expanded` and `aria-controls`

---

### 12.7 token-budget-bar

**Description**: A horizontal progress bar showing context window consumption (tokens used vs. total budget). Displayed in the session header or dock area. Changes color as the budget is consumed.

**Visual States**:
- `low` (0–50%): `--color-success` fill
- `medium` (51–75%): `--color-warning` fill
- `high` (76–90%): `oklch(65% 0.2 40)` (orange-red) fill
- `critical` (91–100%): `--color-destructive` fill, pulsing animation
- `compacting`: Striped animated fill `--color-state-compacting`, "Compacting…" label

**Design Tokens**:
```
--token-bar-height: 4px
--token-bar-radius: var(--radius-full)
--token-bar-bg: var(--color-muted)
--token-bar-low: var(--color-success)
--token-bar-medium: var(--color-warning)
--token-bar-high: oklch(65% 0.2 40)
--token-bar-critical: var(--color-destructive)
--token-bar-compacting: var(--color-state-compacting)
--token-bar-label-size: var(--text-xs)
--token-bar-label-color: var(--color-muted-foreground)
```

**Responsive Behavior**: Full width of its container. On hover, expands to 8px height with a tooltip showing exact token counts (used / total / percentage). Label text "12.3k / 200k tokens" shown to the right, truncated to "12k" on narrow layouts.

**Accessibility**:
- `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label="Context window usage"`
- `aria-valuetext="{used} of {total} tokens used ({percentage}%)"`
- Critical state announced via `aria-live="assertive"` when threshold crossed
- Color is not the sole indicator — text label always present

---

### 12.8 permission-dock

**Description**: A floating dock surfaced above the `dock-prompt` when a tool execution requires explicit user approval. Shows the tool name, requested action description, and allow/deny buttons. Blocks further input until resolved.

**Visual States**:
- `visible`: Slides up from bottom with `--animate-slide-in-up`, amber border `--color-state-permission-pending`
- `resolving`: Buttons disabled, brief spinner while tool executes
- `exiting`: Slides down `--animate-slide-in-down` reversed on resolution

**Design Tokens**:
```
--permission-dock-bg: var(--color-card)
--permission-dock-border: var(--color-state-permission-pending)
--permission-dock-border-width: 2px
--permission-dock-radius: var(--radius-xl)
--permission-dock-padding: var(--spacing-3) var(--spacing-4)
--permission-dock-shadow: var(--shadow-lg)
--permission-dock-z: var(--z-modal)
--permission-allow-bg: var(--color-success)
--permission-allow-fg: var(--color-success-foreground)
--permission-deny-bg: var(--color-destructive)
--permission-deny-fg: var(--color-destructive-foreground)
```

**Responsive Behavior**: Full width of main content area minus `--spacing-4` margins, same as `dock-prompt`. On very narrow layouts (< 480px), button labels shorten to "Allow" / "Deny" (already short; action description truncates to 2 lines).

**Accessibility**:
- `role="alertdialog"` with `aria-modal="true"` and `aria-label="Permission required: {toolName}"`
- Focus trapped within dock; `Tab` cycles between allow and deny
- `Escape` resolves as deny
- Announced immediately via `aria-live="assertive"` on appearance

---

### 12.9 session-tree

**Description**: A sidebar component displaying the hierarchical tree of sessions, worktrees, and sub-agents. Supports expand/collapse of session groups and indicates live session state via `agent-badge` indicators.

**Visual States**:
- `idle`: Standard tree with muted icons, session names, timestamps
- `active-session-highlighted`: Active session row uses `--color-primary-100` background, primary text color
- `dragging`: Drag-to-reorder ghost with `--shadow-md`, drop target highlighted with `--color-primary` border
- `search-filtered`: Non-matching nodes dimmed, matching nodes highlighted

**Design Tokens**:
```
--tree-bg: var(--color-background)
--tree-item-height: 32px
--tree-item-padding: 0 var(--spacing-3)
--tree-item-indent: var(--spacing-4)
--tree-item-hover-bg: var(--color-muted)
--tree-item-active-bg: var(--color-primary-100)
--tree-item-active-fg: var(--color-primary)
--tree-item-radius: var(--radius-md)
--tree-icon-size: 16px
--tree-icon-color: var(--color-muted-foreground)
--tree-font-size: var(--text-sm)
```

**Responsive Behavior**: Occupies the fixed-width left sidebar (240px default, collapsible to 0 via rail toggle). On narrow windows (< 800px), the session tree collapses to a rail by default. Drag-to-reorder disabled on touch/narrow layouts; replaced with long-press context menu with move options.

**Accessibility**:
- `role="tree"` on root; `role="treeitem"` on each node; `role="group"` on child lists
- `aria-expanded` on expandable nodes; `aria-selected` on active session
- `aria-level` for hierarchy depth
- Arrow keys navigate (up/down moves between nodes; right expands; left collapses or moves to parent)

---

### 12.10 team-status

**Description**: A panel or popover displaying the current status of an agent team — showing each agent's identity, role, current task, and state. Used in the session workspace when a multi-agent orchestration (team/ultrawork) is running.

**Visual States**:
- `running`: Each agent row shows `agent-badge` in active/streaming/thinking state
- `waiting`: Agents in queue shown with idle badge and "Waiting for task" label
- `complete`: All agents show success state, summary metrics visible
- `failed`: Failing agent shown with error badge, error details expandable
- `collapsed`: Summary only — "N agents active" with aggregate progress ring

**Design Tokens**:
```
--team-status-bg: var(--color-card)
--team-status-border: var(--color-border)
--team-status-radius: var(--radius-xl)
--team-status-padding: var(--spacing-4)
--team-status-agent-row-height: 40px
--team-status-agent-gap: var(--spacing-2)
--team-status-progress-color: var(--color-state-agent-active)
--team-status-complete-color: var(--color-success)
--team-status-failed-color: var(--color-destructive)
--team-status-shadow: var(--shadow-sm)
```

**Responsive Behavior**: Shown in the collapsible side panel (Section 11.2). When side panel is collapsed, a compact `agent-badge` cluster appears in the session header showing N-agent count and aggregate state. Full team status accessible via popover on click.

**Accessibility**:
- `role="region"` with `aria-label="Team status"`
- Each agent row is a `<li>` in a `<ul>` with `aria-label="{agentName}: {role}, {state}"`
- State changes announced via `aria-live="polite"`
- Collapsed summary: `aria-label="{N} agents active"` with expand button

---

### 12.11 observation-timeline

**Description**: A chronological feed of memory observations, tool calls, and agent events within the session side panel. Provides a temporal audit trail of what the agent observed and acted on.

**Visual States**:
- `default`: Vertical list of `memory-card` and `tool-call-card` entries, newest at bottom
- `live`: Auto-scrolls to bottom as new observations arrive; "Pause scroll" button appears on manual scroll
- `paused`: Scroll paused, "Resume" button with new-event count badge
- `filtered`: Only observations matching active filter tags shown; non-matching entries hidden with count summary

**Design Tokens**:
```
--obs-timeline-bg: var(--color-background)
--obs-timeline-padding: var(--spacing-3)
--obs-timeline-gap: var(--spacing-2)
--obs-timeline-live-indicator: var(--color-state-streaming)
--obs-timeline-pause-btn-bg: var(--color-card)
--obs-timeline-pause-btn-border: var(--color-border)
--obs-timeline-filter-bar-bg: var(--color-muted)
--obs-timeline-filter-bar-height: 36px
```

**Responsive Behavior**: Full height of the side panel minus filter bar. Auto-scroll uses `scroll-behavior: smooth` (disabled with `prefers-reduced-motion`). Filter bar collapses to icon-only on narrow side-panel widths (< 260px).

**Accessibility**:
- `role="feed"` on the timeline list for screen reader compatibility
- New entries announced via `aria-live="polite"` unless paused
- Filter controls use `role="toolbar"` with `aria-label="Filter observations"`
- "Pause scroll" button has `aria-pressed` attribute

---

### 12.12 workspace-card

**Description**: A card displaying a Copy-on-Write (CoW) workspace associated with a session. Shows workspace path, git branch, dirty file count, and quick actions (open in Finder/Explorer, copy path).

**Visual States**:
- `clean`: Green status dot, "No changes" label
- `dirty`: Amber status dot, "{N} files changed" label
- `syncing`: Spinner, "Syncing…" label
- `error`: Red status dot, error message

**Design Tokens**:
```
--workspace-card-bg: var(--color-card)
--workspace-card-border: var(--color-border)
--workspace-card-radius: var(--radius-lg)
--workspace-card-padding: var(--spacing-3)
--workspace-card-clean-dot: var(--color-success)
--workspace-card-dirty-dot: var(--color-warning)
--workspace-card-error-dot: var(--color-destructive)
--workspace-card-path-font: var(--font-mono)
--workspace-card-path-size: var(--text-xs)
--workspace-card-shadow: var(--shadow-xs)
```

**Responsive Behavior**: Full width within side panel. Path truncates from the left (shows filename end) on narrow widths. Action buttons (open, copy) collapse into a `…` overflow menu below 280px card width.

**Accessibility**:
- `role="article"` with `aria-label="Workspace: {path}"`
- Status dot uses `role="img"` with `aria-label="{status} workspace"`
- Path shown in `<code>` element; copy button `aria-label="Copy workspace path"`

---

### 12.13 autopilot-story-card

**Description**: A card representing a single user story within an autopilot execution plan. Displayed in the autopilot progress view. Shows story title, acceptance criteria, current status, and assigned agent.

**Visual States**:
- `pending`: Muted background, lock icon, "Waiting" label
- `in-progress`: `--color-state-agent-active` left border, progress ring, assigned `agent-badge`
- `review`: `--color-warning` left border, "Needs review" label
- `complete`: `--color-success` left border, checkmark icon
- `failed`: `--color-destructive` left border, error icon, retry button

**Design Tokens**:
```
--story-card-bg: var(--color-card)
--story-card-border: var(--color-border)
--story-card-radius: var(--radius-lg)
--story-card-padding: var(--spacing-4)
--story-card-pending-border: var(--color-border)
--story-card-active-border: var(--color-state-agent-active)
--story-card-review-border: var(--color-warning)
--story-card-complete-border: var(--color-success)
--story-card-failed-border: var(--color-destructive)
--story-card-title-size: var(--text-sm)
--story-card-title-weight: var(--font-weight-semibold)
--story-card-meta-size: var(--text-xs)
--story-card-meta-color: var(--color-muted-foreground)
--story-card-shadow: var(--shadow-sm)
```

**Responsive Behavior**: Full width in the autopilot progress panel. Acceptance criteria truncated to 2 items on card; expandable via "Show all" toggle. On narrow layouts, agent badge moves below the title rather than inline-right.

**Accessibility**:
- `role="article"` with `aria-label="Story: {title}, status: {status}"`
- Status change announced via `aria-live="polite"` on the story list container
- Retry button `aria-label="Retry story: {title}"`

---

### 12.14 opinion-comparison

**Description**: A side-by-side or stacked layout for comparing responses from two or more models (CCG / multi-model fan-out). Each pane shows model identity, response content, and a selection action.

**Visual States**:
- `loading`: Skeleton shimmer in each pane while responses stream in
- `streaming`: Each pane shows streaming content independently with per-model streaming indicator
- `complete`: Full responses shown, "Use this response" button in each pane footer
- `selected`: Selected pane gets `--color-primary` border; others dimmed to 0.7 opacity

**Design Tokens**:
```
--opinion-pane-bg: var(--color-card)
--opinion-pane-border: var(--color-border)
--opinion-pane-radius: var(--radius-xl)
--opinion-pane-padding: var(--spacing-4)
--opinion-pane-selected-border: var(--color-primary)
--opinion-pane-selected-shadow: 0 0 0 2px var(--color-primary)
--opinion-pane-dimmed-opacity: 0.7
--opinion-pane-header-bg: var(--color-muted)
--opinion-pane-gap: var(--spacing-4)
--opinion-use-btn-bg: var(--color-primary)
--opinion-use-btn-fg: var(--color-primary-foreground)
```

**Responsive Behavior**: Two panes side-by-side at ≥ 800px; stacked vertically at < 800px. Three or more panes always stack vertically. Each pane is independently scrollable. On narrow layout, "Use this response" sticks to bottom of each pane.

**Accessibility**:
- `role="region"` with `aria-label="Model response comparison"`
- Each pane is `role="article"` with `aria-label="{modelName} response"`
- Selected state: `aria-pressed="true"` on the "Use this response" button
- Keyboard: `Tab` navigates between panes; `Enter`/`Space` on "Use this" selects

---

### 12.15 visual-selector-overlay

**Description**: An overlay rendered on top of the embedded preview browser (for UI generation workflows). Allows users to click elements to select them for inspection, editing, or reference in a prompt. Selected element is highlighted with a bounding box.

**Visual States**:
- `inactive`: No overlay; preview browser renders normally
- `active`: Hover state shows blue bounding box on hovered element; cursor changes to crosshair
- `selected`: Magenta bounding box `#B800B8` on selected element, info panel shows element selector/path
- `multi-select`: Multiple elements selected, each with numbered bounding box

**Design Tokens**:
```
--selector-hover-box: oklch(55% 0.15 260)        /* blue */
--selector-hover-box-alpha: 0.5
--selector-selected-box: #B800B8                  /* brand magenta */
--selector-selected-box-width: 2px
--selector-selected-label-bg: #B800B8
--selector-selected-label-fg: #FFFFFF
--selector-multi-box-colors: #B800B8, #6640D0, #9E2DD6, #B5008B
--selector-overlay-cursor: crosshair
--selector-info-panel-bg: var(--color-card)
--selector-info-panel-border: var(--color-border)
--selector-info-panel-shadow: var(--shadow-lg)
--selector-info-panel-z: var(--z-popover)
```

**Responsive Behavior**: Overlay occupies the full bounds of the preview browser iframe/webview. Info panel anchors to the bottom of the selected element bounding box, flipping above if below the fold. On touch, tap-to-select replaces hover; long-press for multi-select.

**Accessibility**:
- Overlay mode announced via `aria-live="assertive"`: "Element selection mode active"
- Selected element path shown in `aria-label` of info panel
- `Escape` deactivates overlay and returns to normal preview
- Keyboard: `Tab` to cycle between visible interactive elements; `Enter` to select

---

### 12.16 remote-qr-code

**Description**: A QR code display for pairing a mobile device to the current Amoena session. Used in the remote control / remote pairing flow.

**Visual States**:
- `generating`: Spinner placeholder while QR code URL generates
- `active`: QR code shown with session URL encoded, countdown timer showing expiry
- `expired`: QR code grayed out, "Expired — Regenerate" button
- `paired`: Success state, device name shown, "Disconnect" button

**Design Tokens**:
```
--qr-code-size: 200px
--qr-code-bg: #FFFFFF          /* always white for QR readability */
--qr-code-fg: #000000          /* always black */
--qr-code-padding: var(--spacing-4)
--qr-code-border: var(--color-border)
--qr-code-radius: var(--radius-xl)
--qr-code-shadow: var(--shadow-md)
--qr-code-expired-opacity: 0.4
--qr-code-timer-color: var(--color-muted-foreground)
--qr-code-timer-critical-color: var(--color-destructive)
--qr-code-paired-border: var(--color-success)
```

**Responsive Behavior**: Fixed 200×200px QR image regardless of layout; surrounding container may vary. On small modals (< 280px), QR code scales down to 160px. Always preserves 1:1 aspect ratio.

**Accessibility**:
- QR code `<img>` has `alt="QR code for remote pairing. URL: {url}"`
- Countdown timer uses `aria-live="polite"` for periodic updates (every 30s)
- When expired: `aria-live="assertive"` announces "QR code expired"
- Regenerate and Disconnect buttons have descriptive `aria-label`

---

### 12.17 provider-status-badge

**Description**: A small badge indicating the authentication and connectivity status of an AI provider (Claude, OpenAI, Gemini, etc.). Shown in the settings sidebar, session header, and provider management panel.

**Visual States**:
- `authenticated`: Green dot + "Connected" label
- `unauthenticated`: Red dot + "Not configured" label + "Configure" link
- `error`: Red dot + short error message (e.g., "Invalid API key")
- `checking`: Spinner + "Checking…" label
- `rate-limited`: Amber dot + "Rate limited" label, retry countdown

**Design Tokens**:
```
--provider-badge-height: 22px
--provider-badge-padding: 0 var(--spacing-2)
--provider-badge-radius: var(--radius-full)
--provider-badge-font-size: var(--text-xs)
--provider-badge-authenticated-bg: color-mix(in oklab, var(--color-success) 15%, transparent)
--provider-badge-authenticated-fg: var(--color-success)
--provider-badge-unauth-bg: color-mix(in oklab, var(--color-destructive) 12%, transparent)
--provider-badge-unauth-fg: var(--color-destructive)
--provider-badge-error-bg: color-mix(in oklab, var(--color-destructive) 15%, transparent)
--provider-badge-error-fg: var(--color-destructive)
--provider-badge-rate-bg: color-mix(in oklab, var(--color-warning) 15%, transparent)
--provider-badge-rate-fg: var(--color-warning)
--provider-badge-dot-size: 6px
```

**Responsive Behavior**: Icon-only mode (dot only, no label) below 200px container width. Full label shown at wider widths. Tooltip always shows full status + error detail on hover/focus.

**Accessibility**:
- `role="status"` with `aria-label="{providerName}: {status}"`
- Status changes announced via `aria-live="polite"` in parent container
- Dot uses `aria-hidden="true"`; status meaning conveyed by label and `aria-label`

---

### 12.18 mode-selector

**Description**: A toggle control for switching between Amoena operating modes — wrapper mode (GUI wrapping an existing TUI) vs. native mode (Amoena's own agent runtime). Shown in session creation and settings.

**Visual States**:
- `wrapper-active`: Left option highlighted with `--color-primary`, native option muted
- `native-active`: Right option highlighted with `--color-primary`, wrapper option muted
- `disabled`: Both options muted, tooltip explains why switching is unavailable
- `hover-wrapper` / `hover-native`: Preview description shown below selector on hover

**Design Tokens**:
```
--mode-selector-bg: var(--color-muted)
--mode-selector-radius: var(--radius-lg)
--mode-selector-padding: var(--spacing-1)
--mode-selector-option-height: 36px
--mode-selector-option-padding: 0 var(--spacing-4)
--mode-selector-option-radius: var(--radius-md)
--mode-selector-active-bg: var(--color-card)
--mode-selector-active-fg: var(--color-primary)
--mode-selector-active-shadow: var(--shadow-sm)
--mode-selector-inactive-fg: var(--color-muted-foreground)
--mode-selector-transition: background-color var(--duration-fast) var(--ease-default)
--mode-selector-description-size: var(--text-xs)
--mode-selector-description-color: var(--color-muted-foreground)
```

**Responsive Behavior**: Full width of its containing form group. Option labels shorten to "Wrapper" / "Native" below 320px (from "Wrapper Mode" / "Native Mode"). Description text below selector hidden below 480px.

**Accessibility**:
- Implemented as `role="radiogroup"` with `aria-label="Operating mode"`
- Each option is `role="radio"` with `aria-checked`
- `aria-disabled` and `aria-describedby` pointing to disabled reason when locked
- Arrow keys switch between options (left/right or up/down)

---

## 13. Cross-References

- [See: `monorepo-structure.md`] — workspace/package layout for `@lunaria/ui`
- [See: `data-model.md#json-configuration`] — Theme storage in SQLite and JSON config
- [See: `ui-screens.md`] — Screen inventory referencing these components (Task 13)
- [See: `marketplace-discovery.md`] — Theme marketplace integration (Task 11)
- [See: `plugin-framework.md`] — Plugin UI components and theme access (Task 7)
- [See: `remote-control-protocol.md`] — Remote pairing QR code flow
- [See: `agent-backend-interface.md`] — TUI identity tokens and brand colors

---

## Appendix A: Built-in Themes

Amoena ships with the following built-in themes:

| Theme | Base | Description |
|-------|------|-------------|
| **Amoena Light** | light | Default light theme — clean, professional |
| **Amoena Dark** | dark | Default dark theme — easy on the eyes |
| **High Contrast Light** | light | WCAG AAA compliant, maximum contrast |
| **High Contrast Dark** | dark | WCAG AAA compliant, maximum contrast |

## Appendix B: Color Utility Functions

```typescript
// ui/src/theme/color-utils.ts

/** Convert OKLCH string to hex for Monaco and non-OKLCH contexts */
export function oklchToHex(oklch: string): string { /* implementation */ }

/** Convert hex to OKLCH for theme import */
export function hexToOklch(hex: string): string { /* implementation */ }

/** Calculate WCAG contrast ratio between two OKLCH colors */
export function contrastRatio(color1: string, color2: string): number { /* implementation */ }

/** Check if contrast meets WCAG AA for given text size */
export function meetsWCAGAA(fg: string, bg: string, isLargeText: boolean): boolean {
  const ratio = contrastRatio(fg, bg);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/** Generate semi-transparent variant using color-mix */
export function withAlpha(color: string, alpha: number): string {
  return `color-mix(in oklab, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}
```

## Appendix C: State Token Quick Reference

| State | Token Prefix | Primary Use |
|-------|-------------|-------------|
| streaming | `--color-state-streaming` | Active token generation in progress |
| thinking | `--color-state-thinking` | Extended reasoning / plan mode active |
| permission-pending | `--color-state-permission-pending` | Tool requires user approval |
| agent-active | `--color-state-agent-active` | Agent executing a task |
| agent-idle | `--color-state-agent-idle` | Agent connected but not running |
| compacting | `--color-state-compacting` | Context window compaction running |

## Appendix D: Component Token Index

| Component | Token Namespace | Section |
|-----------|----------------|---------|
| dock-prompt | `--dock-prompt-*` | 12.1 |
| session-turn | `--turn-*` | 12.2 |
| diff-changes | `--diff-*` | 12.3 |
| tool-call-card | `--tool-card-*` | 12.4 |
| agent-badge | `--agent-badge-*` | 12.5 |
| memory-card | `--memory-card-*` | 12.6 |
| token-budget-bar | `--token-bar-*` | 12.7 |
| permission-dock | `--permission-dock-*` | 12.8 |
| session-tree | `--tree-*` | 12.9 |
| team-status | `--team-status-*` | 12.10 |
| observation-timeline | `--obs-timeline-*` | 12.11 |
| workspace-card | `--workspace-card-*` | 12.12 |
| autopilot-story-card | `--story-card-*` | 12.13 |
| opinion-comparison | `--opinion-pane-*` | 12.14 |
| visual-selector-overlay | `--selector-*` | 12.15 |
| remote-qr-code | `--qr-code-*` | 12.16 |
| provider-status-badge | `--provider-badge-*` | 12.17 |
| mode-selector | `--mode-selector-*` | 12.18 |
| side panel | `--panel-side-*` | 11.2 |
