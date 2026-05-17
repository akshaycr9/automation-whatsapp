import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProviders } from "@/app/providers";
import { server } from "@/test/mocks/server";
import { useLogoutMutation } from "../hooks/use-logout-mutation";
import { useAuth } from "../hooks/use-auth";

it("refreshes session on startup when refresh succeeds", async () => {
  server.use(
    http.post("http://localhost:4000/api/auth/refresh", () =>
      HttpResponse.json({
        data: {
          accessToken: "refreshed-access-token",
          admin: { id: "admin_1", email: "admin@example.com", lastLoginAt: null }
        }
      })
    )
  );

  renderAuthConsumer();

  expect(await screen.findByText("admin@example.com")).toBeInTheDocument();
});

it("remains logged out when refresh fails", async () => {
  renderAuthConsumer();

  expect(await screen.findByText("Logged out")).toBeInTheDocument();
});

it("clears session on logout", async () => {
  const user = userEvent.setup();
  server.use(
    http.post("http://localhost:4000/api/auth/refresh", () =>
      HttpResponse.json({
        data: {
          accessToken: "refreshed-access-token",
          admin: { id: "admin_1", email: "admin@example.com", lastLoginAt: null }
        }
      })
    ),
    http.post("http://localhost:4000/api/auth/logout", () => HttpResponse.json({ data: { success: true } }))
  );
  renderAuthConsumer();

  expect(await screen.findByText("admin@example.com")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /logout/i }));

  expect(await screen.findByText("Logged out")).toBeInTheDocument();
});

it("does not store refresh token in localStorage or sessionStorage", async () => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  server.use(
    http.post("http://localhost:4000/api/auth/refresh", () =>
      HttpResponse.json({
        data: {
          accessToken: "refreshed-access-token",
          admin: { id: "admin_1", email: "admin@example.com", lastLoginAt: null }
        }
      })
    )
  );

  renderAuthConsumer();

  expect(await screen.findByText("admin@example.com")).toBeInTheDocument();
  expect(window.localStorage.length).toBe(0);
  expect(window.sessionStorage.length).toBe(0);
});

it("does not store access token in localStorage or sessionStorage", async () => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  server.use(
    http.post("http://localhost:4000/api/auth/refresh", () =>
      HttpResponse.json({
        data: {
          accessToken: "refreshed-access-token",
          admin: { id: "admin_1", email: "admin@example.com", lastLoginAt: null }
        }
      })
    )
  );

  renderAuthConsumer();

  expect(await screen.findByText("admin@example.com")).toBeInTheDocument();
  expect(window.localStorage.length).toBe(0);
  expect(window.sessionStorage.length).toBe(0);
});

function renderAuthConsumer() {
  return render(
    <AppProviders>
      <MemoryRouter>
        <AuthConsumer />
      </MemoryRouter>
    </AppProviders>
  );
}

function AuthConsumer() {
  const { admin, isAuthenticated, isBootstrappingAuth } = useAuth();
  const logoutMutation = useLogoutMutation();

  if (isBootstrappingAuth) return <div>Loading auth</div>;

  return (
    <div>
      <p>{isAuthenticated ? admin?.email : "Logged out"}</p>
      <button type="button" onClick={() => logoutMutation.mutate()}>
        Logout
      </button>
    </div>
  );
}
