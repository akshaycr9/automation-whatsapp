import { cn } from "@/lib/utils";

export type TemplateActionNotificationVariant = "success" | "error" | "info";

export type TemplateActionNotificationState = {
  id: number;
  variant: TemplateActionNotificationVariant;
  message: string;
};

type TemplateActionNotificationProps = {
  notification: TemplateActionNotificationState | null;
  onDismiss: () => void;
};

export function TemplateActionNotification({ notification, onDismiss }: TemplateActionNotificationProps) {
  if (!notification) return null;

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm shadow-sm",
        notification.variant === "success" && "border-success/30 bg-success-soft text-text",
        notification.variant === "error" && "border-error/30 bg-error-soft text-error",
        notification.variant === "info" && "border-info/30 bg-info-soft text-text"
      )}
      role={notification.variant === "error" ? "alert" : "status"}
    >
      <p className="min-w-0">{notification.message}</p>
      <button
        aria-label="Dismiss notification"
        className="grid size-6 shrink-0 place-items-center rounded-md text-current transition hover:bg-black/5"
        type="button"
        onClick={onDismiss}
      >
        <span aria-hidden="true" className="relative block size-3.5">
          <span className="absolute left-1/2 top-0 h-3.5 w-0.5 -translate-x-1/2 rotate-45 rounded-full bg-current" />
          <span className="absolute left-1/2 top-0 h-3.5 w-0.5 -translate-x-1/2 -rotate-45 rounded-full bg-current" />
        </span>
      </button>
    </div>
  );
}
