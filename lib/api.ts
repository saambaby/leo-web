export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const PUBLIC_API_PREFIXES = [
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
  "/auth/verify-email",
  "/auth/resend-verify",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/mfa/enroll",
  "/auth/signup",
  "/invitations/accept",
] as const;

export function isPublicApiPath(path: string): boolean {
  return PUBLIC_API_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}?`),
  );
}

let refreshPromise: Promise<boolean> | null = null;

async function silentRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const { bffPost } = await import("./auth-bff-client");
      const { setAccessToken } = await import("./auth-token-store");

      const data = await bffPost<{ access_token: string; expires_in: number }>(
        "/api/auth/refresh",
      );
      setAccessToken(data.access_token);
      return true;
    } catch {
      const { notifySessionExpired } = await import("./auth-token-store");
      notifySessionExpired();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!isPublicApiPath(path)) {
    const { getAccessToken } = await import("./auth-token-store");
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(`/api/v1${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && !isPublicApiPath(path)) {
    const refreshed = await silentRefresh();
    if (refreshed) {
      const { getAccessToken } = await import("./auth-token-store");
      const token = getAccessToken();
      const retryHeaders = new Headers(options.headers);
      if (options.body && !retryHeaders.has("Content-Type")) {
        retryHeaders.set("Content-Type", "application/json");
      }
      if (token) {
        retryHeaders.set("Authorization", `Bearer ${token}`);
      }

      const retryRes = await fetch(`/api/v1${path}`, {
        ...options,
        headers: retryHeaders,
      });

      if (!retryRes.ok) {
        const body = (await retryRes.json().catch(() => null)) as {
          message?: string;
        } | null;
        if (retryRes.status === 401) {
          const { notifySessionExpired } = await import("./auth-token-store");
          notifySessionExpired();
        }
        throw new ApiError(
          retryRes.status,
          body?.message ?? `Request failed (${retryRes.status})`,
        );
      }

      if (retryRes.status === 204) {
        return undefined as T;
      }

      return retryRes.json() as Promise<T>;
    }
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ApiError(
      res.status,
      body?.message ?? `Request failed (${res.status})`,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
