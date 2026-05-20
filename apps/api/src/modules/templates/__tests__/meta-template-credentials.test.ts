it("resolves WhatsApp Business Account ID from the existing env key", async () => {
  vi.resetModules();
  const originalBusinessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  const originalAccessToken = process.env.META_ACCESS_TOKEN;

  process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = "waba_123";
  process.env.META_ACCESS_TOKEN = "token_123";

  const { MetaTemplateCredentialResolver } = await import("../providers/meta/meta-template-credentials.js");
  const credentials = new MetaTemplateCredentialResolver().resolve({ adminUserId: "admin_123" });

  expect(credentials.wabaId).toBe("waba_123");
  expect(credentials.accessToken).toBe("token_123");

  restoreEnv("WHATSAPP_BUSINESS_ACCOUNT_ID", originalBusinessAccountId);
  restoreEnv("META_ACCESS_TOKEN", originalAccessToken);
});

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
