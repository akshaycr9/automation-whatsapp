import { TemplateProvider } from "@prisma/client";

export type TemplateProviderErrorDetails = {
  provider: TemplateProvider;
  code: string;
  message: string;
  statusCode: number;
  raw: unknown;
};

export class TemplateProviderError extends Error {
  constructor(public readonly details: TemplateProviderErrorDetails) {
    super(details.message);
  }
}
