import { LoginPageContainer } from "../components/login-page-container";

export function LoginPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-text sm:px-6">
      <section
        aria-labelledby="login-title"
        className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center"
      >
        <LoginPageContainer />
      </section>
    </main>
  );
}
