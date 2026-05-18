import { BaseErrorBoundary } from "./BaseErrorBoundary";
import type { ErrorBoundaryProps } from "./errorBoundary.types";

export function RouteErrorBoundary(props: ErrorBoundaryProps) {
  return <BaseErrorBoundary variant="route" {...props} />;
}
