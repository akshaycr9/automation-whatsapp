# Architecture Overview

QW Automations is a pnpm monorepo with clear package boundaries.

- `apps/web`: React PWA-ready frontend. It owns UI, routing, forms, and client-side orchestration.
- `apps/api`: Express API. It owns auth, validation, services, webhook processing, queues, sockets, and integration adapters.
- `packages/shared`: shared types, Zod schemas, constants, and utilities only.
- `prisma`: PostgreSQL schema and seed entrypoints.

The architecture is testability-first. Controllers, services, repositories, integrations, workers, and UI hooks/components should have separate responsibilities. SOLID principles are applied pragmatically where they reduce coupling.

## Auth Foundation

The MVP auth system is a single-admin, DB-backed model in `apps/api`. Admin credentials live in PostgreSQL, with bootstrap values used only by the Prisma seed flow. Auth logic is split into routes, controller, service, repository, password, token, refresh-session, cookie, and middleware modules.

Access tokens are short-lived JWTs returned in JSON. Refresh tokens are opaque random values stored in httpOnly cookies; only SHA-256 refresh token hashes are stored in the database. Each browser also receives a stable httpOnly `qw_device_id` cookie so `RefreshSession` stores one current row per admin device. Refresh token rotation updates that row in place, and logout revokes the matching device session. Private API routes should use the auth middleware, which verifies the bearer access token and loads the active admin before attaching `request.auth`.

The frontend owns auth orchestration through `AuthProvider`, protected-route wrappers, and auth feature hooks. It stores the access token in memory only, calls login/refresh/logout with `credentials: "include"`, and sends access tokens to protected APIs with `Authorization: Bearer <token>`. The app shell exposes a sign-out action that calls backend logout, clears auth state and query cache, and returns the admin to `/login`.

Prisma currently defines `AdminUser` and `RefreshSession`. `RefreshSession` is unique by admin and device, with expired and revoked sessions indexed for future cleanup.

When `DATABASE_URL` is available, create the auth migration with:

```bash
pnpm prisma migrate dev --name add_auth_models --create-only
```
