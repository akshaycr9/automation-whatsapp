import { http, HttpResponse } from "msw";
import { useState } from "react";
import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProviders } from "@/app/providers";
import { apiClient } from "@/lib/api-client";
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

it("refreshes an expired access token and retries the failed protected request", async () => {
  const user = userEvent.setup();
  let refreshCalls = 0;
  const protectedRequestTokens: Array<string | null> = [];

  server.use(
    http.post("http://localhost:4000/api/auth/refresh", () => {
      refreshCalls += 1;

      return HttpResponse.json({
        data: {
          accessToken: refreshCalls === 1 ? "expired-access-token" : "fresh-access-token",
          admin: { id: "admin_1", email: "admin@example.com", lastLoginAt: null }
        }
      });
    }),
    http.get("http://localhost:4000/api/protected-resource", ({ request }) => {
      protectedRequestTokens.push(request.headers.get("authorization"));

      if (request.headers.get("authorization") === "Bearer fresh-access-token") {
        return HttpResponse.json({ data: { message: "Recovered request" } });
      }

      return HttpResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    })
  );

  renderAuthConsumer();

  expect(await screen.findByText("admin@example.com")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /load protected resource/i }));

  expect(await screen.findByText("Recovered request")).toBeInTheDocument();
  expect(refreshCalls).toBe(2);
  expect(protectedRequestTokens).toEqual(["Bearer expired-access-token", "Bearer fresh-access-token"]);
});

it("clears the session and exposes a login message when unauthorized recovery fails", async () => {
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

  renderAuthConsumer();

  expect(await screen.findByText("admin@example.com")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /load protected resource/i }));

  expect(await screen.findByText("Logged out")).toBeInTheDocument();
  expect(screen.getByText("Your session expired. Please log in again.")).toBeInTheDocument();
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
  const { accessToken, admin, isAuthenticated, isBootstrappingAuth, sessionMessage } = useAuth();
  const logoutMutation = useLogoutMutation();
  const [resourceMessage, setResourceMessage] = useState<string | null>(null);

  if (isBootstrappingAuth) return <div>Loading auth</div>;

  return (
    <div>
      <p>{isAuthenticated ? admin?.email : "Logged out"}</p>
      {sessionMessage ? <p>{sessionMessage}</p> : null}
      <p>{resourceMessage}</p>
      <button
        type="button"
        onClick={async () => {
          try {
            const response = await apiClient.get<{ message: string }>("/api/protected-resource", { accessToken });
            setResourceMessage(response.data.message);
          } catch {
            setResourceMessage("Protected request failed");
          }
        }}
      >
        Load protected resource
      </button>
      <button type="button" onClick={() => logoutMutation.mutate()}>
        Logout
      </button>
    </div>
  );
}
