import { BaseErrorBoundary } from "./BaseErrorBoundary";
import type { ErrorBoundaryProps } from "./errorBoundary.types";

export function SectionErrorBoundary(props: ErrorBoundaryProps) {
  return <BaseErrorBoundary variant="section" {...props} />;
}
