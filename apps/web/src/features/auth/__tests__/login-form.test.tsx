import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { renderWithProviders } from "@/test/test-utils";
import { LoginForm } from "../components/login-form";

const initialValues = {
  email: "",
  password: ""
};

it("renders accessible login controls", () => {
  renderWithProviders(<LoginForm initialValues={initialValues} />);

  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /show password/i })).toBeInTheDocument();
  expect(screen.queryByLabelText(/remember this device/i)).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
});

it("toggles password visibility", async () => {
  const user = userEvent.setup();
  renderWithProviders(<LoginForm initialValues={initialValues} />);

  const passwordInput = screen.getByLabelText(/^password$/i);

  expect(passwordInput).toHaveAttribute("type", "password");

  await user.click(screen.getByRole("button", { name: /show password/i }));

  expect(passwordInput).toHaveAttribute("type", "text");
  expect(screen.getByRole("button", { name: /hide password/i })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /hide password/i }));

  expect(passwordInput).toHaveAttribute("type", "password");
});

it("shows validation errors when submitted empty", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  renderWithProviders(<LoginForm initialValues={initialValues} onSubmit={onSubmit} />);

  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});

it("submits locally without calling a backend", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  renderWithProviders(<LoginForm initialValues={initialValues} onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/email/i), "admin@qwapparel.in");
  await user.type(screen.getByLabelText(/^password$/i), "password123");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: "admin@qwapparel.in",
    password: "password123"
  });
  expect(fetchSpy).not.toHaveBeenCalled();
});
