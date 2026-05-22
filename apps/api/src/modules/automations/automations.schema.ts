import { z } from "zod";

import { AUTOMATION_DELAY_MAX_MINUTES } from "./domain/automation.constants.js";

export const updateAutomationBodySchema = z
  .object({
    templateId: z.string().min(1).nullable(),
    delayMinutes: z
      .number({ required_error: "Delay minutes is required." })
      .int("Delay minutes must be an integer.")
      .min(0, "Delay minutes must be greater than or equal to 0.")
      .max(AUTOMATION_DELAY_MAX_MINUTES, "Delay minutes must be 43,200 minutes or less."),
    variableMappings: z.array(
      z.object({
        templateVariableName: z.string().min(1, "Template variable name is required."),
        componentType: z.enum(["HEADER", "BODY", "BUTTON"]),
        variableIndex: z
          .number({ required_error: "Variable index is required." })
          .int("Variable index must be an integer.")
          .positive("Variable index must be positive."),
        sourceField: z.string().min(1, "Source field is required."),
        fallbackValue: z.string().nullable().optional()
      })
    )
  })
  .strict();

export const toggleAutomationBodySchema = z
  .object({
    isEnabled: z.boolean({ required_error: "Enabled state is required." })
  })
  .strict();
