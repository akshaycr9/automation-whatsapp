import { createTestRequest } from "../../../test/test-utils.js";

it("returns health status", async () => {
  const response = await createTestRequest().get("/health").expect(200);

  expect(response.body).toEqual({ data: { status: "ok" } });
});
