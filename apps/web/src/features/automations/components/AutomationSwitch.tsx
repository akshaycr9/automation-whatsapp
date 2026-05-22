import { cn } from "@/lib/utils";

type AutomationSwitchProps = {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

export function AutomationSwitch({ checked, disabled, label, onChange }: AutomationSwitchProps) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full border-0 transition",
        checked ? "bg-brand" : "bg-border-strong",
        disabled && "cursor-not-allowed opacity-60"
      )}
      disabled={disabled}
      role="switch"
      type="button"
      onClick={() => onChange(!checked)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-4"
        )}
      />
    </button>
  );
}
