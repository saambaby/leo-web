# P1-4 — Customer portal org

**Status:** draft · **Phase:** P1-4 · **Owner:** leo-web · **Deferred** → next phase (needs leo-api `GET /users`)

## Summary

Deliver **customer org admin** surfaces at `/portal/org`: settings, members list, invite flow, and in-tenant role promotion — web-first home for `customer_admin` (BD7). Reuses AdminShell and query patterns from P1-3 with customer-specific fields and promotion pairs.

## User-facing behaviour

- **`/portal/org`:** home with links to Settings, Members, and placeholder "Call portal (P3)" card pointing to `/portal/call`.
- **`/portal/org/settings`:** `GET/PATCH /organizations/me` — **P1 fields only:** `name`, `timezone`, `business_hours` (same DTO as LSP). Defer `industry_types`, `registered_address` until API extends DTO.
- **`/portal/org/members`:** table of tenant members (from `GET /users`); role chips (`customer_admin`, `customer_user`).
- **Invite:** modal → `POST /invitations` with `role: 'customer_user'` default; consent not required on invite creation (invitee accepts separately).
- **Promote:** row action opens confirm → `PATCH /memberships/:id/role` body `{ role: 'customer_admin' | 'customer_user' }` — only allowed pairs per `CUSTOMER_ROLE_PAIR` (service enforces; UI offers valid target roles only). **Affordance:** promote action in row kebab menu; **input surface:** menu item + confirm modal button both trigger same mutation (not double-submit).

## Acceptance criteria

1. `customer_admin` can view/edit org settings; PATCH persists.
2. Members list loads; invite creates membership path for new user.
3. Promotion toggles between `customer_user` ↔ `customer_admin`; list reflects new role without full page reload (query invalidation).
4. `customer_user` cannot reach settings/members write UI; API returns 404 for cross-tenant or unauthorized promotion (INV-ERROR-1).
5. Manual E2E: customer business signup → verify → login → settings → invite requester.
6. `npm run build` and `npm run lint` pass.

## Component design

**Promotion helper** (`lib/permissions/role-promotion.ts`): mirror `CUSTOMER_ROLE_PAIR` from leo-api; `promotableRoles(currentRole)` returns valid targets.

**Wire contract — promotion:** `PATCH /memberships/:id/role` request `{ role: string }` (snake_case); response `MembershipResponseDto`: `{ id, tenant_id, user_id, role, status, created_at, updated_at }` — all strings/enums as API emits; `membership.id` is UUID for path param.

**Wire contract — members list:** same `GET /users` as LSP epic; client filters to customer-relevant columns (email, role, status).

## Non-goals

- `/portal/call` call UI (P3); billing fields (P3); reports (P4); LSP admin (P1-3); `sub_admin`↔`lsp_admin` promotion pairs.

## Touches

INV-WEB-API-2, INV-WEB-SIGNUP-1, INV-WEB-FORM-1; platform INV-ERROR-1.

## Depends on

- P1-2 shell; P1-3 patterns optional (shared `DataTable` if extracted).
- leo-api: `PATCH /memberships/:id/role` (**exists**); `GET /users`, `POST /invitations` (**leo-api slice required**).

## Approach

1. Routes under `(portal)/portal/org/`.
2. Reuse shared **`OrgProfileForm`** from P1-3.
3. Members table + invite + promotion mutation.
4. Permission-gate write actions to `customer_admin` + `memberships:role:patch`.
