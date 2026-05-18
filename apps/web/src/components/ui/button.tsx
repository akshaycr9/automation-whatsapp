import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "border border-brand bg-brand text-white shadow-sm hover:bg-brand-hover",
        variant === "secondary" && "border border-border bg-surface text-text shadow-sm hover:bg-surface-2",
        variant === "ghost" && "text-text-muted hover:bg-surface-2 hover:text-text",
        className
      )}
      {...props}
    />
  );
}
