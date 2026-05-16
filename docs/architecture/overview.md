# Architecture Overview

QW Automations is a pnpm monorepo with clear package boundaries.

- `apps/web`: React PWA-ready frontend. It owns UI, routing, forms, and client-side orchestration.
- `apps/api`: Express API. It owns auth, validation, services, webhook processing, queues, sockets, and integration adapters.
- `packages/shared`: shared types, Zod schemas, constants, and utilities only.
- `prisma`: PostgreSQL schema and seed entrypoints.

The architecture is testability-first. Controllers, services, repositories, integrations, workers, and UI hooks/components should have separate responsibilities. SOLID principles are applied pragmatically where they reduce coupling.
