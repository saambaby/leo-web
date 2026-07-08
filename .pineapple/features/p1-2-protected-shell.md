# P1-2 — Protected shell & shared chrome

**Status:** draft · **Phase:** P1-2 · **Owner:** leo-web · **Closes P1 spine with P1-1**

Replace P1-1 layout stubs with production **protected shells**: session/MFA guards, light `AdminShell`, switch-tenant via **`GET /memberships` (shipped in leo-api)**, codegen `PermissionGate`, sign-out, `/account` + `WorkstationCta`. Consent modal **deferred** to next phase.

## User-facing behaviour

- Unauthenticated visits to `/admin/*`, `/portal/*`, `/account/*` redirect to `/login` with `returnTo` preserved.
- Privileged roles (`platform_admin`, `lsp_admin`, `sub_admin`) without MFA-satisfied refresh family redirect to `/mfa/enroll`.
- **AdminShell** wraps protected routes: light `bg-canvas` layout, role-aware nav links, active org name in header (from nested `organization.name` on active membership or `GET /organizations/me`).
- **Switch-tenant:** header control visible when `GET /memberships` returns **>1** active row. Modal lists `organization.name`, `organization.type`, and `role` per row; selecting one calls BFF switch → `POST /auth/switch-tenant`. Org display names are **admin-customizable** via org profile `PATCH` (`name` field) — modal reflects updated names on next fetch. Privileged target may return `mfa_required` → `/mfa?returnTo=<current path>`. **Affordance:** row hover highlight; **input surface:** full row `button` (min-height 44px), not chevron-only.
- **Sign-out:** header action → BFF logout → clear session → `/login`.
- **`/account`:** password shortcut, MFA status/enroll link, interpreter **awaiting affiliation** when JWT lacks `tenant_id`.
- **PermissionGate:** default deny → empty state (not client 403 page).

## Acceptance criteria

1. Unauthenticated access to protected prefixes redirects to `/login`.
2. Privileged user without MFA satisfied cannot access protected routes until `/mfa/enroll`.
3. User with 2+ active memberships sees switch control; switch succeeds; privileged MFA path returns to `returnTo`.
4. `POST /api/auth/logout` revokes refresh family; cookie cleared; `AuthProvider` empty.
5. `PermissionGate` denies cross-role nav (e.g. `customer_user` vs LSP paths).
6. `/account` shows security section + interpreter empty state when `tenant_id` absent.
7. `/account` renders security section + interpreter empty state when `tenant_id` absent.
8. `npm run build` and `npm run lint` pass.

## Sequence diagram

```mermaid
sequenceDiagram
  participant U as User
  participant W as leo-web
  participant BFF as api/auth/switch-tenant
  participant API as leo-api

  U->>W: Open switch-tenant modal
  W->>API: GET /memberships (Bearer)
  API-->>W: [{ id, tenant_id, role, status, organization }]
  U->>W: Select org B
  W->>BFF: POST { tenant_id, totp_code? }
  BFF->>API: POST /auth/switch-tenant { tenant_id, refresh_token, totp_code? }
  alt mfa_required
    API-->>W: { mfa_required: true }
    W->>U: /mfa?returnTo=...
  else success
    API-->>BFF: TokenPair
    BFF-->>W: Set-Cookie + { access_token, expires_in }
    W->>W: AuthProvider.setSession; route by new role
  end
```

## Component design

**`GET /memberships` wire (leo-api, self-only):** JWT + `memberships:read`. Returns `200` array of active memberships only (`status = active`), sorted `updated_at DESC` (matches login "most recent" ordering). Base fields reuse `MembershipResponseDto` snake_case: `{ id, tenant_id, user_id, role, status, created_at, updated_at }`. Nested join (v1): `organization: { id, name, type }` where `type ∈ { platform, lsp, customer }` — client displays as-is; no camelCase transform.

**Switch visibility:** `memberships.length > 1` from query `useMemberships()`; do **not** infer from JWT alone.

**BFF `POST /api/auth/switch-tenant`:** body `{ tenant_id: string, totp_code?: string }`; server attaches `refresh_token` from `leo_refresh` cookie; response never includes `refresh_token` to JS.

**Switch-tenant API:** snake_case `{ tenant_id, refresh_token, totp_code? }` → `TokenPair` or `{ mfa_required: true }`.

**`PermissionGate`:** build-time codegen from `../leo-api/src/modules/identity/constants/permission-matrix.ts` → `lib/permissions/generated.ts` (`npm run codegen:permissions`); `hasPermission(role, permission)`.

**`last_tenant_id`:** `localStorage` key `leo.last_tenant_id` (UUID string). After login `setSession` or successful switch-tenant, persist JWT `tenant_id`. On login, if stored id differs from JWT default **and** appears in `GET /memberships`, call BFF switch-tenant before `routeAfterLogin`.

## Non-goals

- Consent re-acceptance modal (next phase — `GET /consent/status`)
- Org/user CRUD (P1-3/4 — next phase); platform catalog/WSS/CSP (P1-5 — next phase)

## Touches

INV-WEB-AUTH-4, INV-WEB-AUTH-5, INV-WEB-API-1/2/3, INV-WEB-TENANT-1, INV-WEB-PERM-1, INV-WEB-ROUTE-3/4; platform INV-AUTH-3, INV-ERROR-1.

## Depends on

- P1-1 complete.
- leo-api: `GET /memberships` (**shipped**); `POST /auth/switch-tenant` (exists).

## Approach

1. `useMemberships()` → `GET /memberships`.
2. `last_tenant_id` sync on login/switch.
3. `npm run codegen:permissions`; `PermissionGate` on nav/actions.
4. `AdminShell` + layout guards; `/account` + `WorkstationCta`.

