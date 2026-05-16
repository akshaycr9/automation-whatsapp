# Design System

QW Automations uses semantic CSS variables and Tailwind CSS v4 theme tokens as the source of truth for UI styling.

The Cloud Design generated CSS is a visual/token reference only. Generated layout classes and monolithic component CSS should not be copied directly into React components.

## Color Palette

| Token           | Light     | Dark                      |
| --------------- | --------- | ------------------------- |
| `background`    | `#f8fafc` | `#0b1220`                 |
| `surface`       | `#ffffff` | `#111827`                 |
| `surface-2`     | `#f1f5f9` | `#1a2235`                 |
| `text`          | `#111827` | `#f9fafb`                 |
| `text-muted`    | `#6b7280` | `#9ca3af`                 |
| `text-subtle`   | `#9ca3af` | `#6b7280`                 |
| `border`        | `#e5e7eb` | `#1f2937`                 |
| `border-strong` | `#d1d5db` | `#2a3445`                 |
| `brand`         | `#22c55e` | inherited                 |
| `brand-hover`   | `#16a34a` | inherited                 |
| `brand-soft`    | `#dcfce7` | `rgba(34, 197, 94, 0.14)` |
| `brand-soft-2`  | `#ecfdf5` | `rgba(34, 197, 94, 0.08)` |
| `dark-accent`   | `#0f172a` | inherited                 |

## Status Colors

| Token          | Light     | Dark                       |
| -------------- | --------- | -------------------------- |
| `success`      | `#22c55e` | inherited                  |
| `success-soft` | `#dcfce7` | `rgba(34, 197, 94, 0.16)`  |
| `warning`      | `#f59e0b` | inherited                  |
| `warning-soft` | `#fef3c7` | `rgba(245, 158, 11, 0.16)` |
| `error`        | `#ef4444` | inherited                  |
| `error-soft`   | `#fee2e2` | `rgba(239, 68, 68, 0.16)`  |
| `info`         | `#3b82f6` | inherited                  |
| `info-soft`    | `#dbeafe` | `rgba(59, 130, 246, 0.16)` |

## Typography

- Sans font: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`
- Mono font: `JetBrains Mono`, `ui-monospace`, `SFMono-Regular`, `Menlo`, `monospace`
- Base size: `14px`
- Base line height: `1.5`
- Font smoothing and optimized text rendering are set globally on `html`.

## Spacing and Layout Tokens

- Sidebar width: `232px`
- Header height: `60px`
- Mobile nav height: `64px`

Tailwind token aliases:

- `w-sidebar`, `min-w-sidebar`, `max-w-sidebar`
- `h-header`, `min-h-header`
- `h-mobile-nav`, `min-h-mobile-nav`

## Radius

- `radius-sm`: `6px`
- `radius-md`: `10px`
- `radius-lg`: `14px`
- `radius-xl`: `18px`

Use Tailwind classes such as `rounded-sm`, `rounded-md`, `rounded-lg`, and `rounded-xl` when the component shape maps to these tokens.

## Shadows

- `shadow-sm`: `0 1px 2px rgba(15, 23, 42, 0.04)`
- `shadow-md`: `0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)`
- `shadow-lg`: `0 10px 24px -8px rgba(15, 23, 42, 0.12), 0 4px 10px -4px rgba(15, 23, 42, 0.06)`
- `shadow-pop`: `0 18px 40px -12px rgba(15, 23, 42, 0.18)`

Dark mode overrides `shadow-sm`, `shadow-md`, and `shadow-lg` with the Cloud Design values. `shadow-pop` currently inherits from the light token because the reference file did not define a dark override.

## Dark Mode Strategy

Dark mode is controlled by `[data-theme="dark"]`. Components should use semantic tokens rather than hardcoded colors so theme changes remain centralized.

## Tailwind Token Names

Use Tailwind classes backed by these tokens:

- Colors: `bg-background`, `bg-surface`, `bg-surface-2`, `text-text`, `text-text-muted`, `text-text-subtle`, `border-border`, `border-border-strong`, `bg-brand`, `hover:bg-brand-hover`, `bg-brand-soft`
- Status colors: `text-success`, `bg-success-soft`, `text-warning`, `bg-warning-soft`, `text-error`, `bg-error-soft`, `text-info`, `bg-info-soft`
- Fonts: `font-sans`, `font-mono`
- Radius: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`
- Shadows: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-pop`

## Component Rules

- Do not hardcode colors inside React components.
- Prefer semantic Tailwind classes backed by these tokens.
- Keep component classes small and composable.
- Build screen layouts in React using the project feature/component architecture.
- Do not copy generated screen classes such as `.app-shell`, `.convo-shell`, `.kpi-grid`, or `.auto-card`.
