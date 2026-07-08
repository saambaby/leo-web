# Feature Specs — Index

> Seed from as-built code (2026-07-07). Spec bodies written via `/pineapple:feature-spec`. Platform specs in `../leo-api/.pineapple/features/` — link, don't copy.

| Spec | Status | One-line |
|---|---|---|
| `p1-1-session-auth-foundation.md` | **draft** | P1-1: BFF session, AuthProvider, design migration, routing, layout stubs |
| `p1-2-protected-shell.md` | **draft** (audit-amended) | AdminShell, guards, GET /memberships switch-tenant BFF |
| `p1-3-lsp-admin.md` | **deferred** | Next phase — LSP org + users |
| `p1-4-customer-portal-org.md` | **deferred** | Next phase — customer org |
| `p1-5-platform-admin-infra.md` | **deferred** | Next phase — platform + infra |
| `auth-public-signup.md` | **as-built** (no spec file yet) | Union signup variants → `POST /auth/signup` with consent |
| `auth-email-verify.md` | **as-built** | Magic-link handler `POST /auth/verify-email` |
| `auth-login-mfa.md` | **as-built** | Login + inline MFA challenge + enrollment redirect |
| `auth-password-recovery.md` | **as-built** | Forgot + reset password flows |
| `auth-session-foundation.md` | **superseded** | → `p1-1-session-auth-foundation.md` |
| `auth-protected-layout.md` | **superseded** | → `p1-2-protected-shell.md` |
| `auth-invite-accept.md` | **in P1-1** | Covered by `p1-1-session-auth-foundation.md` |
| `platform-admin-setup.md` | **in P1-1** | Covered by `p1-1-session-auth-foundation.md` |
| `org-profile.md` | **superseded** | → `p1-3-lsp-admin.md` + `p1-4-customer-portal-org.md` |
| `users-rbac.md` | **superseded** | → `p1-3-lsp-admin.md` + `p1-4-customer-portal-org.md` |
| `catalog-admin.md` | **superseded** | → `p1-5-platform-admin-infra.md` |
| `design-system-auth-migration.md` | **in P1-1** | Covered by `p1-1-session-auth-foundation.md` |
| — | platform | `../leo-api/.pineapple/features/unified-signup.md` |
| — | platform | `../leo-api/.pineapple/features/auth-identity-tokens.md` |

**Next:** Re-run `/pineapple:cross-spec-audit` → `/pineapple:taskgraph` for P1-1.
