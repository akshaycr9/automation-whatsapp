import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ErrorFallback, SectionErrorBoundary } from "../index";

let shouldThrow = false;

function ThrowingChild() {
  if (shouldThrow) {
    throw new Error("Kaboom");
  }

  return <div>Recovered content</div>;
}

beforeEach(() => {
  shouldThrow = false;
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("renders fallback title and description", () => {
  render(
    <ErrorFallback
      title="Custom fallback"
      description="A friendly fallback message."
      variant="section"
      showDetails={false}
    />
  );

  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(screen.getByText("Custom fallback")).toBeInTheDocument();
  expect(screen.getByText("A friendly fallback message.")).toBeInTheDocument();
});

it("catches a child render error and shows the section fallback", () => {
  shouldThrow = true;

  render(
    <SectionErrorBoundary name="Risky Section" showDetails={false}>
      <ThrowingChild />
    </SectionErrorBoundary>
  );

  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(screen.getByText("This section could not be loaded")).toBeInTheDocument();
  expect(screen.queryByText("Recovered content")).not.toBeInTheDocument();
});

it("resets the boundary when retry is clicked", async () => {
  const user = userEvent.setup();
  shouldThrow = true;

  render(
    <SectionErrorBoundary name="Retry Section" showDetails={false}>
      <ThrowingChild />
    </SectionErrorBoundary>
  );

  expect(screen.getByText("This section could not be loaded")).toBeInTheDocument();

  shouldThrow = false;
  await user.click(screen.getByRole("button", { name: /try again/i }));

  expect(screen.getByText("Recovered content")).toBeInTheDocument();
});
