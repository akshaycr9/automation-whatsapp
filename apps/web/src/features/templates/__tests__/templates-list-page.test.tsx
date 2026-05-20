import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { createMemoryRouter, RouterProvider } from "react-router";
import { renderWithProviders } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import { TemplateCategoryBadge } from "../components/TemplateList/TemplateCategoryBadge";
import { TemplateStatusBadge } from "../components/TemplateList/TemplateStatusBadge";
import { mockTemplates } from "../data/mockTemplates";
import { TemplatesListPage } from "../pages/templates-page";
import type { Template } from "../types/template.types";

function renderTemplatesList(templates = mockTemplates, detailTemplates = templates) {
  server.use(
    http.post("http://localhost:4000/api/auth/refresh", () =>
      HttpResponse.json({
        data: {
          admin: { id: "admin_123", email: "admin@example.com", lastLoginAt: null },
          accessToken: "access-token"
        }
      })
    ),
    http.get("http://localhost:4000/api/templates", () =>
      HttpResponse.json({
        data: templates,
        pagination: { page: 1, limit: templates.length, total: templates.length, totalPages: 1 }
      })
    ),
    http.get("http://localhost:4000/api/templates/:id", ({ params }) => {
      const template = detailTemplates.find((item) => item.id === params.id);
      return template
        ? HttpResponse.json({ data: template })
        : HttpResponse.json({ message: "Not found" }, { status: 404 });
    }),
    http.post("http://localhost:4000/api/templates/sync", () =>
      HttpResponse.json({
        data: { syncedCount: 0, createdCount: 0, updatedCount: 0, failedCount: 0 },
        message: "Templates synced successfully"
      })
    ),
    http.post("http://localhost:4000/api/templates/:id/sync", ({ params }) => {
      const template = templates.find((item) => item.id === params.id) ?? templates[0]!;
      return HttpResponse.json({
        data: { ...template, status: "APPROVED" },
        message: "Template synced successfully"
      });
    }),
    http.delete("http://localhost:4000/api/templates/:id", ({ params }) =>
      HttpResponse.json({ data: { id: params.id, status: "DELETED" }, message: "Template deleted successfully" })
    )
  );

  const router = createMemoryRouter(
    [
      { path: "/templates", element: <TemplatesListPage /> },
      { path: "/templates/create", element: <div>Create template route</div> }
    ],
    { initialEntries: ["/templates"] }
  );

  renderWithProviders(<RouterProvider router={router} />);

  return router;
}

it("renders mock templates", async () => {
  renderTemplatesList();

  expect(await screen.findAllByText("Order confirmation")).toHaveLength(2);
  expect(screen.getAllByText("order_confirmation_v1")).toHaveLength(2);
  expect(screen.getAllByText("Delivery update")).toHaveLength(2);
});

it("filters templates by search", async () => {
  const user = userEvent.setup();
  renderTemplatesList();

  await screen.findAllByText("Order confirmation");
  await user.type(screen.getByLabelText(/search templates/i), "cart");

  expect(screen.getAllByText("Abandoned cart reminder")).toHaveLength(2);
  expect(screen.queryByText("Order confirmation")).not.toBeInTheDocument();
});

it("filters templates by status", async () => {
  const user = userEvent.setup();
  renderTemplatesList();

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getByRole("button", { name: /rejected/i }));

  expect(screen.getAllByText("New collection offer")).toHaveLength(2);
  expect(screen.queryByText("Order shipped")).not.toBeInTheDocument();
});

it("opens advanced filters and filters by category", async () => {
  const user = userEvent.setup();
  renderTemplatesList();

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getByRole("button", { name: "Filters" }));
  await user.selectOptions(screen.getByLabelText("Category"), "MARKETING");

  expect(screen.getAllByText("Abandoned cart reminder")).toHaveLength(2);
  expect(screen.queryByText("Order confirmation")).not.toBeInTheDocument();
});

it("shows empty state for filters with no matches", async () => {
  const user = userEvent.setup();
  renderTemplatesList();

  await screen.findAllByText("Order confirmation");
  await user.type(screen.getByLabelText(/search templates/i), "does_not_exist");

  expect(screen.getByText("No templates match your filters.")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(screen.getAllByText("Order confirmation")).toHaveLength(2);
});

it("navigates to the create template route", async () => {
  const user = userEvent.setup();
  const router = renderTemplatesList();

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getByRole("button", { name: "Create Template" }));

  expect(router.state.location.pathname).toBe("/templates/create");
});

