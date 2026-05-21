import { AUTOMATION_KEYS, MESSAGE_STATUSES } from "../index";

it("defines future automation keys and message lifecycle statuses", () => {
  expect(AUTOMATION_KEYS).toContain("COD_ORDER_FOLLOW_UP");
  expect(MESSAGE_STATUSES).toEqual(["queued", "sent", "delivered", "read", "failed"]);
});
