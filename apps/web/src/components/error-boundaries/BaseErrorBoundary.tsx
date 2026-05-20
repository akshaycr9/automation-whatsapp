import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorFallback } from "./ErrorFallback";
import { logError } from "./errorLogger";
import type { ErrorBoundaryProps, ErrorBoundaryVariant } from "./errorBoundary.types";

type BaseErrorBoundaryProps = ErrorBoundaryProps & {
  variant: ErrorBoundaryVariant;
};

type BaseErrorBoundaryState = {
  error: Error | null;
};

export class BaseErrorBoundary extends Component<BaseErrorBoundaryProps, BaseErrorBoundaryState> {
  state: BaseErrorBoundaryState = {
    error: null
  };

  static getDerivedStateFromError(error: Error): BaseErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const boundary = this.props.name ?? `${this.props.variant} boundary`;

    logError({
      error,
      errorInfo,
      boundary,
      level: this.props.variant
    });

    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (!this.state.error) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <ErrorFallback
        error={this.state.error}
        resetError={this.resetError}
        variant={this.props.variant}
        {...(this.props.showDetails === undefined ? {} : { showDetails: this.props.showDetails })}
      />
    );
  }
}
