import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks/use-auth";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isBootstrappingAuth } = useAuth();
  const location = useLocation();

  if (isBootstrappingAuth) {
    return <AuthRouteLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return children;
}

export function PublicOnlyRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isBootstrappingAuth } = useAuth();

  if (isBootstrappingAuth) {
    return <AuthRouteLoading />;
  }

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  return children;
}

function AuthRouteLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-text">
      <div
        className="rounded-lg border border-border bg-surface px-5 py-4 text-sm text-text-muted shadow-sm"
        role="status"
      >
        Checking session...
      </div>
    </main>
  );
}
