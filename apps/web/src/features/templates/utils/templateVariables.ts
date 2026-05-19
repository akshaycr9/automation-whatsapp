import type { TemplateVariable } from "../types/template.types";

const TEMPLATE_VARIABLE_PATTERN = /\{\{(\d+)\}\}/g;

export function extractTemplateVariables(text: string): TemplateVariable[] {
  const seen = new Map<number, TemplateVariable>();

  for (const match of text.matchAll(TEMPLATE_VARIABLE_PATTERN)) {
    const rawIndex = match[1];
    const index = Number(rawIndex);

    if (!rawIndex || !Number.isInteger(index) || seen.has(index)) {
      continue;
    }

    seen.set(index, {
      key: rawIndex,
      index,
      token: `{{${rawIndex}}}`
    });
  }

  return [...seen.values()].sort((a, b) => a.index - b.index);
}

export function getVariablePositions(text: string) {
  return [...text.matchAll(TEMPLATE_VARIABLE_PATTERN)].map((match) => ({
    token: match[0],
    index: Number(match[1]),
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length
  }));
}

export function areVariablesSequential(variables: Array<TemplateVariable | string>): boolean {
  const indexes = variables
    .map((variable) => {
      if (typeof variable !== "string") {
        return variable.index;
      }

      const match = variable.match(/^\{\{(\d+)\}\}$/);
      return match?.[1] ? Number(match[1]) : Number.NaN;
    })
    .filter((index) => Number.isInteger(index))
    .sort((a, b) => a - b);

  if (indexes.length === 0) {
    return true;
  }

  return indexes.every((index, position) => index === position + 1);
}

export function replaceVariablesWithSamples(text: string, sampleValues: Record<string, string>) {
  return text.replace(TEMPLATE_VARIABLE_PATTERN, (token) => sampleValues[token] || token);
}
