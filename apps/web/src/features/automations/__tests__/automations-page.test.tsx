import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { createMemoryRouter, RouterProvider } from "react-router";
import { renderWithProviders } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import { AutomationConfigurePage } from "../pages/automation-configure-page";
import { AutomationsPage } from "../pages/automations-page";

function renderAutomations(initialEntries = ["/automations"]) {
  server.use(
    http.post("http://localhost:4000/api/auth/refresh", () =>
      HttpResponse.json({
        data: {
          admin: { id: "admin_123", email: "admin@example.com", lastLoginAt: null },
          accessToken: "access-token"
        }
      })
    ),
    http.get("http://localhost:4000/api/automations", () => HttpResponse.json({ data: automationsList() })),
    http.get("http://localhost:4000/api/automations/:id", ({ params }) => {
      const id = String(params.id);
      return HttpResponse.json({ data: automationDetail({ id }) });
    }),
    http.get("http://localhost:4000/api/automations/:id/field-options", () =>
      HttpResponse.json({
        data: {
          groups: [
            {
              label: "Customer",
              options: [{ label: "First Name", value: "customer.firstName" }]
            },
            {
              label: "Order",
              options: [{ label: "Name", value: "order.name" }]
            }
          ]
        }
      })
    ),
    http.get("http://localhost:4000/api/templates", () =>
      HttpResponse.json({
        data: [approvedTemplate()],
        pagination: { page: 1, limit: 1, total: 1, totalPages: 1 }
      })
    ),
    http.get("http://localhost:4000/api/templates/:id", () => HttpResponse.json({ data: approvedTemplate() })),
    http.put("http://localhost:4000/api/automations/:id", () =>
      HttpResponse.json({ data: automationDetail({ isConfigured: true }) })
    ),
    http.patch("http://localhost:4000/api/automations/:id/toggle", () =>
      HttpResponse.json({ data: automationDetail({ isEnabled: true, isConfigured: true }) })
    )
  );

  const router = createMemoryRouter(
    [
      { path: "/automations", element: <AutomationsPage /> },
      { path: "/automations/:id", element: <AutomationConfigurePage /> }
    ],
    { initialEntries }
  );

  renderWithProviders(<RouterProvider router={router} />);

  return router;
}

function fireTouch(element: Element, type: string, clientY: number) {
  element.dispatchEvent(
    new TouchEvent(type, {
      bubbles: true,
      cancelable: true,
      touches: type === "touchend" ? [] : [{ clientY } as Touch],
      changedTouches: [{ clientY } as Touch]
    })
  );
}

it("renders grouped automation flows and trigger button text", async () => {
  const user = userEvent.setup();
  renderAutomations();

  expect(await screen.findByRole("heading", { name: "Automations" })).toBeInTheDocument();
  expect((await screen.findAllByText("Order Flow")).length).toBeGreaterThanOrEqual(2);
  expect((await screen.findAllByText("Cash on Delivery Flow")).length).toBeGreaterThanOrEqual(2);
  for (const button of screen.getAllByRole("button", { name: /cash on delivery flow/i })) {
    await user.click(button);
  }
  expect((await screen.findAllByText("Button: Confirm my order")).length).toBeGreaterThanOrEqual(1);
});

it("navigates from a configure action to the automation detail route", async () => {
  const user = userEvent.setup();
  const router = renderAutomations();

  expect(await screen.findAllByText("Order Confirmed")).toHaveLength(2);
  await user.click(screen.getAllByRole("button", { name: "Configure" })[0]!);

  expect(router.state.location.pathname).toBe("/automations/auto_order");
});

it("shows backend enable validation failures from the list toggle", async () => {
  const user = userEvent.setup();
  renderAutomations();
  server.use(
    http.patch("http://localhost:4000/api/automations/:id/toggle", () =>
      HttpResponse.json(
        {
          error: {
            code: "AUTOMATION_NOT_CONFIGURED",
            message: "Automation cannot be enabled until a WhatsApp template and all required variables are configured."
          }
        },
        { status: 400 }
      )
    )
  );

  expect(await screen.findAllByText("Order Confirmed")).toHaveLength(2);
  await user.click(screen.getAllByRole("switch", { name: /enable order confirmed/i })[0]!);

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Automation cannot be enabled until a WhatsApp template and all required variables are configured."
  );
});

it("pull to refresh refetches the automation list", async () => {
  let requestCount = 0;
  renderAutomations();
  server.use(
    http.get("http://localhost:4000/api/automations", () => {
      requestCount += 1;
      return HttpResponse.json({ data: automationsList() });
    })
  );

  const heading = await screen.findByRole("heading", { name: "Automations" });
  const section = heading.closest("section");
  expect(section).not.toBeNull();

  await act(async () => {
    fireTouch(section!, "touchstart", 0);
    fireTouch(section!, "touchmove", 120);
    fireTouch(section!, "touchend", 120);
  });

  await waitFor(() => expect(requestCount).toBeGreaterThan(0));
});

it("loads the configure page with breadcrumbs, trigger button, fields, and preview", async () => {
  renderAutomations(["/automations/auto_cod_confirmed"]);

  expect(await screen.findByRole("heading", { name: "Configure COD Order Confirmed" })).toBeInTheDocument();
  expect(screen.getByRole("navigation", { name: "Automation breadcrumb" })).toHaveTextContent(
    "Automations/Cash on Delivery Flow/COD Order Confirmed"
  );
  expect(screen.getByText("Trigger button: Confirm my order")).toBeInTheDocument();
  expect(await screen.findByText("Approved template")).toBeInTheDocument();
  expect(await screen.findByText("Select source field")).toBeInTheDocument();
  expect(screen.getByText("Example output")).toBeInTheDocument();
});

