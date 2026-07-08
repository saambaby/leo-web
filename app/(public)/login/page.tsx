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
import { loginNavigationPath } from "@/lib/auth-post-login";
import {
  isMfaEnrollmentRequired,
  isMfaRequired,
  isTokenPair,
  type LoginResult,
} from "@/lib/auth-types";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invited = searchParams.get("invited") === "1";
  const { finishLogin, setMfaEnrollment } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [mfaStep, setMfaStep] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body: Record<string, string> = { email, password };
      if (mfaStep && totpCode) {
        body.totp_code = totpCode;
      }

      const result = await api<LoginResult>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (isMfaRequired(result)) {
        setMfaStep(true);
        setLoading(false);
        return;
      }

      if (isMfaEnrollmentRequired(result)) {
        setMfaEnrollment({
          enrollment_token: result.enrollment_token,
          otpauth_url: result.otpauth_url,
          secret: result.secret,
        });
        router.push("/mfa/enroll");
        return;
      }

      if (isTokenPair(result)) {
        const nav = await finishLogin(result);
        router.push(loginNavigationPath(nav));
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.message === "Email not verified") {
          setError(
            "Verify your email first. Check your inbox for the link we sent, then try again.",
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your Leo account"
      footer={
        <>
          No account?{" "}
          <Link href="/signup" className="text-signal-live hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {invited ? (
          <Alert variant="success">
            Account created — sign in with your new password.
          </Alert>
        ) : null}
        {error ? <Alert variant="error">{error}</Alert> : null}

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

        {mfaStep ? (
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
        ) : null}

        <Button type="submit" disabled={loading}>
          {loading ? "Signing in…" : mfaStep ? "Verify & sign in" : "Sign in"}
        </Button>

        <p className="text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-black-100 hover:text-black-50"
          >
            Forgot password?
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <LoginContent />
    </Suspense>
  );
}
