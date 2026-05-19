import { TemplateComponentType } from "@prisma/client";
import type {
  CreateTemplateInput,
  DetectedTemplateVariable,
  TemplateValidationError,
  TemplateVariableInput
} from "./template.types.js";

const VALID_VARIABLE_PATTERN = /\{\{(\d+)\}\}/g;
const VARIABLE_LIKE_PATTERN = /\{\{[^}]*\}\}/g;

export function extractTemplateVariables(
  text: string,
  componentType: DetectedTemplateVariable["componentType"] = TemplateComponentType.BODY
): DetectedTemplateVariable[] {
  const seen = new Map<number, DetectedTemplateVariable>();

  for (const match of text.matchAll(VALID_VARIABLE_PATTERN)) {
    const position = Number(match[1]);

    if (!Number.isInteger(position) || position < 1 || seen.has(position)) {
      continue;
    }

    seen.set(position, {
      componentType,
      position,
      placeholder: `{{${position}}}`
    });
  }

  return [...seen.values()].sort((left, right) => left.position - right.position);
}

export function validateVariableSyntax(text: string, field = "components.body.text"): TemplateValidationError[] {
  const errors: TemplateValidationError[] = [];
  const validTokens = new Set([...text.matchAll(VALID_VARIABLE_PATTERN)].map((match) => match[0]));

  for (const match of text.matchAll(VARIABLE_LIKE_PATTERN)) {
    const token = match[0];

    if (!validTokens.has(token)) {
      errors.push({
        field,
        message: `Invalid variable syntax "${token}". Use numbered placeholders like {{1}}.`
      });
    }
  }

  return errors;
}

export function validateVariableSequence(variables: Array<DetectedTemplateVariable | TemplateVariableInput>) {
  const errors: TemplateValidationError[] = [];
  const positions = [...new Set(variables.map((variable) => variable.position))].sort((left, right) => left - right);

  positions.forEach((position, index) => {
    if (position !== index + 1) {
      errors.push({
        field: "variables",
        message: "Template variables must be sequential from {{1}} with no gaps."
      });
    }
  });

  return errors.slice(0, 1);
}

export function validateTemplateVariables(input: CreateTemplateInput): TemplateValidationError[] {
  const errors: TemplateValidationError[] = [];
  const detected = [
    ...extractTemplateVariables(input.components.header?.text ?? "", TemplateComponentType.HEADER),
    ...extractTemplateVariables(input.components.body.text, TemplateComponentType.BODY)
  ];

  errors.push(...validateVariableSyntax(input.components.header?.text ?? "", "components.header.text"));
  errors.push(...validateVariableSyntax(input.components.body.text));
  errors.push(...validateVariableSequence(detected));

  for (const variable of detected) {
    const requested = input.variables.find(
      (candidate) => candidate.componentType === variable.componentType && candidate.position === variable.position
    );

    if (!requested) {
      errors.push({
        field: "variables",
        message: `Missing sample value for ${variable.placeholder}.`
      });
      continue;
    }

    if (requested.placeholder !== variable.placeholder) {
      errors.push({
        field: "variables",
        message: `Variable position ${variable.position} must use placeholder ${variable.placeholder}.`
      });
    }

    if (!requested.sampleValue?.trim()) {
      errors.push({
        field: "variables",
        message: `Sample value is required for ${variable.placeholder}.`
      });
    }
  }

  for (const variable of input.variables) {
    const matchingDetected = detected.some(
      (candidate) => candidate.componentType === variable.componentType && candidate.position === variable.position
    );

    if (!matchingDetected) {
      errors.push({
        field: "variables",
        message: `Variable ${variable.placeholder} does not match a supported template placeholder.`
      });
    }
  }

  return errors;
}
