import { BaseErrorBoundary } from "./BaseErrorBoundary";
import type { ErrorBoundaryProps } from "./errorBoundary.types";

export function AppErrorBoundary(props: ErrorBoundaryProps) {
  return <BaseErrorBoundary variant="app" name="App" {...props} />;
}
