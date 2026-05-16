import { TemplatesService } from "../templates.service.js";

it("can construct the templates service placeholder", () => {
  expect(new TemplatesService()).toBeInstanceOf(TemplatesService);
});
