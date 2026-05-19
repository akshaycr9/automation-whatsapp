import { TemplateCategory, TemplateStatus, TemplateType } from "@prisma/client";
import type { Request, Response } from "express";
import { TemplatesController } from "../templates.controller.js";
import type { TemplateDomainService } from "../services/template-domain.service.js";

function createResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
  };

  return res as unknown as Response & typeof res;
}

const auth = { adminUserId: "admin_123", email: "admin@example.com" };

it("returns a paginated scoped template list", async () => {
  const listTemplates = vi.fn().mockResolvedValue({
    data: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
  });
  const controller = new TemplatesController({ listTemplates } as unknown as TemplateDomainService);
  const res = createResponse();

  await controller.list({ query: { page: "1" }, auth } as unknown as Request, res);

  expect(listTemplates).toHaveBeenCalledWith({ page: 1 }, { adminUserId: "admin_123" });
  expect(res.json).toHaveBeenCalledWith({
    data: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
  });
});

it("returns template detail by id with tenant scope", async () => {
  const getTemplateById = vi.fn().mockResolvedValue({ data: { id: "tmpl_123" } });
  const controller = new TemplatesController({ getTemplateById } as unknown as TemplateDomainService);
  const res = createResponse();

  await controller.detail({ params: { id: "tmpl_123" }, auth } as unknown as Request, res);

  expect(getTemplateById).toHaveBeenCalledWith("tmpl_123", { adminUserId: "admin_123" });
  expect(res.json).toHaveBeenCalledWith({ data: { id: "tmpl_123" } });
});

it("creates a local template and returns the Phase 12 create response", async () => {
  const createLocalTemplate = vi.fn().mockResolvedValue({
    data: {
      id: "tmpl_123",
      name: "order_confirmation_v1",
      displayName: "Order Confirmation",
      category: TemplateCategory.UTILITY,
      type: TemplateType.TEXT,
      languageCode: "en",
      status: TemplateStatus.DRAFT,
      createdAt: "2026-05-19T10:00:00.000Z",
      updatedAt: "2026-05-19T10:00:00.000Z"
    }
  });
  const controller = new TemplatesController({ createLocalTemplate } as unknown as TemplateDomainService);
  const res = createResponse();

  await controller.create(
    {
      auth,
      body: {
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
      }
    } as unknown as Request,
    res
  );

  expect(createLocalTemplate).toHaveBeenCalledWith(expect.objectContaining({ name: "order_confirmation_v1" }), {
    adminUserId: "admin_123"
  });
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({
    data: expect.objectContaining({ id: "tmpl_123", status: TemplateStatus.DRAFT }),
    message: "Template created successfully"
  });
});

it("returns the sync result from the template service", async () => {
  const syncTemplates = vi.fn().mockResolvedValue({
    data: { syncedCount: 0, createdCount: 0, updatedCount: 0, failedCount: 0 },
    message: "Templates synced successfully"
  });
  const controller = new TemplatesController({ syncTemplates } as unknown as TemplateDomainService);
  const res = createResponse();

  await controller.sync({ auth } as unknown as Request, res);

  expect(syncTemplates).toHaveBeenCalledWith({ adminUserId: "admin_123" });
  expect(res.json).toHaveBeenCalledWith({
    data: { syncedCount: 0, createdCount: 0, updatedCount: 0, failedCount: 0 },
    message: "Templates synced successfully"
  });
});
