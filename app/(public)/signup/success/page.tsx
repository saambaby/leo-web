"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Alert, Button } from "@/components/form-field";

function SignupSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <AuthShell
      title="Check your email"
      subtitle="One more step before you can sign in"
    >
      <div className="space-y-4">
        <Alert variant="info">
          {email ? (
            <>
              We sent a verification link to{" "}
              <strong className="text-white">{email}</strong>. Open the link in
              that message, then sign in.
            </>
          ) : (
            <>
              We sent a verification link to your email. Open it, then sign in.
            </>
          )}
        </Alert>
        <p className="text-sm text-zinc-400">
          The link expires in 24 hours. If you do not see the email, check spam
          or wait a moment and refresh your inbox.
        </p>
        <Button onClick={() => (window.location.href = "/login")}>
          Go to sign in
        </Button>
        <p className="text-center text-xs text-zinc-500">
          Wrong address?{" "}
          <Link href="/signup" className="text-emerald-400 hover:underline">
            Sign up again
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function SignupSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-[#0b0d12] text-sm text-zinc-400">
          Loading…
        </div>
      }
    >
      <SignupSuccessContent />
    </Suspense>
  );
}
