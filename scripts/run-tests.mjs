#!/usr/bin/env node

import { execFileSync } from "node:child_process";

// Root test wrapper keeps `pnpm test`, `pnpm test -- --run`, and hook usage stable.
// Package-level scripts can still receive Vitest flags directly.
const args = process.argv.slice(2).filter((arg) => arg !== "--run");

execFileSync("pnpm", ["-r", "exec", "vitest", "run", ...args], {
  stdio: "inherit"
});
