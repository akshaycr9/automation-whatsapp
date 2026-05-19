import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import { templateApi } from "../api/templateApi";
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

  it("builds GET query params and unwraps backend list responses", async () => {
    server.use(
      http.get("http://localhost:4000/api/templates", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("status")).toBe("APPROVED");
        expect(url.searchParams.get("category")).toBe("UTILITY");
        expect(url.searchParams.get("search")).toBe("order");
        expect(url.searchParams.has("languageCode")).toBe(false);

        return HttpResponse.json({
          data: [
            {
              id: "tmpl_123",
              name: "order_confirmation_v1",
              displayName: "Order Confirmation",
              category: "UTILITY",
              type: "TEXT",
              languageCode: "en",
              status: "APPROVED",
              qualityRating: "GREEN",
              rejectionReason: null,
              createdAt: "2026-05-19T10:00:00.000Z",
              updatedAt: "2026-05-19T10:00:00.000Z"
            }
          ],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        });
      })
    );

    const response = await templateApi.getTemplates({
      search: "order",
      status: "APPROVED",
      category: "UTILITY",
      languageCode: "ALL"
    });

    expect(response.data[0]?.qualityRating).toBe("GREEN");
    expect(response.pagination.totalPages).toBe(1);
  });

  it("posts create payloads to the backend", async () => {
    server.use(
      http.post("http://localhost:4000/api/templates", async ({ request }) => {
        expect(await request.json()).toEqual({
          name: "order_confirmation_v1",
          displayName: "Order Confirmation",
          category: "UTILITY",
          type: "TEXT",
          languageCode: "en",
          components: {
            body: { text: "Hi {{1}}" },
            buttons: []
          },
          variables: [{ componentType: "BODY", position: 1, placeholder: "{{1}}", sampleValue: "Akshay" }]
        });

        return HttpResponse.json({
          data: {
            id: "tmpl_123",
            name: "order_confirmation_v1",
            displayName: "Order Confirmation",
            category: "UTILITY",
            type: "TEXT",
            languageCode: "en",
            status: "PENDING",
            createdAt: "2026-05-19T10:00:00.000Z",
            updatedAt: "2026-05-19T10:00:00.000Z"
          },
          message: "Template created successfully"
        });
      })
    );

    const response = await templateApi.createTemplate({
      name: "order_confirmation_v1",
      displayName: "Order Confirmation",
      category: "UTILITY",
      type: "TEXT",
      languageCode: "en",
      components: {
        body: { text: "Hi {{1}}" },
        buttons: []
      },
      variables: [{ componentType: "BODY", position: 1, placeholder: "{{1}}", sampleValue: "Akshay" }]
    });

    expect(response.data.status).toBe("PENDING");
  });
});
