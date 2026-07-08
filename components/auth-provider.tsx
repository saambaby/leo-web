"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { bffPost, clearCsrfToken } from "@/lib/auth-bff-client";
import type { JwtClaims, MfaEnrollmentState, TokenPair } from "@/lib/auth-types";
import {
  setAccessToken as setStoredAccessToken,
  setAccessTokenChangeHandler,
  setSessionExpiredHandler,
} from "@/lib/auth-token-store";

interface AuthContextValue {
  accessToken: string | null;
  mfaEnrollment: MfaEnrollmentState | null;
  sessionExpired: boolean;
  setSession: (pair: TokenPair) => Promise<void>;
  clearSession: () => Promise<void>;
  decodeClaims: () => JwtClaims | null;
  setMfaEnrollment: (state: MfaEnrollmentState) => void;
  clearMfaEnrollment: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseJwtClaims(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as {
      sub?: string;
      tenant_id?: string;
      role?: string;
      exp?: number;
    };
    if (!decoded.sub || !decoded.role || decoded.exp === undefined) return null;
    return {
      sub: decoded.sub,
      tenant_id: decoded.tenant_id,
      role: decoded.role,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [mfaEnrollment, setMfaEnrollmentState] =
    useState<MfaEnrollmentState | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  const syncAccessToken = useCallback((token: string | null) => {
    setAccessToken(token);
    setStoredAccessToken(token);
  }, []);

  const setSession = useCallback(
    async (pair: TokenPair) => {
      const data = await bffPost<{ access_token: string; expires_in: number }>(
        "/api/auth/session",
        {
          refresh_token: pair.refresh_token,
          access_token: pair.access_token,
          expires_in: pair.expires_in,
        },
      );
      syncAccessToken(data.access_token);
      setSessionExpired(false);
    },
    [syncAccessToken],
  );

  const clearSession = useCallback(async () => {
    try {
      await bffPost("/api/auth/logout");
    } catch {
      // Best-effort logout; always clear local state.
    }
    clearCsrfToken();
    syncAccessToken(null);
    setSessionExpired(false);
  }, [syncAccessToken]);

  const decodeClaims = useCallback((): JwtClaims | null => {
    if (!accessToken) return null;
    return parseJwtClaims(accessToken);
  }, [accessToken]);

  const setMfaEnrollment = useCallback((state: MfaEnrollmentState) => {
    setMfaEnrollmentState(state);
  }, []);

  const clearMfaEnrollment = useCallback(() => {
    setMfaEnrollmentState(null);
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setSessionExpired(true);
      syncAccessToken(null);
    });
    setAccessTokenChangeHandler((token) => {
      setAccessToken(token);
    });
    return () => {
      setSessionExpiredHandler(null);
      setAccessTokenChangeHandler(null);
    };
  }, [syncAccessToken]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const data = await bffPost<{ access_token: string; expires_in: number }>(
          "/api/auth/refresh",
        );
        if (!cancelled) {
          syncAccessToken(data.access_token);
        }
      } catch {
        // No cookie session — user stays unauthenticated.
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [syncAccessToken]);

  useEffect(() => {
    if (sessionExpired) {
      router.replace("/login");
    }
  }, [sessionExpired, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      mfaEnrollment,
      sessionExpired,
      setSession,
      clearSession,
      decodeClaims,
      setMfaEnrollment,
      clearMfaEnrollment,
    }),
    [
      accessToken,
      mfaEnrollment,
      sessionExpired,
      setSession,
      clearSession,
      decodeClaims,
      setMfaEnrollment,
      clearMfaEnrollment,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {sessionExpired ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6"
          role="alertdialog"
          aria-labelledby="session-expired-title"
          aria-describedby="session-expired-desc"
        >
          <div className="max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-center text-white shadow-xl">
            <h2 id="session-expired-title" className="text-lg font-semibold">
              Session expired
            </h2>
            <p id="session-expired-desc" className="mt-2 text-sm text-zinc-400">
              Your session has ended. Redirecting to sign in…
            </p>
          </div>
        </div>
      ) : null}
      {!bootstrapped ? (
        <span className="sr-only" aria-live="polite">
          Restoring session…
        </span>
      ) : null}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
