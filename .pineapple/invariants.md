# leo-web — Invariants

> Client-only rules (`INV-WEB-*`). Platform rules (`INV-*`) live in `../leo-api/.pineapple/invariants.md` — reference by ID, do not duplicate. Rules here are **as-built** unless marked **target**.

## INV-WEB-API-1 — Same-origin API via rewrite
**Rule:** All backend calls use `lib/api.ts` against paths under `/api/v1/*`; Next.js rewrites proxy to `API_URL` (default `http://localhost:3000`). No direct cross-origin fetches to leo-api from the browser.
**Why:** Avoid CORS in dev; single fetch entry point. (ADR-WEB-002)
**Touched by:** all auth pages, future admin modules
**Status:** as-built

## INV-WEB-API-2 — snake_case wire format
**Rule:** Request and response JSON uses snake_case field names (`access_token`, `totp_code`, `new_password`, `email_verification_required`, …) matching leo-api DTOs.
**Why:** Platform wire convention (leo-api arch). Client types in `lib/auth-types.ts` mirror API shape.
**Depends on:** platform INV-* naming (implicit)
**Touched by:** `lib/api.ts`, `lib/auth-types.ts`, all forms
**Status:** as-built

## INV-WEB-API-3 — ApiError envelope
**Rule:** Non-2xx responses parse `{ message?: string }` and throw `ApiError(statusCode, message)`; UI shows `err.message` — never raw response bodies or stack traces.
**Why:** Consistent error UX; avoids leaking internals.
**Touched by:** `lib/api.ts`, all auth pages
**Status:** as-built

## INV-WEB-AUTH-1 — Session storage
**Rule:** Refresh token in **httpOnly** `Secure` `SameSite` cookie set/cleared only via BFF (`app/api/auth/*`). Access token in **memory only** via `AuthProvider` — never `sessionStorage` or `localStorage`. Access TTL ≤15 min per platform D7. MFA enrollment pending and MFA login pending held in `AuthProvider` React state only.
**Why:** XSS-resistant session per `docs/ARCHITECTURE.md` §6.3; retires ADR-WEB-001.
**Depends on:** platform INV-AUTH-1, INV-AUTH-2
**Touched by:** `AuthProvider`, BFF routes, `lib/api.ts`, all protected layouts
**Status:** as-built (P1-1)

## INV-WEB-AUTH-2 — Bearer on authenticated calls
**Rule:** `lib/api.ts` attaches `Authorization: Bearer <access_token>` on all non-public API calls; silent refresh once on 401 via BFF; session-expired overlay → `/login` on failure.
**Why:** Tenant-scoped reads/writes require authenticated requests per arch §9.1.
**Depends on:** INV-WEB-AUTH-1, platform INV-AUTH-1
**Touched by:** `lib/api.ts`, TanStack Query fetchers, admin/portal pages
**Status:** as-built (P1-1)

## INV-WEB-AUTH-3 — BFF for cookie auth mutations
**Rule:** Browser never reads or writes the refresh token directly. `POST /auth/refresh` and `POST /auth/logout` are proxied through `app/api/auth/*` route handlers that manage the httpOnly cookie and CSRF token on mutations.
**Why:** Same-origin cookie semantics without exposing refresh to client JS.
**Touched by:** `app/api/auth/`, `AuthProvider`, sign-out flow
**Status:** as-built (P1-1)

## INV-WEB-AUTH-4 — Sign-out revokes refresh family (target: P1-2)
**Rule (target):** Sign out calls BFF logout → `POST /auth/logout` server-side, clears httpOnly cookie, resets `AuthProvider`, redirects `/login`.
**Rule (as-built):** `clearTokens()` only; no server revoke.
**Depends on:** INV-WEB-AUTH-3, platform INV-AUTH-2
**Status:** as-built gap · **target epic:** P1-2

## INV-WEB-AUTH-5 — Protected layout session guard (target: P1-2)
**Rule:** Protected layout groups (`(platform)`, `(lsp)`, `(portal)`, `(account)`) validate session via `AuthProvider`; unauthenticated users redirect to `/login`. Privileged roles (`platform_admin`, `lsp_admin`, `sub_admin`) must complete MFA before accessing protected routes.
**Why:** Replaces ADR-WEB-003 client-only `/dashboard` guard.
**Touched by:** protected `layout.tsx` files in each group
**Status:** **target** · epic P1-2

## INV-WEB-UI-1 — Auth shell composition
**Rule:** Public auth routes render inside `AuthShell` (`.theme-auth` scope) with `components/design-system` primitives (`Input`, `Button`, `Checkbox`, `Alert`, `Label`) and `form-field` composites (`FormField`, `SelectField`, `CheckboxField`).
**Why:** Consistent auth UX; single tokenized surface for auth forms.
**Touched by:** signup, login, verify-email, forgot/reset password, mfa, mfa/enroll, invite/accept, admin/setup
**Status:** as-built

## INV-WEB-UI-2 — Auth dark theme
**Rule:** Auth pages use `.theme-auth` semantic tokens (`bg-background`, `text-foreground`) and `black-*` / `signal-*` scale classes from `components/design-system` — no hardcoded `#0b0d12` canvas in `AuthShell`.
**Why:** Aligns auth UI with workstation token source (`components/design-system/tokens.css`).
**Touched by:** `AuthShell`, public auth routes, `form-field.tsx`
**Status:** as-built (P1-1)

