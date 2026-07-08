import type { JwtClaims } from "@/lib/auth-types";

const ROLE_HOME: Record<string, string> = {
  platform_admin: "/admin/platform",
  lsp_admin: "/admin/lsp",
  sub_admin: "/admin/lsp",
  customer_admin: "/portal/org",
  customer_user: "/portal/call",
};

export function parseJwtClaims(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as {
      sub?: string;
      tenant_id?: string;
      role?: string;
      exp?: number;
    };
    if (!decoded.sub || !decoded.role || decoded.exp === undefined) return null;
    return {
      sub: decoded.sub,
      tenant_id: decoded.tenant_id,
      role: decoded.role,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
}

/** Maps JWT claims to the role home per product spec §4. */
export function homeForClaims(claims: JwtClaims): string {
  if (!claims.tenant_id) {
    return "/account";
  }
  return ROLE_HOME[claims.role] ?? "/account";
}

export function routeAfterLogin(accessToken: string): string {
  const claims = parseJwtClaims(accessToken);
  if (!claims) return "/login";
  return homeForClaims(claims);
}

/** Reject open-redirect targets; allow same-origin relative paths only. */
export function safeReturnPath(returnTo: string | null): string | null {
  if (!returnTo) return null;
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return null;
  return returnTo;
}
