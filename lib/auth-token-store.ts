let accessToken: string | null = null;
let onSessionExpired: (() => void) | null = null;
let onAccessTokenChange: ((token: string | null) => void) | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
  onAccessTokenChange?.(token);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessTokenChangeHandler(
  handler: ((token: string | null) => void) | null,
): void {
  onAccessTokenChange = handler;
}

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

export function notifySessionExpired(): void {
  onSessionExpired?.();
}
