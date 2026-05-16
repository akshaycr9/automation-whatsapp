import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { AppProviders } from "@/app/providers";

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: AppProviders, ...options });
}