## INV-WEB-ROUTE-1 — Query params for one-shot tokens
**Rule:** Email verify and password reset read `?token=` from URL search params; missing token shows error state — never POST without token.
**Why:** Magic-link contract with leo-api; avoids empty verify calls.
**Touched by:** verify-email, reset-password
**Status:** as-built

## INV-WEB-ROUTE-2 — Role-based post-login routing
**Rule:** After successful login, route by JWT `role` via `lib/auth-routing.ts` per product spec §4; missing `tenant_id` → `/account`. Invite accept does **not** mint a session — user lands `/login?invited=1` then logs in normally. No `/dashboard` route.
**Why:** Each persona has a defined web home per arch §6.2 / BD7.
**Touched by:** login, mfa, mfa/enroll, invite/accept, admin/setup, `lib/auth-routing.ts`
**Status:** as-built (P1-1)

## INV-WEB-ROUTE-3 — No cross-app auto-redirect
**Rule:** leo-web never auto-opens leo-workstation (or vice versa). Workstation CTAs use `WorkstationCta` — native app open/download copy and optional custom URL scheme (`leoconnexio://`); **no web URL env**.
**Why:** Product decision D11/D13; leo-workstation is an installed app.
**Touched by:** `/account`, `/portal/call` stub
**Status:** as-built (P1-1)

## INV-WEB-ROUTE-4 — Workstation CTA (native app)
**Rule:** `WorkstationCta` does not use `WORKSTATION_URL` or external https links as primary action. Show platform-appropriate "Open Leo Workstation" / install guidance; optional `href="leoconnexio://"` only when app registers the scheme.
**Touched by:** `components/workstation-cta.tsx`
**Status:** as-built (P1-1)

## INV-WEB-TENANT-1 — Last tenant preference (localStorage)
**Rule:** Persist `leo.last_tenant_id` in `localStorage` after login or successful switch-tenant. On login, if stored UUID ≠ JWT `tenant_id` and is an active held membership (`GET /memberships`), call BFF `switch-tenant` before role routing.
**Touched by:** `AuthProvider`, P1-2 switch flow
**Status:** **target** · epic P1-2

## INV-WEB-PERM-1 — Permission matrix codegen
**Rule:** `lib/permissions/generated.ts` is build-time generated from `../leo-api/src/modules/identity/constants/permission-matrix.ts` via `npm run codegen:permissions`; never hand-edit generated file.
**Touched by:** `PermissionGate`, build script
**Status:** **target** · epic P1-2

## INV-WEB-WSS-1 — Realtime via Next proxy
**Rule:** Browser WSS client connects to same-origin `/realtime`; Next rewrites/proxies to leo-api gateway. No direct cross-origin socket to API port from browser.
**Touched by:** `lib/wss/client.ts`, `next.config.ts`
**Status:** **target** · epic P1-5

## INV-WEB-CONSENT-1 — Re-acceptance modal (deferred)
**Rule:** Protected shell calls `GET /consent/status` on mount; blocking modal until re-capture succeeds.
**Status:** **deferred** to next phase (after leo-api consent-status endpoint). Not in P1 spine (P1-2).
**Depends on:** platform INV-CONSENT-1

## INV-WEB-SECURITY-1 — Security headers middleware (target: P1-5)
**Rule:** Production middleware sets CSP (`strict-dynamic` + nonce), HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` on document responses.
**Touched by:** `middleware.ts`, root layout nonce plumbing
**Status:** **target** · epic P1-5

## INV-WEB-SIGNUP-1 — Union signup payload shape
**Rule:** Signup posts exactly one of: `{ account_type: "personal", email, password, consent }` or `{ account_type: "business", business_type: "lsp"|"customer", email, password, name, timezone, consent }` with `baa_ack` only for LSP variant.
**Why:** Matches `POST /auth/signup` unified contract (`../leo-api/.pineapple/specs/unified-signup-onboarding.md`).
**Depends on:** leo-api unified-signup feature spec
**Touched by:** `app/signup/page.tsx`
**Status:** as-built

## INV-WEB-MFA-1 — Hybrid MFA routing
**Rule:** `mfa_required` on login → inline TOTP on `/login`. Switch-tenant and deep-link MFA → dedicated `/mfa?returnTo=…` (re-POST `/auth/login` with `totp_code`; full switch-tenant wiring in P1-2). `mfa_enrollment_required` → `/mfa/enroll` with enrollment pending state in `AuthProvider` memory only.
**Why:** Product decision D8; login speed + reusable MFA for tenant switch.
**Depends on:** platform INV-AUTH-3
**Touched by:** login, mfa, mfa/enroll, admin/setup, switch-tenant modal (P1-2)
**Status:** as-built (P1-1)

## INV-WEB-FORM-1 — Unsaved org form guard
**Rule:** Editable org profile forms (`PATCH /organizations/me`) use unsaved-changes guard (`beforeunload` + in-app navigation prompt) when `isDirty`.
**Why:** Prevents accidental loss of admin edits on LSP/customer settings.
**Touched by:** P1-3, P1-4 org settings pages
**Status:** **target** · epic P1-3/P1-4

## INV-WEB-TEST-1 — No tests unless requested
**Rule:** Do not add unit/e2e tests unless explicitly requested. Repo has zero test files today.
**Why:** P1 velocity; matches early scaffold state.
**Revisit:** Before P2 MVP sellable gate or when Playwright is added per arch §4.
**Status:** as-built
