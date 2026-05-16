import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition",
        variant === "primary" && "bg-[#1f6f50] text-white hover:bg-[#185a41]",
        variant === "secondary" && "border border-[#c9d4cc] bg-white text-[#17201b] hover:bg-[#eef3ef]",
        className
      )}
      {...props}
    />
  );
}
