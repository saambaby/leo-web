import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  REFRESH_COOKIE,
  clearedCookieOptions,
  refreshCookieOptions,
} from "@/lib/auth-cookies";
import { csrfForbiddenResponse, validateCsrf } from "@/lib/auth-csrf";
import { ProxyAuthError, proxySwitchTenant, type TokenPairResponse } from "@/lib/auth-server";

interface SwitchTenantRequestBody {
  tenant_id: string;
  totp_code?: string;
}

export async function POST(request: Request) {
  if (!(await validateCsrf(request))) {
    return csrfForbiddenResponse();
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const accessToken = authHeader.slice("Bearer ".length).trim();
  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: SwitchTenantRequestBody;
  try {
    body = (await request.json()) as SwitchTenantRequestBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  if (!body.tenant_id) {
    return NextResponse.json({ message: "tenant_id is required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh session" }, { status: 401 });
  }

  try {
    const result = await proxySwitchTenant(accessToken, {
      tenant_id: body.tenant_id,
      refresh_token: refreshToken,
      totp_code: body.totp_code,
    });

    if ("mfa_required" in result && result.mfa_required) {
      return NextResponse.json({ mfa_required: true });
    }

    const pair = result as TokenPairResponse;

    cookieStore.set(
      REFRESH_COOKIE,
      pair.refresh_token,
      refreshCookieOptions(pair.expires_in),
    );

    return NextResponse.json({
      access_token: pair.access_token,
      expires_in: pair.expires_in,
    });
  } catch (err) {
    if (err instanceof ProxyAuthError) {
      if (err.statusCode === 401) {
        cookieStore.set(REFRESH_COOKIE, "", clearedCookieOptions());
      }
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}
