import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
          disabled={isLoading}
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
        <div className="relative">
          <Input
            id="login-password"
            autoComplete="current-password"
            className="pr-11"
            disabled={isLoading}
            placeholder="Enter your password"
            type={isPasswordVisible ? "text" : "password"}
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            {...register("password")}
          />
          <button
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            aria-pressed={isPasswordVisible}
            className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-sm text-text-subtle transition hover:bg-surface-2 hover:text-text"
            disabled={isLoading}
            type="button"
            onClick={() => setIsPasswordVisible((current) => !current)}
          >
            {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
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

function EyeIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M2.5 12s3.25-6 9.5-6 9.5 6 9.5 6-3.25 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path d="m3 3 18 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path
        d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M7.1 7.6C4.2 9.2 2.5 12 2.5 12s3.25 6 9.5 6c1.7 0 3.18-.45 4.42-1.1M19.1 14.45c1.55-1.2 2.4-2.45 2.4-2.45S18.25 6 12 6c-.7 0-1.36.08-1.98.23"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
