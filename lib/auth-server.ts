const API_URL = process.env.API_URL ?? "http://localhost:3000";

export interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export async function proxyRefresh(
  refreshToken: string,
): Promise<TokenPairResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ProxyAuthError(
      res.status,
      body?.message ?? `Refresh failed (${res.status})`,
    );
  }

  return res.json() as Promise<TokenPairResponse>;
}

export async function proxyLogout(refreshToken: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok && res.status !== 204) {
    const body = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ProxyAuthError(
      res.status,
      body?.message ?? `Logout failed (${res.status})`,
    );
  }
}

export class ProxyAuthError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ProxyAuthError";
  }
}
