import { TemplateType } from "@prisma/client";
import { TemplateUnsupportedTypeError } from "./template.errors.js";
import { TextTemplateFactory } from "./text-template.factory.js";
import type { CreateTemplateInput, TemplateScope } from "./template.types.js";

export class TemplateFactoryResolver {
  constructor(private readonly textTemplateFactory = new TextTemplateFactory()) {}

  build(input: CreateTemplateInput, context: TemplateScope) {
    if (input.type === TemplateType.TEXT) {
      return this.textTemplateFactory.build(input, context);
    }

    throw new TemplateUnsupportedTypeError();
  }
}
