import { http, HttpResponse, delay } from "msw";
import { useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProviders } from "@/app/providers";
import { apiClient } from "@/lib/api-client";
import { server } from "@/test/mocks/server";
import { LoginPageContainer } from "../components/login-page-container";
import { ProtectedRoute, PublicOnlyRoute } from "../components/protected-route";
import { useAuth } from "../hooks/use-auth";

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

it("redirects to login with a session message when protected request recovery fails", async () => {
  const user = userEvent.setup();
  let refreshCalls = 0;

  server.use(
    http.post("http://localhost:4000/api/auth/refresh", () => {
      refreshCalls += 1;

      if (refreshCalls === 1) {
        return HttpResponse.json({
          data: {
            accessToken: "expired-access-token",
            admin: { id: "admin_1", email: "admin@example.com", lastLoginAt: null }
          }
        });
      }

      return HttpResponse.json({ error: { code: "UNAUTHORIZED", message: "Refresh token expired." } }, { status: 401 });
    }),
    http.get("http://localhost:4000/api/protected-resource", () =>
      HttpResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } }, { status: 401 })
    )
  );

  renderAuthRecoveryRoutes();

  expect(await screen.findByText("Private route")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /load protected resource/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Your session expired. Please log in again.");
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

function renderAuthRecoveryRoutes() {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route
            element={
              <PublicOnlyRoute>
                <LoginPageContainer />
              </PublicOnlyRoute>
            }
            path="/login"
          />
          <Route
            element={
              <ProtectedRoute>
                <PrivateRequestRoute />
              </ProtectedRoute>
            }
            path="/private"
          />
        </Routes>
      </MemoryRouter>
    </AppProviders>
  );
}

function PrivateRequestRoute() {
  const { accessToken } = useAuth();
  const [message, setMessage] = useState("Private route");

  return (
    <div>
      <p>{message}</p>
      <button
        type="button"
        onClick={async () => {
          try {
            await apiClient.get("/api/protected-resource", { accessToken });
          } catch {
            setMessage("Protected request failed");
          }
        }}
      >
        Load protected resource
      </button>
    </div>
  );
}
