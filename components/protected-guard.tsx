"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { requiresMfaEnrollment } from "@/lib/auth-guard";
import { safeReturnPath } from "@/lib/auth-routing";

function GuardLoadingFallback() {
  return (
    <div className="flex min-h-full items-center justify-center bg-canvas font-sans text-sm text-muted">
      Loading…
    </div>
  );
}

function ProtectedGuardInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    accessToken,
    bootstrapped,
    mfaEnrollment,
    sessionMfaSatisfied,
    decodeClaims,
  } = useAuth();

  const returnTo = safeReturnPath(
    pathname +
      (searchParams.toString() ? `?${searchParams.toString()}` : ""),
  );

  const claims = accessToken ? decodeClaims() : null;
  const mfaBlocked = requiresMfaEnrollment(
    claims,
    Boolean(mfaEnrollment),
    sessionMfaSatisfied,
  );

  useEffect(() => {
    if (!bootstrapped) return;

    if (!accessToken) {
      const loginPath = returnTo
        ? `/login?returnTo=${encodeURIComponent(returnTo)}`
        : "/login";
      router.replace(loginPath);
      return;
    }

    if (mfaBlocked) {
      const enrollPath = returnTo
        ? `/mfa/enroll?returnTo=${encodeURIComponent(returnTo)}`
        : "/mfa/enroll";
      router.replace(enrollPath);
    }
  }, [
    accessToken,
    bootstrapped,
    mfaBlocked,
    returnTo,
    router,
  ]);

  if (!bootstrapped || !accessToken || mfaBlocked) {
    return <GuardLoadingFallback />;
  }

  return <>{children}</>;
}

export function ProtectedGuard({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<GuardLoadingFallback />}>
      <ProtectedGuardInner>{children}</ProtectedGuardInner>
    </Suspense>
  );
}
