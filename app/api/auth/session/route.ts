import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  REFRESH_COOKIE,
  refreshCookieOptions,
} from "@/lib/auth-cookies";
import { csrfForbiddenResponse, validateCsrf } from "@/lib/auth-csrf";

interface SessionBody {
  refresh_token: string;
  access_token: string;
  expires_in: number;
}

export async function POST(request: Request) {
  if (!(await validateCsrf(request))) {
    return csrfForbiddenResponse();
  }

  let body: SessionBody;
  try {
    body = (await request.json()) as SessionBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  if (!body.refresh_token || !body.access_token || !body.expires_in) {
    return NextResponse.json(
      { message: "refresh_token, access_token, and expires_in are required" },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(
    REFRESH_COOKIE,
    body.refresh_token,
    refreshCookieOptions(body.expires_in),
  );

  return NextResponse.json({
    access_token: body.access_token,
    expires_in: body.expires_in,
  });
}
