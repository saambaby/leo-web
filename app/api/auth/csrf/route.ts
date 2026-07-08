import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { CSRF_COOKIE, csrfCookieOptions } from "@/lib/auth-cookies";

export async function GET() {
  const csrfToken = randomBytes(32).toString("hex");
  const response = NextResponse.json({ csrf_token: csrfToken });

  response.cookies.set(CSRF_COOKIE, csrfToken, csrfCookieOptions());

  return response;
}
