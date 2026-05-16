#!/usr/bin/env node

import { readFileSync } from "node:fs";

function readPayload() {
  try {
    const input = readFileSync(0, "utf8").trim();
    return input ? JSON.parse(input) : {};
  } catch {
    return {};
  }
}

function findCommand(value) {
  if (!value || typeof value !== "object") return "";

  const direct =
    value.command ??
    value.cmd ??
    value.input?.command ??
    value.input?.cmd ??
    value.arguments?.command ??
    value.arguments?.cmd ??
    value.tool_input?.command ??
    value.tool_input?.cmd;

  if (typeof direct === "string") return direct;

  for (const item of Object.values(value)) {
    const found = findCommand(item);
    if (found) return found;
  }

  return "";
}

const payload = readPayload();
const command = findCommand(payload);
const normalized = command.replace(/\s+/g, " ").trim();

if (!normalized) {
  console.log("[codex:pre-tool] No shell command found in hook payload; allowing.");
  process.exit(0);
}

const blockedPatterns = [
  { pattern: /\brm\s+-[^\n;|&]*rf[^\n;|&]*(?:\s+\/|\s+\.)\b/, reason: "destructive recursive delete" },
  { pattern: /\bsudo\s+rm\b/, reason: "sudo delete command" },
  { pattern: /\bchmod\s+-R\s+777\b/, reason: "unsafe recursive permissions" },
  { pattern: /\bgit\s+push\b[^\n;|&]*\s--force(?:\b|=)/, reason: "force push" },
  { pattern: /\bgit\s+reset\s+--hard\b/, reason: "hard reset" },
  { pattern: /\bgit\s+clean\s+-fdx\b/, reason: "destructive git clean" },
  { pattern: /\bcat\s+(?:\.\/)?\.env(?:\b|$)/, reason: "printing .env content" },
  {
    pattern:
      /\b(?:echo|printf|printenv|env|cat)\b[^\n;|&]*(?:META_ACCESS_TOKEN|SHOPIFY_ADMIN_ACCESS_TOKEN|JWT_ACCESS_SECRET|JWT_REFRESH_SECRET|DATABASE_URL)/,
    reason: "printing secret-like environment values"
  }
];

for (const { pattern, reason } of blockedPatterns) {
  if (pattern.test(normalized)) {
    console.error(`[codex:pre-tool] Blocked command: ${reason}`);
    console.error(`[codex:pre-tool] Command: ${normalized}`);
    process.exit(2);
  }
}

const warningPatterns = [
  { pattern: /\brm\s+-r\b|\brm\s+-rf\b/, reason: "deleting multiple files" },
  { pattern: /\bpnpm\s+(?:add|remove|install|update)\b/, reason: "changing dependencies or lockfile" },
  { pattern: /\b(?:sed|perl)\b[^\n;|&]*\s-i\b/, reason: "in-place bulk editing" },
  { pattern: /\b(?:package\.json|pnpm-lock\.yaml)\b/, reason: "touching package metadata or lockfiles" }
];

for (const { pattern, reason } of warningPatterns) {
  if (pattern.test(normalized)) {
    console.warn(`[codex:pre-tool] Warning: ${reason}. Continue only when intentional.`);
  }
}

console.log("[codex:pre-tool] Command allowed.");
