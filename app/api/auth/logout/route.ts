import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { REFRESH_COOKIE, clearedCookieOptions } from "@/lib/auth-cookies";
import { csrfForbiddenResponse, validateCsrf } from "@/lib/auth-csrf";
import { ProxyAuthError, proxyLogout } from "@/lib/auth-server";

export async function POST(request: Request) {
  if (!(await validateCsrf(request))) {
    return csrfForbiddenResponse();
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    try {
      await proxyLogout(refreshToken);
    } catch (err) {
      if (err instanceof ProxyAuthError && err.statusCode >= 500) {
        return NextResponse.json({ message: err.message }, { status: err.statusCode });
      }
    }
  }

  cookieStore.set(REFRESH_COOKIE, "", clearedCookieOptions());

  return new NextResponse(null, { status: 204 });
}
