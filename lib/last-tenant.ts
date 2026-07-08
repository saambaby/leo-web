const LAST_TENANT_KEY = "leo.last_tenant_id";

export function getLastTenantId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LAST_TENANT_KEY);
  } catch {
    return null;
  }
}

export function setLastTenantId(tenantId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_TENANT_KEY, tenantId);
  } catch {
    // Preference only — ignore quota / private-mode failures.
  }
}

export function clearLastTenantId(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LAST_TENANT_KEY);
  } catch {
    // Best-effort clear.
  }
}
