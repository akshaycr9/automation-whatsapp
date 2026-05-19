import { env } from "../../../../config/env.js";
import { HttpError } from "../../../../lib/http-error.js";
import type { TemplateScope } from "../../domain/template.types.js";
import type { TemplateProviderCredentials } from "../template-provider.adapter.js";

export class MetaTemplateCredentialResolver {
  resolve(_scope: TemplateScope): TemplateProviderCredentials {
    if (!env.META_WABA_ID || !env.META_ACCESS_TOKEN) {
      throw new HttpError(503, "Meta WhatsApp template credentials are not configured.", "TEMPLATE_PROVIDER_ERROR");
    }

    return {
      graphApiVersion: env.META_GRAPH_API_VERSION,
      wabaId: env.META_WABA_ID,
      accessToken: env.META_ACCESS_TOKEN
    };
  }
}
