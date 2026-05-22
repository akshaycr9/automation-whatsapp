import { Input } from "@/components/ui/input";

type AutomationDelayFieldProps = {
  value: number;
  error?: string | null;
  onChange: (delayMinutes: number) => void;
};

export function AutomationDelayField({ value, error, onChange }: AutomationDelayFieldProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-[170px_1fr] sm:items-end">
      <label className="block">
        <span className="text-xs font-medium text-text-muted">Delay minutes</span>
        <Input
          className="mt-1"
          min={0}
          max={43200}
          step={1}
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </label>
      <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-xs leading-5 text-text-muted">
        Use <span className="font-mono text-text">0</span> for instant send. Delayed sends are checked again by runtime
        guardrails in later phases.
      </div>
      {error ? <p className="sm:col-span-2 text-sm text-error">{error}</p> : null}
    </div>
  );
}
