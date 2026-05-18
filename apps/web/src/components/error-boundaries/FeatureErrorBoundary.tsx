import { BaseErrorBoundary } from "./BaseErrorBoundary";
import type { ErrorBoundaryProps } from "./errorBoundary.types";

export function FeatureErrorBoundary(props: ErrorBoundaryProps) {
  return <BaseErrorBoundary variant="feature" {...props} />;
}
