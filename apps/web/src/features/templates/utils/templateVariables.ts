import type { TemplateVariable } from "../types/template.types";

const TEMPLATE_VARIABLE_PATTERN = /\{\{(\d+)\}\}/g;
const TEMPLATE_LIKE_VARIABLE_PATTERN = /\{\{[^}]*\}\}|\{+\s*[^{}\s]+\s*\}+/g;

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

export function extractBodyTemplateVariables(text: string): TemplateVariable[] {
  return extractTemplateVariables(text).map((variable) => ({
    ...variable,
    componentType: "BODY",
    componentPath: "bodyText"
  }));
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

export function getMissingVariablePositions(variables: Array<TemplateVariable | string>) {
  const indexes = variables
    .map((variable) => (typeof variable === "string" ? Number(variable.match(/^\{\{(\d+)\}\}$/)?.[1]) : variable.index))
    .filter((index) => Number.isInteger(index))
    .sort((a, b) => a - b);

  if (indexes.length === 0) {
    return [];
  }

  const uniqueIndexes = [...new Set(indexes)];
  const highestIndex = uniqueIndexes[uniqueIndexes.length - 1] ?? 0;

  return Array.from({ length: highestIndex }, (_, index) => index + 1).filter(
    (index) => !uniqueIndexes.includes(index)
  );
}

export function findInvalidVariableSyntax(text: string) {
  const invalidTokens = new Set<string>();
  const validTokens = new Set([...text.matchAll(TEMPLATE_VARIABLE_PATTERN)].map((match) => match[0]));

  for (const match of text.matchAll(TEMPLATE_LIKE_VARIABLE_PATTERN)) {
    const token = match[0];
    if (!validTokens.has(token)) {
      invalidTokens.add(token);
    }
  }

  return [...invalidTokens];
}
