import { cn } from "@/lib/utils";

type AutomationIconProps = {
  name: string;
  className?: string;
};

const paths: Record<string, string> = {
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  order: "M7 3h10l3 4v14H4V7l3-4Z M7 3v4h10V3 M8 12h8 M8 16h6",
  cash: "M3 7h18v10H3V7Z M7 11h.01 M17 13h.01 M12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z",
  check: "m5 12 4 4L19 6",
  x: "M6 6l12 12M18 6 6 18",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 6v6l4 2",
  truck: "M3 6h11v10H3V6Z M14 10h4l3 3v3h-7v-6Z M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  cart: "M4 5h2l2 10h9l3-7H7 M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z M17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  template: "M6 3h12v18H6V3Z M9 8h6 M9 12h6 M9 16h4",
  arrow: "M19 12H5 M12 19l-7-7 7-7",
  phone:
    "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z"
};

export function AutomationIcon({ name, className }: AutomationIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("size-4", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d={paths[name] ?? paths.bolt} />
    </svg>
  );
}
