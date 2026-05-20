import type { Request, Response } from "express";
import type { WebhooksService } from "../webhooks.service.js";

function createResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis()
  };

  return res as unknown as Response & typeof res;
}

it("responds to Meta webhook verification challenge", async () => {
  vi.resetModules();
  process.env.META_VERIFY_TOKEN = "verify-token";
  const { WebhooksController } = await import("../webhooks.controller.js");
  const controller = new WebhooksController({} as WebhooksService);
  const res = createResponse();

  await controller.metaChallenge(
    {
      query: {
        "hub.mode": "subscribe",
        "hub.verify_token": "verify-token",
        "hub.challenge": "challenge_123"
      }
    } as unknown as Request,
    res
  );

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.send).toHaveBeenCalledWith("challenge_123");
});
