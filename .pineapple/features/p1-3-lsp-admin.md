# P1-3 — LSP admin surfaces

**Status:** draft · **Phase:** P1-3 · **Owner:** leo-web · **Deferred** → next phase (needs leo-api `GET /users`)

## Summary

Ship full-depth **LSP back-office** inside `AdminShell`: `/admin/lsp` home, org profile editor, user list with filters, invite modal, and user detail with lifecycle actions — all via Bearer-authenticated TanStack Query against leo-api tenant-scoped endpoints.

## User-facing behaviour

- **`/admin/lsp`:** dashboard cards linking to Organization and Users.
- **`/admin/lsp/settings` (org profile):** form bound to `GET /organizations/me`; save calls `PATCH` with dirty-state guard. **P1 fields only** (per `OrganizationProfileDto`): editable `name`, `timezone`, `business_hours` (JSON object — send as object, not double-stringified). Read-only: `id`, `type`, `status`, `stripe_verification_status`, `platform_baa_status`, `activation_blockers`. Org `name` is admin-customizable and flows to switch-tenant modal labels (P1-2).
- **`/admin/lsp/users`:** sticky-header table; columns per API user DTO; filter by role/status client-side until API query params exist.
- **Invite:** modal posts `POST /invitations` with `{ email, role, expires_in_hours? }` (snake_case); success toast + invalidate list query.
- **`/admin/lsp/users/[id]`:** detail view; toggle active via `PATCH /users/:id/status`; admin reset-password trigger per API; delete/deactivate with confirm modal. **Affordance:** destructive button uses `signal-error` styling; **input surface:** confirm modal blocks backdrop click-to-dismiss — only Cancel / Confirm buttons close it.

## Acceptance criteria

1. `lsp_admin` can load, edit, save org profile; reload shows persisted values.
2. User list renders from `GET /users`; empty state when no users.
3. Invite sends invitation; `ApiError.message` shown on failure (no raw body).
4. User detail status toggle and allowed mutations work; confirm required for destructive actions.
5. `sub_admin` **can access** `/admin/lsp/*` read-only (`orgs:read`, `users:read` per matrix); write actions hidden; API 404 on unauthorized PATCH (INV-ERROR-1). `customer_*` / `interpreter` cannot access LSP routes.
6. Manual E2E: LSP signup → verify → login → edit org → invite Sub-Admin.
7. `npm run build` and `npm run lint` pass.

## Component design

**Queries** (`lib/queries/lsp.ts`): `useOrgProfile()`, `useUsers()`, `useUser(id)` with keys `['org','me']`, `['users']`, `['users', id]`.

**Wire contract — org profile:** `GET/PATCH /organizations/me` response fields all snake_case; `business_hours` is `Record<string, unknown> | null` (JSON object); timestamps ISO-8601 UTC strings; no client camelCase transform (INV-WEB-API-2).

**Wire contract — users (arch-reference):** `GET /users` returns array of user+membership rows (shape per leo-api DTO when implemented); `PATCH /users/:id/status` body `{ status: 'active' | 'inactive' }`; `POST /invitations` body `{ email, role, expires_in_hours? }`.

**Unsaved guard:** `beforeunload` + Next.js navigation prompt when form `isDirty`.

## Non-goals

- LSP onboarding wizard (P2); interpreter/affiliation queues (P2); rate cards/billing (P2); customer portal (P1-4); role promotion UI here (customer epic owns pair rules; LSP promotion via user detail only if API exposes on user endpoint).

## Touches

INV-WEB-API-1/2/3, INV-WEB-AUTH-2, INV-WEB-FORM-1; platform INV-ERROR-1, INV-AUDIT-1 (mutations audited server-side).

## Depends on

- P1-2 `AdminShell`, `PermissionGate`.
- leo-api handlers: `GET/PATCH /organizations/me` (**exists**); `GET/POST /users`, `PATCH /users/:id/status`, `POST /invitations` (**verify — referenced in arch-reference, may need leo-api slice first**).

## Approach

1. Routes under `(lsp)/admin/lsp/`.
2. **`OrgProfileForm`** shared component (`components/org-profile-form.tsx`) — used by P1-4 with `organization.type` prop.
3. Build users table + invite modal + detail page.
4. Gate write actions with `users:write` permission.

## Open questions

- Exact `GET /users` tenant member-list response shape — align when leo-api handler lands (distinct from self `GET /memberships`).
