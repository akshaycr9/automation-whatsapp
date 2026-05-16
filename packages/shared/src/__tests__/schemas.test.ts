import { paginationSchema } from "../schemas/common.schema";

it("applies pagination defaults", () => {
  expect(paginationSchema.parse({})).toEqual({ page: 1, pageSize: 25 });
});
