# Shared Package Agent Guide

`packages/shared` may contain only shared types, Zod schemas, constants, and utilities.

- No frontend-only dependencies.
- No backend-only dependencies.
- Avoid circular dependencies.
- Keep exports explicit through `src/index.ts`.
- Prefer stable, reusable schema names.
- Do not add business logic, API clients, React code, Express code, Prisma access, or environment reads here.
