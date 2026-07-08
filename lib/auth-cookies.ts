import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const REFRESH_COOKIE = "leo_refresh";
export const CSRF_COOKIE = "leo_csrf";

const isProd = process.env.NODE_ENV === "production";

export function refreshCookieOptions(maxAge?: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export function csrfCookieOptions(maxAge = 60 * 60 * 24): Partial<ResponseCookie> {
  return {
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export function clearedCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
}
