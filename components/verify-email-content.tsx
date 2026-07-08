"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { Alert, Button } from "@/components/form-field";
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
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500" />
          <p className="text-sm text-zinc-400">Verifying your link…</p>
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
              className="text-center text-sm text-emerald-400 hover:text-emerald-300"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="text-center text-sm text-zinc-400 hover:text-zinc-300"
            >
              Sign in
            </Link>
          </div>
        </div>
      ) : null}

      {state === "error" ? (
        <div className="space-y-4">
          <Alert variant="error">{message}</Alert>
          <p className="text-center text-xs text-zinc-500">
            If you already verified, try{" "}
            <Link href="/login" className="text-emerald-400 hover:underline">
              signing in
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={() => {
              attempted.current = false;
              setState("loading");
              window.location.reload();
            }}
            className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
          >
            Try again
          </button>
        </div>
      ) : null}
    </AuthShell>
  );
}
