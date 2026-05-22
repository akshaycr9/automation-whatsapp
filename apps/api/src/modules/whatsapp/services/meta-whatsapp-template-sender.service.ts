import { TemplateProvider } from "@prisma/client";
import { env } from "../../../config/env.js";
import { HttpError } from "../../../lib/http-error.js";
import { TemplateProviderError } from "../../templates/providers/meta/meta-template.errors.js";

type FetchLike = typeof fetch;

export type WhatsAppTemplateSendComponent = {
  type: "header" | "body" | "button";
  sub_type?: "quick_reply" | "url";
  index?: string;
  parameters: Array<{ type: "text"; text: string } | { type: "payload"; payload: string }>;
};

export type WhatsAppTemplateSendInput = {
  to: string;
  templateName: string;
  languageCode: string;
  components: WhatsAppTemplateSendComponent[];
};

export class MetaWhatsAppTemplateSenderService {
  constructor(private readonly fetchClient: FetchLike = fetch) {}

  async sendTemplateMessage(input: WhatsAppTemplateSendInput) {
    if (!env.WHATSAPP_PHONE_NUMBER_ID || !env.META_ACCESS_TOKEN) {
      throw new HttpError(503, "Meta WhatsApp message credentials are not configured.", "WHATSAPP_SEND_ERROR");
    }

    const response = await this.fetchClient(this.messagesUrl("v21.0", env.WHATSAPP_PHONE_NUMBER_ID), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.META_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: input.to,
        type: "template",
        template: {
          name: input.templateName,
          language: { code: input.languageCode },
          ...(input.components.length > 0 ? { components: input.components } : {})
        }
      })
    });
    const body = (await response.json().catch(() => ({}))) as {
      messages?: Array<{ id?: string }>;
      error?: { code?: string; message?: string };
    };

    if (!response.ok) {
      throw new TemplateProviderError({
        provider: TemplateProvider.META,
        code: body.error?.code ? String(body.error.code) : "META_WHATSAPP_SEND_ERROR",
        message: body.error?.message ?? "Meta WhatsApp send request failed.",
        statusCode: response.status,
        raw: body
      });
    }

    return {
      providerMessageId: body.messages?.[0]?.id,
      raw: body
    };
  }

  private messagesUrl(version: string, phoneNumberId: string) {
    return `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
  }
}
