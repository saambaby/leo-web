import type { JwtClaims } from "@/lib/auth-types";
import { isPrivilegedRole } from "@/lib/privileged-roles";

/**
 * Returns true when a privileged session must complete MFA enrollment before
 * protected routes (INV-WEB-AUTH-5). Enrollment pending in memory always blocks;
 * privileged JWT without a satisfied refresh family blocks when the session flag
 * is false (e.g. stale token during enrollment).
 */
export function requiresMfaEnrollment(
  claims: JwtClaims | null,
  mfaEnrollmentPending: boolean,
  sessionMfaSatisfied: boolean,
): boolean {
  if (mfaEnrollmentPending) return true;
  if (!claims || !isPrivilegedRole(claims.role)) return false;
  return !sessionMfaSatisfied;
}
