import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TemplateFormRenderer } from "../components/TemplateBuilder/TemplateFormRenderer";
import { TemplatePreviewRenderer } from "../components/TemplatePreview/TemplatePreviewRenderer";
import { templateTypeRegistry } from "../config/templateTypeRegistry";
import { mapTemplateFormToApiPayload } from "../mappers/templateFormToApi.mapper";
import type { CreateTemplateFormValues } from "../types/template.types";
import { extractBodyTemplateVariables } from "../utils/templateVariables";
import { validateTemplateByType } from "../utils/templateValidation";

const baseForm: CreateTemplateFormValues = {
  name: "order_confirmation_v1",
  displayName: "Order confirmation",
  category: "UTILITY",
  languageCode: "en",
  type: "TEXT",
  headerFormat: "NONE",
  headerText: "",
  bodyText: "Hi {{1}}",
  footerText: "",
  buttons: [],
  variableSamples: {
    "{{1}}": "Akshay"
  }
};

const noopProps = {
  visibleErrors: {},
  onHeaderFormatChange: () => undefined,
  onHeaderTextChange: () => undefined,
  onBodyTextChange: () => undefined,
  onFooterTextChange: () => undefined,
  onButtonsChange: () => undefined,
  onSampleValueChange: () => undefined
};

describe("template type architecture", () => {
  it("keeps TEXT enabled and future template types disabled", () => {
    expect(templateTypeRegistry.TEXT.isEnabled).toBe(true);
    expect(templateTypeRegistry.MEDIA.isEnabled).toBe(false);
    expect(templateTypeRegistry.CAROUSEL.isEnabled).toBe(false);
    expect(templateTypeRegistry.AUTHENTICATION.isEnabled).toBe(false);
  });

  it("renders the text template form for TEXT", () => {
    render(
      <TemplateFormRenderer
        {...noopProps}
        formValues={baseForm}
        detectedVariables={extractBodyTemplateVariables(baseForm.bodyText)}
      />
    );

    expect(screen.getByRole("heading", { name: "Message content" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Interactive actions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Variable samples" })).toBeInTheDocument();
  });

  it("shows an unsupported placeholder for future template types if rendered directly", () => {
    render(<TemplateFormRenderer {...noopProps} formValues={{ ...baseForm, type: "MEDIA" }} detectedVariables={[]} />);

    expect(screen.getByRole("heading", { name: "Template type coming soon" })).toBeInTheDocument();
  });

  it("validates TEXT through the type-aware validation resolver", () => {
    expect(validateTemplateByType(baseForm).isValid).toBe(true);
    expect(validateTemplateByType({ ...baseForm, type: "MEDIA" }).isValid).toBe(false);
  });

  it("maps TEXT forms through the type-aware mapper", () => {
    const payload = mapTemplateFormToApiPayload(baseForm, extractBodyTemplateVariables(baseForm.bodyText));

    expect(payload.type).toBe("TEXT");
    expect(payload.components.body.text).toBe("Hi {{1}}");
  });

  it("renders the text preview through the preview renderer", () => {
    render(<TemplatePreviewRenderer formValues={baseForm} />);

    expect(screen.getByRole("complementary", { name: "Template message" })).toBeInTheDocument();
    expect(screen.getByText("Hi [Akshay]")).toBeInTheDocument();
  });
});
