import { describe, expect, it } from "vitest";
import { templateApi } from "../api/templateApi";
import { mockTemplates } from "../data/mockTemplates";
import { templateKeys } from "../hooks/templateKeys";

describe("template API and query keys", () => {
  it("builds stable query keys", () => {
    const filters = { status: "APPROVED" as const };

    expect(templateKeys.all).toEqual(["templates"]);
    expect(templateKeys.lists()).toEqual(["templates", "list"]);
    expect(templateKeys.list(filters)).toEqual(["templates", "list", filters]);
    expect(templateKeys.details()).toEqual(["templates", "detail"]);
    expect(templateKeys.detail("tmpl_1")).toEqual(["templates", "detail", "tmpl_1"]);
  });

  it("returns mock templates in an API response envelope", async () => {
    const response = await templateApi.getTemplates();

    expect(response.data).toHaveLength(mockTemplates.length);
    expect(response.pagination.total).toBe(mockTemplates.length);
  });

  it("filters mock templates in the API layer", async () => {
    const response = await templateApi.getTemplates({ status: "APPROVED" });

    expect(response.data.every((template) => template.status === "APPROVED")).toBe(true);
  });

  it("returns a single template by id", async () => {
    const response = await templateApi.getTemplateById("tmpl_order_confirmation_v1");

    expect(response.data.name).toBe("order_confirmation_v1");
  });
});