it("opens template details in a modal when a template row is clicked", async () => {
  const user = userEvent.setup();
  const templateWithPreview: Template = {
    ...mockTemplates[0]!,
    components: [
      { id: "header", type: "HEADER", format: "TEXT", text: "Order {{1}} confirmed" },
      {
        id: "body",
        type: "BODY",
        text: "Hi {{1}}, your order is ready.",
        variables: [{ key: "customerName", index: 1, token: "{{1}}", sampleValue: "Akshay" }]
      },
      { id: "footer", type: "FOOTER", text: "Reply STOP to opt out." },
      { id: "buttons", type: "BUTTONS", buttons: [{ id: "track", type: "URL", text: "Track order" }] }
    ]
  };
  const templateSummary: Template = { ...templateWithPreview };
  delete templateSummary.components;
  const router = renderTemplatesList([templateSummary], [templateWithPreview]);

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getAllByText("Order confirmation")[0]!);

  expect(router.state.location.pathname).toBe("/templates");
  const dialog = screen.getByRole("dialog", { name: "Order confirmation" });
  expect(dialog).toBeInTheDocument();
  expect(within(dialog).queryByText("order_confirmation_v1")).not.toBeInTheDocument();
  expect(within(dialog).getByText("Utility")).toBeInTheDocument();
  expect(await screen.findByText("Order [Akshay] confirmed")).toBeInTheDocument();
  expect(await screen.findByText("Hi [Akshay], your order is ready.")).toBeInTheDocument();
  expect(await screen.findByText("Reply STOP to opt out.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /track order/i })).toBeInTheDocument();
  expect(screen.queryByText("Template message is not available.")).not.toBeInTheDocument();
});

it("closes the template details modal from the close icon", async () => {
  const user = userEvent.setup();
  renderTemplatesList();

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getAllByText("Order confirmation")[0]!);
  expect(screen.getByRole("dialog", { name: "Order confirmation" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Close template details" }));

  expect(screen.queryByRole("dialog", { name: "Order confirmation" })).not.toBeInTheDocument();
});

it("closes the template details modal with Escape", async () => {
  const user = userEvent.setup();
  renderTemplatesList();

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getAllByText("Order confirmation")[0]!);
  expect(screen.getByRole("dialog", { name: "Order confirmation" })).toBeInTheDocument();

  await user.keyboard("{Escape}");

  expect(screen.queryByRole("dialog", { name: "Order confirmation" })).not.toBeInTheDocument();
});

it("renders only duplicate and delete row actions", async () => {
  renderTemplatesList();

  await screen.findAllByText("Order confirmation");

  expect(screen.getAllByRole("button", { name: "Duplicate template" })).toHaveLength(12);
  expect(screen.getAllByRole("button", { name: "Delete template" })).toHaveLength(12);
  expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "View" })).not.toBeInTheDocument();
});

it("renders sync actions and created dates", async () => {
  renderTemplatesList();

  await screen.findAllByText("Order confirmation");

  expect(screen.getByRole("button", { name: /sync templates/i })).toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "Sync" })).toHaveLength(10);
  expect(screen.getAllByText(/May 01, 2026/)).toHaveLength(2);
  expect(screen.getAllByText(/Created May 01, 2026/)).toHaveLength(1);
  expect(screen.getByText("Drafts sync after submission")).toBeInTheDocument();
  expect(screen.getByText("Not available")).toBeInTheDocument();
});

it("shows and dismisses a success notification after bulk sync", async () => {
  const user = userEvent.setup();
  renderTemplatesList();
  server.use(
    http.post("http://localhost:4000/api/templates/sync", () =>
      HttpResponse.json({
        data: { syncedCount: 3, createdCount: 0, updatedCount: 2, failedCount: 1 },
        message: "Templates synced successfully"
      })
    )
  );

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getByRole("button", { name: /sync templates/i }));

  expect(await screen.findByRole("status")).toHaveTextContent("Templates synced. Updated 2, failed 1.");

  await user.click(screen.getByRole("button", { name: "Dismiss notification" }));

  expect(screen.queryByText("Templates synced. Updated 2, failed 1.")).not.toBeInTheDocument();
});

