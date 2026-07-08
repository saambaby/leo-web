# leo-web — Code Map

> Single-package Next.js app. Drives taskgraph `area` field and safe-parallel dispatch.

## Areas

| Area | Paths | Coupling | Owns | Safe-parallel with |
|---|---|---|---|---|
| **foundation** | `lib/api.ts`, `lib/session.ts`, `lib/auth-types.ts`, `next.config.ts` | foundation | fetch wrapper, token storage, API proxy, shared auth types | — (single-writer for auth contract changes) |
| **auth-ui** | `app/signup/**`, `app/login/**`, `app/verify-email/**`, `app/mfa/**`, `app/forgot-password/**`, `app/reset-password/**`, `components/auth-shell.tsx`, `components/form-field.tsx`, `components/verify-email-content.tsx` | api-coupled | public auth pages, AuthShell, form primitives | design-system (if only token/CSS) |
| **shell** | `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/dashboard/**` | api-coupled | marketing home, root layout, post-login placeholder | auth-ui (after foundation stable) |
| **design-system** | `components/design-system/**` | isolated | tokens.ts, tokens.css, README | auth-ui (token migration) |
| **docs** | `docs/**` | cross-cutting | `ARCHITECTURE.md` (target canonical) | — (human + coordinator) |
| **admin** | `app/(platform)/**`, `app/(lsp)/**` *(not created)* | api-coupled | future LSP/platform admin surfaces | portal (if API stable) |
| **portal** | `app/(portal)/**` *(not created)* | api-coupled | future customer org + call portal | admin (if API stable) |

## Coupling levels

- **Isolated** — design-system token files (no runtime deps on auth).
- **API-coupled** — safe to parallelise if leo-api auth/org contracts are frozen for the slice.
- **Foundation** — `lib/*` + `next.config.ts`; merge auth contract changes before fan-out to auth-ui / admin / portal.

## Integration contract owner

**foundation** area owns: ports (`8080`→`3000`), wire format (snake_case), env (`API_URL`), auth header convention (target: Bearer + refresh).
