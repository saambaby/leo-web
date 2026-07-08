# leo-web — Code Map

> Single-package Next.js app. Drives taskgraph `area` field and safe-parallel dispatch.

## Areas

| Area | Paths | Coupling | Owns | Safe-parallel with |
|---|---|---|---|---|
| **foundation** | `lib/api.ts`, `lib/session.ts`, `lib/auth-types.ts`, `next.config.ts` | foundation | fetch wrapper, token storage, API proxy, shared auth types | — (single-writer for auth contract changes) |
| **auth-ui** | `app/(public)/**`, `components/auth-shell.tsx`, `components/form-field.tsx`, `components/verify-email-content.tsx` | api-coupled | public auth pages, AuthShell, form primitives | design-system (if only token/CSS) |
| **shell** | `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/(platform)/**`, `app/(lsp)/**`, `app/(portal)/**`, `app/(account)/**`, `components/protected-guard.tsx`, `components/workstation-cta.tsx` | api-coupled | marketing home, root layout, protected route groups + stubs | auth-ui (after foundation stable) |
| **design-system** | `components/design-system/**` | isolated | tokens.ts, tokens.css, README | auth-ui (token migration) |
| **docs** | `docs/**` | cross-cutting | `ARCHITECTURE.md` (target canonical) | — (human + coordinator) |
| **admin** | `app/(platform)/**`, `app/(lsp)/**` | api-coupled | platform/LSP admin stub surfaces | portal (if API stable) |
| **portal** | `app/(portal)/**`, `app/(account)/**` | api-coupled | customer org/call stubs + account home | admin (if API stable) |

## Coupling levels

- **Isolated** — design-system token files (no runtime deps on auth).
- **API-coupled** — safe to parallelise if leo-api auth/org contracts are frozen for the slice.
- **Foundation** — `lib/*` + `next.config.ts`; merge auth contract changes before fan-out to auth-ui / admin / portal.

## Integration contract owner

**foundation** area owns: ports (`8080`→`3000`), wire format (snake_case), env (`API_URL`), auth header convention (target: Bearer + refresh).
