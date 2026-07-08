# leo-web — Product Spec

> **Phase:** P1 close (Full arch checklist) · **Interview date:** 2026-07-07 · **Canonical architecture:** `docs/ARCHITECTURE.md` / `.pineapple/architecture-overview.md`

## Vision

**Leo Web** is the Next.js production client for **Leo Connexio** — organization administration, customer portals, compliance, billing, and (from P3) desktop customer call flows. This delivery closes **P1**: a production-grade **auth + tenancy spine** with **role-scoped admin shells**, full org/user management surfaces, and platform operator tools — all integrated to live `leo-api` REST endpoints behind the existing `/api/v1` rewrite.

The as-built P1 slice (public auth funnel + `/dashboard` placeholder + `sessionStorage` token spike) is **replaced**, not extended: migrate session handling to target architecture, restructure the App Router into layout groups per §5.2, align auth UI to the design system and reference mocks, and ship the complete `docs/ARCHITECTURE.md` §17 P1 checklist at full depth.

## Audience


| Audience | Role slug | P1 home surface | Notes |
| -------- | --------- | --------------- | ----- |
| Platform operator | `platform_admin` | `/admin/platform` | CLI bootstrap funnel → setup → MFA enroll |
| LSP back-office | `lsp_admin` | `/admin/lsp` | Org profile, users, invites, user detail |
| Customer org admin | `customer_admin` | `/portal/org` | Org settings, members, invites, role promotion |
| Customer requester | `customer_user` | `/portal/call` (stub) | Workstation app CTA until P3 call UI |
| Interpreter (no org) | tenant-less JWT | `/account` | Awaiting affiliation + **Open Workstation** CTA (native app, not web URL) |
| Invited members | varies | `/invite/accept` → `/login?invited=1` | Accept creates membership; user signs in separately |


## Capabilities

### 1. Session & API integration

- **httpOnly refresh cookie** + **in-memory access token** via `AuthProvider` (retire ADR-WEB-001 `sessionStorage` spike).
- Thin **BFF route handlers** at `app/api/auth/*` proxy `POST /auth/refresh` and `POST /auth/logout`; set/clear `httpOnly` `Secure` `SameSite` refresh cookie; never expose refresh token to client JS.
- Extend `lib/api.ts` with Bearer injection, silent refresh on 401 (once), session-expired overlay → `/login` on refresh failure.
- TanStack Query for authenticated data fetching and cache invalidation.
- Wire all auth endpoints: login, MFA, MFA enroll, refresh, logout, signup, verify-email, forgot/reset password, switch-tenant, invitations accept.

### 2. Auth UI (public routes)

Migrate all public auth pages to **design-system primitives** and **`.theme-auth`** tokens; visually align with `../leo-api/docs/design/leo-workstation.html` web surfaces (typography, spacing, form density, logo treatment).

| Route | Endpoint(s) | Notes |
| ----- | ----------- | ----- |
| `/signup` | `POST /auth/signup` | Union variant picker: `personal` · `business`+`customer` · `business`+`lsp` |
| `/signup/success` | — | Email verification pending |
| `/verify-email?token=` | `POST /auth/verify-email` | Auto-submit on mount |
| `/login` | `POST /auth/login` | **Inline MFA** when `mfa_required` |
| `/mfa` | `POST /auth/mfa` | Dedicated route for switch-tenant MFA + deep links |
| `/mfa/enroll` | `POST /auth/mfa/enroll` | First privileged enrollment |
| `/forgot-password` | `POST /auth/forgot-password` | |
| `/reset-password?token=` | `POST /auth/reset-password` | |
| `/invite/accept?token=` | `POST /invitations/accept` | Redirect `/login?invited=1` — API returns membership metadata, not tokens |
| `/admin/setup?token=` | `POST /auth/reset-password` | Platform Admin CLI bootstrap → MFA enroll → `/admin/platform` |

**Shared components (new):** `Input`, `Button`, `Checkbox`, `Alert`, `Label` in `components/design-system/` — consumed by auth and admin shells.

### 3. Application restructure (App Router §5.2)

Replace flat `app/` layout with protected **layout groups**:

```
app/
├── (public)/          # signup, login, verify, reset, invite, admin/setup
├── (platform)/admin/platform/
├── (lsp)/admin/lsp/
├── (portal)/portal/org/
├── (portal)/portal/call/     # stub for customer_user
├── (account)/account/
└── api/auth/                 # BFF refresh/logout
```

Each protected layout:

1. Validates session (access or refresh flow).
2. Enforces MFA completion for privileged roles (`platform_admin`, `lsp_admin`, `sub_admin`).
3. Renders **active tenant** label + **switch-tenant modal** when `GET /memberships` returns >1 active row (P1-2).
4. Mounts **notification center** (WSS bell in `AdminShell` header — P1-5).

Remove `/dashboard` placeholder; role-based routing replaces it.

### 4. Post-login routing

**Silent land** on API default membership (most recent active). **No org picker** on login. Switch-tenant in header when `GET /memberships` returns **>1** active row (not JWT inference).

