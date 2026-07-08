"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/components/auth-provider";
import { AuthShell, AuthLoadingFallback } from "@/components/auth-shell";
import { Alert, Button } from "@/components/design-system";
import { FormField } from "@/components/form-field";
import { api, ApiError } from "@/lib/api";
import {
  isMfaEnrollmentRequired,
  isMfaRequired,
  isTokenPair,
  type LoginResult,
} from "@/lib/auth-types";

type SetupStep = "reset" | "login";

const PLATFORM_HOME = "/admin/platform";

function AdminSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupToken = searchParams.get("token");
  const { setSession, setMfaEnrollment } = useAuth();
  const [step, setStep] = useState<SetupStep>("reset");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [mfaStep, setMfaStep] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const missingToken = !setupToken;

  async function handleResetSubmit(e: FormEvent) {
    e.preventDefault();
    if (!setupToken) return;

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api<{ reset: true }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: setupToken, new_password: password }),
      });
      setStep("login");
      setTotpCode("");
      setMfaStep(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not set password. The setup link may have expired.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLoginSubmit(e: FormEvent) {
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
        router.push(
          `/mfa/enroll?returnTo=${encodeURIComponent(PLATFORM_HOME)}`,
        );
        return;
      }

      if (isTokenPair(result)) {
        await setSession(result);
        router.push(PLATFORM_HOME);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (missingToken) {
    return (
      <AuthShell
        title="Platform setup"
        subtitle="Complete your platform administrator account"
      >
        <div className="space-y-4">
          <Alert variant="error">Invalid or missing setup link.</Alert>
          <Link
            href="/login"
            className="block text-center text-sm text-signal-live hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (step === "reset") {
    return (
      <AuthShell
        title="Platform setup"
        subtitle="Set your administrator password"
      >
        <form onSubmit={handleResetSubmit} className="space-y-4">
          {error ? <Alert variant="error">{error}</Alert> : null}
          <FormField
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormField
            label="Confirm password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Continue"}
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Platform setup"
      subtitle="Sign in with your new password"
    >
      <form onSubmit={handleLoginSubmit} className="space-y-4">
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
          />
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading
            ? "Signing in…"
            : mfaStep
              ? "Verify & continue"
              : "Sign in & set up MFA"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function AdminSetupPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <AdminSetupContent />
    </Suspense>
  );
}
