import { TemplateProvider } from "@prisma/client";
import type {
  ProviderCreateTemplateInput,
  ProviderListTemplatesInput,
  TemplateProviderAdapter
} from "../template-provider.adapter.js";
import { TemplateProviderError } from "./meta-template.errors.js";
import { mapMetaCreateResponse, mapMetaListResponse } from "./meta-template.mapper.js";
import type { MetaListTemplatesResponse, MetaTemplateResponse } from "./meta-template.types.js";

type FetchLike = typeof fetch;

export class MetaTemplateAdapter implements TemplateProviderAdapter {
  constructor(private readonly fetchClient: FetchLike = fetch) {}

  async createTemplate(input: ProviderCreateTemplateInput) {
    const response = await this.request<MetaTemplateResponse>(
      this.templatesUrl(input.credentials.graphApiVersion, input.credentials.wabaId),
      input.credentials.accessToken,
      {
        method: "POST",
        body: JSON.stringify(input.payload)
      }
    );

    return mapMetaCreateResponse(response.body, response.statusCode);
  }

  async listTemplates(input: ProviderListTemplatesInput) {
    const response = await this.request<MetaListTemplatesResponse>(
      this.templatesUrl(input.credentials.graphApiVersion, input.credentials.wabaId),
      input.credentials.accessToken,
      { method: "GET" }
    );

    return mapMetaListResponse(response.body, response.statusCode);
  }

  private templatesUrl(version: string, wabaId: string) {
    return `https://graph.facebook.com/${version}/${wabaId}/message_templates`;
  }

  private async request<T>(
    url: string,
    accessToken: string,
    init: RequestInit
  ): Promise<{ body: T; statusCode: number }> {
    const response = await this.fetchClient(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    });
    const body = (await response.json().catch(() => ({}))) as T & { error?: { code?: string; message?: string } };

    if (!response.ok) {
      throw new TemplateProviderError({
        provider: TemplateProvider.META,
        code: body.error?.code ? String(body.error.code) : "META_TEMPLATE_API_ERROR",
        message: body.error?.message ?? "Meta template API request failed.",
        statusCode: response.status,
        raw: body
      });
    }

    return { body, statusCode: response.status };
  }
}
