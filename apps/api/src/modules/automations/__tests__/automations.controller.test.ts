import type { Request, Response } from "express";
import { AutomationsController } from "../automations.controller.js";
import type { AutomationsService } from "../automations.service.js";

function createResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
  };

  return res as unknown as Response & typeof res;
}

const auth = { adminUserId: "admin_123", email: "admin@example.com" };

it("returns automation list from the service", async () => {
  const getAutomationsList = vi.fn().mockResolvedValue({ data: { flows: [] } });
  const controller = new AutomationsController({ getAutomationsList } as unknown as AutomationsService);
  const res = createResponse();

  await controller.list({ auth } as unknown as Request, res);

  expect(getAutomationsList).toHaveBeenCalledWith();
  expect(res.json).toHaveBeenCalledWith({ data: { flows: [] } });
});

it("returns automation detail by id", async () => {
  const getAutomationDetail = vi.fn().mockResolvedValue({ data: { id: "auto_123" } });
  const controller = new AutomationsController({ getAutomationDetail } as unknown as AutomationsService);
  const res = createResponse();

  await controller.detail({ params: { id: "auto_123" }, auth } as unknown as Request, res);

  expect(getAutomationDetail).toHaveBeenCalledWith("auto_123");
  expect(res.json).toHaveBeenCalledWith({ data: { id: "auto_123" } });
});

it("updates automation with tenant scope", async () => {
  const updateAutomation = vi.fn().mockResolvedValue({ data: { id: "auto_123", delayMinutes: 10 } });
  const controller = new AutomationsController({ updateAutomation } as unknown as AutomationsService);
  const res = createResponse();

  await controller.update(
    {
      params: { id: "auto_123" },
      auth,
      body: {
        templateId: "tmpl_123",
        delayMinutes: 10,
        variableMappings: [
          {
            templateVariableName: "body_1",
            componentType: "BODY",
            variableIndex: 1,
            sourceField: "customer.firstName"
          }
        ]
      }
    } as unknown as Request,
    res
  );

  expect(updateAutomation).toHaveBeenCalledWith(
    "auto_123",
    {
      templateId: "tmpl_123",
      delayMinutes: 10,
      variableMappings: [
        {
          templateVariableName: "body_1",
          componentType: "BODY",
          variableIndex: 1,
          sourceField: "customer.firstName"
        }
      ]
    },
    { adminUserId: "admin_123" }
  );
  expect(res.json).toHaveBeenCalledWith({ data: { id: "auto_123", delayMinutes: 10 } });
});

it("toggles automation enabled state", async () => {
  const toggleAutomation = vi.fn().mockResolvedValue({ data: { id: "auto_123", isEnabled: true } });
  const controller = new AutomationsController({ toggleAutomation } as unknown as AutomationsService);
  const res = createResponse();

  await controller.toggle({ params: { id: "auto_123" }, auth, body: { isEnabled: true } } as unknown as Request, res);

  expect(toggleAutomation).toHaveBeenCalledWith("auto_123", { isEnabled: true });
  expect(res.json).toHaveBeenCalledWith({ data: { id: "auto_123", isEnabled: true } });
});

it("returns field options by automation id", async () => {
  const getFieldOptions = vi.fn().mockResolvedValue({ data: { groups: [] } });
  const controller = new AutomationsController({ getFieldOptions } as unknown as AutomationsService);
  const res = createResponse();

  await controller.fieldOptions({ params: { id: "auto_123" }, auth } as unknown as Request, res);

  expect(getFieldOptions).toHaveBeenCalledWith("auto_123");
  expect(res.json).toHaveBeenCalledWith({ data: { groups: [] } });
});
