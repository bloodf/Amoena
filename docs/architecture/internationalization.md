# Internationalization

## Current State

Lunaria is English-only for MVP through V1.5. Internationalization (i18n) is planned for V2.0+.

## Preparation (All Phases)

Even before full i18n, follow these practices to avoid costly rewrites later:

1. **No hardcoded user-facing strings** in components. Use a constants file or string map.
2. **Use `Intl` APIs** for date/number/currency formatting (already available in all target platforms).
3. **Support Unicode** in all text fields — names, file paths, search queries.
4. **RTL-aware layout:** Use logical CSS properties (`margin-inline-start` instead of `margin-left`) where practical.

## V2.0+ Plan

| Layer | Tool | Notes |
|-------|------|-------|
| String extraction | `react-intl` or `i18next` | TBD — evaluate during V1.5 |
| Translation files | JSON per locale | Stored in `packages/ui/locales/` |
| Date/time | `date-fns` locale support | Already using date-fns |
| LLM interaction | Always English | Model prompts and tool schemas remain English |

## Non-Goals

- Translating AI model output (user controls model language via system prompts)
- Translating documentation (English only)
- Translating CLI output (desktop-first product)
