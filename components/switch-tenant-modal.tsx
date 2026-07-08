"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { isSwitchMfaRequired } from "@/lib/auth-types";
import { routeAfterLogin, safeReturnPath } from "@/lib/auth-routing";
import {
  membershipsQueryKey,
  useMemberships,
} from "@/lib/hooks/use-memberships";
import type { MembershipListItem } from "@/lib/membership-types";
import { ApiError } from "@/lib/api";

function formatOrgType(type: string): string {
  return type.replace(/_/g, " ");
}

function formatRole(role: string): string {
  return role.replace(/_/g, " ");
}

interface MembershipRowProps {
  membership: MembershipListItem;
  active: boolean;
  disabled: boolean;
  onSelect: (tenantId: string) => void;
}

function MembershipRow({
  membership,
  active,
  disabled,
  onSelect,
}: MembershipRowProps) {
  return (
    <li>
      <button
        type="button"
        disabled={disabled || active}
        onClick={() => onSelect(membership.tenant_id)}
        className={`flex min-h-11 w-full flex-col items-start rounded-lg border px-4 py-3 text-left transition ${
          active
            ? "cursor-default border-border bg-canvas"
            : "border-transparent hover:border-border hover:bg-canvas/80"
        } disabled:opacity-60`}
        aria-current={active ? "true" : undefined}
      >
        <span className="font-display text-sm font-medium text-foreground">
          {membership.organization.name}
        </span>
        <span className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted">
          {formatOrgType(membership.organization.type)} · {formatRole(membership.role)}
        </span>
      </button>
    </li>
  );
}

export function SwitchTenantModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const { decodeClaims, switchTenant } = useAuth();
  const { data: memberships, isLoading } = useMemberships();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState("");

  const claims = decodeClaims();
  const activeTenantId = claims?.tenant_id;

  const returnTo = safeReturnPath(
    pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""),
  );

  const showControl = (memberships?.length ?? 0) > 1;

  const close = useCallback(() => {
    if (switching) return;
    setOpen(false);
    setError("");
  }, [switching]);

  const handleSelect = useCallback(
    async (tenantId: string) => {
      if (tenantId === activeTenantId) {
        close();
        return;
      }

      setSwitching(true);
      setError("");

      try {
        const result = await switchTenant(tenantId);

        if (isSwitchMfaRequired(result)) {
          const mfaPath = returnTo
            ? `/mfa?returnTo=${encodeURIComponent(returnTo)}`
            : "/mfa";
          setOpen(false);
          router.push(mfaPath);
          return;
        }

        await queryClient.invalidateQueries({ queryKey: membershipsQueryKey });
        setOpen(false);
        router.push(routeAfterLogin(result.access_token));
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Could not switch organization. Please try again.");
        }
      } finally {
        setSwitching(false);
      }
    },
    [
      activeTenantId,
      close,
      queryClient,
      returnTo,
      router,
      switchTenant,
    ],
  );

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
  }, [open]);

  if (!showControl) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isLoading}
        className="rounded-md border border-border bg-surface px-3 py-1.5 font-display text-sm font-medium text-secondary transition hover:bg-canvas hover:text-foreground disabled:opacity-60"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Switch organization
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              close();
            }
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-xl outline-none"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id={titleId}
                  className="font-display text-base font-semibold text-foreground"
                >
                  Switch organization
                </h2>
                <p className="mt-1 text-sm text-secondary">
                  Choose which organization to work in.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={switching}
                className="rounded-md px-2 py-1 text-sm text-muted transition hover:bg-canvas hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {error ? (
              <p className="mt-4 rounded-md border border-signal-error/30 bg-signal-error/10 px-3 py-2 text-sm text-signal-error">
                {error}
              </p>
            ) : null}

            <ul className="mt-4 space-y-1">
              {memberships?.map((membership) => (
                <MembershipRow
                  key={membership.id}
                  membership={membership}
                  active={membership.tenant_id === activeTenantId}
                  disabled={switching}
                  onSelect={(tenantId) => void handleSelect(tenantId)}
                />
              ))}
            </ul>

            {switching ? (
              <p className="mt-4 text-center text-sm text-muted" aria-live="polite">
                Switching…
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
