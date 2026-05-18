# Testing Strategy

## Frontend

Use Vitest, jsdom, React Testing Library, jest-dom, user-event, and MSW placeholders. Test user-visible behavior, not implementation details.

## Backend

Use Vitest and Supertest for API integration tests. Mock Shopify, Meta WhatsApp, Redis, push notifications, and any external APIs.

Auth service and route tests use in-memory repositories so they do not require a live database or production secrets. DB-backed auth behavior should be covered later with a dedicated test database once PostgreSQL integration testing is introduced.

Auth coverage includes password hashing, login success/failure, failed-attempt lockout, refresh-token hashing and rotation, logout revocation, bearer-token middleware behavior, frontend bootstrap refresh, protected routes, safe login errors, logout navigation, and checks that auth tokens are not written to browser storage.

## Shared

Test schemas, constants, and utilities with Vitest.

## Unit vs Integration

Prefer API integration tests for routes. Unit test pure utilities and services when logic is complex.

## Do Not Test

Do not test internal React state directly. Do not call real external services. Do not depend on production secrets.

## Later

Testcontainers may be considered later for real PostgreSQL/Redis integration tests, but it is intentionally not included yet.

## Quality Gates and Hooks

QW Automations uses layered hooks so quality checks happen at the right time without making every edit slow.

Codex lifecycle hooks live in `.codex/hooks.json` and `.codex/hooks`. The PreToolUse hook blocks dangerous shell commands and secret-printing commands. The PostToolUse hook runs targeted checks based on changed areas, such as web lint/typecheck for frontend edits or API tests for route/service/schema edits. The Stop hook prints a changed-file summary and runs broader lint, typecheck, and test checks when available.

Git pre-commit uses Husky and lint-staged. It formats and lints staged files only, so commits stay fast and focused.

Git pre-push runs broader checks: `pnpm lint`, `pnpm typecheck`, and `pnpm test -- --run`. Build is left to CI for now and can be added later if it remains fast.

lint-staged runs ESLint and Prettier for staged TypeScript/JavaScript files, and Prettier for staged Markdown, JSON, CSS, HTML, YAML, and TOML files.

Full CI runs install, lint, typecheck, tests, and build. Before completing a feature, developers and Codex should expect lint, typecheck, tests, and any relevant targeted checks to pass.
