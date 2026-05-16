# Project Quality Safety

## Purpose

Keep QW Automations maintainable, secure, and easy to evolve.

## When to Use

Use for any implementation, refactor, dependency, testing, CI, or documentation task.

## pnpm Only

Use `pnpm` and workspace filters. Do not use npm or yarn.

## TypeScript

Keep strict TypeScript clean. Prefer explicit contracts at module boundaries.

## Tests

Add focused tests for behavior and risk. Mock external services.

## Checks

Run typecheck and tests when dependencies are installed. Keep CI realistic.

## Dependencies

Add dependencies only when they are necessary and consistent with the stack.

## Security

No secrets in repo. Server-side tokens only. Verify webhooks before processing.

## Docs

Update docs and AGENTS.md when architectural rules change.

## Definition of Done

Code is typed, tested, documented when needed, scoped to the task, and avoids real external side effects unless explicitly planned.

## Do

Prefer small changes and clear ownership.

## Do Not

Do not over-engineer, mix package managers, commit secrets, or silently introduce real integrations.