it("shows an error notification when bulk sync fails", async () => {
  const user = userEvent.setup();
  renderTemplatesList();
  server.use(
    http.post("http://localhost:4000/api/templates/sync", () =>
      HttpResponse.json(
        { error: { code: "TEMPLATE_SYNC_FAILED", message: "Meta credentials are missing." } },
        { status: 500 }
      )
    )
  );

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getByRole("button", { name: /sync templates/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Meta credentials are missing.");
});

it("keeps advanced filters inside the filter dropdown", async () => {
  const user = userEvent.setup();
  renderTemplatesList();

  await screen.findAllByText("Order confirmation");
  expect(screen.queryByLabelText("Category")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /filters/i }));

  expect(screen.getByLabelText("Status")).toBeInTheDocument();
  expect(screen.getByLabelText("Category")).toBeInTheDocument();
  expect(screen.getByLabelText("Language")).toBeInTheDocument();
  expect(screen.getByLabelText("Type")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
});

it("shows syncing feedback for the clicked template", async () => {
  const user = userEvent.setup();
  let syncCalled = false;
  renderTemplatesList();
  server.use(
    http.post("http://localhost:4000/api/templates/tmpl_delivery_update_v1/sync", async () => {
      syncCalled = true;
      await delay(100);
      return HttpResponse.json({
        data: { ...mockTemplates[5], status: "APPROVED" },
        message: "Template synced successfully"
      });
    })
  );

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getAllByRole("button", { name: "Sync" })[0]!);

  expect(await screen.findAllByRole("button", { name: "Syncing" })).toHaveLength(2);
  expect(syncCalled).toBe(true);
});

it("shows a success notification after row sync", async () => {
  const user = userEvent.setup();
  renderTemplatesList();

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getAllByRole("button", { name: "Sync" })[0]!);

  expect(await screen.findByRole("status")).toHaveTextContent("Delivery update synced. Status is Approved.");
});

it("shows an error notification when row sync fails", async () => {
  const user = userEvent.setup();
  renderTemplatesList();
  server.use(
    http.post("http://localhost:4000/api/templates/tmpl_delivery_update_v1/sync", () =>
      HttpResponse.json(
        { error: { code: "TEMPLATE_SYNC_FAILED", message: "Template was not found on Meta." } },
        { status: 404 }
      )
    )
  );

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getAllByRole("button", { name: "Sync" })[0]!);

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Delivery update could not be synced: Template was not found on Meta."
  );
});

it("shows retry action for error templates and calls retry API", async () => {
  const user = userEvent.setup();
  let retryCalled = false;
  server.use(
    http.post("http://localhost:4000/api/templates/tmpl_error/retry-submission", () => {
      retryCalled = true;
      return HttpResponse.json({
        data: { ...mockTemplates[0], id: "tmpl_error", status: "PENDING" },
        message: "Template resubmitted to Meta."
      });
    })
  );
  const errorTemplate: Template = {
    ...mockTemplates[0]!,
    id: "tmpl_error",
    status: "ERROR",
    rejectionReason: "Meta unavailable"
  };
  renderTemplatesList([errorTemplate]);

  expect(await screen.findAllByText("Meta unavailable")).toHaveLength(2);
  await user.click(screen.getAllByRole("button", { name: "Retry template submission" })[0]!);

  expect(retryCalled).toBe(true);
  expect(await screen.findByRole("status")).toHaveTextContent("Order confirmation resubmitted. Status is Pending.");
});

it("shows a success notification after delete", async () => {
  const user = userEvent.setup();
  const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
  renderTemplatesList();

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getAllByRole("button", { name: "Delete template" })[0]!);

  expect(await screen.findByRole("status")).toHaveTextContent("Template deleted locally.");

  confirmSpy.mockRestore();
});

it("hides empty Meta rejection reasons from the template column", async () => {
  renderTemplatesList([{ ...mockTemplates[0]!, rejectionReason: "NONE" }]);

  await screen.findAllByText("Order confirmation");

  expect(screen.queryByText("NONE")).not.toBeInTheDocument();
});

it("renders status and category badges", () => {
  renderWithProviders(
    <div>
      <TemplateStatusBadge status="APPROVED" />
      <TemplateCategoryBadge category="UTILITY" />
    </div>
  );

  expect(screen.getByText("Approved")).toBeInTheDocument();
  expect(screen.getByText("Utility")).toBeInTheDocument();
});
