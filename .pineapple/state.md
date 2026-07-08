# leo-web — As-built state

> Snapshot for `/pineapple:ongoing` adoption. Update via `/pineapple:context-update` when floor moves.

**Date:** 2026-07-07  
**Phase:** P1 (partial)  
**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind 4 · npm

## Floor (verified in repo)

- App Router layout groups: `(public)`, `(platform)`, `(lsp)`, `(portal)`, `(account)` with protected stub pages
- 18 App Router pages (public auth + invite/setup/mfa + role stubs; `/dashboard` removed)
- BFF auth routes (`/api/auth/*`) with httpOnly `leo_refresh` cookie + CSRF
- `AuthProvider` in-memory access token; TanStack Query in root layout
- API client: Bearer on non-public paths + silent refresh via BFF
- MFA enrollment + login pending in `AuthProvider` memory (not sessionStorage)
- Role-based post-login routing via `lib/auth-routing.ts` (`routeAfterLogin`)
- Auth flows: `/mfa`, `/invite/accept`, `/admin/setup` (P1-1-T-04)
- Design tokens + auth UI migrated to `.theme-auth` and `components/design-system` primitives (P1-1-T-02)
- P1-2 foundation: switch-tenant BFF, `useMemberships`, permission codegen, `last_tenant_id` (P1-2-T-01)
- `AdminShell` light chrome + upgraded `ProtectedGuard` (session, MFA, `returnTo`, sign-out) on protected layouts (P1-2-T-02)
- `SwitchTenantModal` in AdminShell header; `PermissionGate` on nav; `/account` security + interpreter empty state (P1-2-T-03)

## Not on floor

- WSS, middleware security headers
- Vitest / Playwright

## Drift vs `docs/ARCHITECTURE.md`

| Topic | Target doc | As-built |
|---|---|---|
| Token storage | httpOnly refresh + memory access | **BFF cookie + AuthProvider memory** (P1-1-T-01) |
| API client | Bearer + refresh interceptor | **Bearer + silent refresh** (P1-1-T-01) |
| MFA route | `/mfa` for deep links + inline on `/login` | **inline `/login` + `/mfa?returnTo=`** (P1-1-T-04) |
| Post-login | role routing | **`routeAfterLogin` per JWT role** (P1-1-T-04) |
| Theme | light admin + auth scope | **light admin default + `.theme-auth` on public auth** (P1-1-T-02) |

## Open questions

See `.pineapple/product-spec.md` §Open questions — **needs human interview before `/pineapple:prd-readiness` pass.**
