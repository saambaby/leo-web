import { api } from "@/lib/api";
import { bffPostWithAuth } from "@/lib/auth-bff-client";
import { homeForClaims, parseJwtClaims, routeAfterLogin } from "@/lib/auth-routing";
import type {
  PostLoginNavigation,
  SwitchTenantResult,
  TokenPair,
} from "@/lib/auth-types";
import { isSwitchMfaRequired } from "@/lib/auth-types";
import { getLastTenantId, setLastTenantId } from "@/lib/last-tenant";
import type { MembershipListItem } from "@/lib/membership-types";

interface FinishLoginFlowOptions {
  setSession: (pair: TokenPair) => Promise<void>;
  syncAccessToken: (token: string) => void;
}

/**
 * Establishes a session then restores `leo.last_tenant_id` preference when held (INV-WEB-TENANT-1).
 */
export async function finishLoginFlow(
  pair: TokenPair,
  { setSession, syncAccessToken }: FinishLoginFlowOptions,
): Promise<PostLoginNavigation> {
  const preferredTenantId = getLastTenantId();

  await setSession(pair);

  let accessToken = pair.access_token;
  const claims = parseJwtClaims(accessToken);

  if (
    preferredTenantId &&
    claims?.tenant_id &&
    preferredTenantId !== claims.tenant_id
  ) {
    try {
      const memberships = await api<MembershipListItem[]>("/memberships");
      const target = memberships.find((m) => m.tenant_id === preferredTenantId);

      if (target) {
        const switchResult = await bffPostWithAuth<SwitchTenantResult>(
          "/api/auth/switch-tenant",
          accessToken,
          { tenant_id: preferredTenantId },
        );

        if (isSwitchMfaRequired(switchResult)) {
          return {
            kind: "mfa",
            returnTo: homeForClaims({
              sub: claims.sub,
              role: target.role,
              tenant_id: preferredTenantId,
              exp: claims.exp,
            }),
          };
        }

        accessToken = switchResult.access_token;
        syncAccessToken(accessToken);
        const switchedClaims = parseJwtClaims(accessToken);
        if (switchedClaims?.tenant_id) {
          setLastTenantId(switchedClaims.tenant_id);
        }
      }
    } catch {
      // Best-effort preference restore — continue with login token.
    }
  }

  return {
    kind: "route",
    accessToken,
    destination: routeAfterLogin(accessToken),
  };
}

export function loginNavigationPath(nav: PostLoginNavigation): string {
  if (nav.kind === "mfa") {
    return `/mfa?returnTo=${encodeURIComponent(nav.returnTo)}`;
  }
  return nav.destination;
}
