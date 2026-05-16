# Codex Hooks

This directory contains project-local Codex lifecycle hooks for QW Automations.

## Files

- `../hooks.json`: single Codex hook configuration file.
- `pre_tool_use_policy.mjs`: checks shell commands before execution and blocks dangerous commands.
- `post_tool_use_quality_check.mjs`: runs targeted checks after edits or shell commands based on changed paths.
- `stop_quality_summary.mjs`: prints a changed-file summary and runs broad lint/typecheck/test checks when Codex stops.

## Policy

- PreToolUse blocks destructive commands, secret-printing commands, forced pushes, hard resets, and unsafe permission changes.
- PostToolUse runs targeted checks for changed workspace areas instead of full CI every time.
- Stop runs broader summary checks and prints a checklist.

## Trust and Review

Depending on the installed Codex CLI/app version, you may be asked to review or trust hooks before they run. Inspect `hooks.json` and the scripts in this folder before trusting them.

Hook matcher names can vary by Codex version. This project uses conservative matcher names for shell commands, file editing tools, and stop events. If hooks do not fire, adjust matchers in `hooks.json` for the installed Codex version.

## Manual Checks

Run these manually at any time:

```bash
pnpm lint
pnpm typecheck
pnpm test -- --run
pnpm build
pnpm format:check
```

Targeted checks:

```bash
pnpm --filter @qw-automations/web lint
pnpm --filter @qw-automations/api typecheck
pnpm --filter @qw-automations/shared test -- --run
```

## Troubleshooting

- If a hook cannot parse a payload, it allows safe continuation and logs a message.
- If Prisma generation fails because `DATABASE_URL` is unset, provide a local development URL.
- If Supertest fails inside a sandbox because local listen calls are blocked, run tests in the normal local environment or CI.
- Hooks must never print secrets, read `.env` contents, call real external APIs, auto-commit, auto-push, or delete files.
