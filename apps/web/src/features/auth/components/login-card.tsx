import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { AuthBrand } from "./auth-brand";

type LoginCardProps = {
  children: ReactNode;
};

export function LoginCard({ children }: LoginCardProps) {
  return (
    <Card className="w-full rounded-lg p-6 shadow-pop sm:p-7">
      <AuthBrand />
      <div className="mt-6">
        <h1 id="login-title" className="text-2xl font-semibold tracking-normal text-text">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-text-muted">Private WhatsApp automation dashboard for your Shopify store</p>
      </div>
      <div className="mt-6">{children}</div>
    </Card>
  );
}
