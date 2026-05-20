import { http, HttpResponse } from "msw";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { AppShell } from "../app-shell";
import { renderWithProviders } from "@/test/test-utils";
import { server } from "@/test/mocks/server";

function renderShell(initialPath = "/dashboard") {
  const router = createMemoryRouter(
    [
      {
        path: "/login",
        element: <div>Login content</div>
      },
      {
        path: "/",
        element: <AppShell />,
        children: [
          { path: "dashboard", element: <div>Dashboard content</div> },
          { path: "templates", element: <div>Templates content</div> },
          { path: "templates/create", element: <div>Create template content</div> },
          { path: "templates/new", element: <div>Create template content</div> },
          { path: "automations", element: <div>Automations content</div> },
          { path: "automations/configure", element: <div>Automation configure content</div> },
          { path: "conversations", element: <div>Conversations content</div> },
          { path: "logs", element: <div>Logs content</div> },
          { path: "settings", element: <div>Settings content</div> }
        ]
      }
    ],
    { initialEntries: [initialPath] }
  );

  renderWithProviders(<RouterProvider router={router} />);

  return router;
}

it("renders the desktop shell navigation and current route content", () => {
  renderShell();

  expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  expect(screen.getByText("Dashboard content")).toBeInTheDocument();
  expect(screen.getByText("Cloud API healthy")).toBeInTheDocument();
});

it("navigates from templates to the create template route", async () => {
  const user = userEvent.setup();
  const router = renderShell("/templates");

  await user.click(screen.getByRole("button", { name: /create template/i }));

  expect(router.state.location.pathname).toBe("/templates/create");
  expect(screen.getByRole("heading", { name: "Create Template" })).toBeInTheDocument();
  expect(screen.getByText("Create template content")).toBeInTheDocument();
});

it("returns from a secondary route when the shell back button is used", async () => {
  const user = userEvent.setup();
  const router = renderShell("/automations/configure");

  await user.click(screen.getByRole("button", { name: "Go back" }));

  expect(router.state.location.pathname).toBe("/automations");
  expect(screen.getByRole("heading", { name: "Automations" })).toBeInTheDocument();
  expect(screen.getByText("Automations content")).toBeInTheDocument();
});

it("logs out from the topbar avatar action", async () => {
  const user = userEvent.setup();
  const router = renderShell();
  let logoutCalled = false;
  server.use(
    http.post("http://localhost:4000/api/auth/logout", () => {
      logoutCalled = true;
      return HttpResponse.json({ data: { success: true } });
    })
  );

  await user.click(screen.getByRole("button", { name: /sign out/i }));

  expect(logoutCalled).toBe(true);
  await waitFor(() => expect(router.state.location.pathname).toBe("/login"));
  expect(await screen.findByText("Login content")).toBeInTheDocument();
});
