it("accepts a valid WhatsApp webhook verification challenge", async () => {
  vi.resetModules();
  process.env.META_VERIFY_TOKEN = "verify-token";
  const { WhatsAppWebhookVerificationService } = await import("../services/whatsapp-webhook-verification.service.js");

  expect(
    new WhatsAppWebhookVerificationService().verifyChallenge({
      mode: "subscribe",
      verifyToken: "verify-token",
      challenge: "challenge_123"
    })
  ).toBe("challenge_123");
});

it("rejects an invalid WhatsApp webhook verification challenge", async () => {
  vi.resetModules();
  process.env.META_VERIFY_TOKEN = "verify-token";
  const { WhatsAppWebhookVerificationService } = await import("../services/whatsapp-webhook-verification.service.js");

  expect(() =>
    new WhatsAppWebhookVerificationService().verifyChallenge({
      mode: "subscribe",
      verifyToken: "wrong-token",
      challenge: "challenge_123"
    })
  ).toThrow("WhatsApp webhook verification failed.");
});
