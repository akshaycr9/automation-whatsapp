import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { LoginPage } from "@/features/auth/pages/login-page";
import { AutomationsPage } from "@/features/automations/pages/automations-page";
import { ConversationsPage } from "@/features/conversations/pages/conversations-page";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { LogsPage } from "@/features/logs/pages/logs-page";
import { SettingsPage } from "@/features/settings/pages/settings-page";
import { AutomationConfigurePage } from "@/features/automations/pages/automation-configure-page";
import { CreateTemplatePage } from "@/features/templates/pages/create-template-page";
import { TemplatesPage } from "@/features/templates/pages/templates-page";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "templates", element: <TemplatesPage /> },
      { path: "templates/new", element: <CreateTemplatePage /> },
      { path: "automations", element: <AutomationsPage /> },
      { path: "automations/configure", element: <AutomationConfigurePage /> },
      { path: "conversations", element: <ConversationsPage /> },
      { path: "logs", element: <LogsPage /> },
      { path: "settings", element: <SettingsPage /> }
    ]
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
