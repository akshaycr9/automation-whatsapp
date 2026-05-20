import { LoginCard } from "./login-card";
import { LoginForm } from "./login-form";
import { ApiError } from "@/lib/api-client";
import { useLoginMutation } from "../hooks/use-login-mutation";
import { useAuth } from "../hooks/use-auth";
import type { LoginFormValues } from "../schemas/login.schema";

const initialLoginValues: LoginFormValues = {
  email: "",
  password: ""
};

export function LoginPageContainer() {
  const { sessionMessage } = useAuth();
  const loginMutation = useLoginMutation();
  const errorMessage = loginMutation.error ? getLoginErrorMessage(loginMutation.error) : sessionMessage;

  return (
    <LoginCard>
      <LoginForm
        errorMessage={errorMessage}
        initialValues={initialLoginValues}
        isLoading={loginMutation.isPending}
        onSubmit={(values) => {
          loginMutation.mutate(values);
        }}
      />
    </LoginCard>
  );
}

function getLoginErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === "INVALID_CREDENTIALS") return "Invalid email or password.";
    if (error.code === "ACCOUNT_LOCKED") return "Too many failed attempts. Please try again later.";
    if (error.code === "NETWORK_ERROR") return error.message;
  }

  return "Something went wrong. Please try again.";
}
