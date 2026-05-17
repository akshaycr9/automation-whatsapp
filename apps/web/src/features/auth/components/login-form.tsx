import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormValues } from "../schemas/login.schema";

type LoginFormProps = {
  isLoading?: boolean;
  errorMessage?: string | null;
  initialValues: LoginFormValues;
  onSubmit?: (values: LoginFormValues) => void;
};

export function LoginForm({ isLoading = false, errorMessage, initialValues, onSubmit }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: initialValues
  });

  const submitLabel = isLoading ? "Signing in..." : "Sign in";

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={handleSubmit((values) => {
        onSubmit?.(values);
      })}
    >
      {errorMessage ? (
        <div className="rounded-md border border-error/30 bg-error-soft px-3 py-2 text-sm text-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text-muted" htmlFor="login-email">
          Email
        </label>
        <Input
          id="login-email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@store.com"
          type="email"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-xs text-error" id="login-email-error">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text-muted" htmlFor="login-password">
          Password
        </label>
        <Input
          id="login-password"
          autoComplete="current-password"
          placeholder="Enter your password"
          type="password"
          aria-invalid={errors.password ? "true" : "false"}
          aria-describedby={errors.password ? "login-password-error" : undefined}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-error" id="login-password-error">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button className="w-full" disabled={isLoading} type="submit">
        {submitLabel}
      </Button>

      <p className="border-t border-border pt-4 text-center text-xs text-text-subtle">
        Single-admin access. Keep this dashboard on a trusted device.
      </p>
    </form>
  );
}
