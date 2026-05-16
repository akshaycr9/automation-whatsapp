import { AUTOMATION_KEYS, MESSAGE_STATUSES } from "../index";

it("defines future automation keys and message lifecycle statuses", () => {
  expect(AUTOMATION_KEYS).toContain("cod_order_followup");
  expect(MESSAGE_STATUSES).toEqual(["queued", "sent", "delivered", "read", "failed"]);
});
