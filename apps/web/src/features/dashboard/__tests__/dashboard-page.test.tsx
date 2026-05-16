import { screen } from "@testing-library/react";
import { DashboardPage } from "../pages/dashboard-page";
import { renderWithProviders } from "@/test/test-utils";

it("renders the dashboard placeholder", () => {
  renderWithProviders(<DashboardPage />);

  expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
});
