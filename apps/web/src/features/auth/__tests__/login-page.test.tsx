import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { renderWithProviders } from "@/test/test-utils";
import { LoginPage } from "../pages/login-page";

it("renders the login page brand and primary form controls", () => {
  renderWithProviders(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

  expect(screen.getByText("QW Automations")).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
});
