"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useAuth } from "@/components/auth-provider";
import { WorkstationCta } from "@/components/workstation-cta";
import { isPrivilegedRole } from "@/lib/privileged-roles";

function AccountContent() {
  const { decodeClaims, sessionMfaSatisfied } = useAuth();
  const claims = decodeClaims();

  if (!claims) {
    return null;
  }

  const awaitingAffiliation = !claims.tenant_id;

  if (awaitingAffiliation) {
    return (
      <div className="px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Account
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
            Awaiting affiliation
          </h1>
          <p className="mt-2 text-sm text-secondary">
            Your interpreter account is active but not yet linked to an
            organization. You can manage security settings below while you wait.
          </p>
          <SecuritySection
            mfaEnrolled={sessionMfaSatisfied || !isPrivilegedRole(claims.role)}
          />
          <WorkstationCta />
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Account
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
          Profile
        </h1>
        <p className="mt-2 text-sm text-secondary">
          Manage your account security and preferences.
        </p>
        <SecuritySection
          mfaEnrolled={sessionMfaSatisfied || !isPrivilegedRole(claims.role)}
        />
      </div>
    </div>
  );
}

function SecuritySection({ mfaEnrolled }: { mfaEnrolled: boolean }) {
  return (
    <section className="mt-8" aria-labelledby="account-security-heading">
      <h2
        id="account-security-heading"
        className="font-display text-lg font-semibold text-foreground"
      >
        Security
      </h2>
      <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
        <li>
          <Link
            href="/forgot-password"
            className="flex min-h-11 items-center justify-between px-4 py-3 text-sm text-foreground transition hover:bg-canvas"
          >
            <span>Change password</span>
            <span className="text-muted" aria-hidden>
              →
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/mfa/enroll?returnTo=%2Faccount"
            className="flex min-h-11 items-center justify-between px-4 py-3 text-sm text-foreground transition hover:bg-canvas"
          >
            <span>
              Two-factor authentication
              <span className="mt-0.5 block text-xs text-muted">
                {mfaEnrolled ? "Enabled on this session" : "Enrollment required"}
              </span>
            </span>
            <span className="text-muted" aria-hidden>
              →
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}

function AccountLoading() {
  return (
    <div className="flex min-h-[12rem] items-center justify-center px-6 py-10 text-sm text-muted">
      Loading account…
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountLoading />}>
      <AccountContent />
    </Suspense>
  );
}