| Role / state | Destination |
| ------------ | ----------- |
| `platform_admin` | `/admin/platform` |
| `lsp_admin` | `/admin/lsp` |
| `customer_admin` | `/portal/org` |
| `customer_user` | `/portal/call` (stub + workstation link) |
| Tenant-less interpreter | `/account` (awaiting affiliation + workstation CTA — **no auto-open**) |

**Cross-app:** explicit CTAs only; no auto-redirect between web and workstation.

### 5. MFA (hybrid)

| Context | UX |
| ------- | -- |
| Login | Inline MFA step on `/login` |
| Switch-tenant (privileged) | Redirect to `/mfa?returnTo=…` |
| Deep links / session recovery | `/mfa` route |
| First privileged mint | `/mfa/enroll` |

*Rejected:* MFA-only-on-login (blocks switch-tenant); dedicated `/mfa` for all flows (extra step on every login).

### 6. LSP admin (full depth)

| Surface | API | UX |
| ------- | --- | -- |
| Org profile | `GET/PATCH /organizations/me` | `name`, `timezone`, `business_hours` (current DTO only; contact/login prefs → P2) |
| User list | org users endpoints | Sticky-header table, filters |
| Invite user | `POST /invitations` | Modal flow |
| User detail | user CRUD endpoints | View/edit, toggle active, reset password, delete with confirm |

### 7. Customer portal — org (full depth)

| Surface | API | UX |
| ------- | --- | -- |
| Org settings | `GET/PATCH /organizations/me` | `name`, `timezone`, `business_hours` (P1); `industry_types`, `registered_address` deferred until API extends DTO |
| Members | members endpoints | List, invite `customer_user`, role promotion (alpha.5) |

### 8. Platform admin (full depth)

| Surface | API | UX |
| ------- | --- | -- |
| Catalog — languages | catalog CRUD | Full CRUD |
| Catalog — certifications | catalog CRUD | Full CRUD |
| Catalog — tiers | catalog CRUD | Full CRUD |
| Tenant browser | platform tenants | List + detail (read) |
| Audit log viewer | audit endpoints | Filterable table |

### 9. Shared authenticated chrome

- `/account/*` — security settings, password shortcut, MFA management; home for tenant-less interpreters.
- **Switch-tenant modal** — `POST /auth/switch-tenant`; MFA via `/mfa` when required.
- **Notification center** — lightweight WSS on authenticated channel (`notification.push`).
- **Consent re-acceptance modal** — deferred to next phase (see product spec D16/D19).
- **Permission gate** — client mirror of `leo-api` permission matrix; default deny → empty state.

### 10. Security middleware

- CSP (`strict-dynamic` + nonces), HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` at edge/middleware.
- CSRF: `SameSite` cookies + CSRF token on cookie-auth mutations via BFF.
- Graceful 429 UX with `Retry-After`.
- No PHI in URL query params; no PHI in browser console (INV-PHI-1).

### 11. Customer call portal stub (P1)

`/portal/call` — authenticated shell with:

- Copy explaining desktop call portal ships in P3.
- **WorkstationCta** component: prompts user to open the **leo-workstation** native app (no web URL env). Platform-specific copy + optional custom URL scheme link (`leoconnexio://` if registered); no `window.open` on load.
- Satisfies `customer_user` post-login routing without building Vonage/Twilio UI.

## Non-goals (this delivery)

| Item | Owner / phase | Rationale |
| ---- | ------------- | --------- |
| LSP onboarding wizard (partners, languages, pricing) | P2 | Post-signup settings, not signup transaction |
| Interpreter list, affiliation queue, cert review | P2 | |
| Rate cards, billing records, adjustments | P2 | |
| Desktop call portal (request wizard, in-session, Vonage/Twilio JS) | P3 | Stub only for `customer_user` routing |
| Stripe compliance hub, payments, reports/export | P4 | |
| Interpreter dispatch, accept, presence | `leo-workstation` | Explicit platform boundary |
| Session recording UI | Never | Hard exclusion |
| Auto-redirect web ↔ workstation | Never | Explicit navigation only |
| `sessionStorage` token storage | Retired | Replaced by httpOnly + in-memory |
| E2e test suite (Playwright) | Deferred | Unless added in carve; not a P1 interview gate |

## Success metrics

| Metric | Target | How measured |
| ------ | ------ | ------------ |
| P1 checklist complete | 100% of `docs/ARCHITECTURE.md` §17 P1 rows shippable | Manual QA + lint/build green |
| Auth funnel E2E | Signup → verify → login → role home for all 3 union variants | Manual script per variant |
| Platform Admin bootstrap | CLI token → setup → MFA → `/admin/platform` | Manual |
| Invite accept | Sub-Admin + Customer User paths → `/login?invited=1` then role home after login | Manual |
| Session hardening | Refresh in httpOnly cookie; access never in `localStorage`/`sessionStorage` | Code review + DevTools audit |
| Design alignment | Auth pages match reference mock treatment | Visual review against `leo-workstation.html` |
| API integration | All P1 surfaces read/write via Bearer + refresh interceptor | Integration smoke |

