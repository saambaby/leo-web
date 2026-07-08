let csrfToken: string | null = null;

export async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  const res = await fetch("/api/auth/csrf", { credentials: "same-origin" });
  if (!res.ok) {
    throw new Error("Failed to fetch CSRF token");
  }

  const data = (await res.json()) as { csrf_token: string };
  csrfToken = data.csrf_token;
  return csrfToken;
}

export function clearCsrfToken(): void {
  csrfToken = null;
}

export async function bffPost<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  const token = await ensureCsrfToken();
  const res = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return parseBffResponse<T>(res);
}

export async function bffPostWithAuth<T>(
  path: string,
  accessToken: string,
  body?: unknown,
): Promise<T> {
  const token = await ensureCsrfToken();
  const res = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
      Authorization: `Bearer ${accessToken}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return parseBffResponse<T>(res);
}

async function parseBffResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new BffError(
      res.status,
      errorBody?.message ?? `BFF request failed (${res.status})`,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export class BffError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "BffError";
  }
}
