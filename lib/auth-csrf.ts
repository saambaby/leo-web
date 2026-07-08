import { cookies } from "next/headers";
import { CSRF_COOKIE } from "./auth-cookies";

export async function validateCsrf(request: Request): Promise<boolean> {
  const header = request.headers.get("X-CSRF-Token");
  if (!header) return false;

  const cookieStore = await cookies();
  const cookie = cookieStore.get(CSRF_COOKIE)?.value;
  return Boolean(cookie && cookie === header);
}

export function csrfForbiddenResponse(): Response {
  return Response.json({ message: "Invalid CSRF token" }, { status: 403 });
}
