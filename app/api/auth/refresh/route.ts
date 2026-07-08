import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  REFRESH_COOKIE,
  clearedCookieOptions,
  refreshCookieOptions,
} from "@/lib/auth-cookies";
import { csrfForbiddenResponse, validateCsrf } from "@/lib/auth-csrf";
import { ProxyAuthError, proxyRefresh } from "@/lib/auth-server";

export async function POST(request: Request) {
  if (!(await validateCsrf(request))) {
    return csrfForbiddenResponse();
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh session" }, { status: 401 });
  }

  try {
    const pair = await proxyRefresh(refreshToken);

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
      cookieStore.set(REFRESH_COOKIE, "", clearedCookieOptions());
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}
