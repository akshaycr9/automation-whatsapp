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

# Agent Instructions for This Repository

This project is a production-oriented WhatsApp automation application. The agent must prioritize correctness, maintainability, minimal changes, and verified outcomes over speed or speculative improvements.

## Core Behaviour Rules

### 1. Think Before Coding

Do not assume silently. Before implementing any task:

- State the goal in your own words.
- State important assumptions explicitly.
- If multiple interpretations exist, mention them and choose the safest one.
- If something is unclear and implementation could go in the wrong direction, stop and ask.
- Surface tradeoffs before choosing an approach.
- Prefer the simpler approach when it satisfies the requirement.

Do not hide confusion. If something is ambiguous, name the ambiguity.

### 2. Simplicity First

Write the minimum code required to solve the requested problem.

- Do not add features beyond what was asked.
- Do not create abstractions for single-use code.
- Do not add “future flexibility” unless explicitly requested.
- Do not add unnecessary defensive code for impossible or irrelevant scenarios.
- Avoid large rewrites when a small targeted fix is enough.
- If a solution can be 50 lines instead of 200, prefer the 50-line solution.
- Keep business logic easy to understand.

### 3. Surgical Changes Only

Touch only the files and code needed for the task.

- Do not refactor unrelated code.
- Do not reformat unrelated files.
- Do not rename variables, functions, files, or components unless required.
- Match the existing project style, naming, and patterns.
- Do not “improve” adjacent code unless it is directly necessary for the requested change.
- If dead code, duplication, or architectural issues are noticed, mention them in the final summary instead of changing them without permission.
- Keep diffs small and reviewable.

### 4. Goal-Driven Execution

Convert every task into verifiable success criteria.

Examples:

- “Add validation” means: define the validation rules, add tests where appropriate, implement, then verify.
- “Fix a bug” means: reproduce the bug if possible, fix it, then verify the fix.
- “Refactor X” means: confirm behaviour before and after, and ensure tests/build still pass.
- “Update UI” means: confirm the changed screen/component works responsively and does not break existing behaviour.

Before finishing:

- Run relevant tests, lint, type-check, or build commands when available.
- If a command cannot be run, explain why.
- Clearly list what was changed.
- Clearly list how the change was verified.
- Clearly list any remaining risks or follow-ups.

## Project-Specific Expectations

- Prefer existing architecture and conventions over introducing new patterns.
- For frontend work, preserve separation of concerns:
  - presentational components should stay mostly UI-focused;
  - API calls and server-state logic should stay in hooks/services;
  - TanStack Query should be used consistently where server state is involved.
- For backend work, keep service/controller/repository boundaries clean if already present.
- For Prisma/database changes, avoid destructive migrations unless explicitly requested.
- For authentication, automation, webhook, and WhatsApp template features, prioritize data integrity and predictable state transitions.
- Do not introduce new libraries unless there is a clear need and the existing stack cannot solve the problem cleanly.
- Do not change public API contracts unless the task explicitly requires it.
- Do not break existing flows while implementing a new feature.

## Response Format After Completing Work

At the end of each task, provide:

1. Summary of changes
2. Files changed
3. Verification performed
4. Any assumptions made
5. Any risks or follow-ups

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
