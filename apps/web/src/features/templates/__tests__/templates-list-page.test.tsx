import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { createMemoryRouter, RouterProvider } from "react-router";
import { renderWithProviders } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import { TemplateCategoryBadge } from "../components/TemplateList/TemplateCategoryBadge";
import { TemplateStatusBadge } from "../components/TemplateList/TemplateStatusBadge";
import { mockTemplates } from "../data/mockTemplates";
import { TemplatesListPage } from "../pages/templates-page";

function renderTemplatesList() {
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
        data: mockTemplates,
        pagination: { page: 1, limit: mockTemplates.length, total: mockTemplates.length, totalPages: 1 }
      })
    ),
    http.post("http://localhost:4000/api/templates/sync", () =>
      HttpResponse.json({
        data: { syncedCount: 0, createdCount: 0, updatedCount: 0, failedCount: 0 },
        message: "Templates synced successfully"
      })
    ),
    http.delete("http://localhost:4000/api/templates/:id", ({ params }) =>
      HttpResponse.json({ data: { id: params.id, status: "DELETED" }, message: "Template deleted successfully" })
    )
  );

  const router = createMemoryRouter(
    [
      { path: "/templates", element: <TemplatesListPage /> },
      { path: "/templates/create", element: <div>Create template route</div> },
      { path: "/templates/:id", element: <div>Template detail route</div> }
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
  await user.selectOptions(screen.getByLabelText("Status", { selector: "#template-status" }), "REJECTED");

  expect(screen.getAllByText("New collection offer")).toHaveLength(2);
  expect(screen.queryByText("Order shipped")).not.toBeInTheDocument();
});

it("shows empty state for filters with no matches", async () => {
  const user = userEvent.setup();
  renderTemplatesList();

  await screen.findAllByText("Order confirmation");
  await user.type(screen.getByLabelText(/search templates/i), "does_not_exist");

  expect(screen.getByText("No templates match your filters.")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /clear filters/i }));
  expect(screen.getAllByText("Order confirmation")).toHaveLength(2);
});

it("navigates to the create template route", async () => {
  const user = userEvent.setup();
  const router = renderTemplatesList();

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getByRole("button", { name: "Create Template" }));

  expect(router.state.location.pathname).toBe("/templates/create");
});

it("navigates to detail when a template row is clicked", async () => {
  const user = userEvent.setup();
  const router = renderTemplatesList();

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getAllByText("Order confirmation")[0]!);

  expect(router.state.location.pathname).toBe("/templates/tmpl_order_confirmation_v1");
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

  expect(screen.getAllByRole("button", { name: "Sync" })).toHaveLength(10);
  expect(screen.getAllByText(/May 01, 2026/)).toHaveLength(2);
  expect(screen.getAllByText(/Created May 01, 2026/)).toHaveLength(1);
  expect(screen.getByText("Drafts sync after submission")).toBeInTheDocument();
  expect(screen.getByText("Not available")).toBeInTheDocument();
});

it("shows syncing feedback for the clicked template", async () => {
  const user = userEvent.setup();
  renderTemplatesList();

  await screen.findAllByText("Order confirmation");
  await user.click(screen.getAllByRole("button", { name: "Sync" })[0]!);

  expect(screen.getAllByRole("button", { name: "Syncing" })).toHaveLength(2);
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
