"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { Alert, Button } from "@/components/design-system";
import { api, ApiError } from "@/lib/api";

type VerifyState = "loading" | "success" | "error" | "missing";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerifyState>(
    token ? "loading" : "missing",
  );
  const [message, setMessage] = useState("");
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    let cancelled = false;

    (async () => {
      try {
        await api<{ verified: true }>("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        if (!cancelled) {
          setState("success");
          setMessage("Your email is verified. You can sign in now.");
        }
      } catch (err) {
        if (cancelled) return;
        setState("error");
        if (err instanceof ApiError) {
          setMessage(err.message);
        } else {
          setMessage("Could not verify your email. Try again or sign in if you already verified.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthShell title="Verify email" subtitle="Confirming your email address">
      {state === "loading" ? (
        <div className="space-y-3 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black-400 border-t-signal-live" />
          <p className="font-sans text-sm text-black-100">Verifying your link…</p>
        </div>
      ) : null}

      {state === "success" ? (
        <div className="space-y-4">
          <Alert variant="success">{message}</Alert>
          <Button onClick={() => (window.location.href = "/login")}>
            Continue to sign in
          </Button>
        </div>
      ) : null}

      {state === "missing" ? (
        <div className="space-y-4">
          <Alert variant="error">
            This link is missing a verification token. Open the link from your
            email or sign up again.
          </Alert>
          <div className="flex flex-col gap-2">
            <Link
              href="/signup"
              className="text-center text-sm text-signal-live hover:text-signal-live/80"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="text-center text-sm text-black-100 hover:text-black-50"
            >
              Sign in
            </Link>
          </div>
        </div>
      ) : null}

      {state === "error" ? (
        <div className="space-y-4">
          <Alert variant="error">{message}</Alert>
          <p className="text-center font-sans text-xs text-black-200">
            If you already verified, try{" "}
            <Link href="/login" className="text-signal-live hover:underline">
              signing in
            </Link>
            .
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              attempted.current = false;
              setState("loading");
              window.location.reload();
            }}
          >
            Try again
          </Button>
        </div>
      ) : null}
    </AuthShell>
  );
}
