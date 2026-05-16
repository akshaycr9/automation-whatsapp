# QW Automations

Private WhatsApp automation PWA for a single Shopify t-shirt store admin.

The app will manage WhatsApp templates, predefined Shopify automations, customer conversations, logs, basic analytics, and settings. This repository is currently boilerplate/foundation only.

## MVP Modules

- Single admin authentication
- Dashboard
- WhatsApp templates
- Predefined automations
- Conversations
- Logs
- Settings
- Mobile/PWA-ready shell

## Tech Stack

- Monorepo: pnpm workspaces
- Frontend: React, Vite, TypeScript, Tailwind CSS v4, TanStack Query, React Hook Form, Zod, React Router
- Backend: Node.js, Express, TypeScript, Prisma placeholder, PostgreSQL later
- Testing: Vitest, React Testing Library, Supertest

## Layout

```text
apps/web        React frontend shell
apps/api        Express API shell
packages/shared Shared types, schemas, constants, utilities
prisma          Prisma schema and seed placeholders
docs            Product and architecture docs
.codex/skills   Project-specific Codex skills
```

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Real service credentials are not required for the foundation.

## Commands

- `pnpm dev`: run web and API dev scripts
- `pnpm build`: build all packages/apps
- `pnpm typecheck`: run TypeScript checks
- `pnpm test`: run tests
- `pnpm lint`: placeholder lint command
- `pnpm db:generate`: Prisma client generation placeholder
- `pnpm db:migrate`: Prisma migration placeholder
- `pnpm db:seed`: seed placeholder

## Current Status

Boilerplate/foundation only. No product features, real integrations, queues, database models, or business logic are implemented yet.
