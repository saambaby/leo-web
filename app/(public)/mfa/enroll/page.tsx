"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { AuthShell } from "@/components/auth-shell";
import { Alert, Button } from "@/components/design-system";
import { FormField } from "@/components/form-field";
import { api, ApiError } from "@/lib/api";
import type { TokenPair } from "@/lib/auth-types";

export default function MfaEnrollPage() {
  const router = useRouter();
  const {
    mfaEnrollment: enrollment,
    setSession,
    clearMfaEnrollment,
  } = useAuth();
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!enrollment) return;

    setError("");
    setLoading(true);

    try {
      const result = await api<TokenPair>("/auth/mfa/enroll", {
        method: "POST",
        body: JSON.stringify({
          enrollment_token: enrollment.enrollment_token,
          totp_code: totpCode,
        }),
      });

      await setSession(result);
      clearMfaEnrollment();
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Enrollment failed. Check your code and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Set up MFA"
      subtitle="Privileged accounts require an authenticator app"
    >
      {!enrollment ? (
        <div className="space-y-4">
          <Alert variant="error">
            No MFA enrollment in progress. Sign in again.
          </Alert>
          <Link
            href="/login"
            className="block text-center text-sm text-signal-live hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? <Alert variant="error">{error}</Alert> : null}
          <Alert variant="info">
            Add this account to your authenticator app using the secret below,
            then enter the 6-digit code.
          </Alert>
          <div className="rounded-lg border border-black-600 bg-black-700 p-3">
            <p className="text-xs uppercase tracking-wide text-black-200">
              Manual entry secret
            </p>
            <p className="mt-1 break-all font-mono text-sm text-signal-live">
              {enrollment.secret}
            </p>
            <a
              href={enrollment.otpauth_url}
              className="mt-2 inline-block text-xs text-signal-info hover:underline"
            >
              Open otpauth link
            </a>
          </div>
          <FormField
            label="Authenticator code"
            name="totp_code"
            inputMode="numeric"
            maxLength={6}
            required
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Verifying…" : "Complete setup"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
