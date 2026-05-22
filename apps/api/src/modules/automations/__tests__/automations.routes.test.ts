import express from "express";
import request from "supertest";
import { errorHandler } from "../../../middleware/error-handler.js";
import { AutomationsController } from "../automations.controller.js";
import { createAutomationsRoutes } from "../automations.routes.js";
import { AutomationNotConfiguredError, AutomationNotFoundError } from "../domain/automation.errors.js";

const authMiddleware = (req: express.Request, _res: express.Response, next: express.NextFunction) => {
  req.auth = {
    adminUserId: "admin_123",
    email: "admin@example.com"
  };
  next();
};

function createRoutesTestApp(controller: AutomationsController, middleware = authMiddleware) {
  const app = express();
  app.use(express.json());
  app.use("/api/automations", createAutomationsRoutes(controller as never, middleware));
  app.use(errorHandler);

  return app;
}

it("GET /api/automations returns grouped flows", async () => {
  const service = {
    getAutomationsList: vi.fn().mockResolvedValue({ data: { flows: [{ id: "flow_123", automations: [] }] } })
  };
  const controller = new AutomationsController(service as never);
  const app = createRoutesTestApp(controller);

  const response = await request(app).get("/api/automations").expect(200);

  expect(response.body).toEqual({ data: { flows: [{ id: "flow_123", automations: [] }] } });
});

it("GET /api/automations/:id returns 404 when the automation is missing", async () => {
  const service = {
    getAutomationDetail: vi.fn().mockRejectedValue(new AutomationNotFoundError())
  };
  const controller = new AutomationsController(service as never);
  const app = createRoutesTestApp(controller);

  const response = await request(app).get("/api/automations/missing").expect(404);

  expect(response.body.error).toEqual({
    code: "AUTOMATION_NOT_FOUND",
    message: "Automation not found."
  });
});

it("PUT /api/automations/:id validates request body", async () => {
  const service = {
    update: vi.fn()
  };
  const controller = new AutomationsController(service as never);
  const app = createRoutesTestApp(controller);

  const response = await request(app)
    .put("/api/automations/auto_123")
    .send({
      templateId: "tmpl_123",
      delayMinutes: -1,
      variableMappings: []
    })
    .expect(400);

  expect(response.body.error.code).toBe("AUTOMATION_VALIDATION_ERROR");
  expect(response.body.error.details).toEqual([
    expect.objectContaining({
      field: "delayMinutes"
    })
  ]);
});

it("PUT /api/automations/:id returns updated detail", async () => {
  const service = {
    updateAutomation: vi.fn().mockResolvedValue({
      data: { id: "auto_123", delayMinutes: 30, variableMappings: [] }
    })
  };
  const controller = new AutomationsController(service as never);
  const app = createRoutesTestApp(controller);

  const response = await request(app)
    .put("/api/automations/auto_123")
    .send({
      templateId: null,
      delayMinutes: 30,
      variableMappings: []
    })
    .expect(200);

  expect(response.body.data).toEqual({ id: "auto_123", delayMinutes: 30, variableMappings: [] });
});

it("PATCH /api/automations/:id/toggle surfaces enable validation errors", async () => {
  const service = {
    toggleAutomation: vi
      .fn()
      .mockRejectedValue(
        new AutomationNotConfiguredError(
          "Automation cannot be enabled until a WhatsApp template and all required variables are configured."
        )
      )
  };
  const controller = new AutomationsController(service as never);
  const app = createRoutesTestApp(controller);

  const response = await request(app).patch("/api/automations/auto_123/toggle").send({ isEnabled: true }).expect(400);

  expect(response.body.error).toEqual({
    code: "AUTOMATION_NOT_CONFIGURED",
    message: "Automation cannot be enabled until a WhatsApp template and all required variables are configured."
  });
});

it("GET /api/automations/:id/field-options returns option groups", async () => {
  const service = {
    getFieldOptions: vi.fn().mockResolvedValue({
      data: {
        groups: [{ label: "Customer", options: [{ label: "First Name", value: "customer.firstName" }] }]
      }
    })
  };
  const controller = new AutomationsController(service as never);
  const app = createRoutesTestApp(controller);

  const response = await request(app).get("/api/automations/auto_123/field-options").expect(200);

  expect(response.body.data.groups[0].options[0]).toEqual({
    label: "First Name",
    value: "customer.firstName"
  });
});

it("requires auth middleware on automation routes", async () => {
  const service = {
    getAutomationsList: vi.fn()
  };
  const controller = new AutomationsController(service as never);
  const middleware = (_req: express.Request, res: express.Response) => {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
  };
  const app = createRoutesTestApp(controller, middleware);

  const response = await request(app).get("/api/automations").expect(401);

  expect(response.body.error.code).toBe("UNAUTHORIZED");
  expect(service.getAutomationsList).not.toHaveBeenCalled();
});
