import { http, HttpResponse, delay } from "msw";
import { Route, Routes, MemoryRouter } from "react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProviders } from "@/app/providers";
import { server } from "@/test/mocks/server";
import { LoginPage } from "../pages/login-page";

function renderLoginRoute(initialPath = "/login") {
  return renderWithAuthRouter(
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<div>Dashboard screen</div>} path="/dashboard" />
    </Routes>,
    initialPath
  );
}

it("renders login form", async () => {
  renderLoginRoute();

  expect(await screen.findByText("QW Automations")).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
});

it("validates invalid email", async () => {
  const user = userEvent.setup();
  renderLoginRoute();

  await user.type(await screen.findByLabelText(/email/i), "not-email");
  await user.type(screen.getByLabelText(/^password$/i), "password123");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
});

it("validates missing password", async () => {
  const user = userEvent.setup();
  renderLoginRoute();

  await user.type(await screen.findByLabelText(/email/i), "admin@example.com");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
});

it("submits valid credentials", async () => {
  const user = userEvent.setup();
  const requests: unknown[] = [];
  server.use(
    http.post("http://localhost:4000/api/auth/login", async ({ request }) => {
      requests.push(await request.json());
      return HttpResponse.json({
        data: {
          accessToken: "access-token",
          admin: { id: "admin_1", email: "admin@example.com", lastLoginAt: null }
        }
      });
    })
  );
  renderLoginRoute();

  await user.type(await screen.findByLabelText(/email/i), "admin@example.com");
  await user.type(screen.getByLabelText(/^password$/i), "password123");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  await waitFor(() => expect(requests).toEqual([{ email: "admin@example.com", password: "password123" }]));
});

it("disables button while submitting", async () => {
  const user = userEvent.setup();
  server.use(
    http.post("http://localhost:4000/api/auth/login", async () => {
      await delay(150);
      return HttpResponse.json({
        data: {
          accessToken: "access-token",
          admin: { id: "admin_1", email: "admin@example.com", lastLoginAt: null }
        }
      });
    })
  );
  renderLoginRoute();

  await user.type(await screen.findByLabelText(/email/i), "admin@example.com");
  await user.type(screen.getByLabelText(/^password$/i), "password123");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
});

it("shows API error message on invalid credentials", async () => {
  const user = userEvent.setup();
  server.use(
    http.post("http://localhost:4000/api/auth/login", () =>
      HttpResponse.json(
        { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } },
        { status: 401 }
      )
    )
  );
  renderLoginRoute();

  await user.type(await screen.findByLabelText(/email/i), "admin@example.com");
  await user.type(screen.getByLabelText(/^password$/i), "password123");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
});

it("redirects after successful login", async () => {
  const user = userEvent.setup();
  server.use(
    http.post("http://localhost:4000/api/auth/login", () =>
      HttpResponse.json({
        data: {
          accessToken: "access-token",
          admin: { id: "admin_1", email: "admin@example.com", lastLoginAt: null }
        }
      })
    )
  );
  renderLoginRoute();

  await user.type(await screen.findByLabelText(/email/i), "admin@example.com");
  await user.type(screen.getByLabelText(/^password$/i), "password123");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(await screen.findByText("Dashboard screen")).toBeInTheDocument();
});

function renderWithAuthRouter(children: React.ReactNode, initialPath: string) {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
    </AppProviders>
  );
}
