import type { ErrorInfo, ReactNode } from "react";

export type ErrorBoundaryVariant = "app" | "route" | "feature" | "section";

export type ErrorFallbackProps = {
  title?: string;
  description?: string;
  error?: Error;
  resetError?: () => void;
  variant?: ErrorBoundaryVariant;
  showDetails?: boolean;
};

export type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
};

export type ErrorLogInput = {
  error: Error;
  errorInfo?: ErrorInfo;
  boundary: string;
  level: ErrorBoundaryVariant;
};
