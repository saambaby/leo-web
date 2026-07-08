"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { hasPermission, type Permission } from "@/lib/permissions/has-permission";

interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  /** Shown when the caller lacks permission; default is an empty deny state. */
  fallback?: ReactNode;
}

function DefaultDenyState() {
  return (
    <div
      className="flex min-h-[8rem] items-center justify-center rounded-lg border border-dashed border-zinc-700/60 px-6 py-8 text-center text-sm text-zinc-500"
      role="status"
      aria-label="Not available for your role"
    />
  );
}

/**
 * Default-deny permission gate (INV-WEB-PERM-1).
 * Renders children only when the active JWT role holds the required permission.
 */
export function PermissionGate({
  permission,
  children,
  fallback,
}: PermissionGateProps) {
  const { decodeClaims } = useAuth();
  const claims = decodeClaims();

  if (!claims || !hasPermission(claims.role, permission)) {
    return <>{fallback ?? <DefaultDenyState />}</>;
  }

  return <>{children}</>;
}
