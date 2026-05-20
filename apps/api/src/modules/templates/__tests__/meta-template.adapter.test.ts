import { TemplateProvider } from "@prisma/client";
import { MetaTemplateAdapter } from "../providers/meta/meta-template.adapter.js";
import { TemplateProviderError } from "../providers/meta/meta-template.errors.js";

const credentials = {
  graphApiVersion: "v21.0",
  wabaId: "waba_123",
  accessToken: "secret-token"
};

it("normalizes Meta create success responses", async () => {
  const fetchClient = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ id: "meta_123", status: "PENDING" })
  });
  const result = await new MetaTemplateAdapter(fetchClient).createTemplate({
    credentials,
    payload: { name: "order_confirmation_v1" }
  });

  expect(fetchClient).toHaveBeenCalledWith(
    "https://graph.facebook.com/v21.0/waba_123/message_templates",
    expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ Authorization: "Bearer secret-token" })
    })
  );
  expect(result).toEqual({
    providerTemplateId: "meta_123",
    status: "PENDING",
    raw: { id: "meta_123", status: "PENDING" },
    statusCode: 200
  });
});

it("normalizes Meta error responses", async () => {
  const fetchClient = vi.fn().mockResolvedValue({
    ok: false,
    status: 400,
    json: async () => ({ error: { code: "100", message: "Invalid parameter" } })
  });

  await expect(
    new MetaTemplateAdapter(fetchClient).listTemplates({
      credentials
    })
  ).rejects.toEqual(
    new TemplateProviderError({
      provider: TemplateProvider.META,
      code: "100",
      message: "Invalid parameter",
      statusCode: 400,
      raw: { error: { code: "100", message: "Invalid parameter" } }
    })
  );
});
