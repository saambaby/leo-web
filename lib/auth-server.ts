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

export interface SwitchTenantBody {
  tenant_id: string;
  refresh_token: string;
  totp_code?: string;
}

export type SwitchTenantApiResult =
  | TokenPairResponse
  | { mfa_required: true };

export async function proxySwitchTenant(
  accessToken: string,
  body: SwitchTenantBody,
): Promise<SwitchTenantApiResult> {
  const res = await fetch(`${API_URL}/api/v1/auth/switch-tenant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ProxyAuthError(
      res.status,
      errorBody?.message ?? `Switch tenant failed (${res.status})`,
    );
  }

  const data = (await res.json()) as SwitchTenantApiResult;
  if ("mfa_required" in data && data.mfa_required) {
    return { mfa_required: true };
  }

  return data as TokenPairResponse;
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
