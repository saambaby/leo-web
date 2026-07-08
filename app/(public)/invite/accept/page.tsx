"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthShell, AuthLoadingFallback } from "@/components/auth-shell";
import { Alert, Button, Checkbox } from "@/components/design-system";
import { FormField } from "@/components/form-field";
import { api, ApiError } from "@/lib/api";
import type { InviteAcceptResponse } from "@/lib/auth-types";

function InviteAcceptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [tos, setTos] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [baaAck, setBaaAck] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const missingToken = !token;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api<InviteAcceptResponse>("/invitations/accept", {
        method: "POST",
        body: JSON.stringify({
          token,
          password,
          consent: { tos, privacy, baa_ack: baaAck },
        }),
      });
      router.push("/login?invited=1");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not accept invitation. The link may have expired.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Accept invitation"
      subtitle="Create your password to join the organization"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-signal-live hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {missingToken ? (
        <div className="space-y-4">
          <Alert variant="error">Invalid or missing invitation link.</Alert>
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

          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="At least 8 characters."
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

          <div className="space-y-2 rounded-lg border border-black-600 bg-black-700/50 p-3">
            <label className="flex items-start gap-2 font-sans text-sm text-black-50">
              <Checkbox checked={tos} onChange={(e) => setTos(e.target.checked)} />
              <span>I agree to the Terms of Service</span>
            </label>
            <label className="flex items-start gap-2 font-sans text-sm text-black-50">
              <Checkbox
                checked={privacy}
                onChange={(e) => setPrivacy(e.target.checked)}
              />
              <span>I agree to the Privacy Policy</span>
            </label>
            <label className="flex items-start gap-2 font-sans text-sm text-black-50">
              <Checkbox
                checked={baaAck}
                onChange={(e) => setBaaAck(e.target.checked)}
              />
              <span>I acknowledge the Business Associate Agreement</span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading || !tos || !privacy || !baaAck}
          >
            {loading ? "Creating account…" : "Accept invitation"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <InviteAcceptContent />
    </Suspense>
  );
}
