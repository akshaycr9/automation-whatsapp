import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { createMemoryRouter, RouterProvider } from "react-router";
import { renderWithProviders } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import { CreateTemplatePage } from "../pages/create-template-page";
import { TemplatesListPage } from "../pages/templates-page";
import { mockTemplates } from "../data/mockTemplates";

function renderCreateTemplatePage(listElement = <div>Templates list route</div>) {
  const router = createMemoryRouter(
    [
      { path: "/templates/create", element: <CreateTemplatePage /> },
      { path: "/templates", element: listElement }
    ],
    { initialEntries: ["/templates/create"] }
  );

  renderWithProviders(<RouterProvider router={router} />);

  return router;
}

function mockTemplateList() {
  server.use(
    http.get("http://localhost:4000/api/templates", () =>
      HttpResponse.json({
        data: mockTemplates,
        pagination: { page: 1, limit: mockTemplates.length, total: mockTemplates.length, totalPages: 1 }
      })
    ),
    http.get("http://localhost:4000/api/templates/:id", ({ params }) => {
      const template = mockTemplates.find((item) => item.id === params.id);
      return template
        ? HttpResponse.json({ data: template })
        : HttpResponse.json({ message: "Not found" }, { status: 404 });
    }),
    http.post("http://localhost:4000/api/templates/sync", () =>
      HttpResponse.json({
        data: { syncedCount: 0, createdCount: 0, updatedCount: 0, failedCount: 0 },
        message: "Templates synced successfully"
      })
    )
  );
}

it("renders the create template screen", () => {
  renderCreateTemplatePage();

  expect(screen.getByRole("heading", { name: "Create Template" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Basic information" })).toBeInTheDocument();
  expect(screen.getByRole("complementary", { name: "Template message" })).toBeInTheDocument();
  expect(screen.getByLabelText("Template name")).toHaveValue("");
  expect(screen.getByLabelText("Display name")).toHaveValue("");
  expect(screen.getByLabelText("Category")).toHaveValue("");
  expect(screen.getByLabelText("Language")).toHaveValue("");
  expect(screen.getByLabelText("Body")).toHaveValue("");
  expect(screen.getByLabelText("Header format")).toHaveValue("NONE");
  expect(screen.queryByText("Template name is required.")).not.toBeInTheDocument();
  expect(screen.queryByText("Select a category.")).not.toBeInTheDocument();
  expect(screen.queryByText("Select a language.")).not.toBeInTheDocument();
  expect(screen.queryByText("Body text is required.")).not.toBeInTheDocument();
});

it("updates the preview from body text", async () => {
  const user = userEvent.setup();
  renderCreateTemplatePage();

  await user.clear(screen.getByLabelText("Body"));
  fireEvent.change(screen.getByLabelText("Body"), { target: { value: "Hello {{1}}" } });
  await user.type(screen.getByLabelText("Sample value for {{1}}"), "Akshay");

  expect(screen.getByText("Hello [Akshay]")).toBeInTheDocument();
});

it("detects variables and replaces samples in preview", async () => {
  const user = userEvent.setup();
  renderCreateTemplatePage();

  await user.clear(screen.getByLabelText("Body"));
  fireEvent.change(screen.getByLabelText("Body"), { target: { value: "Order {{3}} for {{1}}" } });

  expect(screen.getByText("{{3}}")).toBeInTheDocument();
  await user.type(screen.getByLabelText("Sample value for {{1}}"), "Akshay");
  await user.type(screen.getByLabelText("Sample value for {{3}}"), "#QW999");

  expect(screen.getByText("Order [#QW999] for [Akshay]")).toBeInTheDocument();
});

it("updates the validation checklist when body is cleared", async () => {
  const user = userEvent.setup();
  renderCreateTemplatePage();

  expect(screen.getByText("Body message added")).toBeInTheDocument();
  await user.clear(screen.getByLabelText("Body"));

  expect(screen.getByRole("button", { name: "Submit for approval" })).toBeDisabled();
});

it("shows an error for an invalid template name", async () => {
  const user = userEvent.setup();
  renderCreateTemplatePage();

  await user.type(screen.getByLabelText("Template name"), "Order Confirmation");

  expect(screen.getByText("Template name must start with a lowercase letter.")).toBeInTheDocument();
});

it("shows required errors after a touched field is cleared", async () => {
  const user = userEvent.setup();
  renderCreateTemplatePage();

  await user.type(screen.getByLabelText("Template name"), "order_confirmation_v1");
  await user.clear(screen.getByLabelText("Template name"));

  expect(screen.getByText("Template name is required.")).toBeInTheDocument();
  expect(screen.queryByText("Select a category.")).not.toBeInTheDocument();
});

it("adds and removes a button", async () => {
  const user = userEvent.setup();
  renderCreateTemplatePage();

  await user.click(screen.getByRole("button", { name: "Add action" }));
  expect(screen.getByLabelText("Action text")).toBeInTheDocument();
  expect(screen.queryByLabelText("Value")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Remove action 1" }));
  expect(screen.queryByLabelText("Action text")).not.toBeInTheDocument();
});

it("navigates back to templates on cancel", async () => {
  const user = userEvent.setup();
  const router = renderCreateTemplatePage();

  await user.click(screen.getByRole("button", { name: "Cancel" }));

  expect(router.state.location.pathname).toBe("/templates");
});

it("shows a list notification after successful template submission", async () => {
  const user = userEvent.setup();
  mockTemplateList();
  server.use(
    http.post("http://localhost:4000/api/templates", () =>
      HttpResponse.json(
        {
          data: { ...mockTemplates[0]!, status: "PENDING" },
          message: "Template created successfully"
        },
        { status: 201 }
      )
    )
  );
  const router = renderCreateTemplatePage(<TemplatesListPage />);

  await user.type(screen.getByLabelText("Template name"), "order_confirmation_v1");
  await user.type(screen.getByLabelText("Display name"), "Order confirmation");
  await user.selectOptions(screen.getByLabelText("Category"), "UTILITY");
  await user.selectOptions(screen.getByLabelText("Language"), "en");
  await user.clear(screen.getByLabelText("Body"));
  await user.type(screen.getByLabelText("Body"), "Your order is confirmed.");
  await user.click(screen.getByRole("button", { name: "Submit for approval" }));

  expect(router.state.location.pathname).toBe("/templates");
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Template submitted to Meta for approval. Current status: Pending."
  );
});

it("shows create submission errors on the create page", async () => {
  const user = userEvent.setup();
  server.use(
    http.post("http://localhost:4000/api/templates", () =>
      HttpResponse.json(
        { error: { code: "TEMPLATE_PROVIDER_ERROR", message: "Meta credentials are missing." } },
        { status: 500 }
      )
    )
  );
  const router = renderCreateTemplatePage();

  await user.type(screen.getByLabelText("Template name"), "order_confirmation_v1");
  await user.type(screen.getByLabelText("Display name"), "Order confirmation");
  await user.selectOptions(screen.getByLabelText("Category"), "UTILITY");
  await user.selectOptions(screen.getByLabelText("Language"), "en");
  await user.clear(screen.getByLabelText("Body"));
  await user.type(screen.getByLabelText("Body"), "Your order is confirmed.");
  await user.click(screen.getByRole("button", { name: "Submit for approval" }));

  expect(router.state.location.pathname).toBe("/templates/create");
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Template could not be submitted to Meta. Please review and try again."
  );
});
