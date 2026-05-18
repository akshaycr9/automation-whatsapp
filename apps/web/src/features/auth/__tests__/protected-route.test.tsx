import { http, HttpResponse, delay } from "msw";
import { MemoryRouter, Route, Routes } from "react-router";
import { render, screen } from "@testing-library/react";
import { AppProviders } from "@/app/providers";
import { server } from "@/test/mocks/server";
import { ProtectedRoute, PublicOnlyRoute } from "../components/protected-route";

it("shows loading state during bootstrap", async () => {
  server.use(
    http.post("http://localhost:4000/api/auth/refresh", async () => {
      await delay(150);
      return HttpResponse.json({ error: { code: "UNAUTHORIZED", message: "No session" } }, { status: 401 });
    })
  );

  renderRoutes("/private");

  expect(await screen.findByRole("status")).toHaveTextContent("Checking session...");
});

it("redirects unauthenticated user to /login", async () => {
  renderRoutes("/private");

  expect(await screen.findByText("Login route")).toBeInTheDocument();
});

it("renders protected content for authenticated user", async () => {
  server.use(
    http.post("http://localhost:4000/api/auth/refresh", () =>
      HttpResponse.json({
        data: {
          accessToken: "access-token",
          admin: { id: "admin_1", email: "admin@example.com", lastLoginAt: null }
        }
      })
    )
  );

  renderRoutes("/private");

  expect(await screen.findByText("Private route")).toBeInTheDocument();
});

it("redirects authenticated user away from /login", async () => {
  server.use(
    http.post("http://localhost:4000/api/auth/refresh", () =>
      HttpResponse.json({
        data: {
          accessToken: "access-token",
          admin: { id: "admin_1", email: "admin@example.com", lastLoginAt: null }
        }
      })
    )
  );

  renderRoutes("/login");

  expect(await screen.findByText("Dashboard route")).toBeInTheDocument();
});

function renderRoutes(initialPath: string) {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<PublicOnlyRoute>Login route</PublicOnlyRoute>} path="/login" />
          <Route element={<div>Dashboard route</div>} path="/dashboard" />
          <Route
            element={
              <ProtectedRoute>
                <div>Private route</div>
              </ProtectedRoute>
            }
            path="/private"
          />
        </Routes>
      </MemoryRouter>
    </AppProviders>
  );
}
