# Accessibility

## Target

WCAG 2.1 Level AA compliance for all interactive UI surfaces.

## Keyboard Navigation

| Context | Keys | Behavior |
|---------|------|----------|
| Global | Cmd+K | Open command palette |
| Session list | Arrow keys | Navigate sessions |
| Session list | Enter | Open selected session |
| Composer | Enter | Send message |
| Composer | Shift+Enter | New line |
| Composer | Tab/Shift+Tab | Switch agent (V1.5+) |
| Permission prompt | Enter | Approve |
| Permission prompt | Escape | Deny |
| File tree | Arrow keys | Navigate files |
| File tree | Enter | Open file |
| Terminal | Standard terminal keys | Pass-through to xterm.js |

All interactive elements must be reachable via Tab navigation. Focus traps are used for modals and dialogs.

## Screen Reader Support

- All interactive elements have accessible names (via `aria-label` or visible text).
- Radix UI primitives provide built-in ARIA roles and attributes.
- Dynamic content updates use `aria-live` regions:
  - Token streaming: `aria-live="polite"` (announces completion, not individual tokens)
  - Error messages: `aria-live="assertive"`
  - Status changes: `aria-live="polite"`

## Color and Contrast

- OKLCH palette ensures consistent perceptual contrast.
- All text meets 4.5:1 contrast ratio (AA standard).
- Large text (18px+) meets 3:1 contrast ratio.
- Interactive elements have visible focus indicators (2px ring, contrasting color).
- Color is never the sole indicator of state — always paired with text or icon.

## Motion and Animation

- Respect `prefers-reduced-motion` media query.
- All animations can be disabled globally in Settings.
- No auto-playing animations that last more than 5 seconds.

## Testing

- Run `@storybook/addon-a11y` (already installed) on all components.
- Automated axe-core checks in CI for Storybook builds.
- Manual screen reader testing with VoiceOver (macOS) before each release.

## Non-Goals (MVP)

- Full internationalization (English only for MVP — see `docs/architecture/internationalization.md`)
- Mobile-specific accessibility (deferred to V2.0 with React Native)
