#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

function readPayload() {
  try {
    const input = readFileSync(0, "utf8").trim();
    return input ? JSON.parse(input) : {};
  } catch {
    return {};
  }
}

function collectPaths(value, out = new Set()) {
  if (!value) return out;
  if (typeof value === "string") {
    if (/^(?:apps|packages|prisma|docs|scripts|\.codex|\.github|\.husky|package\.json|pnpm-lock\.yaml)/.test(value)) {
      out.add(value);
    }
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectPaths(item, out));
    return out;
  }
  if (typeof value === "object") {
    for (const key of ["file_path", "path", "filename", "file", "cwd"]) {
      if (typeof value[key] === "string") collectPaths(value[key], out);
    }
    Object.values(value).forEach((item) => collectPaths(item, out));
  }
  return out;
}

function gitChangedFiles() {
  try {
    const output = execFileSync("git", ["diff", "--name-only", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function hasScript(packageName, script) {
  try {
    const output = execFileSync("pnpm", ["--filter", packageName, "pkg", "get", `scripts.${script}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return output && output !== "{}" && output !== "null";
  } catch {
    return false;
  }
}

function rootHasScript(script) {
  try {
    const output = execFileSync("pnpm", ["pkg", "get", `scripts.${script}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return output && output !== "{}" && output !== "null";
  } catch {
    return false;
  }
}

function run(label, command, args, required = true) {
  console.log(`[codex:post-tool] ${label}`);
  try {
    execFileSync(command, args, { stdio: "inherit" });
    console.log(`[codex:post-tool] PASS ${label}`);
    return true;
  } catch {
    console.error(`[codex:post-tool] FAIL ${label}`);
    if (required) process.exitCode = 1;
    return false;
  }
}

function runPackageChecks(packageName, scripts) {
  for (const script of scripts) {
    if (hasScript(packageName, script)) {
      const args = ["--filter", packageName, script];
      if (script === "test") args.push("--", "--run");
      run(`${packageName} ${script}`, "pnpm", args);
    } else {
      console.log(`[codex:post-tool] SKIP ${packageName} ${script}: script not found`);
    }
  }
}

const payloadPaths = [...collectPaths(readPayload())];
const changed = [...new Set([...payloadPaths, ...gitChangedFiles()])];

if (changed.length === 0) {
  console.log("[codex:post-tool] No changed files detected; skipping targeted checks.");
  process.exit(0);
}

console.log("[codex:post-tool] Changed files:");
for (const file of changed.slice(0, 40)) console.log(`- ${file}`);
if (changed.length > 40) console.log(`- ...and ${changed.length - 40} more`);

const touchesWeb = changed.some((file) => file.startsWith("apps/web/"));
const touchesApi = changed.some((file) => file.startsWith("apps/api/"));
const touchesShared = changed.some((file) => file.startsWith("packages/shared/"));
const touchesPrisma = changed.some((file) => file.startsWith("prisma/"));
const touchesRootConfig = changed.some((file) =>
  /^(package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|tsconfig\.base\.json|eslint\.config\.js|prettier\.config\.cjs|lint-staged\.config\.js)$/.test(
    file
  )
);

const webNeedsTests = changed.some((file) =>
  /^apps\/web\/src\/.*(?:__tests__|\.test\.|components|hooks|forms?|pages)/.test(file)
);
const apiNeedsTests = changed.some((file) =>
  /^apps\/api\/src\/.*(?:__tests__|\.test\.|routes|service|schema|controller)/.test(file)
);

if (touchesWeb) runPackageChecks("@qw-automations/web", ["lint", "typecheck", ...(webNeedsTests ? ["test"] : [])]);
if (touchesApi) runPackageChecks("@qw-automations/api", ["lint", "typecheck", ...(apiNeedsTests ? ["test"] : [])]);
if (touchesShared) runPackageChecks("@qw-automations/shared", ["lint", "typecheck", "test"]);

if (touchesRootConfig) {
  for (const script of ["typecheck", "lint"]) {
    if (rootHasScript(script)) run(`root ${script}`, "pnpm", [script]);
    else console.log(`[codex:post-tool] SKIP root ${script}: script not found`);
  }
}

if (touchesPrisma) {
  if (rootHasScript("db:generate")) {
    run("root db:generate", "pnpm", ["db:generate"], false);
  } else {
    console.log("[codex:post-tool] SKIP db:generate: script not found");
  }
  if (rootHasScript("typecheck")) run("root typecheck", "pnpm", ["typecheck"]);
}

if (process.exitCode) {
  console.error("[codex:post-tool] One or more targeted checks failed.");
} else {
  console.log("[codex:post-tool] Targeted quality checks complete.");
}
