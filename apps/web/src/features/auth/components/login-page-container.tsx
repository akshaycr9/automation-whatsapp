import { LoginCard } from "./login-card";
import { LoginForm } from "./login-form";
import type { LoginFormValues } from "../schemas/login.schema";

const initialLoginValues: LoginFormValues = {
  email: "",
  password: ""
};

export function LoginPageContainer() {
  return (
    <LoginCard>
      <LoginForm
        initialValues={initialLoginValues}
        onSubmit={(values) => {
          console.log("Login UI submitted", values);
        }}
      />
    </LoginCard>
  );
}
