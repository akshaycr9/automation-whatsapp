# Design CSS Audit

This audit covers the uploaded `styles.css` export from Cloud Design for QW Automations.

## Extracted as Tokens

The top-level design token block was extracted into `apps/web/src/styles/index.css`:

- Light and dark color variables
- Semantic text, surface, border, brand, and status color tokens
- Typography stack for sans and mono fonts
- Base font size and line height
- Radius scale
- Shadow scale
- Sidebar, header, and mobile navigation sizes
- Global focus-visible outline
- Base element defaults for `html`, `body`, `button`, `input`, `textarea`, `select`, and `a`

The extracted values keep the exact color, radius, shadow, and layout measurements from the reference token block.

## Ignored for Now

Generated component and screen classes were intentionally not copied, including:

- Button, input, card, badge, tab, and toggle class implementations
- Application layout classes
- Conversation shell classes
- KPI, automation, settings, log, and dashboard classes
- Any monolithic classes tied to exported HTML structure

These classes are useful visual references, but they are not the React source of truth.

## Why Generated Classes Should Not Be Copied

Generated screen and component CSS tends to couple visual styling to a static HTML export. Copying it directly would make the React app harder to maintain, test, theme, and evolve. It would also bypass the project architecture rules that keep pages thin, components focused, and reusable UI primitives composable.

The app should instead use semantic tokens, Tailwind v4 classes, small reusable components, and feature-level containers/hooks.

## Rebuilding in React

React components should be rebuilt using the project structure:

- Page components remain thin.
- Containers and hooks handle orchestration, data fetching, mutations, permissions, and side effects.
- Presentational components receive props and render UI.
- Shared UI primitives use token-backed Tailwind classes.
- Mobile behavior is implemented intentionally, especially for tables and conversations.

Future UI work may reference the Cloud Design export for spacing, hierarchy, and tone, but implementation should be native to the QW Automations React codebase.
