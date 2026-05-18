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

## Auth Decisions

- Store admin credentials in the database, not in environment variables.
- Use environment variables only for the initial admin seed values.
- Hash MVP passwords with bcrypt through a password service abstraction so Argon2id can replace it later.
- Return short-lived access tokens in JSON and store refresh tokens in httpOnly cookies.
- Store only hashed refresh tokens in the database.
- Rotate refresh tokens on refresh and revoke refresh sessions on logout.
- Apply rate limiting and failed-login lockout to reduce brute-force risk.
- Keep MVP auth single-admin with no roles, teams, OAuth, or password-reset flows.
- Store the frontend access token in memory only for MVP.
- Keep refresh tokens in backend-managed httpOnly cookies only.
- Do not store auth tokens in `localStorage` or `sessionStorage`.
