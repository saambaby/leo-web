# P1-1 — Session hardening & auth foundation

**Status:** draft · **Phase:** P1-1 · **Owner:** leo-web

## Summary

Retire the `sessionStorage` token spike (ADR-WEB-001) and deliver the target session model: refresh in an httpOnly cookie via Next.js BFF routes, access in memory via `AuthProvider`, Bearer + silent refresh in `lib/api.ts`. Migrate public auth UI to design-system primitives (`.theme-auth`), restructure App Router into layout groups with protected stubs, and wire role-based post-login routing. Proves authenticated API calls work before P1-2 admin chrome.

## User-facing behaviour

- **Login:** email/password on `/login`; privileged roles see inline TOTP step on the same page when API returns `mfa_required`. Success lands on role home (not `/dashboard`).
- **Session:** surviving browser refresh re-establishes access via silent cookie refresh; expired/revoked session shows overlay → `/login`.
- **Signup / verify / password recovery:** unchanged flows; pages use tokenized dark auth shell aligned to reference mocks.
- **Invite accept (`/invite/accept?token=`):** password + consent form → `POST /invitations/accept` → **always** redirect `/login?invited=1` with success copy ("Account created — sign in with your new password"). No auto-login; API never returns `TokenPair`.
- **Platform setup (`/admin/setup?token=`):** reset password → MFA enroll → `/admin/platform` stub.
- **`/mfa`:** TOTP page for deep-link MFA completion (`?returnTo=`); full switch-tenant wiring deferred to P1-2 — page must render and accept TOTP without breaking login inline path.
- **Role stubs:** tenant-less interpreter → `/account` + `WorkstationCta` (native app open/download copy; optional `leoconnexio://` scheme link — **no web URL env**); `customer_user` → `/portal/call` stub + same CTA. **Affordance:** primary button styled CTA; **input surface:** full button hit area; no `window.open` on page load.

## Acceptance criteria

1. DevTools: no `access_token` or `refresh_token` in `sessionStorage`/`localStorage`; refresh present only as httpOnly cookie after login.
2. `AuthProvider` holds `access_token` in React state/module closure only; `lib/api.ts` sends `Authorization: Bearer` on non-public paths.
3. `POST /api/auth/refresh` recovers session after hard reload without re-login; second consecutive 401 shows session-expired UI → `/login`.
4. Manual E2E passes for all three signup variants → verify → login → correct stub home per JWT `role` (decode client-side; claims `sub`, `tenant_id?`, `role`, `exp` — snake_case).
5. `/invite/accept` completes → `/login?invited=1` (no session mint); `/admin/setup` funnel → platform stub; `/dashboard` removed.
6. All public auth routes use `components/design-system/` primitives + `.theme-auth`; no hardcoded `#0b0d12` in `AuthShell`.
7. App Router uses `(public)`, `(platform)`, `(lsp)`, `(portal)`, `(account)` groups; each protected group has a stub page with minimal client guard calling `useAuth()`.
8. `npm run build` and `npm run lint` pass; `lib/session.ts` token persistence deleted.

## Sequence diagram

```mermaid
sequenceDiagram
  participant U as Browser
  participant BFF as app/api/auth/*
  participant API as leo-api

  U->>API: POST /auth/login (snake_case body)
  API-->>U: { access_token, refresh_token, expires_in }
  U->>BFF: POST /api/auth/session { refresh_token }
  BFF->>API: (optional validate)
  BFF-->>U: Set-Cookie httpOnly refresh; body { access_token, expires_in }
  Note over U: access in AuthProvider memory only

  U->>API: GET /organizations/me + Bearer
  alt 401 expired
    U->>BFF: POST /api/auth/refresh + CSRF header
    BFF->>API: POST /auth/refresh { refresh_token from cookie }
    API-->>BFF: rotated pair
    BFF-->>U: new cookie + { access_token, expires_in }
  end
```

## Component design

**BFF routes** (`app/api/auth/session`, `refresh`, `logout`):
- Cookie name `leo_refresh`; `HttpOnly; Secure` (prod); `SameSite=Lax`; path `/`.
- **Wire contract:** browser ↔ BFF JSON is snake_case. `session` request: `{ refresh_token: string }` — BFF stores token, never echoes it back. `refresh` response: `{ access_token: string, expires_in: number }` only. BFF ↔ leo-api uses existing DTOs (`RefreshDto.refresh_token`, `LogoutDto.refresh_token`) via server-side `fetch` to `API_URL/api/v1/...`.
- CSRF: BFF `GET /api/auth/csrf` sets readable `leo_csrf` cookie; mutating BFF POSTs require matching `X-CSRF-Token` header.

**AuthProvider** (`components/auth-provider.tsx`):
- Exposes `accessToken`, `setSession(pair)`, `clearSession()`, `decodeClaims()` via JWT payload parse (no verify — display/routing only).
- `setSession`: POST BFF session with refresh, store access in state.
- MFA enrollment pending: in-memory context only (replace `sessionStorage` in `lib/session.ts`).

**`lib/api.ts`:** public path prefix list (`/auth/signup`, `/auth/login`, …) skips Bearer; 401 handler calls refresh once per request chain.

**Role router** (`lib/auth-routing.ts`): maps `role` → path; missing `tenant_id` → `/account`.

**Wire contract — invite accept:** request snake_case `{ token: string, password: string, consent: { tos: boolean, privacy: boolean, baa_ack: boolean } }`; response `201` body `{ user_id: string, tenant_id: string, role: string, membership_id: string }` — client does **not** call `setSession`; user must `POST /auth/login` separately.

## Non-goals

- Switch-tenant modal (P1-2); light admin shell; org/user CRUD; WSS; CSP middleware; server-side middleware auth; Playwright tests.

## Touches

INV-WEB-AUTH-1 (target), INV-WEB-AUTH-2, INV-WEB-AUTH-3, INV-WEB-API-1/2/3, INV-WEB-ROUTE-1/2/3/4, INV-WEB-MFA-1, INV-WEB-UI-1/2, INV-WEB-SIGNUP-1; platform INV-AUTH-1/2/3.

## Depends on

- Shipped auth floor (public pages).
- leo-api: tenant-less interpreter login mints JWT without `tenant_id`; `POST /invitations/accept` returns `{ user_id, tenant_id, role, membership_id }` (no `TokenPair`).
- TanStack Query added to root layout.
- `WorkstationCta` — no `WORKSTATION_URL`; native app only.

## Approach

1. Add BFF routes + CSRF helper; add `AuthProvider` + QueryClientProvider in root layout.
2. Refactor `lib/api.ts`; delete token keys from `lib/session.ts` (or remove file).
3. Extract design-system `Input`, `Button`, `Checkbox`, `Alert`, `Label`; migrate `AuthShell` to `.theme-auth` + `black-*` tokens.
4. Restructure `app/` into route groups; add stub protected pages + minimal `useAuth` guard.
5. Update login/MFA/enroll/invite/setup flows to use `setSession` + `routeAfterLogin(claims)`.
6. Add `/mfa` page scaffold; add `/invite/accept`, `/admin/setup`; remove `/dashboard`.

## Prerequisites (confirmed in leo-api)

- Tenant-less interpreter login mints JWT without `tenant_id` (`auth.service.ts`).
