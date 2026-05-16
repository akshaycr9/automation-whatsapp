#!/usr/bin/env node

import { execFileSync } from "node:child_process";

function runCapture(command, args) {
  try {
    return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return "";
  }
}

function rootHasScript(script) {
  const output = runCapture("pnpm", ["pkg", "get", `scripts.${script}`]);
  return output && output !== "{}" && output !== "null";
}

function runCheck(label, command, args) {
  if (command === "pnpm" && !rootHasScript(args[0])) {
    console.log(`[codex:stop] SKIP ${label}: script not found`);
    return "skipped";
  }

  console.log(`[codex:stop] Running ${label}`);
  try {
    execFileSync(command, args, { stdio: "inherit" });
    return "passed";
  } catch {
    return "failed";
  }
}

function changedFiles() {
  const output = runCapture("git", ["status", "--short"]);
  return output ? output.split("\n") : [];
}

const changes = changedFiles();
console.log("[codex:stop] Changed files summary:");
if (changes.length === 0) {
  console.log("- No git changes detected.");
} else {
  for (const line of changes.slice(0, 60)) console.log(`- ${line}`);
  if (changes.length > 60) console.log(`- ...and ${changes.length - 60} more`);
}

const lint = runCheck("lint", "pnpm", ["lint"]);
const typecheck = runCheck("typecheck", "pnpm", ["typecheck"]);
const test = runCheck("test", "pnpm", ["test", "--", "--run"]);
const build = "not run";

console.log("[codex:stop] Final quality checklist:");
console.log(`- Lint status: ${lint}`);
console.log(`- Typecheck status: ${typecheck}`);
console.log(`- Test status: ${test}`);
console.log(`- Build status: ${build}`);
console.log(`- Uncommitted changes: ${changes.length}`);

if ([lint, typecheck, test].includes("failed")) {
  process.exitCode = 1;
}
