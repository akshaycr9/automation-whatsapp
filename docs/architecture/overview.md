# Architecture Overview

QW Automations is a pnpm monorepo with clear package boundaries.

- `apps/web`: React PWA-ready frontend. It owns UI, routing, forms, and client-side orchestration.
- `apps/api`: Express API. It owns auth, validation, services, webhook processing, queues, sockets, and integration adapters.
- `packages/shared`: shared types, Zod schemas, constants, and utilities only.
- `prisma`: PostgreSQL schema and seed entrypoints.

The architecture is testability-first. Controllers, services, repositories, integrations, workers, and UI hooks/components should have separate responsibilities. SOLID principles are applied pragmatically where they reduce coupling.

## Auth Foundation

The MVP auth system is a single-admin, DB-backed model in `apps/api`. Admin credentials live in PostgreSQL, with bootstrap values used only by the Prisma seed flow. Auth logic is split into routes, controller, service, repository, password, token, refresh-session, cookie, and middleware modules.

Access tokens are short-lived JWTs returned in JSON. Refresh tokens are opaque random values stored in httpOnly cookies; only SHA-256 refresh token hashes are stored in the database. Refresh sessions rotate on every refresh and are revoked on logout. Private API routes should use the auth middleware, which verifies the bearer access token and loads the active admin before attaching `request.auth`.

When `DATABASE_URL` is available, create the auth migration with:

```bash
pnpm prisma migrate dev --name add_auth_models --create-only
```