**Sellable?** No — P1 is platform spine. First sellable web release remains **P2** (LSP MVP).

## Build phases (carved 2026-07-07, rescoped)

| Epic | Delivers | Status |
| ---- | -------- | ------ |
| **Floor** (shipped) | Public auth funnel, sessionStorage spike | done |
| **P1-1** | httpOnly BFF, AuthProvider, design-system auth UI, layout stubs, role routing | **active** |
| **P1-2** | Protected shell, switch-tenant (`GET /memberships` ✓), permission gate, `/account` | **active** — closes P1 spine |
| **P1-3** | LSP org profile + users | **deferred** — next phase |
| **P1-4** | Customer org + members | **deferred** — next phase |
| **P1-5** | Catalog, WSS, CSP, tenants, audit | **deferred** — next phase |

**P1 spine** = P1-1 + P1-2. Admin surfaces resume when leo-api ships remaining endpoints.

## Key decisions


| # | Decision | Rejected alternative | Rationale |
| - | -------- | -------------------- | --------- |
| D1 | **Full P1 checklist** at arch depth | Auth polish only (A) or auth+skeleton (B) | Founder wants complete platform spine before P2 MVP work |
| D2 | **httpOnly refresh + in-memory access** via BFF | Keep `sessionStorage` spike (ADR-WEB-001) | Matches arch §6.3 / D7; close security debt at P1 |
| D3 | **Silent post-login routing** on API default membership | Org picker on login (B) | Matches arch §6.2; switch-tenant in chrome |
| D4 | Tenant-less interpreter → **`/account`** + workstation CTA | Auto-open workstation (B) | Keeps user in browser; explicit cross-app nav |
| D5 | **`customer_user` → `/portal/call` stub** + workstation link | Block until P3 | Routing correct now; honest UX until call UI |
| D6 | **Design C** — primitives + `.theme-auth` + mock alignment | Token swap only (A) | Admin surfaces reuse same primitives immediately |
| D7 | **Full depth** on all org/user/catalog/audit surfaces | Minimal read-only shells | No second pass needed before P2 |
| D8 | **Hybrid MFA** — inline on login; `/mfa` for switch-tenant | All inline (B) or all `/mfa` (A) | Login speed + reusable MFA for tenant switch |
| D9 | Invite accept: **redirect to `/login`** after accept | Auto-login when tokens returned | API returns membership metadata only; no `TokenPair` |
| D10 | Platform Admin: **`/admin/setup` → reset → MFA enroll → platform** | Defer bootstrap | Required for break-glass operator |
| D11 | Interpreter post-signup: **workstation CTA on `/account`** | Auto-redirect to workstation | Consistent with no cross-app auto-redirect rule |
| D12 | **`last_tenant_id` in `localStorage`** | API default only | On login, if stored tenant ≠ JWT default and held in `GET /memberships`, call `switch-tenant` before routing |
| D13 | **Workstation CTA = native app** | `WORKSTATION_URL` env | leo-workstation is an installed app; use `WorkstationCta` + optional scheme, not a web URL |
| D14 | **Permission matrix build-time codegen** | Hand-maintained copy | Script imports `../leo-api/.../permission-matrix.ts` → `lib/permissions/generated.ts` |
| D15 | **Tracker:** GitHub [`saambaby/leo-web`](https://github.com/saambaby/leo-web) issues; branches `pin-<issue>/<slug>` | Monorepo `saam-baby/arp` | This repo tracks its own issues |
| D16 | **Consent re-acceptance** | In P1-2 | **Deferred** to next phase (needs `GET /consent/status`) |
| D17 | **WSS via Next proxy** | Direct to API `:3000` | Socket.io connects through Next rewrite to `/realtime` |
| D18 | **Shared `OrgProfileForm`** | Separate LSP/customer forms | One component parameterized by `organization.type` |
| D19 | **P1 spine only** (P1-1 + P1-2); admin epics next phase | Full §17 P1 in one delivery | `GET /memberships` shipped; consent/users/tenants/audit API deferred |

### Invariants promoted (see `.pineapple/invariants.md`)

INV-WEB-AUTH-1 through AUTH-5, ROUTE-2, ROUTE-3, MFA-1, FORM-1, TENANT-1, ROUTE-4, PERM-1, WSS-1, CONSENT-1, SECURITY-1 updated with target rules and epic assignments.

## API dependencies

| Endpoint | Status | Phase |
| -------- | ------ | ----- |
| `GET /memberships` (+ nested `organization`) | **shipped** (leo-api) | P1-2 |
| `GET /consent/status` + re-capture POST | next phase (leo-api) | P1-2 follow-on |
| `GET/POST /users`, `PATCH /users/:id/status` | next phase (leo-api) | P1-3, P1-4 |
| `GET /platform/tenants`, `GET /audit/logs` | next phase (leo-api) | P1-5 |

## Research Grounding

- [[research/synthesis/leo-api]] — unified signup union contract (`account_type` / `business_type`), login tenant-resolution constraints, invitation + affiliation model informed auth routing and invite-accept expectations.
