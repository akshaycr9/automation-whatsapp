import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-10 rounded-md border border-[#c9d4cc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f6f50] focus:ring-2 focus:ring-[#1f6f50]/20",
        className
      )}
      {...props}
    />
  );
}
