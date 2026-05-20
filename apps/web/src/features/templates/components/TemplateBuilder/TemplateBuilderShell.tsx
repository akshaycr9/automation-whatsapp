import type { ReactNode } from "react";

type TemplateBuilderShellProps = {
  children: ReactNode;
};

export function TemplateBuilderShell({ children }: TemplateBuilderShellProps) {
  return <div className="space-y-4">{children}</div>;
}
