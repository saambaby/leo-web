"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthShell, AuthLoadingFallback } from "@/components/auth-shell";
import { Alert, Button } from "@/components/design-system";
import { FormField } from "@/components/form-field";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { routeAfterLogin, safeReturnPath } from "@/lib/auth-routing";
import {
  isMfaEnrollmentRequired,
  isMfaRequired,
  isTokenPair,
  type LoginResult,
} from "@/lib/auth-types";

function MfaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("returnTo"));
  const {
    mfaLoginPending,
    setSession,
    setMfaEnrollment,
    clearMfaLoginPending,
  } = useAuth();
  const [email, setEmail] = useState(mfaLoginPending?.email ?? "");
  const [password, setPassword] = useState(mfaLoginPending?.password ?? "");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const loginEmail = mfaLoginPending?.email ?? email;
    const loginPassword = mfaLoginPending?.password ?? password;

    try {
      const result = await api<LoginResult>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          totp_code: totpCode,
        }),
      });

      if (isMfaRequired(result)) {
        setError("Enter a valid authenticator code.");
        setLoading(false);
        return;
      }

      if (isMfaEnrollmentRequired(result)) {
        setMfaEnrollment({
          enrollment_token: result.enrollment_token,
          otpauth_url: result.otpauth_url,
          secret: result.secret,
        });
        const enrollPath = returnTo
          ? `/mfa/enroll?returnTo=${encodeURIComponent(returnTo)}`
          : "/mfa/enroll";
        router.push(enrollPath);
        return;
      }

      if (isTokenPair(result)) {
        await setSession(result);
        clearMfaLoginPending();
        router.push(returnTo ?? routeAfterLogin(result.access_token));
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const needsCredentials = !mfaLoginPending;

  return (
    <AuthShell
      title="Two-factor authentication"
      subtitle="Enter your authenticator code to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}

        {needsCredentials ? (
          <>
            <FormField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormField
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        ) : null}

        <FormField
          label="Authenticator code"
          name="totp_code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value)}
          hint="Enter the 6-digit code from your authenticator app."
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Verifying…" : "Continue"}
        </Button>

        <p className="text-center text-sm">
          <Link href="/login" className="text-signal-live hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function MfaPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <MfaContent />
    </Suspense>
  );
}
