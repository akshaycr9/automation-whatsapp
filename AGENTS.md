# QW Automations Agent Guide

## Project Overview

QW Automations is a private WhatsApp automation PWA for one Shopify store. It replaces third-party WhatsApp automation tools for a single admin/store owner.

This repository is currently a foundation only. Do not implement product features, real Shopify/Meta/WhatsApp calls, Redis jobs, or database business logic until the relevant feature plan is approved.

## Monorepo Structure

- `apps/web`: React, Vite, TypeScript PWA-ready frontend shell.
- `apps/api`: Express, TypeScript backend API shell.
- `packages/shared`: shared types, Zod schemas, constants, and utilities only.
- `prisma`: PostgreSQL Prisma schema and seed placeholders.
- `docs`: architecture, product, API, and Codex prompt documentation.
- `.codex/skills`: project-specific Codex workflows.

## Package Manager

Use `pnpm` only. Do not use `npm`, `yarn`, or mixed lockfiles.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS v4, TanStack Query, React Hook Form, Zod, React Router, Socket.IO Client later, Vitest, React Testing Library, MSW placeholders.
- Backend: Node.js, TypeScript, Express, Prisma, PostgreSQL, BullMQ/Redis later, Socket.IO later, JWT later, Vitest, Supertest.
- Shared: TypeScript, Zod, Vitest.

## MVP Scope

Included: single admin authentication, dashboard, WhatsApp templates, predefined automations, conversations, logs, settings, and mobile/PWA-ready UI.

Excluded: multi-user teams, SaaS billing, multi-store support, automation builder, template editing, broadcasts, AI chatbot, audio/video sending, advanced analytics, native mobile apps.

## Frontend Rules

- Use TanStack Query for server state only.
- Use `useState`/`useReducer` for local UI state.
- Use Context only for app-wide concerns such as auth/session, theme, notification permission, or shell state.
- Do not add Redux, Zustand, MobX, Recoil, Jotai, or similar global state libraries.
- Use React Hook Form + Zod for all forms.
- Keep pages thin. Use containers/hooks/services for data fetching, orchestration, effects, permissions, mutations, and sockets.
- Presentational components receive props and focus on rendering.
- Tables must become cards on mobile.
- Conversations must support desktop split layout and mobile list/thread navigation.
- Use accessible labels, semantic markup, and clear loading/empty/error states.

## Backend Rules

- Use thin controllers.
- Put business logic in services.
- Use repositories/data-access helpers when useful.
- Wrap external integrations behind adapter/client modules.
- Validate all input.
- Use centralized error handling.
- Never expose secrets.
- Webhook handlers must verify signatures later, store raw payloads, and never send WhatsApp messages directly.
- Future sends must go through queue jobs.

## Shared Package Rules

- Only shared types, shared Zod schemas, shared constants, and shared utilities.
- No frontend-only or backend-only dependencies.
- Avoid circular dependencies.
- Export public API from `src/index.ts`.

## Database Rules

- Prisma schema must stay PostgreSQL-compatible.
- Define final models only during the database design phase.
- Use enums for statuses later.
- Index external IDs later.
- Seed predefined automations later.
- Do not delete migrations manually.
- Avoid nullable fields unless required.

## Testing Rules

- Tests are first-class.
- Frontend: Vitest, jsdom, React Testing Library, jest-dom, user-event, MSW placeholders.
- Backend: Vitest node environment and Supertest for API routes.
- Shared: Vitest for schemas/constants/utilities.
- Mock Shopify, Meta WhatsApp, Redis, push notifications, and payment APIs.
- Never depend on production secrets or real external services.

## Hook Rules

- Respect project Codex hooks and Git hooks.
- Do not bypass hooks unless the user explicitly requests and approves it.
- If a hook fails, fix the root cause before continuing.
- Do not suppress lint, typecheck, or test failures.
- Do not use `--force`, `--no-verify`, or similar bypass flags unless explicitly approved.
- Do not commit secrets.

## SOLID and Patterns

Apply SOLID pragmatically. Prefer service, repository, adapter, and factory/helper patterns only when they reduce coupling or clarify responsibility. Do not over-engineer before the product needs it.

## Do Not

- Do not implement real product features in boilerplate tasks.
- Do not make real external API calls.
- Do not commit secrets.
- Do not add unsupported state libraries.
- Do not wire Redis, BullMQ, Socket.IO, PWA service workers, or Prisma business models prematurely.

## Definition of Done

- Structure follows the monorepo layout.
- Scripts and package names are consistent.
- TypeScript aliases are coherent.
- Placeholder files explain future ownership.
- Tests are configured with at least basic smoke coverage.
- Docs and skills are updated with architectural rules.
- No secrets or real integrations are present.
