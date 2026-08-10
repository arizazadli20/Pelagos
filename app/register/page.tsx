import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <div className="auth-page-loading">Loading…</div>
        </div>
      }
    >
      <AuthForm mode="register" />
    </Suspense>
  );
}
