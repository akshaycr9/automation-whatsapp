import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { renderWithProviders } from "@/test/test-utils";
import { CreateTemplatePage } from "../pages/create-template-page";

function renderCreateTemplatePage() {
  const router = createMemoryRouter(
    [
      { path: "/templates/create", element: <CreateTemplatePage /> },
      { path: "/templates", element: <div>Templates list route</div> }
    ],
    { initialEntries: ["/templates/create"] }
  );

  renderWithProviders(<RouterProvider router={router} />);

  return router;
}

it("renders the create template screen", () => {
  renderCreateTemplatePage();

  expect(screen.getByRole("heading", { name: "Create Template" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Basic information" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "WhatsApp preview" })).toBeInTheDocument();
  expect(screen.getByLabelText("Template name")).toHaveValue("");
  expect(screen.getByLabelText("Display name")).toHaveValue("");
  expect(screen.getByLabelText("Category")).toHaveValue("");
  expect(screen.getByLabelText("Language")).toHaveValue("");
  expect(screen.getByLabelText("Body")).toHaveValue("");
  expect(screen.getByLabelText("Header format")).toHaveValue("NONE");
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
