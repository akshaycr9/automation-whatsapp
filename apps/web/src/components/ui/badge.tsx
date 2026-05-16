import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex rounded-full bg-[#e3f2eb] px-2.5 py-1 text-xs font-medium text-[#1f6f50]", className)}
      {...props}
    />
  );
}
