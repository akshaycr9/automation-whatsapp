# Architecture Decisions

## Initial Foundation Decisions

- Use a `pnpm` monorepo.
- Use `apps/web` and `apps/api`.
- Use `packages/shared` for shared types, schemas, constants, and utilities.
- Use React + Vite + TypeScript for the frontend.
- Use Express for the initial API shell.
- Do not use Zustand or Redux for MVP.
- Use TanStack Query for server state.
- Use React local state and Context for UI/app state.
- Use fixed predefined automations for MVP.
- Exclude template editing from MVP.
- Build a PWA-ready web app instead of a native mobile app.
- Support a single admin user for MVP.
- Use Vitest across the monorepo.
- Use React Testing Library for frontend tests.
- Use Supertest for backend API integration tests.
