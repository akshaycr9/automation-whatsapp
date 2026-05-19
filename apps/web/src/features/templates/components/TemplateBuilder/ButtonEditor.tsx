import {
  BUTTON_TEXT_MAX_LENGTH,
  TEMPLATE_BUTTON_TOTAL_MAX_COUNT,
  TEMPLATE_PHONE_NUMBER_BUTTON_MAX_COUNT,
  TEMPLATE_QUICK_REPLY_BUTTON_MAX_COUNT,
  TEMPLATE_URL_BUTTON_MAX_COUNT
} from "../../constants/template.constants";
import type { TemplateButton, TemplateButtonType } from "../../types/template.types";

type ButtonEditorProps = {
  buttons: TemplateButton[];
  onButtonsChange: (buttons: TemplateButton[]) => void;
  errors?: Record<string, string[]>;
};

const buttonTypes: Array<Extract<TemplateButtonType, "QUICK_REPLY" | "URL" | "PHONE_NUMBER">> = [
  "QUICK_REPLY",
  "URL",
  "PHONE_NUMBER"
];

export function ButtonEditor({ buttons, onButtonsChange, errors = {} }: ButtonEditorProps) {
  const buttonCounts = getButtonCounts(buttons);
  const canAddButton = buttons.length < TEMPLATE_BUTTON_TOTAL_MAX_COUNT && getDefaultButtonType(buttons) !== null;

  const addButton = () => {
    const defaultType = getDefaultButtonType(buttons);
    if (!defaultType) {
      return;
    }

    const id = globalThis.crypto?.randomUUID?.() ?? `button_${Date.now()}_${buttons.length}`;

    onButtonsChange([...buttons, { id, type: defaultType, text: "" }]);
  };

  const updateButton = (id: string, nextButton: Partial<TemplateButton>) => {
    onButtonsChange(buttons.map((button) => (button.id === id ? { ...button, ...nextButton } : button)));
  };

  const removeButton = (id: string) => {
    onButtonsChange(buttons.filter((button) => button.id !== id));
  };

  return (
    <section
      className="rounded-lg border border-border bg-surface p-4 shadow-sm"
      aria-labelledby="template-interactive-actions-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="template-interactive-actions-title" className="text-base font-semibold text-text">
            Interactive actions
          </h2>
          <p className="mt-1 text-sm text-text-muted">Optional quick reply, URL, or phone buttons.</p>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-brand bg-brand px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-2 disabled:text-text-subtle disabled:shadow-none sm:w-auto"
          type="button"
          disabled={!canAddButton}
          onClick={addButton}
        >
          Add action
        </button>
      </div>
      <p className="mt-3 text-xs text-text-subtle">
        WhatsApp allows up to {TEMPLATE_BUTTON_TOTAL_MAX_COUNT} buttons total: {TEMPLATE_QUICK_REPLY_BUTTON_MAX_COUNT}{" "}
        quick replies, {TEMPLATE_URL_BUTTON_MAX_COUNT} URL buttons, and {TEMPLATE_PHONE_NUMBER_BUTTON_MAX_COUNT} phone
        number button.
      </p>
      {errors.buttons?.[0] ? <p className="mt-2 text-xs text-error">{errors.buttons[0]}</p> : null}

      <div className="mt-4 space-y-3">
        {buttons.length === 0 ? <p className="text-sm text-text-subtle">No interactive actions added.</p> : null}
        {buttons.map((button, index) => (
          <div key={button.id} className="rounded-md border border-border bg-surface-2 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text">Action {index + 1}</p>
                <p className="text-xs text-text-subtle">{formatButtonType(button.type)}</p>
              </div>
              <button
                aria-label={`Remove action ${index + 1}`}
                className="grid size-9 shrink-0 place-items-center rounded-md text-error transition hover:bg-error-soft"
                type="button"
                title="Remove action"
                onClick={() => removeButton(button.id)}
              >
                <TrashIcon />
              </button>
            </div>
            <div
              className={
                button.type === "QUICK_REPLY"
                  ? "grid gap-3 md:grid-cols-[150px_1fr]"
                  : "grid gap-3 md:grid-cols-[150px_1fr_1fr]"
              }
            >
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted" htmlFor={`button-type-${button.id}`}>
                  Type
                </label>
                <select
                  id={`button-type-${button.id}`}
                  className="block min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none"
                  value={button.type}
                  onChange={(event) =>
                    updateButton(button.id, { type: event.target.value as TemplateButtonType, value: "" })
                  }
                >
                  {buttonTypes.map((type) => (
                    <option key={type} value={type} disabled={!canUseButtonType(type, button.type, buttonCounts)}>
                      {formatButtonType(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted" htmlFor={`button-text-${button.id}`}>
                  Action text
                </label>
                <input
                  id={`button-text-${button.id}`}
                  className="block min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none"
                  maxLength={BUTTON_TEXT_MAX_LENGTH}
                  value={button.text}
                  onChange={(event) => updateButton(button.id, { text: event.target.value })}
                />
              </div>
              {button.type !== "QUICK_REPLY" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted" htmlFor={`button-value-${button.id}`}>
                    {button.type === "URL" ? "URL" : "Phone number"}
                  </label>
                  <input
                    id={`button-value-${button.id}`}
                    className="block min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none"
                    inputMode={button.type === "PHONE_NUMBER" ? "tel" : undefined}
                    pattern={button.type === "PHONE_NUMBER" ? "[0-9+()\\-\\s]*" : undefined}
                    placeholder={button.type === "URL" ? "https://example.com" : "+91 98765 43210"}
                    value={button.value ?? ""}
                    onChange={(event) =>
                      updateButton(button.id, {
                        value:
                          button.type === "PHONE_NUMBER" ? sanitizePhoneNumber(event.target.value) : event.target.value
                      })
                    }
                  />
                </div>
              ) : null}
            </div>
            {errors[`buttons.${index}`]?.[0] ? (
              <p className="mt-2 text-xs text-error">{errors[`buttons.${index}`]?.[0]}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function getButtonCounts(buttons: TemplateButton[]) {
  return {
    total: buttons.length,
    quickReply: buttons.filter((button) => button.type === "QUICK_REPLY").length,
    url: buttons.filter((button) => button.type === "URL").length,
    phoneNumber: buttons.filter((button) => button.type === "PHONE_NUMBER").length
  };
}

function getDefaultButtonType(
  buttons: TemplateButton[]
): Extract<TemplateButtonType, "QUICK_REPLY" | "URL" | "PHONE_NUMBER"> | null {
  const counts = getButtonCounts(buttons);

  if (counts.total >= TEMPLATE_BUTTON_TOTAL_MAX_COUNT) {
    return null;
  }
  if (counts.quickReply < TEMPLATE_QUICK_REPLY_BUTTON_MAX_COUNT) {
    return "QUICK_REPLY";
  }
  if (counts.url < TEMPLATE_URL_BUTTON_MAX_COUNT) {
    return "URL";
  }
  if (counts.phoneNumber < TEMPLATE_PHONE_NUMBER_BUTTON_MAX_COUNT) {
    return "PHONE_NUMBER";
  }

  return null;
}

function canUseButtonType(
  nextType: TemplateButtonType,
  currentType: TemplateButtonType,
  counts: ReturnType<typeof getButtonCounts>
) {
  if (nextType === currentType) {
    return true;
  }

  if (nextType === "QUICK_REPLY") {
    return counts.quickReply < TEMPLATE_QUICK_REPLY_BUTTON_MAX_COUNT;
  }
  if (nextType === "URL") {
    return counts.url < TEMPLATE_URL_BUTTON_MAX_COUNT;
  }
  if (nextType === "PHONE_NUMBER") {
    return counts.phoneNumber < TEMPLATE_PHONE_NUMBER_BUTTON_MAX_COUNT;
  }

  return false;
}

function formatButtonType(type: TemplateButtonType) {
  const labels: Record<TemplateButtonType, string> = {
    QUICK_REPLY: "Quick reply",
    URL: "URL",
    PHONE_NUMBER: "Phone number",
    COPY_CODE: "Copy code",
    FLOW: "Flow"
  };

  return labels[type];
}

function sanitizePhoneNumber(value: string) {
  return value.replace(/[^\d+()\-\s]/g, "");
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="M3 6h18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path
        d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