it("saves configuration, returns to list, and shows the listing notification", async () => {
  const user = userEvent.setup();
  const router = renderAutomations(["/automations/auto_cod_confirmed"]);
  let savedPayload: unknown;
  server.use(
    http.put("http://localhost:4000/api/automations/:id", async ({ request }) => {
      savedPayload = await request.json();
      return HttpResponse.json({ data: automationDetail({ isConfigured: true }) });
    })
  );

  await screen.findByRole("heading", { name: "Configure COD Order Confirmed" });
  await user.selectOptions(screen.getByLabelText("Source field"), "customer.firstName");
  await user.click(screen.getByRole("button", { name: "Save Configuration" }));

  await waitFor(() => expect(router.state.location.pathname).toBe("/automations"));
  expect(savedPayload).toMatchObject({
    templateId: "tmpl_123",
    delayMinutes: 0,
    variableMappings: [expect.objectContaining({ sourceField: "customer.firstName" })]
  });
  expect(await screen.findByRole("status")).toHaveTextContent("Automation configuration saved.");
});

it("shows frontend validation when enabling an incomplete automation on configure page", async () => {
  const user = userEvent.setup();
  renderAutomations(["/automations/auto_cod_confirmed"]);

  await screen.findByRole("heading", { name: "Configure COD Order Confirmed" });
  await user.click(screen.getByRole("switch", { name: "Enable COD Order Confirmed" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Map every required template variable");
});

function automationsList() {
  return {
    flows: [
      {
        id: "flow_order",
        key: "ORDER_FLOW",
        name: "Order Flow",
        description: "Order lifecycle automations.",
        sortOrder: 1,
        automations: [
          {
            id: "auto_order",
            key: "ORDER_CONFIRMED",
            name: "Order Confirmed",
            description: "Sent when an order is created.",
            triggerSource: "SHOPIFY",
            triggerEvent: "ORDER_CREATED",
            triggerButtonText: null,
            isEnabled: false,
            templateId: null,
            templateName: null,
            delayMinutes: 0,
            sortOrder: 1,
            isConfigured: false,
            mappedVariablesCount: 0,
            requiredVariablesCount: 0
          }
        ]
      },
      {
        id: "flow_cod",
        key: "COD_FLOW",
        name: "Cash on Delivery Flow",
        description: "COD confirmation automations.",
        sortOrder: 2,
        automations: [
          {
            id: "auto_cod_confirmed",
            key: "COD_ORDER_CONFIRMED",
            name: "COD Order Confirmed",
            description: "Sent when the customer confirms COD.",
            triggerSource: "WHATSAPP",
            triggerEvent: "BUTTON_REPLY",
            triggerButtonText: "Confirm my order",
            isEnabled: false,
            templateId: "tmpl_123",
            templateName: "COD confirmed",
            delayMinutes: 0,
            sortOrder: 1,
            isConfigured: false,
            mappedVariablesCount: 0,
            requiredVariablesCount: 1
          }
        ]
      },
      {
        id: "flow_cart",
        key: "ABANDONED_CART_FLOW",
        name: "Abandoned Cart Flow",
        description: "Checkout recovery automations.",
        sortOrder: 3,
        automations: []
      }
    ]
  };
}

function automationDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: "auto_cod_confirmed",
    flow: { id: "flow_cod", key: "COD_FLOW", name: "Cash on Delivery Flow" },
    key: "COD_ORDER_CONFIRMED",
    name: "COD Order Confirmed",
    description: "COD button reply received.",
    triggerSource: "WHATSAPP",
    triggerEvent: "BUTTON_REPLY",
    triggerButtonText: "Confirm my order",
    isEnabled: false,
    templateId: "tmpl_123",
    template: {
      id: "tmpl_123",
      name: "COD confirmed",
      language: "en",
      category: "UTILITY",
      status: "APPROVED",
      components: [{ componentType: "BODY", text: "Thanks {{1}}, your COD order is confirmed.", sortOrder: 1 }],
      variables: [
        {
          templateVariableName: "body_1",
          componentType: "BODY",
          variableIndex: 1,
          placeholder: "{{1}}",
          sampleValue: "Aanya",
          sourceKey: null
        }
      ]
    },
    delayMinutes: 0,
    sortOrder: 1,
    isConfigured: false,
    requiredVariables: [
      {
        templateVariableName: "body_1",
        componentType: "BODY",
        variableIndex: 1,
        placeholder: "{{1}}",
        sampleValue: "Aanya",
        sourceKey: null
      }
    ],
    variableMappings: [],
    ...overrides
  };
}

function approvedTemplate() {
  return {
    id: "tmpl_123",
    name: "cod_confirmed",
    displayName: "COD confirmed",
    category: "UTILITY",
    type: "TEXT",
    languageCode: "en",
    status: "APPROVED",
    createdAt: "2026-05-19T10:00:00.000Z",
    updatedAt: "2026-05-19T10:00:00.000Z",
    components: {
      body: { text: "Thanks {{1}}, your COD order is confirmed." },
      buttons: []
    },
    variables: [
      {
        componentType: "BODY",
        position: 1,
        placeholder: "{{1}}",
        sampleValue: "Aanya",
        sourceKey: null
      }
    ]
  };
}
