import { Suspense } from "react";
import { AuthLoadingFallback } from "@/components/auth-shell";
import { VerifyEmailContent } from "@/components/verify-email-content";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
