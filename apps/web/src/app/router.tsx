import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import type { ReactNode } from "react";
import { FeatureErrorBoundary, RouteErrorBoundary } from "@/components/error-boundaries";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute, PublicOnlyRoute } from "@/features/auth/components/protected-route";
import { LoginPage } from "@/features/auth/pages/login-page";
import { AutomationsPage } from "@/features/automations/pages/automations-page";
import { ConversationsPage } from "@/features/conversations/pages/conversations-page";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { LogsPage } from "@/features/logs/pages/logs-page";
import { SettingsPage } from "@/features/settings/pages/settings-page";
import { AutomationConfigurePage } from "@/features/automations/pages/automation-configure-page";
import { CreateTemplatePage } from "@/features/templates/pages/create-template-page";
import { TemplatesPage } from "@/features/templates/pages/templates-page";

function withRouteBoundary(element: ReactNode, name: string) {
  return <RouteErrorBoundary name={name}>{element}</RouteErrorBoundary>;
}

function withTemplatesBoundary(element: ReactNode, name: string) {
  return withRouteBoundary(<FeatureErrorBoundary name="Templates">{element}</FeatureErrorBoundary>, name);
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    )
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: withRouteBoundary(<DashboardPage />, "Dashboard Page") },
      { path: "templates", element: withTemplatesBoundary(<TemplatesPage />, "Templates List Page") },
      { path: "templates/create", element: withTemplatesBoundary(<CreateTemplatePage />, "Create Template Page") },
      { path: "templates/new", element: <Navigate to="/templates/create" replace /> },
      { path: "automations", element: withRouteBoundary(<AutomationsPage />, "Automations Page") },
      {
        path: "automations/configure",
        element: <Navigate to="/automations" replace />
      },
      { path: "automations/:id", element: withRouteBoundary(<AutomationConfigurePage />, "Automation Configure Page") },
      { path: "conversations", element: withRouteBoundary(<ConversationsPage />, "Conversations Page") },
      { path: "logs", element: withRouteBoundary(<LogsPage />, "Logs Page") },
      { path: "settings", element: withRouteBoundary(<SettingsPage />, "Settings Page") }
    ]
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
